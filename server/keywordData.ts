/**
 * DataForSEO Keyword Data Integration — v2
 *
 * Strategy (in order of priority):
 * 1. If a website URL is provided → use DataForSEO "Ranked Keywords" API to pull
 *    the actual keywords the domain already ranks for in Google organic results.
 *    This shows REAL data, not guesses based on the industry label.
 * 2. Then call "Keyword Ideas" API using the top ranked keyword as a seed to find
 *    high-volume OPPORTUNITIES the domain is NOT yet ranking for.
 * 3. Merge both lists: ranked keywords (current performance) + keyword ideas (opportunities).
 * 4. If no website is provided, fall back to the seed-based approach using industry + location.
 * 5. If DataForSEO credentials are missing, use industry-typical estimates (clearly labelled).
 *
 * API Docs:
 *   Ranked Keywords: https://docs.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live/
 *   Keyword Ideas:   https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live/
 *   Search Volume:   https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/
 */

interface KeywordMetrics {
  keyword: string;
  monthlySearches: number;
  avgCpc: number;
  competition: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  competitionIndex: number;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  isRanking?: boolean;   // true = domain already ranks for this keyword
  rankPosition?: number; // current Google rank position if known
}

export interface KeywordDataResult {
  keywords: KeywordMetrics[];
  rankedKeywords: KeywordMetrics[];      // keywords the domain already ranks for
  opportunityKeywords: KeywordMetrics[]; // high-volume keywords not yet ranked
  totalMonthlyOpportunity: number;
  topKeyword: KeywordMetrics | null;
  topOpportunity: KeywordMetrics | null; // best unranked keyword to target
  source: "dataforseo" | "fallback";
  error?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getLocationCode(location: string): number {
  const loc = location.toLowerCase();
  if (loc.includes("phoenix") || loc.includes("arizona") || loc.includes(", az")) return 1014221;
  if (loc.includes("los angeles") || loc.includes(", ca")) return 1013962;
  if (loc.includes("new york") || loc.includes(", ny")) return 1023191;
  if (loc.includes("chicago") || loc.includes(", il")) return 1016367;
  if (loc.includes("houston") || loc.includes(", tx")) return 1026481;
  if (loc.includes("dallas") || loc.includes(", tx")) return 1026481;
  if (loc.includes("miami") || loc.includes(", fl")) return 1012873;
  if (loc.includes("atlanta") || loc.includes(", ga")) return 1012873;
  if (loc.includes("seattle") || loc.includes(", wa")) return 1027744;
  if (loc.includes("denver") || loc.includes(", co")) return 1013632;
  if (loc.includes("las vegas") || loc.includes(", nv")) return 1020546;
  if (loc.includes("san antonio") || loc.includes(", tx")) return 1026481;
  if (loc.includes("san diego") || loc.includes(", ca")) return 1013962;
  if (loc.includes("austin") || loc.includes(", tx")) return 1026481;
  if (loc.includes("nashville") || loc.includes(", tn")) return 1025402;
  if (loc.includes("charlotte") || loc.includes(", nc")) return 1024671;
  if (loc.includes("portland") || loc.includes(", or")) return 1027744;
  if (loc.includes("minneapolis") || loc.includes(", mn")) return 1019431;
  if (loc.includes("tampa") || loc.includes(", fl")) return 1012873;
  if (loc.includes("orlando") || loc.includes(", fl")) return 1012873;
  return 2840; // United States national
}

function classifyIntent(keyword: string): KeywordMetrics["intent"] {
  const kw = keyword.toLowerCase();
  if (kw.includes("near me") || kw.includes("local") || kw.includes("best") || kw.includes("top") || kw.includes("review")) return "commercial";
  if (kw.includes("buy") || kw.includes("hire") || kw.includes("quote") || kw.includes("cost") || kw.includes("price") || kw.includes("cheap") || kw.includes("affordable")) return "transactional";
  if (kw.includes("how") || kw.includes("what") || kw.includes("why") || kw.includes("when") || kw.includes("does")) return "informational";
  return "commercial";
}

function mapCompetition(val: number | string): KeywordMetrics["competition"] {
  if (typeof val === "string") {
    const v = val.toUpperCase();
    if (v === "LOW") return "LOW";
    if (v === "MEDIUM") return "MEDIUM";
    if (v === "HIGH") return "HIGH";
    return "UNKNOWN";
  }
  if (val < 0.33) return "LOW";
  if (val < 0.66) return "MEDIUM";
  return "HIGH";
}

function cleanDomain(website: string): string {
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  }
}

