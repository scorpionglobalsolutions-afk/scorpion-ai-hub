import { describe, it, expect } from "vitest";

/**
 * Apollo.io Integration Tests
 * Validates API key presence and webhook payload parsing logic
 */

describe("Apollo API Key", () => {
  it("should have APOLLO_API_KEY set in environment", () => {
    const key = process.env.APOLLO_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });
});

// Mirror the extractLeadData logic to test all Apollo formats without needing a live server
function extractApolloLeadData(body: any) {
  if (!body) return null;

  // Format 1: { contact: { ... } }
  if (body.contact && (body.contact.email || body.contact.first_name || body.contact.phone_numbers)) {
    const c = body.contact;
    const phone =
      c.sanitized_phone ||
      c.phone ||
      (Array.isArray(c.phone_numbers) && c.phone_numbers[0]?.sanitized_number) ||
      "";
    return {
      name: c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown",
      email: c.email || "",
      phone,
      business: c.organization_name || c.account?.name || "",
      source: `apollo:${body.event_type || "contact"}`,
    };
  }

  // Format 2: { person: { ... } }
  if (body.person && (body.person.email || body.person.first_name || body.person.sanitized_phone)) {
    const p = body.person;
    const phone =
      p.sanitized_phone ||
      p.mobile_phone ||
      p.phone ||
      (Array.isArray(p.phone_numbers) && p.phone_numbers[0]?.sanitized_number) ||
      "";
    return {
      name: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
      email: p.email || "",
      phone,
      business: p.organization?.name || p.company || p.organization_name || "",
      source: `apollo:${body.event_type || "person"}`,
    };
  }

  // Format 3: { data: { person: { ... } } }
  if (body.data?.person) {
    const p = body.data.person;
    const phone =
      p.sanitized_phone ||
      p.mobile_phone ||
      p.phone ||
      (Array.isArray(p.phone_numbers) && p.phone_numbers[0]?.sanitized_number) ||
      "";
    return {
      name: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
      email: p.email || "",
      phone,
      business: p.organization?.name || p.company || p.organization_name || "",
      source: `apollo:${body.type || "enriched"}`,
    };
  }

  // Format 4: flat top-level Apollo fields
  if (body.first_name || body.last_name || body.phone_number) {
    const phone =
      body.sanitized_phone ||
      body.phone_number ||
      body.mobile_phone ||
      body.phone ||
      (Array.isArray(body.phone_numbers) && body.phone_numbers[0]?.sanitized_number) ||
      "";
    return {
      name: `${body.first_name || ""} ${body.last_name || ""}`.trim() || body.name || "Unknown",
      email: body.email || "",
      phone,
      business: body.organization_name || body.company || "",
      source: `apollo:${body.event_type || "contact"}`,
    };
  }

  return null;
}

describe("Apollo Webhook Payload Parser", () => {
  it("Format 1: parses contact enriched payload with phone_numbers array", () => {
    const payload = {
      event_type: "contact_enriched",
      contact: {
        first_name: "Mike",
        last_name: "Johnson",
        email: "mike@roofpro.com",
        phone_numbers: [{ sanitized_number: "+16025551111", type: "mobile" }],
        organization_name: "RoofPro LLC",
        title: "Owner",
      },
    };
    const result = extractApolloLeadData(payload);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Mike Johnson");
    expect(result?.email).toBe("mike@roofpro.com");
    expect(result?.phone).toBe("+16025551111");
    expect(result?.business).toBe("RoofPro LLC");
    expect(result?.source).toBe("apollo:contact_enriched");
  });

  it("Format 2: parses person payload with sanitized_phone and nested organization", () => {
    const payload = {
      event_type: "contact_stage_change",
      person: {
        first_name: "Sarah",
        last_name: "Chen",
        email: "sarah@hvacpro.com",
        sanitized_phone: "+16025552222",
        organization: { name: "HVAC Pro" },
        title: "CEO",
      },
    };
    const result = extractApolloLeadData(payload);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Sarah Chen");
    expect(result?.phone).toBe("+16025552222");
    expect(result?.business).toBe("HVAC Pro");
    expect(result?.source).toBe("apollo:contact_stage_change");
  });

  it("Format 3: parses data.person payload with mobile_phone", () => {
    const payload = {
      type: "mobile_phone_enriched",
      data: {
        person: {
          first_name: "Tom",
          last_name: "Davis",
          email: "tom@loanfast.com",
          mobile_phone: "+16025553333",
          company: "LoanFast Inc",
          title: "VP",
        },
      },
    };
    const result = extractApolloLeadData(payload);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Tom Davis");
    expect(result?.phone).toBe("+16025553333");
    expect(result?.business).toBe("LoanFast Inc");
    expect(result?.source).toBe("apollo:mobile_phone_enriched");
  });

  it("Format 4: parses flat top-level Apollo fields", () => {
    const payload = {
      first_name: "Lisa",
      last_name: "Park",
      email: "lisa@realtypro.com",
      phone_number: "+16025554444",
      organization_name: "Realty Pro",
      title: "Agent",
    };
    const result = extractApolloLeadData(payload);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Lisa Park");
    expect(result?.phone).toBe("+16025554444");
    expect(result?.business).toBe("Realty Pro");
  });

  it("returns null for empty payload", () => {
    expect(extractApolloLeadData(null)).toBeNull();
    expect(extractApolloLeadData({})).toBeNull();
  });
});
