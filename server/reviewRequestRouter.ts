import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import {
  reviewRequestCampaigns,
  reviewRequestLogs,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getCampaignsByClientId(clientId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(reviewRequestCampaigns).where(eq(reviewRequestCampaigns.clientId, clientId));
}

async function getCampaignById(id: number) {
  const database = await getDb();
  if (!database) return null;
  const rows = await database.select().from(reviewRequestCampaigns).where(eq(reviewRequestCampaigns.id, id));
  return rows[0] ?? null;
}

async function createCampaign(data: {
  clientId: number; userId: number; name: string; businessName: string;
  industry?: string; googleReviewLink?: string;
  channel?: "sms" | "email" | "both"; sendDelayHours?: number;
  smsTemplate?: string; emailSubjectTemplate?: string; emailBodyTemplate?: string;
}) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(reviewRequestCampaigns).values(data);
  const rows = await database.select().from(reviewRequestCampaigns)
    .where(eq(reviewRequestCampaigns.clientId, data.clientId))
    .orderBy(desc(reviewRequestCampaigns.createdAt));
  return rows[0] ?? null;
}

async function updateCampaign(id: number, data: Record<string, unknown>) {
  const database = await getDb();
  if (!database) return null;
  await database.update(reviewRequestCampaigns).set(data).where(eq(reviewRequestCampaigns.id, id));
  return getCampaignById(id);
}

async function deleteCampaign(id: number) {
  const database = await getDb();
  if (!database) return null;
  await database.delete(reviewRequestLogs).where(eq(reviewRequestLogs.campaignId, id));
  await database.delete(reviewRequestCampaigns).where(eq(reviewRequestCampaigns.id, id));
  return { success: true };
}

async function getLogsByCampaignId(campaignId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(reviewRequestLogs)
    .where(eq(reviewRequestLogs.campaignId, campaignId))
    .orderBy(desc(reviewRequestLogs.createdAt));
}

async function createLog(data: {
  campaignId: number; clientId: number; customerName?: string;
  customerPhone?: string; customerEmail?: string;
  serviceDate?: Date; serviceType?: string;
}) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(reviewRequestLogs).values(data);
  const rows = await database.select().from(reviewRequestLogs)
    .where(eq(reviewRequestLogs.campaignId, data.campaignId))
    .orderBy(desc(reviewRequestLogs.createdAt));
  return rows[0] ?? null;
}

async function updateLog(id: number, data: Record<string, unknown>) {
  const database = await getDb();
  if (!database) return null;
  await database.update(reviewRequestLogs).set(data).where(eq(reviewRequestLogs.id, id));
  const rows = await database.select().from(reviewRequestLogs).where(eq(reviewRequestLogs.id, id));
  return rows[0] ?? null;
}

// ── Router ────────────────────────────────────────────────────────────────────

export const reviewRequestRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getCampaignsByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      businessName: z.string().min(1),
      industry: z.string().optional(),
      googleReviewLink: z.string().optional(),
      channel: z.enum(["sms", "email", "both"]).optional(),
      sendDelayHours: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await createCampaign({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_review_request_campaign", entityType: "review_request_campaign",
        details: { name: input.name },
      });
      return campaign;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      businessName: z.string().optional(),
      industry: z.string().optional(),
      googleReviewLink: z.string().optional(),
      channel: z.enum(["sms", "email", "both"]).optional(),
      sendDelayHours: z.number().optional(),
      smsTemplate: z.string().optional(),
      emailSubjectTemplate: z.string().optional(),
      emailBodyTemplate: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateCampaign(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.id);
      await deleteCampaign(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: campaign?.clientId,
        action: "deleted_review_request_campaign", entityType: "review_request_campaign",
        details: { name: campaign?.name },
      });
      return { success: true };
    }),

  generateTemplates: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      industry: z.string(),
      googleReviewLink: z.string().optional(),
      tone: z.enum(["friendly", "professional", "grateful"]).default("friendly"),
    }))
    .mutation(async ({ input }) => {
      const link = input.googleReviewLink || "[REVIEW LINK]";
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate review request message templates for a local business.

Business: ${input.businessName}
Industry: ${input.industry}
Tone: ${input.tone}
Review Link: ${link}

Create:
1. smsTemplate: Under 160 chars. Thank the customer for their service. Ask for a Google review. Include the link. Use {customerName} placeholder.
2. emailSubjectTemplate: Catchy email subject line under 60 chars.
3. emailBodyTemplate: 3-4 sentence email body. Warm, personal. Ask for review. Include link. Use {customerName} placeholder.

Respond as JSON: { "smsTemplate": "...", "emailSubjectTemplate": "...", "emailBodyTemplate": "..." }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
      try {
        return JSON.parse(match[0]) as {
          smsTemplate: string; emailSubjectTemplate: string; emailBodyTemplate: string;
        };
      } catch {
        return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
      }
    }),

  getLogs: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => getLogsByCampaignId(input.campaignId)),

  logCustomer: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      clientId: z.number(),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      customerEmail: z.string().optional(),
      serviceType: z.string().optional(),
    }))
    .mutation(async ({ input }) => createLog(input)),

  updateLog: protectedProcedure
    .input(z.object({
      id: z.number(),
      smsSent: z.boolean().optional(),
      emailSent: z.boolean().optional(),
      reviewLeft: z.boolean().optional(),
      reviewRating: z.number().min(1).max(5).optional(),
      status: z.enum(["pending", "sent", "reviewed", "no_response"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateLog(id, data);
    }),
});
