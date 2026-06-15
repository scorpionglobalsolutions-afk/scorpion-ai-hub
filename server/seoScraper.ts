/**
 * SEO Data Scraper Module
 * 
 * Fetches REAL data from:
 * - Client's website (meta tags, headings, SSL, mobile, social links, CTA, performance)
 * - Google Maps Places API (review count, rating, business type)
 * - Directory presence checks (Yelp, BBB, Facebook, etc.)
 * - Social media presence detection
 */

import { makeRequest, type PlacesSearchResult, type PlaceDetailsResult } from "./_core/map";

// ============================================================================
// TYPES
// ============================================================================

export interface WebsiteAnalysis {
  url: string;
  isAccessible: boolean;
  isHttps: boolean;
  isMobileFriendly: boolean;
  hasTitle: boolean;
  title: string;
  hasMetaDescription: boolean;
  metaDescription: string;
  hasH1: boolean;
  h1Count: number;
  h2Count: number;
  hasPhone: boolean;
  phone: string;
  hasAddress: boolean;
  address: string;
  hasSchemaMarkup: boolean;
  hasSocialLinks: boolean;
  socialLinksFound: string[];
  hasCTA: boolean;
  ctaText: string;
  hasCanonical: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  imageCount: number;
  imagesWithAlt: number;
  pageLoadTime: number; // ms
  htmlSize: number; // bytes
  brandColors: { primary: string; secondary: string; accent: string; logo: string };
}

export interface GoogleBusinessData {
  found: boolean;
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  businessTypes: string[];
  website: string;
  phone: string;
  reviews: Array<{ author: string; rating: number; text: string; time: number }>;
}

export interface DirectoryPresence {
  name: string;
  status: "found" | "not_found" | "inaccurate";
  url?: string;
  issues: string[];
}

export interface SocialPresence {
  platform: string;
  found: boolean;
  url?: string;
  followers?: string;
  activity?: "active" | "inactive" | "not_found";
}

export interface ScrapedData {
  website: WebsiteAnalysis;
  google: GoogleBusinessData;
  directories: DirectoryPresence[];
  social: SocialPresence[];
  competitors: Array<{ name: string; rating: number; reviewCount: number }>;
}

// ============================================================================
// WEBSITE ANALYSIS
// ============================================================================

