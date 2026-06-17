import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { gbpPosts } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getPostsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gbpPosts).where(eq(gbpPosts.clientId, clientId)).orderBy(desc(gbpPosts.createdAt));
}

async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(gbpPosts).where(eq(gbpPosts.id, id));
  return rows[0] ?? null;
}

async function createPost(data: {
  clientId: number; userId: number; businessName?: string; industry?: string;
  postType: "offer" | "update" | "event" | "product" | "seasonal";
  title?: string; content?: string; callToAction?: string; ctaUrl?: string;
  scheduledDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(gbpPosts).values(data);
  const rows = await db.select().from(gbpPosts)
    .where(eq(gbpPosts.clientId, data.clientId))
    .orderBy(desc(gbpPosts.createdAt));
  return rows[0] ?? null;
}

async function updatePost(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(gbpPosts).set(data).where(eq(gbpPosts.id, id));
  return getPostById(id);
}

async function deletePost(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(gbpPosts).where(eq(gbpPosts.id, id));
  return { success: true };
}

export const gbpPostRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getPostsByClientId(input.clientId)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      businessName: z.string().optional(),
      industry: z.string().optional(),
      postType: z.enum(["offer", "update", "event", "product", "seasonal"]),
      title: z.string().optional(),
      content: z.string().optional(),
      callToAction: z.string().optional(),
      ctaUrl: z.string().optional(),
      scheduledDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { scheduledDate, ...rest } = input;
      const post = await createPost({
        userId: ctx.user.id,
        ...rest,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_gbp_post", entityType: "gbp_post",
        details: { postType: input.postType, title: input.title },
      });
      return post;
    }),

  generate: protectedProcedure
    .input(z.object({
      businessName: z.string(),
      industry: z.string(),
      postType: z.enum(["offer", "update", "event", "product", "seasonal"]),
      context: z.string().optional(),
      month: z.number().min(1).max(12).optional(),
    }))
    .mutation(async ({ input }) => {
      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const monthContext = input.month ? `Month: ${monthNames[input.month - 1]}` : "";

      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Write a Google Business Profile post for a local ${input.industry} business.

Business: ${input.businessName}
Post Type: ${input.postType}
${monthContext}
${input.context ? `Additional Context: ${input.context}` : ""}

Requirements:
- title: Catchy headline under 58 chars
- content: Engaging post body 150-300 chars. Include relevant emojis. End with a call-to-action.
- callToAction: One of: "Book", "Order", "Learn more", "Sign up", "Get offer", "Call now"

Respond as JSON: { "title": "...", "content": "...", "callToAction": "..." }`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { title: "", content: "", callToAction: "Learn more" };
      try {
        return JSON.parse(match[0]) as { title: string; content: string; callToAction: string };
      } catch {
        return { title: "", content: "", callToAction: "Learn more" };
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      callToAction: z.string().optional(),
      ctaUrl: z.string().optional(),
      scheduledDate: z.string().optional(),
      status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, scheduledDate, ...rest } = input;
      return updatePost(id, {
        ...rest,
        ...(scheduledDate ? { scheduledDate: new Date(scheduledDate) } : {}),
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const post = await getPostById(input.id);
      await deletePost(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: post?.clientId,
        action: "deleted_gbp_post", entityType: "gbp_post",
        details: { title: post?.title },
      });
      return { success: true };
    }),
});
