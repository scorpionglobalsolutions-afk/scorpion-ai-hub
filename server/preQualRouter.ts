import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { preQualFunnels, preQualSubmissions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getFunnelsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(preQualFunnels).where(eq(preQualFunnels.clientId, clientId)).orderBy(desc(preQualFunnels.createdAt));
}

async function getFunnelById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(preQualFunnels).where(eq(preQualFunnels.id, id));
  return rows[0] ?? null;
}

async function createFunnel(data: {
  clientId: number; userId: number; name: string; industry: string;
  serviceType?: string; questions?: unknown; scoringRules?: unknown;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(preQualFunnels).values(data);
  const rows = await db.select().from(preQualFunnels)
    .where(eq(preQualFunnels.clientId, data.clientId))
    .orderBy(desc(preQualFunnels.createdAt));
  return rows[0] ?? null;
}

async function updateFunnel(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(preQualFunnels).set(data).where(eq(preQualFunnels.id, id));
  return getFunnelById(id);
}

async function deleteFunnel(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(preQualSubmissions).where(eq(preQualSubmissions.funnelId, id));
  await db.delete(preQualFunnels).where(eq(preQualFunnels.id, id));
  return { success: true };
}

async function getSubmissionsByFunnelId(funnelId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(preQualSubmissions)
    .where(eq(preQualSubmissions.funnelId, funnelId))
    .orderBy(desc(preQualSubmissions.createdAt));
}

async function createSubmission(data: {
  funnelId: number; clientId: number; prospectName?: string;
  prospectEmail?: string; prospectPhone?: string;
  answers?: unknown; score?: number;
  qualification?: "hot" | "warm" | "cold" | "unqualified";
  aiSummary?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(preQualSubmissions).values(data);
  const rows = await db.select().from(preQualSubmissions)
    .where(eq(preQualSubmissions.funnelId, data.funnelId))
    .orderBy(desc(preQualSubmissions.createdAt));
  return rows[0] ?? null;
}

async function updateSubmission(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(preQualSubmissions).set(data).where(eq(preQualSubmissions.id, id));
  const rows = await db.select().from(preQualSubmissions).where(eq(preQualSubmissions.id, id));
  return rows[0] ?? null;
}

export const preQualRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getFunnelsByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      industry: z.string().min(1),
      serviceType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const funnel = await createFunnel({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_prequal_funnel", entityType: "prequal_funnel",
        details: { name: input.name },
      });
      return funnel;
    }),

  generateQuestions: protectedProcedure
    .input(z.object({
      industry: z.string(),
      serviceType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate 6-8 pre-qualification questions for a ${input.industry} business${input.serviceType ? ` offering ${input.serviceType}` : ""}.

Each question should help qualify the prospect's readiness, budget, and fit.

For each question provide:
- id: "q1", "q2", etc.
- question: The question text
- type: "multiple_choice", "yes_no", or "text"
- options: Array of answer options (for multiple_choice and yes_no)
- weight: 1-10 (how much this question impacts the score)
- scoringKey: Object mapping each option to a score 0-10

Example for loan broker:
{ id: "q1", question: "What is your credit score range?", type: "multiple_choice", 
  options: ["750+", "700-749", "650-699", "Below 650"],
  weight: 10,
  scoringKey: { "750+": 10, "700-749": 8, "650-699": 5, "Below 650": 1 } }

Respond as JSON array of question objects.`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return { questions: [] };
      try {
        return { questions: JSON.parse(match[0]) };
      } catch {
        return { questions: [] };
      }
    }),

  updateFunnel: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      questions: z.unknown().optional(),
      scoringRules: z.unknown().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateFunnel(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const funnel = await getFunnelById(input.id);
      await deleteFunnel(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: funnel?.clientId,
        action: "deleted_prequal_funnel", entityType: "prequal_funnel",
        details: { name: funnel?.name },
      });
      return { success: true };
    }),

  getSubmissions: protectedProcedure
    .input(z.object({ funnelId: z.number() }))
    .query(async ({ input }) => getSubmissionsByFunnelId(input.funnelId)),

  submit: protectedProcedure
    .input(z.object({
      funnelId: z.number(),
      clientId: z.number(),
      prospectName: z.string().optional(),
      prospectEmail: z.string().optional(),
      prospectPhone: z.string().optional(),
      answers: z.record(z.string(), z.string()),
      questions: z.array(z.object({
        id: z.string(),
        question: z.string(),
        weight: z.number(),
        scoringKey: z.record(z.string(), z.number()),
      })),
    }))
    .mutation(async ({ input }) => {
      // Calculate score
      let totalScore = 0;
      let maxScore = 0;
      for (const q of input.questions) {
        const answer = input.answers[q.id];
        const points = answer ? (q.scoringKey[answer] ?? 0) : 0;
        totalScore += points * q.weight;
        maxScore += 10 * q.weight;
      }
      const normalizedScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const qualification: "hot" | "warm" | "cold" | "unqualified" =
        normalizedScore >= 75 ? "hot" :
        normalizedScore >= 50 ? "warm" :
        normalizedScore >= 25 ? "cold" : "unqualified";

      // Generate AI summary
      const answersText = input.questions.map(q =>
        `Q: ${q.question}\nA: ${input.answers[q.id] ?? "Not answered"}`
      ).join("\n\n");

      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Summarize this prospect's pre-qualification answers in 2-3 sentences. Be direct about their fit.

Prospect: ${input.prospectName ?? "Unknown"}
Score: ${normalizedScore}/100 (${qualification})

Answers:
${answersText}

Write a brief sales-ready summary for the broker/agent.`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const aiSummary = typeof raw === "string" ? raw : "";

      return createSubmission({
        funnelId: input.funnelId,
        clientId: input.clientId,
        prospectName: input.prospectName,
        prospectEmail: input.prospectEmail,
        prospectPhone: input.prospectPhone,
        answers: input.answers,
        score: normalizedScore,
        qualification,
        aiSummary,
      });
    }),

  updateSubmission: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["new", "contacted", "converted", "rejected"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateSubmission(id, data);
    }),
});