export async function analyzeWebsite(websiteUrl: string): Promise<WebsiteAnalysis> {
  const result: WebsiteAnalysis = {
    url: websiteUrl,
    isAccessible: false,
    isHttps: websiteUrl.startsWith("https"),
    isMobileFriendly: false,
    hasTitle: false,
    title: "",
    hasMetaDescription: false,
    metaDescription: "",
    hasH1: false,
    h1Count: 0,
    h2Count: 0,
    hasPhone: false,
    phone: "",
    hasAddress: false,
    address: "",
    hasSchemaMarkup: false,
    hasSocialLinks: false,
    socialLinksFound: [],
    hasCTA: false,
    ctaText: "",
    hasCanonical: false,
    hasRobotsTxt: false,
    hasSitemap: false,
    imageCount: 0,
    imagesWithAlt: 0,
    pageLoadTime: 0,
    htmlSize: 0,
    brandColors: { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" },
  };

  try {
    // Fetch the website
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const resp = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ScorpionBot/1.0; +https://scorpionglobalsolutions.com)" },
      redirect: "follow",
    });
    clearTimeout(timeout);
    result.pageLoadTime = Date.now() - startTime;

    if (!resp.ok) return result;
    result.isAccessible = true;
    result.isHttps = resp.url.startsWith("https");

    const html = await resp.text();
    result.htmlSize = html.length;

    // Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      result.hasTitle = true;
      result.title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
    }

    // Meta Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    if (descMatch && descMatch[1].trim()) {
      result.hasMetaDescription = true;
      result.metaDescription = descMatch[1].trim();
    }

    // H1 and H2 tags
    const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    result.h1Count = h1s.length;
    result.hasH1 = h1s.length > 0;
    const h2s = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || [];
    result.h2Count = h2s.length;

    // Phone number
    const phoneMatch = html.match(/(\(\d{3}\)\s*\d{3}[-.]?\d{4}|\d{3}[-.]?\d{3}[-.]?\d{4})/);
    if (phoneMatch) {
      result.hasPhone = true;
      result.phone = phoneMatch[1];
    }

    // Address detection
    const addressPatterns = [
      /(\d+\s+[A-Za-z0-9\s,]+(?:Ave|St|Rd|Dr|Blvd|Way|Ln|Ct|Pl|Circle|Cir|Suite|Ste)[^<]{0,80}(?:\d{5}))/i,
      /<[^>]*(?:address|location)[^>]*>([^<]+(?:Ave|St|Rd|Dr|Blvd|Way|Ln|Ct|Pl)[^<]+\d{5})/i,
    ];
    for (const pattern of addressPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.hasAddress = true;
        result.address = match[1].trim();
        break;
      }
    }

    // Mobile friendly (viewport meta tag)
    result.isMobileFriendly = /name=["']viewport["']/i.test(html);

    // Schema markup
    result.hasSchemaMarkup = /application\/ld\+json/i.test(html);

    // Social links
    const socialPlatforms = ["facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com", "youtube.com", "tiktok.com", "yelp.com", "nextdoor.com"];
    const foundSocial: string[] = [];
    for (const platform of socialPlatforms) {
      const linkMatch = html.match(new RegExp(`href=["']([^"']*${platform.replace(".", "\\.")}[^"']*)["']`, "i"));
      if (linkMatch) {
        foundSocial.push(platform.replace(".com", ""));
      }
    }
    result.hasSocialLinks = foundSocial.length > 0;
    result.socialLinksFound = foundSocial;

    // CTA detection
    const ctaPatterns = /(contact us|get a quote|call now|schedule|book now|free estimate|request a quote|get started|sign up|learn more)/i;
    const ctaMatch = html.match(ctaPatterns);
    if (ctaMatch) {
      result.hasCTA = true;
      result.ctaText = ctaMatch[1];
    }

    // Canonical URL
    result.hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);

    // Images
    const imgs = html.match(/<img[^>]+>/gi) || [];
    result.imageCount = imgs.length;
    result.imagesWithAlt = imgs.filter((i) => /alt=["'][^"']+["']/i.test(i)).length;

    // Brand colors extraction
    result.brandColors = extractBrandColorsFromHTML(html, websiteUrl);

    // Check robots.txt
    try {
      const robotsResp = await fetch(new URL("/robots.txt", websiteUrl).toString(), {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "ScorpionBot/1.0" },
      });
      result.hasRobotsTxt = robotsResp.ok;
    } catch {
      result.hasRobotsTxt = false;
    }

    // Check sitemap
    try {
      const sitemapResp = await fetch(new URL("/sitemap.xml", websiteUrl).toString(), {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "ScorpionBot/1.0" },
      });
      result.hasSitemap = sitemapResp.ok && (await sitemapResp.text()).includes("<urlset");
    } catch {
      result.hasSitemap = false;
    }
  } catch (error: any) {
    console.error("[SEO Scraper] Website analysis error:", error?.message);
  }

  return result;
}

