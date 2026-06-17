import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { seasonalPlans, seasonalCampaignItems } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getPlansByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seasonalPlans).where(eq(seasonalPlans.clientId, clientId)).orderBy(desc(seasonalPlans.createdAt));
}

async function getPlanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(seasonalPlans).where(eq(seasonalPlans.id, id));
  return rows[0] ?? null;
}

async function getItemsByPlanId(planId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seasonalCampaignItems)
    .where(eq(seasonalCampaignItems.planId, planId))
    .orderBy(seasonalCampaignItems.month);
}

async function createPlan(data: {
  clientId: number; userId: number; name: string; industry: string;
  location?: string; year: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(seasonalPlans).values(data);
  const rows = await db.select().from(seasonalPlans)
    .where(eq(seasonalPlans.clientId, data.clientId))
    .orderBy(desc(seasonalPlans.createdAt));
  return rows[0] ?? null;
}

async function deletePlan(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(seasonalCampaignItems).where(eq(seasonalCampaignItems.planId, id));
  await db.delete(seasonalPlans).where(eq(seasonalPlans.id, id));
  return { success: true };
}

async function updateItem(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(seasonalCampaignItems).set(data).where(eq(seasonalCampaignItems.id, id));
  const rows = await db.select().from(seasonalCampaignItems).where(eq(seasonalCampaignItems.id, id));
  return rows[0] ?? null;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export const seasonalPlannerRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getPlansByClientId(input.clientId)),

  getPlanWithItems: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .query(async ({ input }) => {
      const plan = await getPlanById(input.planId);
      const items = await getItemsByPlanId(input.planId);
      return { plan, items };
    }),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      industry: z.string().min(1),
      location: z.string().optional(),
      year: z.number().min(2024).max(2030),
    }))
    .mutation(async ({ ctx, input }) => {
      const plan = await createPlan({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_seasonal_plan", entityType: "seasonal_plan",
        details: { name: input.name, industry: input.industry },
      });
      return plan;
    }),

  generatePlan: protectedProcedure
    .input(z.object({
      planId: z.number(),
      clientId: z.number(),
      industry: z.string(),
      location: z.string().optional(),
      year: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Create a 12-month seasonal marketing campaign calendar for a local ${input.industry} business${input.location ? ` in ${input.location}` : ""} for ${input.year}.

For each month (1-12), provide:
- title: Campaign name (e.g. "Spring AC Tune-Up Special")
- description: 1-2 sentences about the campaign focus
- offerIdea: A specific promotional offer
- channels: Array of ["sms", "email", "google_posts", "social"] (pick 2-3 relevant ones)
- estimatedBudget: "$X-$Y/month" range
- priority: "high", "medium", or "low" based on seasonal importance for this industry

Consider seasonal patterns, holidays, and industry-specific busy/slow seasons.

Respond as JSON array of 12 objects with keys: month (1-12), title, description, offerIdea, channels, estimatedBudget, priority`,
        }],
      });

      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return { success: false, itemsCreated: 0 };

      let items: Array<{
        month: number; title: string; description: string;
        offerIdea: string; channels: string[]; estimatedBudget: string;
        priority: "high" | "medium" | "low";
      }>;
      try {
        items = JSON.parse(match[0]);
      } catch {
        return { success: false, itemsCreated: 0 };
      }

      // Clear existing items for this plan
      await db.delete(seasonalCampaignItems).where(eq(seasonalCampaignItems.planId, input.planId));

      // Insert all 12 months
      for (const item of items) {
        await db.insert(seasonalCampaignItems).values({
          planId: input.planId,
          clientId: input.clientId,
          month: item.month,
          title: item.title,
          description: item.description,
          offerIdea: item.offerIdea,
          channels: item.channels,
          estimatedBudget: item.estimatedBudget,
          priority: item.priority ?? "medium",
        });
      }

      // Mark plan as active
      await db.update(seasonalPlans).set({ status: "active" }).where(eq(seasonalPlans.id, input.planId));

      return { success: true, itemsCreated: items.length };
    }),

  updateItem: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      offerIdea: z.string().optional(),
      estimatedBudget: z.string().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      status: z.enum(["planned", "in_progress", "completed", "skipped"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateItem(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await getPlanById(input.id);
      await deletePlan(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: plan?.clientId,
        action: "deleted_seasonal_plan", entityType: "seasonal_plan",
        details: { name: plan?.name },
      });
      return { success: true };
    }),
});

export { MONTH_NAMES };
