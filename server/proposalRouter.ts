import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb, logActivity } from "./db";
import { proposals } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

async function getProposalsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(eq(proposals.clientId, clientId)).orderBy(desc(proposals.createdAt));
}

async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(proposals).where(eq(proposals.id, id));
  return rows[0] ?? null;
}

async function createProposal(data: {
  clientId: number; userId: number; title: string; prospectName: string;
  prospectEmail?: string; prospectPhone?: string; industry?: string;
  serviceType?: string; scopeOfWork?: string;
  lineItems?: Array<{ description: string; qty: number; unitPrice: string; total: string }>;
  subtotal?: string; tax?: string; total?: string;
  validUntil?: Date; terms?: string; generatedContent?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(proposals).values(data);
  const rows = await db.select().from(proposals)
    .where(eq(proposals.clientId, data.clientId))
    .orderBy(desc(proposals.createdAt));
  return rows[0] ?? null;
}

async function updateProposal(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(proposals).set(data).where(eq(proposals.id, id));
  return getProposalById(id);
}

async function deleteProposal(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(proposals).where(eq(proposals.id, id));
  return { success: true };
}

const LineItemSchema = z.object({
  description: z.string(),
  qty: z.number(),
  unitPrice: z.string(),
  total: z.string(),
});

export const proposalRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => getProposalsByClientId(input.clientId)),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => getProposalById(input.id)),

  create: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      title: z.string().min(1),
      prospectName: z.string().min(1),
      prospectEmail: z.string().optional(),
      prospectPhone: z.string().optional(),
      industry: z.string().optional(),
      serviceType: z.string().optional(),
      scopeOfWork: z.string().optional(),
      lineItems: z.array(LineItemSchema).optional(),
      subtotal: z.string().optional(),
      tax: z.string().optional(),
      total: z.string().optional(),
      terms: z.string().optional(),
      generatedContent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await createProposal({ userId: ctx.user.id, ...input });
      await logActivity({
        userId: ctx.user.id, clientId: input.clientId,
        action: "created_proposal", entityType: "proposal",
        details: { title: input.title, prospectName: input.prospectName },
      });
      return proposal;
    }),

  generate: protectedProcedure
    .input(z.object({
      prospectName: z.string(),
      businessName: z.string(),
      industry: z.string(),
      serviceType: z.string(),
      scopeOfWork: z.string(),
      lineItems: z.array(LineItemSchema).optional(),
      total: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const lineItemsText = input.lineItems?.map(
        (li) => `- ${li.description}: ${li.qty} x $${li.unitPrice} = $${li.total}`
      ).join("\n") ?? "No line items specified";

      const resp = await invokeLLM({
        messages: [{
          role: "user",
          content: `Write a professional proposal/estimate document body for a local ${input.industry} business.

Prospect: ${input.prospectName}
Business Providing Service: ${input.businessName}
Service Type: ${input.serviceType}
Scope of Work: ${input.scopeOfWork}
Line Items:
${lineItemsText}
${input.total ? `Total: $${input.total}` : ""}

Write a professional proposal body including:
1. A warm opening paragraph addressing ${input.prospectName}
2. A "Scope of Work" section describing what will be done
3. A "Why Choose Us" section (2-3 bullet points)
4. A "Terms & Conditions" section (payment terms, validity, cancellation)
5. A professional closing paragraph

Keep it professional but approachable. Under 500 words total.`,
        }],
      });
      const raw = resp.choices[0]?.message.content;
      return { generatedContent: typeof raw === "string" ? raw : JSON.stringify(raw) };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      prospectName: z.string().optional(),
      prospectEmail: z.string().optional(),
      prospectPhone: z.string().optional(),
      serviceType: z.string().optional(),
      scopeOfWork: z.string().optional(),
      lineItems: z.array(LineItemSchema).optional(),
      subtotal: z.string().optional(),
      tax: z.string().optional(),
      total: z.string().optional(),
      terms: z.string().optional(),
      generatedContent: z.string().optional(),
      status: z.enum(["draft", "sent", "accepted", "declined", "expired"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateProposal(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await getProposalById(input.id);
      await deleteProposal(input.id);
      await logActivity({
        userId: ctx.user.id, clientId: proposal?.clientId,
        action: "deleted_proposal", entityType: "proposal",
        details: { title: proposal?.title },
      });
      return { success: true };
    }),
});
