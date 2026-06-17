import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { retentionRules, retentionEvents } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getRulesByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(retentionRules).where(eq(retentionRules.clientId, clientId));
}

async function getRuleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(retentionRules).where(eq(retentionRules.id, id));
  return rows[0] ?? null;
}

async function createRule(data: {
  clientId: number; userId: number; name: string; industry?: string;
  triggerType: "days_since_service" | "days_before_renewal" | "anniversary" | "seasonal" | "low_engagement";
  triggerDays?: number; channel?: "sms" | "email" | "both";
  messageTemplate?: string; offerIncluded?: boolean; offerDetails?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(retentionRules).values(data);
  const rows = await db.select().from(retentionRules)
    .where(eq(retentionRules.clientId, data.clientId))
    .orderBy(desc(retentionRules.createdAt));
  return rows[0] ?? null;
}

async function updateRule(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(retentionRules).set(data).where(eq(retentionRules.id, id));
  return getRuleById(id);
}

async function deleteRule(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(retentionEvents).where(eq(retentionEvents.ruleId, id));
  await db.delete(retentionRules).where(eq(retentionRules.id, id));
  return { success: true };
}

async function getEventsByRuleId(ruleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(retentionEvents)
    .where(eq(retentionEvents.ruleId, ruleId))
    .orderBy(desc(retentionEvents.createdAt));
}

async function createEvent(data: {
  ruleId: number; clientId: number; customerName?: string;
  customerPhone?: string; customerEmail?: string;
  lastServiceDate?: Date; generatedMessage?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(retentionEvents).values(data);
  const rows = await db.select().from(retentionEvents)
    .where(eq(retentionEvents.ruleId, data.ruleId))
    .orderBy(desc(retentionEvents.createdAt));
  return rows[0] ?? null;
}

async function updateEvent(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(retentionEvents).set(data).where(eq(retentionEvents.id, id));
  const rows = await db.select().from(retentionEvents).where(eq(retentionEvents.id, id));
  return rows[0] ?? null;
}

export const retentionRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getRulesByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      industry: z.string().optional(),
      triggerType: z.enum(["days_since_service", "days_before_renewal", "anniversary", "seasonal", "low_engagement"]),
      triggerDays: z.number().optional(),
      channel: z.enum(["sms", "email", "both"]).optional(),
      offerIncluded: z.boolean().optional(),
      offerDetails: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const rule = await createRule({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_retention_rule", entityType: "retention_rule",
        details: { name: input.name },
      });
      return rule;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      industry: z.string().optional(),
      triggerType: z.enum(["days_since_service", "days_before_renewal", "anniversary", "seasonal", "low_engagement"]).optional(),
      triggerDays: z.number().optional(),
      channel: z.enum(["sms", "email", "both"]).optional(),
      messageTemplate: z.string().optional(),
      offerIncluded: z.boolean().optional(),
      offerDetails: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateRule(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const rule = await getRuleById(input.id);
      await deleteRule(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: rule?.clientId,
        action: "deleted_retention_rule", entityType: "retention_rule",
        details: { name: rule?.name },
      });
      return { success: true };
    }),

  generateMessage: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      industry: z.string(),
      triggerType: z.string(),
      triggerDays: z.number().optional(),
      offerDetails: z.string().optional(),
      channel: z.enum(["sms", "email", "both"]),
    }))
    .mutation(async ({ input }) => {
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate a client retention message template for a local business.

Business Industry: ${input.industry}
Trigger: ${input.triggerType.replace(/_/g, " ")} (${input.triggerDays ?? 90} days)
Channel: ${input.channel}
${input.offerDetails ? `Special Offer: ${input.offerDetails}` : ""}

Requirements:
- smsTemplate: Under 160 chars. Re-engage a past customer. Reference their last service. Use {customerName} placeholder. ${input.offerDetails ? "Include the offer." : ""}
- emailSubjectTemplate: Subject line under 60 chars.
- emailBodyTemplate: 3-4 sentences. Warm and personal. Reference time since last service. ${input.offerDetails ? "Include the offer." : ""}

Respond as JSON: { "smsTemplate": "...", "emailSubjectTemplate": "...", "emailBodyTemplate": "..." }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
      try {
        return JSON.parse(match[0]) as { smsTemplate: string; emailSubjectTemplate: string; emailBodyTemplate: string };
      } catch {
        return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
      }
    }),

  getEvents: protectedProcedure
    .input(z.object({ ruleId: z.number() }))
    .query(async ({ input }) => getEventsByRuleId(input.ruleId)),

  logEvent: protectedProcedure
    .input(z.object({
      ruleId: z.number(),
      clientId: z.number(),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      customerEmail: z.string().optional(),
      generatedMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => createEvent(input)),

  updateEvent: protectedProcedure
    .input(z.object({
      id: z.number(),
      sent: z.boolean().optional(),
      responded: z.boolean().optional(),
      converted: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateEvent(id, data);
    }),
});