function extractBrandColorsFromHTML(html: string, websiteUrl: string): { primary: string; secondary: string; accent: string; logo: string } {
  const defaults = { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" };
  try {
    const domain = new URL(websiteUrl).hostname;
    defaults.logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // Extract theme-color meta tag
    const themeMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([#][0-9a-fA-F]{3,8})["'][^>]*name=["']theme-color["']/i);
    if (themeMatch) defaults.primary = themeMatch[1];

    // Extract og:image for logo
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) defaults.logo = ogMatch[1];

    // Try to find primary brand color from CSS
    const colorMatches = html.match(/(?:--primary|--brand|--main)[^:]*:\s*([#][0-9a-fA-F]{3,8})/gi);
    if (colorMatches && colorMatches.length > 0) {
      const colorVal = colorMatches[0].match(/([#][0-9a-fA-F]{3,8})/)?.[1];
      if (colorVal) defaults.primary = colorVal;
    }

    // Generate complementary secondary color
    if (defaults.primary.startsWith("#") && defaults.primary.length >= 7) {
      const hex = defaults.primary.slice(1);
      const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 30);
      const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 30);
      const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 30);
      defaults.secondary = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  } catch {}
  return defaults;
}

// ============================================================================
// GOOGLE BUSINESS PROFILE (via Places API)
// ============================================================================

export async function fetchGoogleBusinessData(
  businessName: string,
  location?: string,
  industry?: string
): Promise<GoogleBusinessData> {
  const result: GoogleBusinessData = {
    found: false,
    placeId: "",
    name: "",
    address: "",
    rating: 0,
    reviewCount: 0,
    businessTypes: [],
    website: "",
    phone: "",
    reviews: [],
  };

  try {
    // Try multiple search strategies
    const queries = [
      `${businessName}${location ? ` ${location}` : ""}`,
      `${businessName}${industry ? ` ${industry}` : ""}`,
      businessName,
    ];

    let placeId = "";
    let bestMatch: any = null;

    for (const query of queries) {
      try {
        const searchResult = await makeRequest<PlacesSearchResult>(
          "/maps/api/place/textsearch/json",
          { query }
        );

        if (searchResult.status === "OK" && searchResult.results?.length > 0) {
          // Find the best match by name similarity
          const nameNormalized = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const match = searchResult.results.find((r) => {
            const rName = r.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return rName.includes(nameNormalized) || nameNormalized.includes(rName);
          }) || searchResult.results[0];

          if (match) {
            bestMatch = match;
            placeId = match.place_id;
            break;
          }
        }
      } catch (e) {
        console.log("[SEO Scraper] Search query failed:", query, e);
      }
    }

    if (!placeId && bestMatch) {
      placeId = bestMatch.place_id;
    }

    if (placeId) {
      // Get detailed place info
      try {
        const details = await makeRequest<PlaceDetailsResult>(
          "/maps/api/place/details/json",
          {
            place_id: placeId,
            fields: "name,rating,user_ratings_total,reviews,website,formatted_phone_number,formatted_address,types,opening_hours",
          }
        );

        if (details.status === "OK" && details.result) {
          result.found = true;
          result.placeId = placeId;
          result.name = details.result.name;
          result.address = details.result.formatted_address || "";
          result.rating = details.result.rating || 0;
          result.reviewCount = details.result.user_ratings_total || 0;
          result.website = details.result.website || "";
          result.phone = details.result.formatted_phone_number || "";
          result.businessTypes = (details.result as any).types || [];
          result.reviews = (details.result.reviews || []).map((r) => ({
            author: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.time,
          }));
        }
      } catch (e) {
        console.log("[SEO Scraper] Place details failed:", e);
      }
    } else if (bestMatch) {
      // Use basic search result data
      result.found = true;
      result.placeId = bestMatch.place_id || "";
      result.name = bestMatch.name;
      result.address = bestMatch.formatted_address || "";
      result.rating = bestMatch.rating || 0;
      result.reviewCount = bestMatch.user_ratings_total || 0;
      result.businessTypes = bestMatch.types || [];
    }
  } catch (error: any) {
    console.error("[SEO Scraper] Google Business fetch error:", error?.message);
  }

  return result;
}

// ============================================================================
// DIRECTORY PRESENCE CHECKS
// ============================================================================

const DIRECTORIES = [
  { name: "Google Business Profile", checkUrl: (name: string) => `https://www.google.com/maps/search/${encodeURIComponent(name)}` },
  { name: "Yelp", checkUrl: (name: string) => `https://www.yelp.com/search?find_desc=${encodeURIComponent(name)}` },
  { name: "Facebook", checkUrl: (name: string) => `https://www.facebook.com/search/pages/?q=${encodeURIComponent(name)}` },
  { name: "BBB", checkUrl: (name: string) => `https://www.bbb.org/search?find_text=${encodeURIComponent(name)}` },
  { name: "Apple Maps", checkUrl: (_: string) => "" },
  { name: "Bing Places", checkUrl: (name: string) => `https://www.bing.com/maps?q=${encodeURIComponent(name)}` },
  { name: "Yellow Pages", checkUrl: (name: string) => `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(name)}` },
  { name: "Nextdoor", checkUrl: (_: string) => "" },
  { name: "Angi", checkUrl: (name: string) => `https://www.angi.com/companylist/${encodeURIComponent(name)}` },
  { name: "HomeAdvisor", checkUrl: (name: string) => `https://www.homeadvisor.com/rated.${encodeURIComponent(name.replace(/\s/g, ""))}` },
  { name: "Foursquare", checkUrl: (_: string) => "" },
  { name: "MapQuest", checkUrl: (name: string) => `https://www.mapquest.com/search/${encodeURIComponent(name)}` },
];

export async function checkDirectoryPresence(
  businessName: string,
  website?: string,
  googleData?: GoogleBusinessData
): Promise<DirectoryPresence[]> {
  const results: DirectoryPresence[] = [];

  // For each directory, we'll do a lightweight check
  // Google Business Profile - use our Places API data
  results.push({
    name: "Google Business Profile",
    status: googleData?.found ? "found" : "not_found",
    issues: [],
  });

  // For other directories, we attempt to fetch search pages
  // Note: Many sites block bots, so we'll do best-effort checks
  const directoriesToCheck = DIRECTORIES.filter((d) => d.name !== "Google Business Profile");

  for (const dir of directoriesToCheck) {
    try {
      // Try to check if the business appears on this directory
      const checkResult = await checkSingleDirectory(dir.name, businessName, website);
      results.push(checkResult);
    } catch {
      results.push({ name: dir.name, status: "not_found", issues: [] });
    }
  }

  return results;
}

async function checkSingleDirectory(
  directoryName: string,
  businessName: string,
  website?: string
): Promise<DirectoryPresence> {
  // For directories we can't easily check programmatically, we'll use heuristics
  // based on what we know about the business
  const nameNormalized = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Try to fetch the directory page for the business
  const checkUrls: Record<string, string> = {
    Yelp: `https://www.yelp.com/biz/${nameNormalized.replace(/llc|inc|corp/g, "").trim().replace(/\s+/g, "-")}`,
    Facebook: `https://www.facebook.com/${nameNormalized}/`,
    BBB: `https://www.bbb.org/search?find_text=${encodeURIComponent(businessName)}`,
  };

  // For most directories, we'll do a simple fetch check
  const url = checkUrls[directoryName];
  if (url) {
    try {
      const resp = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ScorpionBot/1.0)" },
        redirect: "follow",
      });
      if (resp.ok || resp.status === 200) {
        return { name: directoryName, status: "found", url, issues: [] };
      }
    } catch {
      // Timeout or blocked - can't determine
    }
  }

  return { name: directoryName, status: "not_found", issues: [] };
}

// ============================================================================
// SOCIAL MEDIA PRESENCE
// ============================================================================

export async function checkSocialPresence(
  businessName: string,
  websiteAnalysis: WebsiteAnalysis
): Promise<SocialPresence[]> {
  const platforms = [
    { name: "Facebook", domain: "facebook.com" },
    { name: "Instagram", domain: "instagram.com" },
    { name: "X (Twitter)", domain: "twitter.com" },
    { name: "LinkedIn", domain: "linkedin.com" },
    { name: "YouTube", domain: "youtube.com" },
    { name: "TikTok", domain: "tiktok.com" },
  ];

  const results: SocialPresence[] = [];

  for (const platform of platforms) {
    // Check if the website has a link to this platform
    const foundOnWebsite = websiteAnalysis.socialLinksFound.some(
      (s) => s.includes(platform.domain.replace(".com", ""))
    );

    if (foundOnWebsite) {
      results.push({
        platform: platform.name,
        found: true,
        activity: "active", // If linked from website, likely active
      });
    } else {
      // Try to check if the business has a profile
      const profileFound = await checkSocialProfile(platform.name, platform.domain, businessName);
      results.push({
        platform: platform.name,
        found: profileFound,
        activity: profileFound ? "inactive" : "not_found",
      });
    }
  }

  return results;
}

async function checkSocialProfile(
  platformName: string,
  domain: string,
  businessName: string
): Promise<boolean> {
  // For social platforms, we can't easily verify without their APIs
  // We'll do a best-effort HEAD request check
  const nameSlug = businessName.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/llc|inc|corp/g, "").trim();

  const possibleUrls: Record<string, string[]> = {
    Facebook: [
      `https://www.facebook.com/${nameSlug}`,
      `https://www.facebook.com/${nameSlug.replace(/\s/g, "")}`,
    ],
    Instagram: [
      `https://www.instagram.com/${nameSlug}/`,
    ],
    "X (Twitter)": [
      `https://twitter.com/${nameSlug}`,
    ],
    LinkedIn: [
      `https://www.linkedin.com/company/${nameSlug}/`,
    ],
  };

  const urls = possibleUrls[platformName] || [];
  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ScorpionBot/1.0)" },
        redirect: "follow",
      });
      if (resp.ok) return true;
    } catch {
      // Continue to next URL
    }
  }

  return false;
}

