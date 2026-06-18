/**
 * DataForSEO Keyword Data Integration
 * Fetches real keyword search volumes, CPC, and competition data
 * for use in the SEO Audit Advertising section.
 *
 * API Docs: https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/
 */

interface KeywordMetrics {
  keyword: string;
  monthlySearches: number;
  avgCpc: number; // USD
  competition: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  competitionIndex: number; // 0-100
  intent: "informational" | "commercial" | "transactional" | "navigational";
}

export interface KeywordDataResult {
  keywords: KeywordMetrics[];
  totalMonthlyOpportunity: number;
  topKeyword: KeywordMetrics | null;
  source: "dataforseo" | "fallback";
  error?: string;
}

/**
 * Generate seed keywords from business info
 */
function generateSeedKeywords(industry: string, location: string, businessName: string): string[] {
  const industryClean = industry.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const city = location.split(",")[0]?.trim() || location;
  const state = location.split(",")[1]?.trim() || "";
  const geo = state ? `${city} ${state}` : city;

  const seeds = [
    `${industryClean} near me`,
    `${industryClean} ${city}`,
    `best ${industryClean} ${city}`,
    `${industryClean} ${geo}`,
    `local ${industryClean}`,
    `affordable ${industryClean}`,
    `${industryClean} services`,
    `${industryClean} company ${city}`,
    `top ${industryClean} ${city}`,
    `${industryClean} quotes`,
  ];

  return Array.from(new Set(seeds)).slice(0, 10);
}

/**
 * Map industry to Google Ads location criteria ID
 * Default to US (2840) if location not mapped
 */
function getLocationId(location: string): number {
  const loc = location.toLowerCase();
  if (loc.includes("phoenix") || loc.includes("arizona") || loc.includes(", az")) return 1014221; // Phoenix, AZ
  if (loc.includes("los angeles") || loc.includes(", ca")) return 1013962; // Los Angeles
  if (loc.includes("new york") || loc.includes(", ny")) return 1023191; // New York
  if (loc.includes("chicago") || loc.includes(", il")) return 1016367; // Chicago
  if (loc.includes("houston") || loc.includes(", tx")) return 1026481; // Houston
  if (loc.includes("dallas") || loc.includes(", tx")) return 1026481;
  if (loc.includes("miami") || loc.includes(", fl")) return 1012873; // Miami
  if (loc.includes("atlanta") || loc.includes(", ga")) return 1012873;
  if (loc.includes("seattle") || loc.includes(", wa")) return 1027744;
  if (loc.includes("denver") || loc.includes(", co")) return 1013632;
  return 2840; // United States (national)
}

/**
 * Determine keyword intent based on keyword text
 */
function classifyIntent(keyword: string): KeywordMetrics["intent"] {
  const kw = keyword.toLowerCase();
  if (kw.includes("near me") || kw.includes("local") || kw.includes("best") || kw.includes("top")) return "commercial";
  if (kw.includes("buy") || kw.includes("hire") || kw.includes("quote") || kw.includes("cost") || kw.includes("price")) return "transactional";
  if (kw.includes("how") || kw.includes("what") || kw.includes("why") || kw.includes("when")) return "informational";
  return "commercial";
}

/**
 * Fetch real keyword data from DataForSEO
 */
export async function fetchKeywordData(
  industry: string,
  location: string,
  businessName: string
): Promise<KeywordDataResult> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  const seeds = generateSeedKeywords(industry, location, businessName);

  if (!login || !password) {
    console.warn("[KeywordData] DataForSEO credentials not set — using fallback estimates");
    return buildFallbackData(seeds, industry, location);
  }

  try {
    const credentials = Buffer.from(`${login}:${password}`).toString("base64");
    const locationId = getLocationId(location);

    // DataForSEO Keywords Data API — Search Volume Live
    const response = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            keywords: seeds,
            location_code: locationId,
            language_code: "en",
            date_interval: "next_month",
          },
        ]),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("[KeywordData] DataForSEO API error:", response.status, errText);
      return buildFallbackData(seeds, industry, location, `API error ${response.status}`);
    }

    const data = await response.json();

    if (data.status_code !== 20000 && data.tasks?.[0]?.status_code !== 20000) {
      console.error("[KeywordData] DataForSEO task error:", data.tasks?.[0]?.status_message);
      return buildFallbackData(seeds, industry, location, data.tasks?.[0]?.status_message);
    }

    const items: any[] = data.tasks?.[0]?.result || [];

    if (!items || items.length === 0) {
      return buildFallbackData(seeds, industry, location, "No results returned");
    }

    const keywords: KeywordMetrics[] = items
      .filter((item: any) => item.search_volume > 0)
      .map((item: any) => ({
        keyword: item.keyword,
        monthlySearches: item.search_volume || 0,
        avgCpc: parseFloat((item.cpc || 0).toFixed(2)),
        competition: mapCompetition(item.competition),
        competitionIndex: Math.round((item.competition_index || 0) * 100),
        intent: classifyIntent(item.keyword),
      }))
      .sort((a: KeywordMetrics, b: KeywordMetrics) => b.monthlySearches - a.monthlySearches)
      .slice(0, 8);

    // If all came back zero (common with very niche terms), use fallback
    if (keywords.length === 0) {
      return buildFallbackData(seeds, industry, location, "All keywords returned 0 volume");
    }

    const totalMonthlyOpportunity = keywords.reduce((sum, k) => sum + k.monthlySearches, 0);

    return {
      keywords,
      totalMonthlyOpportunity,
      topKeyword: keywords[0] || null,
      source: "dataforseo",
    };
  } catch (err: any) {
    console.error("[KeywordData] Fetch error:", err.message);
    return buildFallbackData(seeds, industry, location, err.message);
  }
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

/**
 * Fallback: return industry-typical estimates when API is unavailable
 * Clearly marked as estimates so the report is honest
 */
function buildFallbackData(
  seeds: string[],
  industry: string,
  location: string,
  reason?: string
): KeywordDataResult {
  console.warn("[KeywordData] Using fallback estimates. Reason:", reason || "unknown");

  // Industry-typical CPC ranges (conservative estimates)
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
  }));

  const totalMonthlyOpportunity = keywords.reduce((sum, k) => sum + k.monthlySearches, 0);

  return {
    keywords,
    totalMonthlyOpportunity,
    topKeyword: keywords[0] || null,
    source: "fallback",
    error: reason,
  };
}
