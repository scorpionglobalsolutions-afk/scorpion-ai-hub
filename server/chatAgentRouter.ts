import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { chatAgents, chatConversations } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getAgentsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatAgents).where(eq(chatAgents.clientId, clientId)).orderBy(desc(chatAgents.createdAt));
}

async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(chatAgents).where(eq(chatAgents.id, id));
  return rows[0] ?? null;
}

async function createAgent(data: {
  clientId: number; userId: number; name: string; businessName: string;
  industry?: string; tone?: "friendly" | "professional" | "casual" | "formal";
  systemPrompt?: string; welcomeMessage?: string;
  faqs?: unknown; leadCaptureEnabled?: boolean; bookingEnabled?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(chatAgents).values(data);
  const rows = await db.select().from(chatAgents)
    .where(eq(chatAgents.clientId, data.clientId))
    .orderBy(desc(chatAgents.createdAt));
  return rows[0] ?? null;
}

async function updateAgent(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(chatAgents).set(data).where(eq(chatAgents.id, id));
  return getAgentById(id);
}

async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(chatConversations).where(eq(chatConversations.agentId, id));
  await db.delete(chatAgents).where(eq(chatAgents.id, id));
  return { success: true };
}

async function getConversationsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatConversations)
    .where(eq(chatConversations.agentId, agentId))
    .orderBy(desc(chatConversations.createdAt));
}

async function createConversation(data: {
  agentId: number; clientId: number; visitorName?: string;
  visitorEmail?: string; visitorPhone?: string;
  messages?: unknown; leadCaptured?: boolean;
  outcome?: "lead_captured" | "booking_made" | "faq_answered" | "abandoned" | "ongoing";
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(chatConversations).values(data);
  const rows = await db.select().from(chatConversations)
    .where(eq(chatConversations.agentId, data.agentId))
    .orderBy(desc(chatConversations.createdAt));
  return rows[0] ?? null;
}

export const chatAgentRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getAgentsByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      businessName: z.string().min(1),
      industry: z.string().optional(),
      tone: z.enum(["friendly", "professional", "casual", "formal"]).optional(),
      leadCaptureEnabled: z.boolean().optional(),
      bookingEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const agent = await createAgent({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_chat_agent", entityType: "chat_agent",
        details: { name: input.name },
      });
      return agent;
    }),

  generateScript: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      industry: z.string(),
      tone: z.enum(["friendly", "professional", "casual", "formal"]),
      services: z.string().optional(),
      leadCaptureEnabled: z.boolean().optional(),
      bookingEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Generate a complete website chat agent configuration for a local ${input.industry} business.

Business: ${input.businessName}
Tone: ${input.tone}
Services: ${input.services ?? "General services"}
Lead Capture: ${input.leadCaptureEnabled ? "Yes - collect name, phone, email" : "No"}
Booking: ${input.bookingEnabled ? "Yes - offer to schedule appointments" : "No"}

Provide:
1. systemPrompt: Detailed instructions for the AI chat agent (how to behave, what to say, when to escalate). 200-300 words.
2. welcomeMessage: Friendly opening message when visitor arrives. Under 100 chars.
3. faqs: Array of 6-8 common questions with answers. Format: [{ "question": "...", "answer": "..." }]

Respond as JSON: { "systemPrompt": "...", "welcomeMessage": "...", "faqs": [...] }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { systemPrompt: "", welcomeMessage: "", faqs: [] };
      try {
        return JSON.parse(match[0]) as { systemPrompt: string; welcomeMessage: string; faqs: Array<{ question: string; answer: string }> };
      } catch {
        return { systemPrompt: "", welcomeMessage: "", faqs: [] };
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      businessName: z.string().optional(),
      industry: z.string().optional(),
      tone: z.enum(["friendly", "professional", "casual", "formal"]).optional(),
      systemPrompt: z.string().optional(),
      welcomeMessage: z.string().optional(),
      faqs: z.unknown().optional(),
      leadCaptureEnabled: z.boolean().optional(),
      bookingEnabled: z.boolean().optional(),
      status: z.enum(["draft", "active", "paused"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateAgent(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await getAgentById(input.id);
      await deleteAgent(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: agent?.clientId,
        action: "deleted_chat_agent", entityType: "chat_agent",
        details: { name: agent?.name },
      });
      return { success: true };
    }),

  getConversations: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => getConversationsByAgentId(input.agentId)),

  logConversation: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      clientId: z.number(),
      visitorName: z.string().optional(),
      visitorEmail: z.string().optional(),
      visitorPhone: z.string().optional(),
      messages: z.unknown().optional(),
      leadCaptured: z.boolean().optional(),
      outcome: z.enum(["lead_captured", "booking_made", "faq_answered", "abandoned", "ongoing"]).optional(),
    }))
    .mutation(async ({ input }) => createConversation(input)),
});