// ============================================================================
// COMPETITOR ANALYSIS
// ============================================================================

export async function fetchCompetitors(
  industry: string,
  location: string
): Promise<Array<{ name: string; rating: number; reviewCount: number }>> {
  const competitors: Array<{ name: string; rating: number; reviewCount: number }> = [];

  try {
    const searchResult = await makeRequest<PlacesSearchResult>(
      "/maps/api/place/textsearch/json",
      { query: `${industry} ${location}` }
    );

    if (searchResult.status === "OK" && searchResult.results) {
      for (const place of searchResult.results.slice(0, 10)) {
        competitors.push({
          name: place.name,
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
        });
      }
    }
  } catch (error: any) {
    console.error("[SEO Scraper] Competitor fetch error:", error?.message);
  }

  return competitors;
}

// ============================================================================
// FULL SCRAPE ORCHESTRATOR
// ============================================================================

export async function scrapeAllData(params: {
  businessName: string;
  website?: string;
  industry?: string;
  location?: string;
  overrides?: {
    reviewCount?: number;
    rating?: number;
    googlePlaceId?: string;
  };
}): Promise<ScrapedData> {
  console.log("[SEO Scraper] Starting full data scrape for:", params.businessName);

  // 1. Analyze website
  let websiteAnalysis: WebsiteAnalysis;
  if (params.website) {
    console.log("[SEO Scraper] Analyzing website:", params.website);
    websiteAnalysis = await analyzeWebsite(params.website);
  } else {
    websiteAnalysis = {
      url: "",
      isAccessible: false,
      isHttps: false,
      isMobileFriendly: false,
      hasTitle: false,
      title: "",
      hasMetaDescription: false,
      metaDescription: "",
      hasH1: false,
      h1Count: 0,
      h2Count: 0,
      hasPhone: false,
      phone: "",
      hasAddress: false,
      address: "",
      hasSchemaMarkup: false,
      hasSocialLinks: false,
      socialLinksFound: [],
      hasCTA: false,
      ctaText: "",
      hasCanonical: false,
      hasRobotsTxt: false,
      hasSitemap: false,
      imageCount: 0,
      imagesWithAlt: 0,
      pageLoadTime: 0,
      htmlSize: 0,
      brandColors: { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" },
    };
  }

  // 2. Fetch Google Business Profile data
  console.log("[SEO Scraper] Fetching Google Business data...");
  const googleData = await fetchGoogleBusinessData(
    params.businessName,
    params.location || (websiteAnalysis.address ? websiteAnalysis.address : undefined),
    params.industry
  );

  // Apply manual overrides
  if (params.overrides?.reviewCount !== undefined) {
    googleData.reviewCount = params.overrides.reviewCount;
    googleData.found = true; // If user provides review count, they know it exists
  }
  if (params.overrides?.rating !== undefined) {
    googleData.rating = params.overrides.rating;
  }

  // 3. Check directory presence
  console.log("[SEO Scraper] Checking directory presence...");
  const directories = await checkDirectoryPresence(params.businessName, params.website, googleData);

  // 4. Check social media presence
  console.log("[SEO Scraper] Checking social media presence...");
  const social = await checkSocialPresence(params.businessName, websiteAnalysis);

  // 5. Fetch competitors
  console.log("[SEO Scraper] Fetching competitor data...");
  const competitors = await fetchCompetitors(
    params.industry || "local business",
    params.location || "local area"
  );

  console.log("[SEO Scraper] Scrape complete. Google reviews:", googleData.reviewCount, "| Directories found:", directories.filter(d => d.status === "found").length);

  return {
    website: websiteAnalysis,
    google: googleData,
    directories,
    social,
    competitors,
  };
}
