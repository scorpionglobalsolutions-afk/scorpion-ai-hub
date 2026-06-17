import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { referralCampaigns, referralTracking } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

function generateReferralCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function getCampaignsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referralCampaigns).where(eq(referralCampaigns.clientId, clientId)).orderBy(desc(referralCampaigns.createdAt));
}

async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(referralCampaigns).where(eq(referralCampaigns.id, id));
  return rows[0] ?? null;
}

async function createCampaign(data: {
  clientId: number; userId: number; name: string;
  rewardType?: "discount" | "gift_card" | "cash" | "service_credit" | "custom";
  rewardValue?: string; referrerMessage?: string; refereeMessage?: string;
  channel?: "sms" | "email" | "both";
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(referralCampaigns).values(data);
  const rows = await db.select().from(referralCampaigns)
    .where(eq(referralCampaigns.clientId, data.clientId))
    .orderBy(desc(referralCampaigns.createdAt));
  return rows[0] ?? null;
}

async function updateCampaign(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(referralCampaigns).set(data).where(eq(referralCampaigns.id, id));
  return getCampaignById(id);
}

async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(referralTracking).where(eq(referralTracking.campaignId, id));
  await db.delete(referralCampaigns).where(eq(referralCampaigns.id, id));
  return { success: true };
}

async function getTrackingByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referralTracking)
    .where(eq(referralTracking.campaignId, campaignId))
    .orderBy(desc(referralTracking.createdAt));
}

async function createTracking(data: {
  campaignId: number; clientId: number; referrerName?: string;
  referrerPhone?: string; referrerEmail?: string;
  refereeName?: string; refereePhone?: string; refereeEmail?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const referralCode = generateReferralCode();
  await db.insert(referralTracking).values({ ...data, referralCode });
  const rows = await db.select().from(referralTracking)
    .where(eq(referralTracking.campaignId, data.campaignId))
    .orderBy(desc(referralTracking.createdAt));
  return rows[0] ?? null;
}

async function updateTracking(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(referralTracking).set(data).where(eq(referralTracking.id, id));
  const rows = await db.select().from(referralTracking).where(eq(referralTracking.id, id));
  return rows[0] ?? null;
}

export const referralRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getCampaignsByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      rewardType: z.enum(["discount", "gift_card", "cash", "service_credit", "custom"]).optional(),
      rewardValue: z.string().optional(),
      channel: z.enum(["sms", "email", "both"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await createCampaign({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_referral_campaign", entityType: "referral_campaign",
        details: { name: input.name },
      });
      return campaign;
    }),

  generateMessages: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      industry: z.string(),
      rewardType: z.string(),
      rewardValue: z.string(),
      channel: z.enum(["sms", "email", "both"]),
    }))
    .mutation(async ({ input }) => {
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate referral program messages for a local ${input.industry} business.

Business: ${input.businessName}
Reward: ${input.rewardValue} (${input.rewardType.replace(/_/g, " ")})
Channel: ${input.channel}

Create:
1. referrerMessage: Message to send to existing customer asking them to refer a friend. Under 160 chars for SMS. Mention the reward. Use {customerName} placeholder.
2. refereeMessage: Message to send to the referred friend. Under 160 chars for SMS. Mention the reward and who referred them. Use {refereeName} and {referrerName} placeholders.
3. emailSubject: Email subject line for the referrer ask.
4. emailBody: 3-4 sentence email body for the referrer ask.

Respond as JSON: { "referrerMessage": "...", "refereeMessage": "...", "emailSubject": "...", "emailBody": "..." }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { referrerMessage: "", refereeMessage: "", emailSubject: "", emailBody: "" };
      try {
        return JSON.parse(match[0]) as {
          referrerMessage: string; refereeMessage: string; emailSubject: string; emailBody: string;
        };
      } catch {
        return { referrerMessage: "", refereeMessage: "", emailSubject: "", emailBody: "" };
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      rewardType: z.enum(["discount", "gift_card", "cash", "service_credit", "custom"]).optional(),
      rewardValue: z.string().optional(),
      referrerMessage: z.string().optional(),
      refereeMessage: z.string().optional(),
      channel: z.enum(["sms", "email", "both"]).optional(),
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
        action: "deleted_referral_campaign", entityType: "referral_campaign",
        details: { name: campaign?.name },
      });
      return { success: true };
    }),

  getTracking: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => getTrackingByCampaignId(input.campaignId)),

  trackReferral: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      clientId: z.number(),
      referrerName: z.string().optional(),
      referrerPhone: z.string().optional(),
      referrerEmail: z.string().optional(),
      refereeName: z.string().optional(),
      refereePhone: z.string().optional(),
      refereeEmail: z.string().optional(),
    }))
    .mutation(async ({ input }) => createTracking(input)),

  updateTracking: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "contacted", "converted", "rewarded"]).optional(),
      rewardSent: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateTracking(id, data);
    }),
});
