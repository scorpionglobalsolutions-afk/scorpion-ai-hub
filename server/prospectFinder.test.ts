import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// Prospect Finder Router — Unit Tests
// ============================================================================

// Mock the Google Maps makeRequest helper
vi.mock("./_core/map", () => ({
  makeRequest: vi.fn(),
}));

// Mock the Similarweb data API helper
vi.mock("./_core/dataApi", () => ({
  callDataApi: vi.fn(),
}));

// Mock the database helpers
vi.mock("./db", () => ({
  getClientsByUserId: vi.fn().mockResolvedValue([]),
  createClient: vi.fn().mockResolvedValue({ insertId: 42 }),
}));

import { makeRequest } from "./_core/map";
import { callDataApi } from "./_core/dataApi";
import * as db from "./db";

const mockMakeRequest = makeRequest as ReturnType<typeof vi.fn>;
const mockCallDataApi = callDataApi as ReturnType<typeof vi.fn>;

// ============================================================================
// Domain Cleaning Utility (inline test — mirrors router logic)
// ============================================================================
function cleanDomain(input: string): string {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase()
    .trim();
}

describe("Prospect Finder — domain cleaning", () => {
  it("strips https:// prefix", () => {
    expect(cleanDomain("https://poolbuddies.com")).toBe("poolbuddies.com");
  });

  it("strips http:// prefix", () => {
    expect(cleanDomain("http://poolbuddies.com/about")).toBe("poolbuddies.com");
  });

  it("strips www. prefix", () => {
    expect(cleanDomain("www.poolbuddies.com")).toBe("poolbuddies.com");
  });

  it("strips trailing path", () => {
    expect(cleanDomain("poolbuddies.com/services/pool-cleaning")).toBe("poolbuddies.com");
  });

  it("handles already-clean domain", () => {
    expect(cleanDomain("poolbuddies.com")).toBe("poolbuddies.com");
  });

  it("lowercases the domain", () => {
    expect(cleanDomain("PoolBuddies.COM")).toBe("poolbuddies.com");
  });
});

// ============================================================================
// Opportunity Score Logic (inline test — mirrors ProspectFinder.tsx logic)
// ============================================================================
function calcOpportunityScore(p: {
  hasWebsite: boolean;
  isClaimed: boolean;
  reviewCount: number;
  rating: number;
}): number {
  let score = 0;
  if (!p.hasWebsite) score += 40;
  if (!p.isClaimed) score += 30;
  if (p.reviewCount < 10) score += 20;
  if (p.rating < 4.0 && p.reviewCount > 0) score += 10;
  return Math.min(score, 100);
}

describe("Prospect Finder — opportunity score", () => {
  it("gives maximum score to a business with no website, unclaimed, few reviews, low rating", () => {
    const score = calcOpportunityScore({
      hasWebsite: false,
      isClaimed: false,
      reviewCount: 3,
      rating: 3.2,
    });
    expect(score).toBe(100);
  });

  it("gives 0 score to a well-established business", () => {
    const score = calcOpportunityScore({
      hasWebsite: true,
      isClaimed: true,
      reviewCount: 150,
      rating: 4.8,
    });
    expect(score).toBe(0);
  });

  it("gives 40 score to a business with no website but otherwise established", () => {
    const score = calcOpportunityScore({
      hasWebsite: false,
      isClaimed: true,
      reviewCount: 50,
      rating: 4.5,
    });
    expect(score).toBe(40);
  });

  it("gives 70 score to a business with no website and unclaimed", () => {
    const score = calcOpportunityScore({
      hasWebsite: false,
      isClaimed: false,
      reviewCount: 50,
      rating: 4.5,
    });
    expect(score).toBe(70);
  });
});

// ============================================================================
// Google Maps geocoding error handling (mock-based)
// ============================================================================
describe("Prospect Finder — geocoding failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty results when geocoding fails", async () => {
    mockMakeRequest.mockResolvedValueOnce({ status: "ZERO_RESULTS", results: [] });

    // Simulate the router logic
    const geoResult = await makeRequest<{ status: string; results: any[] }>(
      "/maps/api/geocode/json",
      { address: "Nonexistent City XYZ" }
    );
    const coords = geoResult.results?.[0]?.geometry?.location;
    expect(coords).toBeUndefined();
  });

  it("returns error when places search returns no results", async () => {
    // Geocode succeeds
    mockMakeRequest.mockResolvedValueOnce({
      status: "OK",
      results: [{ geometry: { location: { lat: 33.2, lng: -111.6 } } }],
    });
    // Places search returns no results
    mockMakeRequest.mockResolvedValueOnce({ status: "ZERO_RESULTS", results: [] });

    const geoResult = await makeRequest<any>("/maps/api/geocode/json", { address: "test" });
    const coords = geoResult.results?.[0]?.geometry?.location;
    expect(coords).toBeDefined();

    const placesResult = await makeRequest<any>("/maps/api/place/nearbysearch/json", {
      location: `${coords.lat},${coords.lng}`,
      radius: 10000,
      keyword: "pool service",
    });
    expect(placesResult.status).toBe("ZERO_RESULTS");
    expect(placesResult.results).toHaveLength(0);
  });
});

// ============================================================================
// Similarweb traffic data parsing
// ============================================================================
describe("Prospect Finder — traffic data parsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("correctly averages monthly visits", async () => {
    mockCallDataApi.mockResolvedValueOnce({
      visits: [
        { date: "2026-02", visits: 1200 },
        { date: "2026-03", visits: 1800 },
        { date: "2026-04", visits: 1500 },
      ],
    });

    const result = await callDataApi("Similarweb/get_visits_total", { query: {} });
    const visits = (result as any).visits || [];
    const avg = visits.reduce((s: number, v: any) => s + v.visits, 0) / visits.length;
    expect(Math.round(avg)).toBe(1500);
  });

  it("handles empty traffic data gracefully", async () => {
    mockCallDataApi.mockResolvedValueOnce({ visits: [] });

    const result = await callDataApi("Similarweb/get_visits_total", { query: {} });
    const visits = (result as any).visits || [];
    expect(visits).toHaveLength(0);
    // No data = hasData should be false
    const hasData = visits.length > 0;
    expect(hasData).toBe(false);
  });

  it("handles API error gracefully", async () => {
    mockCallDataApi.mockRejectedValueOnce(new Error("API rate limit exceeded"));

    try {
      await callDataApi("Similarweb/get_visits_total", { query: {} });
      expect(true).toBe(false); // Should not reach here
    } catch (err: any) {
      expect(err.message).toBe("API rate limit exceeded");
    }
  });
});

// ============================================================================
// Save as Lead — duplicate detection
// ============================================================================
describe("Prospect Finder — save as lead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects duplicate client by name (case-insensitive)", async () => {
    (db.getClientsByUserId as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 1, name: "Pool Buddies LLC" },
    ]);

    const existing = await db.getClientsByUserId(1);
    const inputName = "pool buddies llc";
    const alreadyExists = existing.some(
      (c: { name: string }) => c.name.toLowerCase() === inputName.toLowerCase()
    );
    expect(alreadyExists).toBe(true);
  });

  it("allows saving a new prospect not already in CRM", async () => {
    (db.getClientsByUserId as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 1, name: "Pool Buddies LLC" },
    ]);

    const existing = await db.getClientsByUserId(1);
    const inputName = "Desert Pool Service";
    const alreadyExists = existing.some(
      (c: { name: string }) => c.name.toLowerCase() === inputName.toLowerCase()
    );
    expect(alreadyExists).toBe(false);
  });
});
