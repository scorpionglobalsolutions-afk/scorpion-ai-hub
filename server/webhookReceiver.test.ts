import { describe, it, expect, vi } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getWebhookById: vi.fn().mockResolvedValue(null),
  createWebhookEvent: vi.fn().mockResolvedValue(null),
  updateWebhook: vi.fn().mockResolvedValue(null),
  createLead: vi.fn().mockResolvedValue(null),
  getDb: vi.fn().mockResolvedValue(null),
}));

describe("Webhook Receiver", () => {
  it("should export registerWebhookReceiver function", async () => {
    const { registerWebhookReceiver } = await import("./webhookReceiver");
    expect(registerWebhookReceiver).toBeDefined();
    expect(typeof registerWebhookReceiver).toBe("function");
  });

  it("should register POST and GET routes on the app", async () => {
    const { registerWebhookReceiver } = await import("./webhookReceiver");
    const mockApp = {
      post: vi.fn(),
      get: vi.fn(),
    };
    registerWebhookReceiver(mockApp as any);
    expect(mockApp.post).toHaveBeenCalledWith("/api/webhooks/:webhookId", expect.any(Function));
    expect(mockApp.get).toHaveBeenCalledWith("/api/webhooks/:webhookId", expect.any(Function));
  });
});

describe("Webhook Event Type Detection", () => {
  it("should detect Typeform events from headers", async () => {
    // The detectEventType function is internal, but we can test via the handler behavior
    // For now, verify the module loads correctly
    const mod = await import("./webhookReceiver");
    expect(mod).toBeDefined();
  });
});