function makeAuth(login: string, password: string): string {
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

// ============================================================================
// STEP 1: RANKED KEYWORDS — what the domain already ranks for
// ============================================================================

async function fetchRankedKeywords(
  domain: string,
  locationCode: number,
  auth: string
): Promise<KeywordMetrics[]> {
  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        body: JSON.stringify([{
          target: domain,
          location_code: locationCode,
          language_code: "en",
          limit: 20,
          order_by: ["keyword_data.keyword_info.search_volume,desc"],
          filters: [
            ["keyword_data.keyword_info.search_volume", ">", 50],
            "and",
            ["ranked_serp_element.serp_item.rank_group", "<=", 50],
          ],
        }]),
      }
    );

    if (!response.ok) {
      console.warn("[KeywordData] Ranked keywords API error:", response.status);
      return [];
    }

    const data = await response.json();
    const items: any[] = data.tasks?.[0]?.result?.[0]?.items || [];

    return items
      .filter((item: any) => item.keyword_data?.keyword_info?.search_volume > 0)
      .slice(0, 10)
      .map((item: any) => ({
        keyword: item.keyword_data.keyword,
        monthlySearches: item.keyword_data.keyword_info.search_volume || 0,
        avgCpc: parseFloat((item.keyword_data.keyword_info.cpc || 0).toFixed(2)),
        competition: mapCompetition(item.keyword_data.keyword_info.competition || 0),
        competitionIndex: Math.round((item.keyword_data.keyword_info.competition_index || 0)),
        intent: classifyIntent(item.keyword_data.keyword),
        isRanking: true,
        rankPosition: item.ranked_serp_element?.serp_item?.rank_group || null,
      }))
      .sort((a: KeywordMetrics, b: KeywordMetrics) => b.monthlySearches - a.monthlySearches);
  } catch (err: any) {
    console.warn("[KeywordData] Ranked keywords fetch error:", err.message);
    return [];
  }
}

// ============================================================================
// STEP 2: KEYWORD IDEAS — high-volume opportunities not yet ranked
// ============================================================================

async function fetchKeywordIdeas(
  seedKeyword: string,
  locationCode: number,
  auth: string,
  excludeKeywords: string[]
): Promise<KeywordMetrics[]> {
  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        body: JSON.stringify([{
          keywords: [seedKeyword],
          location_code: locationCode,
          language_code: "en",
          limit: 30,
          order_by: ["keyword_data.keyword_info.search_volume,desc"],
          filters: [
            ["keyword_data.keyword_info.search_volume", ">", 100],
          ],
        }]),
      }
    );

    if (!response.ok) {
      console.warn("[KeywordData] Keyword ideas API error:", response.status);
      return [];
    }

    const data = await response.json();
    const items: any[] = data.tasks?.[0]?.result?.[0]?.items || [];
    const excludeSet = new Set(excludeKeywords.map((k) => k.toLowerCase()));

    return items
      .filter((item: any) =>
        item.keyword_data?.keyword_info?.search_volume > 0 &&
        !excludeSet.has(item.keyword_data.keyword.toLowerCase())
      )
      .slice(0, 10)
      .map((item: any) => ({
        keyword: item.keyword_data.keyword,
        monthlySearches: item.keyword_data.keyword_info.search_volume || 0,
        avgCpc: parseFloat((item.keyword_data.keyword_info.cpc || 0).toFixed(2)),
        competition: mapCompetition(item.keyword_data.keyword_info.competition || 0),
        competitionIndex: Math.round((item.keyword_data.keyword_info.competition_index || 0)),
        intent: classifyIntent(item.keyword_data.keyword),
        isRanking: false,
      }))
      .sort((a: KeywordMetrics, b: KeywordMetrics) => b.monthlySearches - a.monthlySearches);
  } catch (err: any) {
    console.warn("[KeywordData] Keyword ideas fetch error:", err.message);
    return [];
  }
}

// ============================================================================
// STEP 3: SEARCH VOLUME FALLBACK — for seed keywords when no domain is provided
// ============================================================================

async function fetchSearchVolume(
  seeds: string[],
  locationCode: number,
  auth: string
): Promise<KeywordMetrics[]> {
  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        body: JSON.stringify([{
          keywords: seeds,
          location_code: locationCode,
          language_code: "en",
          date_interval: "next_month",
        }]),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const items: any[] = data.tasks?.[0]?.result || [];

    return items
      .filter((item: any) => item.search_volume > 0)
      .map((item: any) => ({
        keyword: item.keyword,
        monthlySearches: item.search_volume || 0,
        avgCpc: parseFloat((item.cpc || 0).toFixed(2)),
        competition: mapCompetition(item.competition || 0),
        competitionIndex: Math.round((item.competition_index || 0) * 100),
        intent: classifyIntent(item.keyword),
        isRanking: false,
      }))
      .sort((a: KeywordMetrics, b: KeywordMetrics) => b.monthlySearches - a.monthlySearches);
  } catch (err: any) {
    console.warn("[KeywordData] Search volume fetch error:", err.message);
    return [];
  }
}

