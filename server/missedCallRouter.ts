import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import {
  missedCallConfigs,
  missedCallEvents,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getConfigsByClientId(clientId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(missedCallConfigs).where(eq(missedCallConfigs.clientId, clientId));
}

async function getConfigById(id: number) {
  const database = await getDb();
  if (!database) return null;
  const rows = await database.select().from(missedCallConfigs).where(eq(missedCallConfigs.id, id));
  return rows[0] ?? null;
}

async function createConfig(data: {
  clientId: number; userId: number; name: string; businessName: string;
  industry?: string; responseDelaySeconds?: number; smsTemplate?: string;
  followUpTemplate?: string; followUpDelayMinutes?: number;
}) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(missedCallConfigs).values(data);
  const rows = await database.select().from(missedCallConfigs)
    .where(eq(missedCallConfigs.clientId, data.clientId))
    .orderBy(desc(missedCallConfigs.createdAt));
  return rows[0] ?? null;
}

async function updateConfig(id: number, data: Partial<{
  name: string; businessName: string; industry: string;
  responseDelaySeconds: number; smsTemplate: string;
  followUpTemplate: string; followUpDelayMinutes: number; isActive: boolean;
}>) {
  const database = await getDb();
  if (!database) return null;
  await database.update(missedCallConfigs).set(data).where(eq(missedCallConfigs.id, id));
  return getConfigById(id);
}

async function deleteConfig(id: number) {
  const database = await getDb();
  if (!database) return null;
  await database.delete(missedCallEvents).where(eq(missedCallEvents.configId, id));
  await database.delete(missedCallConfigs).where(eq(missedCallConfigs.id, id));
  return { success: true };
}

async function getEventsByConfigId(configId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(missedCallEvents)
    .where(eq(missedCallEvents.configId, configId))
    .orderBy(desc(missedCallEvents.createdAt));
}

async function createEvent(data: {
  configId: number; clientId: number; callerPhone?: string; callerName?: string;
  smsSent?: boolean; smsContent?: string;
}) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(missedCallEvents).values(data);
  const rows = await database.select().from(missedCallEvents)
    .where(eq(missedCallEvents.configId, data.configId))
    .orderBy(desc(missedCallEvents.createdAt));
  return rows[0] ?? null;
}

async function updateEvent(id: number, data: Partial<{
  smsSent: boolean; smsContent: string; followUpSent: boolean;
  responded: boolean; outcome: "booked" | "not_interested" | "no_response" | "wrong_number" | "pending";
  notes: string;
}>) {
  const database = await getDb();
  if (!database) return null;
  await database.update(missedCallEvents).set(data).where(eq(missedCallEvents.id, id));
  const rows = await database.select().from(missedCallEvents).where(eq(missedCallEvents.id, id));
  return rows[0] ?? null;
}

// ── Router ────────────────────────────────────────────────────────────────────

export const missedCallRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getConfigsByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      businessName: z.string().min(1),
      industry: z.string().optional(),
      responseDelaySeconds: z.number().min(0).max(300).optional(),
      followUpDelayMinutes: z.number().min(0).max(1440).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const config = await createConfig({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_missed_call_config", entityType: "missed_call_config",
        details: { name: input.name },
      });
      return config;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      businessName: z.string().optional(),
      industry: z.string().optional(),
      responseDelaySeconds: z.number().optional(),
      smsTemplate: z.string().optional(),
      followUpTemplate: z.string().optional(),
      followUpDelayMinutes: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateConfig(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const config = await getConfigById(input.id);
      await deleteConfig(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: config?.clientId,
        action: "deleted_missed_call_config", entityType: "missed_call_config",
        details: { name: config?.name },
      });
      return { success: true };
    }),

  generateTemplate: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      industry: z.string(),
      tone: z.enum(["friendly", "professional", "urgent"]).default("friendly"),
    }))
    .mutation(async ({ input }) => {
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate a missed call text-back SMS template and a follow-up template for a local business.

Business: ${input.businessName}
Industry: ${input.industry}
Tone: ${input.tone}

Requirements:
- smsTemplate: Under 160 chars. Personalize with {callerName} placeholder. Mention the business name. Ask how you can help. Include a call-back prompt.
- followUpTemplate: Under 160 chars. A gentle follow-up 1 hour later. Different wording from the first.

Respond as JSON: { "smsTemplate": "...", "followUpTemplate": "..." }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { smsTemplate: "", followUpTemplate: "" };
      try {
        return JSON.parse(match[0]) as { smsTemplate: string; followUpTemplate: string };
      } catch {
        return { smsTemplate: "", followUpTemplate: "" };
      }
    }),

  getEvents: protectedProcedure
    .input(z.object({ configId: z.number() }))
    .query(async ({ input }) => getEventsByConfigId(input.configId)),

  logEvent: protectedProcedure
    .input(z.object({
      configId: z.number(),
      clientId: z.number(),
      callerPhone: z.string().optional(),
      callerName: z.string().optional(),
      smsSent: z.boolean().optional(),
      smsContent: z.string().optional(),
    }))
    .mutation(async ({ input }) => createEvent(input)),

  updateEvent: protectedProcedure
    .input(z.object({
      id: z.number(),
      smsSent: z.boolean().optional(),
      smsContent: z.string().optional(),
      followUpSent: z.boolean().optional(),
      responded: z.boolean().optional(),
      outcome: z.enum(["booked", "not_interested", "no_response", "wrong_number", "pending"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateEvent(id, data);
    }),
});
