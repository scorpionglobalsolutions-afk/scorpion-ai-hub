import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { INDUSTRY_PACKS, INDUSTRY_PACK_MAP, type IndustryPackId } from "../shared/industryPacks";
import { getDb } from "./db";
import {
  clients,
  voiceAssistants,
  sequences,
  missedCallConfigs,
  proposals,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ─── Helpers ────────────────────────────────────────────────────────────────

function replacePlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const industryTemplateRouter = router({
  /** List all available industry packs (metadata only) */
  listPacks: protectedProcedure.query(() => {
    return INDUSTRY_PACKS.map((p) => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      color: p.color,
      description: p.description,
      targetCustomer: p.targetCustomer,
      averageDealSize: p.averageDealSize,
      contentSummary: {
        hasVoiceScript: !!p.voiceScript,
        followUpSteps: p.followUpSequence.length,
        objectionHandlers: p.objectionHandlers.length,
        proposalLineItems: p.proposalLineItems.length,
        preQualQuestions: p.preQualQuestions.length,
        chatFAQs: p.chatFAQs.length,
      },
    }));
  }),

  /** Get full content for a specific industry pack */
  getPack: protectedProcedure
    .input(z.object({ industryId: z.string() }))
    .query(({ input }) => {
      const pack = INDUSTRY_PACK_MAP[input.industryId as IndustryPackId];
      if (!pack) throw new Error(`Industry pack '${input.industryId}' not found`);
      return pack;
    }),

  /** Preview what will be applied for a given client + industry */
  previewApply: protectedProcedure
    .input(z.object({ clientId: z.number(), industryId: z.string() }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database unavailable");

      const client = await database
        .select()
        .from(clients)
        .where(eq(clients.id, input.clientId))
        .then((r: typeof clients.$inferSelect[]) => r[0]);
      if (!client) throw new Error("Client not found");

      const pack = INDUSTRY_PACK_MAP[input.industryId as IndustryPackId];
      if (!pack) throw new Error("Industry pack not found");

      const vars: Record<string, string> = {
        firstName: client.name.split(" ")[0],
        businessName: client.name,
        agentName: "Your Agent",
        phone: client.phone ?? "{{phone}}",
        reviewLink: "https://g.page/r/YOUR_REVIEW_LINK",
        techName: "Your Technician",
        agentEmail: client.email ?? "{{agentEmail}}",
        weeklyRate: "150",
      };

      return {
        client,
        pack: { id: pack.id, name: pack.name, icon: pack.icon, color: pack.color },
        preview: {
          speedToLeadSMS: replacePlaceholders(pack.speedToLeadSMS, vars),
          speedToLeadEmail: {
            subject: replacePlaceholders(pack.speedToLeadEmail.subject, vars),
            body: replacePlaceholders(pack.speedToLeadEmail.body, vars),
          },
          voiceScript: replacePlaceholders(pack.voiceScript, vars),
          missedCallSMS: replacePlaceholders(pack.missedCallSMS, vars),
          reviewRequestSMS: replacePlaceholders(pack.reviewRequestSMS, vars),
          followUpCount: pack.followUpSequence.length,
          objectionCount: pack.objectionHandlers.length,
          proposalLineItemCount: pack.proposalLineItems.length,
          preQualQuestionCount: pack.preQualQuestions.length,
          chatFAQCount: pack.chatFAQs.length,
        },
      };
    }),

  /** Apply an industry pack to a client */
  applyToClient: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        industryId: z.string(),
        businessName: z.string().optional(),
        agentName: z.string().optional(),
        phone: z.string().optional(),
        weeklyRate: z.string().optional(),
        applyVoiceScript: z.boolean().default(true),
        applyFollowUp: z.boolean().default(true),
        applyMissedCall: z.boolean().default(true),
        applyProposal: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database unavailable");

      const client = await database
        .select()
        .from(clients)
        .where(eq(clients.id, input.clientId))
        .then((r: typeof clients.$inferSelect[]) => r[0]);
      if (!client) throw new Error("Client not found");

      const pack = INDUSTRY_PACK_MAP[input.industryId as IndustryPackId];
      if (!pack) throw new Error("Industry pack not found");

      const vars: Record<string, string> = {
        firstName: client.name.split(" ")[0],
        businessName: input.businessName ?? client.name,
        agentName: input.agentName ?? "Your Agent",
        phone: input.phone ?? client.phone ?? "{{phone}}",
        reviewLink: "https://g.page/r/YOUR_REVIEW_LINK",
        techName: "Your Technician",
        agentEmail: client.email ?? "{{agentEmail}}",
        weeklyRate: input.weeklyRate ?? "150",
      };

      const results: string[] = [];

      // 1. Voice Assistant
      if (input.applyVoiceScript) {
        try {
          await database.insert(voiceAssistants).values({
            clientId: input.clientId,
            userId: ctx.user.id,
            name: `${pack.name} Voice Agent`,
            type: "outbound",
            status: "draft",
            systemPrompt: replacePlaceholders(pack.voiceSystemPrompt, vars),
            callScript: replacePlaceholders(pack.voiceScript, vars),
            objectionHandling: pack.objectionHandlers,
          });
          results.push(`✅ Voice Assistant script created (${pack.objectionHandlers.length} objection handlers included)`);
        } catch {
          results.push("⚠️ Voice Assistant: skipped (may already exist)");
        }
      }

      // 2. Follow-Up Sequence — uses sequences table (campaignId required, use 0 as placeholder)
      if (input.applyFollowUp) {
        try {
          const stepsData = pack.followUpSequence.map((step) => ({
            day: step.day,
            channel: step.channel,
            subject: step.subject ? replacePlaceholders(step.subject, vars) : undefined,
            body: replacePlaceholders(step.body, vars),
          }));
          await database.insert(sequences).values({
            clientId: input.clientId,
            userId: ctx.user.id,
            campaignId: 0, // placeholder — user can assign to a campaign later
            name: `${pack.name} Follow-Up Sequence`,
            type: "multi_channel",
            status: "draft",
            steps: stepsData,
          });
          results.push(`✅ Follow-Up Sequence created (${pack.followUpSequence.length} steps)`);
        } catch {
          results.push("⚠️ Follow-Up Sequence: skipped (may already exist)");
        }
      }

      // 3. Missed Call Text-Back
      if (input.applyMissedCall) {
        try {
          await database.insert(missedCallConfigs).values({
            clientId: input.clientId,
            userId: ctx.user.id,
            name: `${pack.name} Missed Call Response`,
            businessName: vars.businessName,
            industry: pack.name,
            responseDelaySeconds: 60,
            smsTemplate: replacePlaceholders(pack.missedCallSMS, vars),
            isActive: true,
          });
          results.push("✅ Missed Call Text-Back config created");
        } catch {
          results.push("⚠️ Missed Call Text-Back: skipped (may already exist)");
        }
      }

      // 4. Proposal Template
      if (input.applyProposal) {
        try {
          const total = pack.proposalLineItems.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
          );
          await database.insert(proposals).values({
            clientId: input.clientId,
            userId: ctx.user.id,
            title: replacePlaceholders(pack.proposalTitle, vars),
            prospectName: `${vars.businessName} — Template`,
            prospectEmail: client.email ?? "",
            prospectPhone: client.phone ?? "",
            industry: pack.name,
            serviceType: pack.name,
            scopeOfWork: `Standard ${pack.name} services package`,
            lineItems: pack.proposalLineItems,
            total: total.toString(),
            terms: pack.proposalTerms,
            generatedContent: `${replacePlaceholders(pack.proposalTitle, vars)}\n\n${replacePlaceholders(pack.proposalIntro, vars)}`,
            status: "draft",
          });
          results.push(`✅ Proposal template created ($${total.toLocaleString()} estimated value)`);
        } catch {
          results.push("⚠️ Proposal Template: skipped (may already exist)");
        }
      }

      return {
        success: true,
        industryPack: pack.name,
        clientName: client.name,
        itemsCreated: results,
        nextSteps: [
          "Go to Voice Assistant and review/activate your new script",
          "Go to Follow-Up Sequences and activate when ready",
          "Go to Missed Call Text-Back and update your real phone number",
          "Go to Proposals and customize pricing for this client",
          "Set up the Pre-Qualification Funnel with the included questions",
          "Configure the Chat Agent and get your embed code",
        ],
      };
    }),

  /** Generate a custom AI-enhanced version of a pack section */
  generateCustomSection: protectedProcedure
    .input(
      z.object({
        industryId: z.string(),
        section: z.enum(["voiceScript", "followUpSequence", "objectionHandlers", "chatFAQs"]),
        businessName: z.string(),
        location: z.string(),
        uniqueSellingPoint: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const pack = INDUSTRY_PACK_MAP[input.industryId as IndustryPackId];
      if (!pack) throw new Error("Industry pack not found");

      const sectionContent =
        input.section === "voiceScript"
          ? pack.voiceScript
          : input.section === "followUpSequence"
          ? pack.followUpSequence.map((s) => `Day ${s.day} (${s.channel}): ${s.body}`).join("\n\n")
          : input.section === "objectionHandlers"
          ? pack.objectionHandlers.map((o) => `Q: ${o.objection}\nA: ${o.response}`).join("\n\n")
          : pack.chatFAQs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert marketing copywriter specializing in the ${pack.name} industry. Customize the provided template content for a specific business, making it feel authentic and local.`,
          },
          {
            role: "user",
            content: `Customize this ${input.section} template for:
Business Name: ${input.businessName}
Location: ${input.location}
Unique Selling Point: ${input.uniqueSellingPoint}
Industry: ${pack.name}

Original template:
${sectionContent}

Return the customized version only, keeping the same structure but making it specific to this business. Keep {{firstName}}, {{phone}}, and other merge tags intact.`,
          },
        ],
      });

      const content = (response.choices?.[0]?.message?.content as string) ?? "";
      return { content };
    }),
});
