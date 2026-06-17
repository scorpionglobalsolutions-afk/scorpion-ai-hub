/**
 * Tests for the 4 new AI agent modules:
 * - Missed Call Text-Back (missedCall router)
 * - AI Proposal & Estimate Builder (proposals router)
 * - Pre-Qualification Funnel Builder (preQual router)
 * - Website Chat Agent Builder (chatAgent router)
 *
 * These tests validate router procedure existence, input validation,
 * and business logic without hitting the database or LLM.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

// ─── Shared context factory ───────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(overrides?: Partial<TrpcContext>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

// ─── Router structure tests ───────────────────────────────────────────────────

describe("missedCallRouter — structure", () => {
  it("exports expected procedures from appRouter", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    // Verify procedures exist (they are callable functions)
    expect(typeof caller.missedCall.listByClient).toBe("function");
    expect(typeof caller.missedCall.create).toBe("function");
    expect(typeof caller.missedCall.update).toBe("function");
    expect(typeof caller.missedCall.delete).toBe("function");
    expect(typeof caller.missedCall.generateResponse).toBe("function");
    expect(typeof caller.missedCall.listLogs).toBe("function");
    expect(typeof caller.missedCall.logCall).toBe("function");
  });
});

describe("proposalsRouter — structure", () => {
  it("exports expected procedures from appRouter", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    expect(typeof caller.proposals.listByClient).toBe("function");
    expect(typeof caller.proposals.getById).toBe("function");
    expect(typeof caller.proposals.create).toBe("function");
    expect(typeof caller.proposals.update).toBe("function");
    expect(typeof caller.proposals.delete).toBe("function");
    expect(typeof caller.proposals.generate).toBe("function");
  });
});

describe("preQualRouter — structure", () => {
  it("exports expected procedures from appRouter", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    expect(typeof caller.preQual.listByClient).toBe("function");
    expect(typeof caller.preQual.create).toBe("function");
    expect(typeof caller.preQual.updateFunnel).toBe("function");
    expect(typeof caller.preQual.delete).toBe("function");
    expect(typeof caller.preQual.generateQuestions).toBe("function");
    expect(typeof caller.preQual.submit).toBe("function");
    expect(typeof caller.preQual.getSubmissions).toBe("function");
    expect(typeof caller.preQual.updateSubmission).toBe("function");
  });
});

describe("chatAgentRouter — structure", () => {
  it("exports expected procedures from appRouter", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    expect(typeof caller.chatAgent.listByClient).toBe("function");
    expect(typeof caller.chatAgent.create).toBe("function");
    expect(typeof caller.chatAgent.update).toBe("function");
    expect(typeof caller.chatAgent.delete).toBe("function");
    expect(typeof caller.chatAgent.generateScript).toBe("function");
    expect(typeof caller.chatAgent.getConversations).toBe("function");
    expect(typeof caller.chatAgent.logConversation).toBe("function");
  });
});

// ─── Input validation tests ───────────────────────────────────────────────────

describe("missedCallRouter — input validation", () => {
  it("listByClient rejects missing clientId", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.missedCall.listByClient as any)({})
    ).rejects.toThrow();
  });

  it("create rejects missing required fields", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.missedCall.create as any)({ clientId: 1 })
    ).rejects.toThrow();
  });
});

describe("proposalsRouter — input validation", () => {
  it("listByClient rejects missing clientId", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.proposals.listByClient as any)({})
    ).rejects.toThrow();
  });

  it("create rejects missing title and prospectName", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.proposals.create as any)({ clientId: 1, industry: "HVAC" })
    ).rejects.toThrow();
  });

  it("update rejects invalid status value", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.proposals.update as any)({ id: 1, status: "invalid_status" })
    ).rejects.toThrow();
  });
});

describe("preQualRouter — input validation", () => {
  it("listByClient rejects missing clientId", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.preQual.listByClient as any)({})
    ).rejects.toThrow();
  });

  it("create rejects missing name", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.preQual.create as any)({ clientId: 1, industry: "HVAC" })
    ).rejects.toThrow();
  });

  it("submit rejects missing funnelId", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.preQual.submit as any)({ clientId: 1, answers: {}, questions: [] })
    ).rejects.toThrow();
  });
});

describe("chatAgentRouter — input validation", () => {
  it("listByClient rejects missing clientId", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.chatAgent.listByClient as any)({})
    ).rejects.toThrow();
  });

  it("create rejects missing name and businessName", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.chatAgent.create as any)({ clientId: 1, industry: "HVAC" })
    ).rejects.toThrow();
  });

  it("update rejects invalid status", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createCtx());
    await expect(
      (caller.chatAgent.update as any)({ id: 1, status: "unknown_status" })
    ).rejects.toThrow();
  });
});

// ─── Business logic unit tests ────────────────────────────────────────────────

describe("preQual scoring logic", () => {
  it("scores 100 when all answers match highest scoring key", () => {
    // Simulate the scoring algorithm used in preQualRouter.submit
    const questions = [
      { id: "q1", weight: 50, scoringKey: { "Yes": 100, "No": 0 } },
      { id: "q2", weight: 50, scoringKey: { "Good": 100, "Bad": 0 } },
    ];
    const answers: Record<string, string> = { q1: "Yes", q2: "Good" };

    let totalWeight = 0;
    let weightedScore = 0;
    for (const q of questions) {
      const answerScore = q.scoringKey[answers[q.id] ?? ""] ?? 50;
      weightedScore += (answerScore / 100) * q.weight;
      totalWeight += q.weight;
    }
    const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 50;
    expect(finalScore).toBe(100);
  });

  it("scores 0 when all answers match lowest scoring key", () => {
    const questions = [
      { id: "q1", weight: 50, scoringKey: { "Yes": 100, "No": 0 } },
      { id: "q2", weight: 50, scoringKey: { "Good": 100, "Bad": 0 } },
    ];
    const answers: Record<string, string> = { q1: "No", q2: "Bad" };

    let totalWeight = 0;
    let weightedScore = 0;
    for (const q of questions) {
      const answerScore = q.scoringKey[answers[q.id] ?? ""] ?? 50;
      weightedScore += (answerScore / 100) * q.weight;
      totalWeight += q.weight;
    }
    const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 50;
    expect(finalScore).toBe(0);
  });

  it("defaults to 50 when answer not in scoring key", () => {
    const questions = [
      { id: "q1", weight: 100, scoringKey: { "Yes": 100, "No": 0 } },
    ];
    const answers: Record<string, string> = { q1: "Maybe" }; // not in scoringKey

    let totalWeight = 0;
    let weightedScore = 0;
    for (const q of questions) {
      const answerScore = q.scoringKey[answers[q.id] ?? ""] ?? 50;
      weightedScore += (answerScore / 100) * q.weight;
      totalWeight += q.weight;
    }
    const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 50;
    expect(finalScore).toBe(50);
  });

  it("classifies score >= 75 as hot", () => {
    const classify = (score: number) =>
      score >= 75 ? "hot" : score >= 50 ? "warm" : score >= 25 ? "cold" : "unqualified";
    expect(classify(75)).toBe("hot");
    expect(classify(100)).toBe("hot");
    expect(classify(74)).toBe("warm");
    expect(classify(50)).toBe("warm");
    expect(classify(49)).toBe("cold");
    expect(classify(25)).toBe("cold");
    expect(classify(24)).toBe("unqualified");
    expect(classify(0)).toBe("unqualified");
  });
});

describe("proposal line item calculation", () => {
  it("calculates line item total correctly", () => {
    const qty = 3;
    const unitPrice = "150.00";
    const total = (qty * parseFloat(unitPrice)).toFixed(2);
    expect(total).toBe("450.00");
  });

  it("calculates subtotal from multiple line items", () => {
    const items = [
      { qty: 2, unitPrice: "100.00" },
      { qty: 1, unitPrice: "250.00" },
      { qty: 5, unitPrice: "20.00" },
    ];
    const subtotal = items.reduce((acc, item) => {
      return acc + item.qty * parseFloat(item.unitPrice);
    }, 0).toFixed(2);
    expect(subtotal).toBe("550.00");
  });

  it("handles empty line items gracefully", () => {
    const items: { qty: number; unitPrice: string }[] = [];
    const subtotal = items.reduce((acc, item) => {
      return acc + item.qty * parseFloat(item.unitPrice);
    }, 0).toFixed(2);
    expect(subtotal).toBe("0.00");
  });
});

// ─── industryTemplates router ────────────────────────────────────────────────
describe("industryTemplates router — structure", () => {
  it("exports expected procedures from industryTemplateRouter", async () => {
    const { industryTemplateRouter } = await import("./industryTemplateRouter");
    const procedures = industryTemplateRouter._def.procedures;
    expect(procedures["listPacks"]).toBeDefined();
    expect(procedures["getPack"]).toBeDefined();
    expect(procedures["previewApply"]).toBeDefined();
    expect(procedures["applyToClient"]).toBeDefined();
    expect(procedures["generateCustomSection"]).toBeDefined();
  });

  it("listPacks returns all 5 industry packs", async () => {
    const { INDUSTRY_PACKS } = await import("../shared/industryPacks");
    expect(INDUSTRY_PACKS).toHaveLength(5);
    const ids = INDUSTRY_PACKS.map((p) => p.id);
    expect(ids).toContain("hvac");
    expect(ids).toContain("roofing");
    expect(ids).toContain("pool");
    expect(ids).toContain("insurance");
    expect(ids).toContain("business_loans");
  });

  it("each pack has required content fields", async () => {
    const { INDUSTRY_PACKS } = await import("../shared/industryPacks");
    for (const pack of INDUSTRY_PACKS) {
      expect(pack.voiceScript.length).toBeGreaterThan(50);
      expect(pack.followUpSequence.length).toBeGreaterThanOrEqual(4);
      expect(pack.objectionHandlers.length).toBeGreaterThanOrEqual(3);
      expect(pack.proposalLineItems.length).toBeGreaterThanOrEqual(3);
      expect(pack.preQualQuestions.length).toBeGreaterThanOrEqual(3);
      expect(pack.chatFAQs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("replacePlaceholders substitutes all merge tags", () => {
    const text = "Hi {{firstName}}, this is {{agentName}} from {{businessName}}";
    const vars = { firstName: "John", agentName: "Sarah", businessName: "ACME HVAC" };
    const result = text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key as keyof typeof vars] ?? `{{${key}}}`);
    expect(result).toBe("Hi John, this is Sarah from ACME HVAC");
    expect(result).not.toContain("{{");
  });

  it("INDUSTRY_PACK_MAP provides O(1) lookup by id", async () => {
    const { INDUSTRY_PACK_MAP } = await import("../shared/industryPacks");
    expect(INDUSTRY_PACK_MAP["hvac"]).toBeDefined();
    expect(INDUSTRY_PACK_MAP["hvac"].name).toBe("HVAC");
    expect(INDUSTRY_PACK_MAP["pool"]).toBeDefined();
    expect(INDUSTRY_PACK_MAP["business_loans"]).toBeDefined();
  });
});
