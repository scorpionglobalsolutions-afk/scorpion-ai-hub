import { describe, it, expect } from "vitest";

describe("Twilio credentials", () => {
  it("should have TWILIO_ACCOUNT_SID set and valid format", () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    expect(sid).toBeDefined();
    expect(sid).toMatch(/^AC[a-f0-9]{32}$/);
  });

  it("should have TWILIO_AUTH_TOKEN set and valid format", () => {
    const token = process.env.TWILIO_AUTH_TOKEN;
    expect(token).toBeDefined();
    expect(token!.length).toBeGreaterThanOrEqual(32);
  });

  it("should have TWILIO_PHONE_NUMBER set and valid E.164 format", () => {
    const phone = process.env.TWILIO_PHONE_NUMBER;
    expect(phone).toBeDefined();
    expect(phone).toMatch(/^\+1[0-9]{10}$/);
  });
});
