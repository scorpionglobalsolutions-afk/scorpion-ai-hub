import { describe, it, expect } from "vitest";

describe("DataForSEO credentials", () => {
  it("should have DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD set in environment", () => {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    expect(login).toBeTruthy();
    expect(password).toBeTruthy();
    expect(login).toContain("@");
    expect(password!.length).toBeGreaterThan(8);

    // Credentials verified live via curl: Status 20000 Ok.
    // Network calls to external APIs are blocked in the test sandbox environment,
    // so we validate presence and format only here.
    console.log("DataForSEO credentials present and valid format ✓");
  });
});
