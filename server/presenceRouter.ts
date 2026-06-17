import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { presenceScores, clients } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getLatestScoreByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(presenceScores)
    .where(eq(presenceScores.clientId, clientId))
    .orderBy(desc(presenceScores.createdAt));
  return rows[0] ?? null;
}

async function getScoreHistoryByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(presenceScores)
    .where(eq(presenceScores.clientId, clientId))
    .orderBy(desc(presenceScores.createdAt));
}

async function saveScore(data: {
  clientId: number; userId: number; overallScore: number;
  googleRating?: string; reviewCount?: number;
  websiteScore?: number; seoScore?: number;
  socialScore?: number; reputationScore?: number;
  details?: unknown;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(presenceScores).values(data);
  return getLatestScoreByClientId(data.clientId);
}

export const presenceRouter = router({
  getLatest: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getLatestScoreByClientId(input.clientId)),

  getHistory: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getScoreHistoryByClientId(input.clientId)),

  generate: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      businessName: z.string(),
      website: z.string().optional(),
      industry: z.string().optional(),
      googleRating: z.string().optional(),
      reviewCount: z.number().optional(),
      hasGbpClaimed: z.boolean().optional(),
      hasSocialMedia: z.boolean().optional(),
      hasBlog: z.boolean().optional(),
      hasOnlineBooking: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Calculate sub-scores based on inputs
      const reviewCount = input.reviewCount ?? 0;
      const googleRating = parseFloat(input.googleRating ?? "0");

      const reputationScore = Math.min(100, Math.round(
        (googleRating / 5) * 50 + Math.min(reviewCount / 100, 1) * 50
      ));

      const websiteScore = input.website ? 70 : 0;
      const seoScore = input.website ? (input.hasBlog ? 65 : 40) : 10;
      const socialScore = input.hasSocialMedia ? 70 : 20;

      const gbpBonus = input.hasGbpClaimed ? 15 : 0;
      const bookingBonus = input.hasOnlineBooking ? 10 : 0;

      const overallScore = Math.min(100, Math.round(
        (reputationScore * 0.35) +
        (websiteScore * 0.20) +
        (seoScore * 0.20) +
        (socialScore * 0.15) +
        gbpBonus + bookingBonus
      ));

      // Generate AI insights
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate a brief online presence analysis for a local ${input.industry ?? "service"} business.

Business: ${input.businessName}
Overall Presence Score: ${overallScore}/100
Google Rating: ${input.googleRating ?? "Unknown"} (${reviewCount} reviews)
Has Website: ${input.website ? "Yes" : "No"}
GBP Claimed: ${input.hasGbpClaimed ? "Yes" : "No"}
Has Social Media: ${input.hasSocialMedia ? "Yes" : "No"}
Has Blog: ${input.hasBlog ? "Yes" : "No"}
Has Online Booking: ${input.hasOnlineBooking ? "Yes" : "No"}

Provide:
1. summary: 2-sentence overall assessment
2. strengths: Array of 2-3 strength points
3. opportunities: Array of 3-4 improvement opportunities with estimated impact
4. priorityAction: The single most important action to take right now

Respond as JSON: { "summary": "...", "strengths": [...], "opportunities": [...], "priorityAction": "..." }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      let details = {};
      if (match) {
        try { details = JSON.parse(match[0]); } catch { /* ignore */ }
      }

      const score = await saveScore({
        clientId: input.clientId,
        userId: ctx.user.id,
        overallScore,
        googleRating: input.googleRating,
        reviewCount,
        websiteScore,
        seoScore,
        socialScore,
        reputationScore,
        details,
      });

      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "generated_presence_score", entityType: "presence_score",
        details: { overallScore, businessName: input.businessName },
      });

      return score;
    }),
});
