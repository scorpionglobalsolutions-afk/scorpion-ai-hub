import { describe, it, expect, vi } from "vitest";

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("SEO Scraper", () => {
  it("should export scrapeAllData function", async () => {
    const mod = await import("./seoScraper");
    expect(mod.scrapeAllData).toBeDefined();
    expect(typeof mod.scrapeAllData).toBe("function");
  });

  it("scrapeAllData should return correct structure with all required fields", async () => {
    // Mock a simple HTML response for the website
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `
        <html>
        <head>
          <title>Test Business</title>
          <meta name="description" content="Test description">
          <meta name="viewport" content="width=device-width">
          <link rel="canonical" href="https://test.com">
        </head>
        <body>
          <h1>Welcome</h1>
          <h2>Services</h2>
          <a href="tel:555-1234">Call Us</a>
          <p>123 Main St, Phoenix, AZ</p>
          <a href="https://facebook.com/test">Facebook</a>
          <button>Get Quote</button>
          <img src="test.jpg" alt="Test image">
        </body>
        </html>
      `,
      url: "https://test.com",
    });

    const { scrapeAllData } = await import("./seoScraper");
    const result = await scrapeAllData({
      businessName: "Test Business",
      website: "https://test.com",
      industry: "plumbing",
      location: "Phoenix, AZ",
    });

    // Verify structure
    expect(result).toHaveProperty("website");
    expect(result).toHaveProperty("google");
    expect(result).toHaveProperty("directories");
    expect(result).toHaveProperty("social");
    expect(result).toHaveProperty("competitors");

    // Verify website data
    expect(result.website).toHaveProperty("isAccessible");
    expect(result.website).toHaveProperty("isHttps");
    expect(result.website).toHaveProperty("hasTitle");
    expect(result.website).toHaveProperty("hasMetaDescription");
    expect(result.website).toHaveProperty("isMobileFriendly");
    expect(result.website).toHaveProperty("hasPhone");
    expect(result.website).toHaveProperty("hasAddress");
    expect(result.website).toHaveProperty("hasSocialLinks");
    expect(result.website).toHaveProperty("hasCTA");
    expect(result.website).toHaveProperty("brandColors");

    // Verify google data
    expect(result.google).toHaveProperty("found");
    expect(result.google).toHaveProperty("reviewCount");
    expect(result.google).toHaveProperty("rating");

    // Verify directories is an array
    expect(Array.isArray(result.directories)).toBe(true);
    expect(result.directories.length).toBeGreaterThan(0);
    expect(result.directories[0]).toHaveProperty("name");
    expect(result.directories[0]).toHaveProperty("status");

    // Verify social is an array
    expect(Array.isArray(result.social)).toBe(true);
    expect(result.social.length).toBeGreaterThan(0);
    expect(result.social[0]).toHaveProperty("platform");
    expect(result.social[0]).toHaveProperty("found");
  });

  it("should apply manual overrides for review count and rating", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => `<html><head><title>Test</title></head><body><h1>Hi</h1></body></html>`,
      url: "https://test.com",
    });

    const { scrapeAllData } = await import("./seoScraper");
    const result = await scrapeAllData({
      businessName: "Pool Buddies LLC",
      website: "https://poolbuddiesaz.com",
      industry: "pool service",
      location: "Queen Creek, AZ",
      overrides: {
        reviewCount: 38,
        rating: 4.9,
      },
    });

    // Overrides should be applied
    expect(result.google.reviewCount).toBe(38);
    expect(result.google.rating).toBe(4.9);
  });

  it("should handle missing website gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { scrapeAllData } = await import("./seoScraper");
    const result = await scrapeAllData({
      businessName: "No Website Business",
      industry: "landscaping",
    });

    // Should still return valid structure even without website
    expect(result.website.isAccessible).toBe(false);
    expect(result.google).toHaveProperty("found");
    expect(Array.isArray(result.directories)).toBe(true);
    expect(Array.isArray(result.social)).toBe(true);
  });
});