// ============================================================================
// SEED GENERATOR — fallback when no domain provided
// ============================================================================

function generateSeedKeywords(industry: string, location: string): string[] {
  const industryClean = industry.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const city = location.split(",")[0]?.trim() || location;
  const state = location.split(",")[1]?.trim() || "";
  const geo = state ? `${city} ${state}` : city;

  return Array.from(new Set([
    `${industryClean} near me`,
    `${industryClean} ${city}`,
    `best ${industryClean} ${city}`,
    `${industryClean} ${geo}`,
    `affordable ${industryClean}`,
    `${industryClean} services`,
    `${industryClean} company ${city}`,
    `top ${industryClean} ${city}`,
    `${industryClean} quotes`,
    `${industryClean} cost`,
  ])).slice(0, 10);
}

// ============================================================================
// FALLBACK — industry estimates when DataForSEO is unavailable
// ============================================================================

function buildFallbackData(
  seeds: string[],
  industry: string,
  reason?: string
): KeywordDataResult {
  console.warn("[KeywordData] Using fallback estimates. Reason:", reason || "unknown");

  const industryDefaults: Record<string, { cpc: number; baseVolume: number }> = {
    insurance: { cpc: 18.5, baseVolume: 1200 },
    loan: { cpc: 22.0, baseVolume: 900 },
    lending: { cpc: 20.0, baseVolume: 800 },
    mortgage: { cpc: 25.0, baseVolume: 1400 },
    hvac: { cpc: 14.0, baseVolume: 700 },
    roofing: { cpc: 16.0, baseVolume: 600 },
    pool: { cpc: 8.0, baseVolume: 400 },
    plumbing: { cpc: 12.0, baseVolume: 550 },
    dental: { cpc: 10.0, baseVolume: 800 },
    legal: { cpc: 35.0, baseVolume: 500 },
    realty: { cpc: 12.0, baseVolume: 700 },
    real_estate: { cpc: 12.0, baseVolume: 700 },
    default: { cpc: 8.0, baseVolume: 400 },
  };

  const industryKey = Object.keys(industryDefaults).find((k) =>
    industry.toLowerCase().includes(k)
  ) || "default";
  const defaults = industryDefaults[industryKey];

  const keywords: KeywordMetrics[] = seeds.slice(0, 6).map((kw, i) => ({
    keyword: kw,
    monthlySearches: Math.round(defaults.baseVolume * (1 - i * 0.12)),
    avgCpc: parseFloat((defaults.cpc * (1 - i * 0.05)).toFixed(2)),
    competition: i < 2 ? "HIGH" : i < 4 ? "MEDIUM" : "LOW",
    competitionIndex: Math.max(20, 85 - i * 12),
    intent: classifyIntent(kw),
    isRanking: false,
  }));

  const totalMonthlyOpportunity = keywords.reduce((sum, k) => sum + k.monthlySearches, 0);

  return {
    keywords,
    rankedKeywords: [],
    opportunityKeywords: keywords,
    totalMonthlyOpportunity,
    topKeyword: keywords[0] || null,
    topOpportunity: keywords[0] || null,
    source: "fallback",
    error: reason,
  };
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export async function fetchKeywordData(
  industry: string,
  location: string,
  businessName: string,
  website?: string
): Promise<KeywordDataResult> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  const locationCode = getLocationCode(location);
  const seeds = generateSeedKeywords(industry, location);

  if (!login || !password) {
    console.warn("[KeywordData] DataForSEO credentials not set — using fallback estimates");
    return buildFallbackData(seeds, industry);
  }

  const auth = makeAuth(login, password);

  try {
    let rankedKeywords: KeywordMetrics[] = [];
    let opportunityKeywords: KeywordMetrics[] = [];

    if (website) {
      // ── PATH A: Domain-based discovery ──────────────────────────────────
      const domain = cleanDomain(website);
      console.log(`[KeywordData] Fetching ranked keywords for domain: ${domain}`);

      // Step 1: Get keywords the domain already ranks for
      rankedKeywords = await fetchRankedKeywords(domain, locationCode, auth);
      console.log(`[KeywordData] Found ${rankedKeywords.length} ranked keywords for ${domain}`);

      // Step 2: Use top ranked keyword (or industry seed) to find opportunities
      const seedForIdeas = rankedKeywords[0]?.keyword || `${industry.toLowerCase()} ${location.split(",")[0]?.trim() || ""}`.trim();
      const rankedSet = rankedKeywords.map((k) => k.keyword);

      opportunityKeywords = await fetchKeywordIdeas(seedForIdeas, locationCode, auth, rankedSet);
      console.log(`[KeywordData] Found ${opportunityKeywords.length} opportunity keywords`);

      // If ranked keywords came back empty, fall back to seed search volume
      if (rankedKeywords.length === 0) {
        console.warn("[KeywordData] No ranked keywords found — falling back to seed search volume");
        const seedVolumes = await fetchSearchVolume(seeds, locationCode, auth);
        opportunityKeywords = seedVolumes;
      }

      // If opportunity keywords have very low total volume (< 500/mo), try national-level keyword ideas
      const totalOpportunityVolume = opportunityKeywords.reduce((sum, k) => sum + k.monthlySearches, 0);
      if (totalOpportunityVolume < 500) {
        console.warn(`[KeywordData] Low local volume (${totalOpportunityVolume}/mo) — expanding to national keyword ideas`);
        const nationalSeed = `${industry.toLowerCase()} near me`;
        const nationalIdeas = await fetchKeywordIdeas(nationalSeed, 2840, auth, rankedKeywords.map(k => k.keyword));
        const nationalVolume = nationalIdeas.reduce((s, k) => s + k.monthlySearches, 0);
        if (nationalIdeas.length > 0 && nationalVolume > totalOpportunityVolume) {
          opportunityKeywords = nationalIdeas;
          console.log(`[KeywordData] Switched to national keywords — ${nationalIdeas.length} ideas, top: ${nationalIdeas[0]?.keyword} (${nationalIdeas[0]?.monthlySearches}/mo)`);
        }
        // If national ideas also have low volume, use Google Ads search volume with broad industry seeds
        const bestVolume = Math.max(totalOpportunityVolume, nationalVolume);
        if (bestVolume < 500) {
          console.warn(`[KeywordData] National ideas also low volume (${nationalVolume}/mo) — using Google Ads search volume for broad seeds`);
          const broadSeeds = [
            `${industry.toLowerCase()} near me`,
            `${industry.toLowerCase()} online`,
            `best ${industry.toLowerCase()}`,
            `${industry.toLowerCase()} rates`,
            `${industry.toLowerCase()} company`,
            `${industry.toLowerCase()} services`,
            `fast ${industry.toLowerCase()}`,
            `${industry.toLowerCase()} bad credit`,
            `${industry.toLowerCase()} no credit check`,
            `${industry.toLowerCase()} same day`,
          ];
          const broadVolumes = await fetchSearchVolume(broadSeeds, 2840, auth);
          if (broadVolumes.length > 0 && broadVolumes.reduce((s, k) => s + k.monthlySearches, 0) > bestVolume) {
            opportunityKeywords = broadVolumes;
            console.log(`[KeywordData] Using Google Ads broad seeds — ${broadVolumes.length} keywords, top: ${broadVolumes[0]?.keyword} (${broadVolumes[0]?.monthlySearches}/mo, \$${broadVolumes[0]?.avgCpc} CPC)`);
          }
        }
      }
    } else {
      // ── PATH B: No domain — use seed keywords ────────────────────────────
      console.log("[KeywordData] No website provided — using seed keyword search volume");
      const seedVolumes = await fetchSearchVolume(seeds, locationCode, auth);
      opportunityKeywords = seedVolumes;
    }

    // Merge: ranked first, then opportunities (no duplicates)
    const rankedSet = new Set(rankedKeywords.map((k) => k.keyword.toLowerCase()));
    const uniqueOpportunities = opportunityKeywords.filter(
      (k) => !rankedSet.has(k.keyword.toLowerCase())
    );

    const allKeywords = [...rankedKeywords, ...uniqueOpportunities].slice(0, 10);

    if (allKeywords.length === 0) {
      return buildFallbackData(seeds, industry, "No keyword data returned from DataForSEO");
    }

    const totalMonthlyOpportunity = uniqueOpportunities.reduce((sum, k) => sum + k.monthlySearches, 0);

    return {
      keywords: allKeywords,
      rankedKeywords,
      opportunityKeywords: uniqueOpportunities,
      totalMonthlyOpportunity,
      topKeyword: rankedKeywords[0] || allKeywords[0] || null,
      topOpportunity: uniqueOpportunities[0] || null,
      source: "dataforseo",
    };
  } catch (err: any) {
    console.error("[KeywordData] Unexpected error:", err.message);
    return buildFallbackData(seeds, industry, err.message);
  }
}
