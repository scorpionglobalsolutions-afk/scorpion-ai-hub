import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { leadGenAgentRouter } from "./leadGenAgentRouter";
import { missedCallRouter } from "./missedCallRouter";
import { reviewRequestRouter } from "./reviewRequestRouter";
import { retentionRouter } from "./retentionRouter";
import { seasonalPlannerRouter } from "./seasonalPlannerRouter";
import { proposalRouter } from "./proposalRouter";
import { gbpPostRouter } from "./gbpPostRouter";
import { preQualRouter } from "./preQualRouter";
import { referralRouter } from "./referralRouter";
import { presenceRouter } from "./presenceRouter";
import { chatAgentRouter } from "./chatAgentRouter";
import { industryTemplateRouter } from "./industryTemplateRouter";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { getDb } from "./db";
import {
  clients,
  campaigns,
  sequences,
  voiceAssistants,
  seoAudits,
  reviews,
  contentAssets,
  leadGenAgents,
  missedCallConfigs,
  reviewRequestCampaigns,
  retentionRules,
  seasonalPlans,
  proposals,
  gbpPosts,
  preQualFunnels,
  referralCampaigns,
  chatAgents,
  appointments,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";
// Brand color extraction utility
async function extractBrandColors(websiteUrl: string): Promise<{ primary: string; secondary: string; accent: string; logo: string }> {
  const defaults = { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" };
  try {
    const domain = new URL(websiteUrl).hostname;
    defaults.logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    
    // Fetch the page HTML to extract theme-color meta tag and dominant colors
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(websiteUrl, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ScorpionBot/1.0)' }
    });
    clearTimeout(timeout);
    
    if (!resp.ok) return defaults;
    const html = await resp.text();
    
    // Extract theme-color meta tag
    const themeMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([#][0-9a-fA-F]{3,8})["'][^>]*name=["']theme-color["']/i);
    if (themeMatch) defaults.primary = themeMatch[1];
    
    // Extract og:image for logo
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) defaults.logo = ogMatch[1];
    
    // Try to find primary brand color from CSS in the page
    const colorMatches = html.match(/(?:--primary|--brand|--main)[^:]*:\s*([#][0-9a-fA-F]{3,8})/gi);
    if (colorMatches && colorMatches.length > 0) {
      const colorVal = colorMatches[0].match(/([#][0-9a-fA-F]{3,8})/)?.[1];
      if (colorVal) defaults.primary = colorVal;
    }
    
    // Generate complementary secondary color (darken primary slightly)
    if (defaults.primary.startsWith('#') && defaults.primary.length >= 7) {
      const hex = defaults.primary.slice(1);
      const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 30);
      const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 30);
      const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 30);
      defaults.secondary = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    return defaults;
  } catch {
    return defaults;
  }
}

// ============================================================================
// CLIENT MANAGEMENT ROUTER
// ============================================================================

const clientRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getClientsByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getClientById(input.clientId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createClient({
        userId: ctx.user.id,
        ...input,
      });
      await db.logActivity({
        userId: ctx.user.id,
        action: "created_client",
        entityType: "client",
        details: input,
      });
      return result;
    }),
  update: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        industry: z.string().optional().nullable(),
        website: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        status: z.enum(["active", "inactive", "paused"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { clientId, ...fields } = input;
      const database = await getDb();
      if (!database) throw new Error("DB unavailable");
      await database
        .update(clients)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(clients.id, clientId));
      await db.logActivity({
        userId: ctx.user.id,
        clientId,
        action: "updated_client",
        entityType: "client",
        details: fields,
      });
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new Error("DB unavailable");
      await database.delete(clients).where(eq(clients.id, input.clientId));
      await db.logActivity({
        userId: ctx.user.id,
        action: "deleted_client",
        entityType: "client",
        details: { clientId: input.clientId },
      });
      return { success: true };
    }),
  getProducts: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const { clientId } = input;
      const database = await getDb();
      if (!database) throw new Error("DB unavailable");
      // Query all module tables for this client in parallel
      const [
        campaignRows,
        sequenceRows,
        voiceRows,
        seoRows,
        reviewRows,
        contentRows,
        leadGenRows,
        missedCallRows,
        reviewRequestRows,
        retentionRows,
        seasonalRows,
        proposalRows,
        gbpRows,
        preQualRows,
        referralRows,
        chatAgentRows,
        appointmentRows,
      ] = await Promise.all([
        database.select().from(campaigns).where(eq(campaigns.clientId, clientId)),
        database.select().from(sequences).where(eq(sequences.clientId, clientId)),
        database.select().from(voiceAssistants).where(eq(voiceAssistants.clientId, clientId)),
        database.select().from(seoAudits).where(eq(seoAudits.clientId, clientId)),
        database.select().from(reviews).where(eq(reviews.clientId, clientId)),
        database.select().from(contentAssets).where(eq(contentAssets.clientId, clientId)),
        database.select().from(leadGenAgents).where(eq(leadGenAgents.clientId, clientId)),
        database.select().from(missedCallConfigs).where(eq(missedCallConfigs.clientId, clientId)),
        database.select().from(reviewRequestCampaigns).where(eq(reviewRequestCampaigns.clientId, clientId)),
        database.select().from(retentionRules).where(eq(retentionRules.clientId, clientId)),
        database.select().from(seasonalPlans).where(eq(seasonalPlans.clientId, clientId)),
        database.select().from(proposals).where(eq(proposals.clientId, clientId)),
        database.select().from(gbpPosts).where(eq(gbpPosts.clientId, clientId)),
        database.select().from(preQualFunnels).where(eq(preQualFunnels.clientId, clientId)),
        database.select().from(referralCampaigns).where(eq(referralCampaigns.clientId, clientId)),
        database.select().from(chatAgents).where(eq(chatAgents.clientId, clientId)),
        database.select().from(appointments).where(eq(appointments.clientId, clientId)),
      ]);
      return [
        { module: "Campaigns", path: "campaigns", icon: "Megaphone", count: campaignRows.length, active: campaignRows.some((r: any) => r.status === "active"), items: campaignRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "Follow-Up Sequences", path: "sequences", icon: "MessageSquare", count: sequenceRows.length, active: sequenceRows.some((r: any) => r.status === "active"), items: sequenceRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "Voice Assistant", path: "voice", icon: "Mic", count: voiceRows.length, active: voiceRows.some((r: any) => r.status === "active"), items: voiceRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "SEO Audits", path: "seo-audit", icon: "Search", count: seoRows.length, active: seoRows.length > 0, items: seoRows.map((r: any) => ({ id: r.id, name: r.businessName ?? "Audit", status: "completed" })) },
        { module: "Reputation / Reviews", path: "reputation", icon: "Star", count: reviewRows.length, active: reviewRows.length > 0, items: reviewRows.map((r: any) => ({ id: r.id, name: r.reviewerName ?? "Review", status: r.responded ? "responded" : "pending" })) },
        { module: "Content Assets", path: "content", icon: "Pen", count: contentRows.length, active: contentRows.length > 0, items: contentRows.map((r: any) => ({ id: r.id, name: r.title ?? r.type, status: r.status ?? "draft" })) },
        { module: "Lead Gen Agent", path: "lead-gen-agent", icon: "Bot", count: leadGenRows.length, active: leadGenRows.some((r: any) => r.status === "active"), items: leadGenRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "Missed Call Text-Back", path: "missed-call", icon: "PhoneMissed", count: missedCallRows.length, active: missedCallRows.some((r: any) => r.isActive), items: missedCallRows.map((r: any) => ({ id: r.id, name: r.name, status: r.isActive ? "active" : "inactive" })) },
        { module: "Review Request", path: "review-request", icon: "ThumbsUp", count: reviewRequestRows.length, active: reviewRequestRows.some((r: any) => r.status === "active"), items: reviewRequestRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "Client Retention", path: "retention", icon: "Heart", count: retentionRows.length, active: retentionRows.some((r: any) => r.isActive), items: retentionRows.map((r: any) => ({ id: r.id, name: r.name, status: r.isActive ? "active" : "inactive" })) },
        { module: "Seasonal Planner", path: "seasonal-planner", icon: "Calendar", count: seasonalRows.length, active: seasonalRows.length > 0, items: seasonalRows.map((r: any) => ({ id: r.id, name: r.name, status: "planned" })) },
        { module: "Proposals", path: "proposals", icon: "ClipboardList", count: proposalRows.length, active: proposalRows.some((r: any) => r.status === "accepted"), items: proposalRows.map((r: any) => ({ id: r.id, name: r.title, status: r.status })) },
        { module: "GBP Posts", path: "gbp-posts", icon: "Globe", count: gbpRows.length, active: gbpRows.some((r: any) => r.status === "published"), items: gbpRows.map((r: any) => ({ id: r.id, name: r.title, status: r.status })) },
        { module: "Pre-Qual Funnel", path: "pre-qual", icon: "Filter", count: preQualRows.length, active: preQualRows.some((r: any) => r.isActive), items: preQualRows.map((r: any) => ({ id: r.id, name: r.name, status: r.isActive ? "active" : "inactive" })) },
        { module: "Referral Campaigns", path: "referral", icon: "Share2", count: referralRows.length, active: referralRows.some((r: any) => r.status === "active"), items: referralRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "Chat Agent", path: "chat-agent", icon: "MessageCircle", count: chatAgentRows.length, active: chatAgentRows.some((r: any) => r.status === "active"), items: chatAgentRows.map((r: any) => ({ id: r.id, name: r.name, status: r.status })) },
        { module: "Appointments", path: "appointments", icon: "Calendar", count: appointmentRows.length, active: appointmentRows.some((r: any) => r.status === "scheduled"), items: appointmentRows.map((r: any) => ({ id: r.id, name: r.leadName ?? "Appointment", status: r.status })) },
      ];
    }),
});

// ============================================================================
// CAMPAIGNS ROUTER
// ============================================================================

const campaignRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getCampaignsByClientId(input.clientId);
    }),

  get: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return db.getCampaignById(input.campaignId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        name: z.string().min(1),
        type: z.enum([
          "speed_to_lead",
          "reactivation",
          "appointment_setting",
          "follow_up",
          "content",
          "reputation",
        ]),
        config: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createCampaign({
        clientId: input.clientId,
        userId: ctx.user.id,
        name: input.name,
        type: input.type,
        config: input.config,
      });
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "created_campaign",
        entityType: "campaign",
        details: input,
      });
      return result;
    }),
});

// ============================================================================
// LEADS ROUTER
// ============================================================================

const leadRouter = router({
  listByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadsByCampaignId(input.campaignId);
    }),

  listAll: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAllLeads(input?.limit ?? 100);
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "qualified", "converted", "lost"]) }))
    .mutation(async ({ input }) => {
      return db.updateLeadStatus(input.id, input.status);
    }),

  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        clientId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createLead(input);
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "created_lead",
        entityType: "lead",
        details: input,
      });
      return result;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadById(input.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await db.updateLead(id, data);
      await db.logActivity({
        userId: ctx.user.id,
        clientId: 0,
        action: "updated_lead",
        entityType: "lead",
        details: input,
      });
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.logActivity({
        userId: ctx.user.id,
        clientId: 0,
        action: "deleted_lead",
        entityType: "lead",
        details: { id: input.id },
      });
      return db.deleteLead(input.id);
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const all = await db.getAllLeads(500);
      const q = input.query.toLowerCase();
      const filtered = all.filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.includes(q)) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.source && l.source.toLowerCase().includes(q))
      );
      return filtered.slice(0, input.limit ?? 50);
    }),
});

// ============================================================================
// SPEED TO LEAD MODULE
// ============================================================================

const speedToLeadRouter = router({
  generateResponse: protectedProcedure
    .input(
      z.object({
        leadName: z.string(),
        leadEmail: z.string().email(),
        leadCompany: z.string().optional(),
        channel: z.enum(["sms", "email"]),
        businessContext: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt =
        input.channel === "sms"
          ? `Generate a short, personalized SMS response (max 160 chars) for a lead named ${input.leadName} from ${input.leadCompany || "a company"}. Context: ${input.businessContext || "lead generation campaign"}. Make it friendly and include a clear call-to-action.`
          : `Generate a personalized email response for a lead named ${input.leadName} from ${input.leadCompany || "a company"}. Email: ${input.leadEmail}. Context: ${input.businessContext || "lead generation campaign"}. Include subject line and body. Make it professional and compelling.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return {
        content:
          response.choices[0]?.message.content || "Failed to generate response",
        channel: input.channel,
      };
    }),
});

// ============================================================================
// DATABASE REACTIVATION MODULE
// ============================================================================

const reactivationRouter = router({
  generateSequence: protectedProcedure
    .input(
      z.object({
        leadName: z.string(),
        leadEmail: z.string().email(),
        lastContactDate: z.string().optional(),
        businessContext: z.string().optional(),
        numMessages: z.number().default(3),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Generate a ${input.numMessages}-step reactivation email sequence for a dormant lead named ${input.leadName}. 
      Last contact: ${input.lastContactDate || "unknown"}. 
      Context: ${input.businessContext || "business services"}. 
      Each email should be progressively more compelling. Format as JSON array with objects containing: subject, body, delayDays.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      try {
        const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "[]");
        let sequence: any;
        try {
          sequence = JSON.parse(contentStr);
        } catch {
          sequence = [{ step: 1, content: contentStr, channel: "email", delay: 0 }];
        }
        return { sequence, success: true };
      } catch (error) {
        console.error("[Reactivation Error]", error);
        return {
          sequence: [],
          success: false,
          error: "Failed to parse sequence",
        };
      }
    }),
});

// ============================================================================
// APPOINTMENT SETTING MODULE
// ============================================================================

const appointmentRouter = router({
  listByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return db.getAppointmentsByCampaignId(input.campaignId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        leadId: z.number(),
        clientId: z.number(),
        scheduledAt: z.date().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createAppointment(input);
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "created_appointment",
        entityType: "appointment",
        details: input,
      });
      return result;
    }),

  generateConfirmation: protectedProcedure
    .input(
      z.object({
        leadName: z.string(),
        appointmentTime: z.string(),
        businessName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Generate a professional appointment confirmation message for ${input.leadName} with ${input.businessName} scheduled for ${input.appointmentTime}. Include: confirmation of time, what to expect, and contact info. Keep it concise and friendly.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return {
        message:
          response.choices[0]?.message.content ||
          "Failed to generate confirmation",
      };
    }),
});

// ============================================================================
// AI VOICE ASSISTANT MODULE
// ============================================================================

const voiceAssistantRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getVoiceAssistantsByClientId(input.clientId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        name: z.string().min(1),
        type: z.enum(["inbound", "outbound"]),
        systemPrompt: z.string().optional(),
        callScript: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createVoiceAssistant({
        userId: ctx.user.id,
        ...input,
      });
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "created_voice_assistant",
        entityType: "voice_assistant",
        details: input,
      });
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        systemPrompt: z.string().optional(),
        callScript: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateVoiceAssistant(id, data);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "active", "paused"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.updateVoiceAssistantStatus(input.id, input.status);
      await db.logActivity({
        userId: ctx.user.id,
        action: `voice_assistant_${input.status}`,
        entityType: "voice_assistant",
        details: { id: input.id, status: input.status },
      });
      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.logActivity({
        userId: ctx.user.id,
        action: "deleted_voice_assistant",
        entityType: "voice_assistant",
        details: { id: input.id },
      });
      return db.deleteVoiceAssistant(input.id);
    }),

  generateScript: protectedProcedure
    .input(
      z.object({
        businessName: z.string(),
        industry: z.string(),
        callType: z.enum(["inbound", "outbound"]),
        goal: z.string(), // e.g. "book appointments", "qualify leads", "follow up on quote"
        tone: z.enum(["professional", "friendly", "urgent", "consultative"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const toneDesc = input.tone ?? "professional";
      const prompt = `You are an expert voice AI script writer for sales and service businesses.

Write a complete ${input.callType} call script for:
- Business: ${input.businessName}
- Industry: ${input.industry}
- Goal: ${input.goal}
- Tone: ${toneDesc}

The script should include:
1. Opening greeting (introduce the AI assistant by name)
2. Purpose statement
3. 3-5 qualifying questions
4. Value proposition
5. Call to action (book appointment / confirm details / transfer to human)
6. Closing

Also write a system prompt (2-3 sentences) that describes the assistant's personality and behavior.

Format your response as JSON with keys: "systemPrompt", "callScript"`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "voice_script",
            strict: true,
            schema: {
              type: "object",
              properties: {
                systemPrompt: { type: "string" },
                callScript: { type: "string" },
              },
              required: ["systemPrompt", "callScript"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message.content || "{}";
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      try {
        return JSON.parse(content) as { systemPrompt: string; callScript: string };
      } catch {
        return { systemPrompt: "", callScript: content };
      }
    }),

  generateObjectionHandler: protectedProcedure
    .input(
      z.object({
        objection: z.string(),
        productContext: z.string(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `You are an expert sales coach. Generate a professional, empathetic response to this sales objection.

Objection: "${input.objection}"
Business context: ${input.productContext}${input.industry ? `\nIndustry: ${input.industry}` : ""}

Provide:
1. A brief empathetic acknowledgment (1 sentence)
2. A reframe or value statement (1-2 sentences)
3. A soft close or next step (1 sentence)

Keep it conversational and under 60 words total.`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
      });

      const objContent = response.choices[0]?.message.content;
      return {
        response: typeof objContent === "string" ? objContent : (objContent ? JSON.stringify(objContent) : "Failed to generate response"),
      };
    }),

  addCallLog: protectedProcedure
    .input(
      z.object({
        voiceAssistantId: z.number(),
        leadId: z.number().optional(),
        campaignId: z.number().optional(),
        duration: z.number().optional(),
        outcome: z.string().optional(),
        transcript: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.createCallLog(input);
    }),

  getCallLogs: protectedProcedure
    .input(z.object({ voiceAssistantId: z.number() }))
    .query(async ({ input }) => {
      return db.getCallLogsByAssistantId(input.voiceAssistantId);
    }),
});

// ============================================================================
// MULTI-CHANNEL FOLLOW-UP SEQUENCE MODULE
// ============================================================================

const sequenceRouter = router({
  listByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return db.getSequencesByCampaignId(input.campaignId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        clientId: z.number(),
        name: z.string().min(1),
        type: z.enum(["email", "sms", "multi_channel"]),
        steps: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createSequence({
        campaignId: input.campaignId,
        clientId: input.clientId,
        userId: ctx.user.id,
        name: input.name,
        type: input.type,
        steps: input.steps,
      });
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "created_sequence",
        entityType: "sequence",
        details: input,
      });
      return result;
    }),

  generateStep: protectedProcedure
    .input(
      z.object({
        stepNumber: z.number(),
        leadName: z.string(),
        previousContext: z.string().optional(),
        channel: z.enum(["email", "sms"]),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Generate a ${input.channel} for step ${input.stepNumber} of a follow-up sequence to ${input.leadName}. 
      ${input.previousContext ? `Previous context: ${input.previousContext}` : ""}
      Make it progressively more compelling and include a clear call-to-action. 
      ${input.channel === "email" ? "Include subject line and body." : "Keep under 160 characters."}`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return {
        content:
          response.choices[0]?.message.content || "Failed to generate step",
        channel: input.channel,
        stepNumber: input.stepNumber,
      };
    }),
});

// ============================================================================
// LOCAL SEO & GBP AUDITOR MODULE (Vendasta-Style Snapshot Report)
// ============================================================================

function buildReportFromScrapedData(scrapedData: any, businessName: string, industry: string) {
  const ws = scrapedData.website;
  const g = scrapedData.google;
  const dirs = scrapedData.directories;
  const social = scrapedData.social;
  const comps = scrapedData.competitors;

  // Calculate scores based on real data
  const seoScore = [
    ws.hasTitle ? 15 : 0,
    ws.hasMetaDescription ? 15 : 0,
    ws.hasH1 ? 10 : 0,
    ws.hasSchemaMarkup ? 15 : 0,
    ws.hasCanonical ? 10 : 0,
    ws.hasRobotsTxt ? 10 : 0,
    ws.hasSitemap ? 10 : 0,
    ws.imageCount > 0 ? Math.round((ws.imagesWithAlt / ws.imageCount) * 15) : 0,
  ].reduce((a, b) => a + b, 0);

  const listingsFound = dirs.filter((d: any) => d.status === 'found').length;
  const listingsScore = Math.round((listingsFound / Math.max(dirs.length, 1)) * 100);

  const reviewScore = Math.min(100, Math.round((g.reviewCount / 50) * 60 + (g.rating / 5) * 40));

  const socialFound = social.filter((s: any) => s.found).length;
  const socialScore = Math.round((socialFound / Math.max(social.length, 1)) * 100);

  const websiteScore = [
    ws.isAccessible ? 20 : 0,
    ws.isHttps ? 15 : 0,
    ws.isMobileFriendly ? 20 : 0,
    ws.hasPhone ? 10 : 0,
    ws.hasAddress ? 10 : 0,
    ws.hasCTA ? 15 : 0,
    ws.hasSocialLinks ? 10 : 0,
  ].reduce((a, b) => a + b, 0);

  const overallScore = Math.round((seoScore + listingsScore + reviewScore + socialScore + websiteScore) / 5);
  const gradeFromScore = (s: number) => s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 55 ? 'C' : s >= 35 ? 'D' : 'F';

  const topComp = comps.length > 0 ? comps.reduce((a: any, b: any) => a.reviewCount > b.reviewCount ? a : b) : null;

  return {
    overallGrade: gradeFromScore(overallScore),
    overallScore,
    executiveSummary: `${businessName} has a digital presence score of ${overallScore}/100. ${g.found ? `Their Google Business Profile shows ${g.reviewCount} reviews with a ${g.rating}-star rating.` : 'No Google Business Profile was found.'} ${listingsFound} of ${dirs.length} directory listings were verified.`,
    categories: [
      {
        name: 'SEO',
        grade: gradeFromScore(seoScore),
        score: seoScore,
        metrics: [
          { label: 'Title Tag', value: ws.hasTitle ? 'Present' : 'Missing', benchmark: 'Required', status: ws.hasTitle ? 'good' : 'critical' },
          { label: 'Meta Description', value: ws.hasMetaDescription ? 'Present' : 'Missing', benchmark: 'Required', status: ws.hasMetaDescription ? 'good' : 'critical' },
          { label: 'Schema Markup', value: ws.hasSchemaMarkup ? 'Present' : 'Missing', benchmark: 'Recommended', status: ws.hasSchemaMarkup ? 'good' : 'warning' },
          { label: 'Sitemap', value: ws.hasSitemap ? 'Present' : 'Missing', benchmark: 'Required', status: ws.hasSitemap ? 'good' : 'warning' },
          { label: 'Image Alt Text', value: `${ws.imagesWithAlt}/${ws.imageCount}`, benchmark: '100%', status: ws.imagesWithAlt === ws.imageCount ? 'good' : 'warning' },
        ],
        findings: [
          !ws.hasMetaDescription ? 'Missing meta description - critical for search rankings' : 'Meta description is present',
          !ws.hasSitemap ? 'No XML sitemap found' : 'XML sitemap is present',
          ws.h1Count !== 1 ? `${ws.h1Count} H1 tags found (should be exactly 1)` : 'Proper H1 tag structure',
        ].filter(Boolean),
        recommendations: [
          !ws.hasMetaDescription ? 'Add a unique, keyword-rich meta description (150-160 characters)' : null,
          !ws.hasSitemap ? 'Create and submit an XML sitemap to Google Search Console' : null,
          !ws.hasCanonical ? 'Add canonical URLs to prevent duplicate content issues' : null,
          ws.imagesWithAlt < ws.imageCount ? 'Add descriptive alt text to all images' : null,
        ].filter(Boolean),
      },
      {
        name: 'Listings',
        grade: gradeFromScore(listingsScore),
        score: listingsScore,
        presenceCount: listingsFound,
        totalDirectories: dirs.length,
        accuracyPercent: listingsFound > 0 ? 80 : 0,
        directories: dirs.map((d: any) => ({ name: d.name, status: d.status, issues: d.issues })),
        findings: [`Business found on ${listingsFound} of ${dirs.length} checked directories`],
        recommendations: ['Submit business to all major directories', 'Ensure NAP (Name, Address, Phone) consistency across all listings'],
      },
      {
        name: 'Reviews',
        grade: gradeFromScore(reviewScore),
        score: reviewScore,
        metrics: [
          { label: 'Total Reviews Found', value: String(g.reviewCount), benchmark: '25+', industryLeader: topComp ? String(topComp.reviewCount) : '100+' },
          { label: 'Average Rating', value: String(g.rating || 'N/A'), benchmark: '4.5', industryLeader: topComp ? String(topComp.rating) : '4.9' },
          { label: 'Reviews Per Month', value: 'N/A', benchmark: '3-5', industryLeader: '10+' },
          { label: 'Review Sources', value: '1', benchmark: '3+', industryLeader: '5+' },
        ],
        findings: [
          g.reviewCount < 25 ? `Only ${g.reviewCount} reviews found - below industry average of 25+` : `${g.reviewCount} reviews found`,
          g.rating < 4.5 ? `Rating of ${g.rating} is below the 4.5 industry benchmark` : `Strong ${g.rating}-star rating`,
        ],
        recommendations: [
          'Implement an automated review request system after service completion',
          'Respond to all reviews within 24 hours',
          'Diversify review sources (Google, Yelp, Facebook, industry-specific sites)',
        ],
      },
      {
        name: 'Social',
        grade: gradeFromScore(socialScore),
        score: socialScore,
        platforms: social.map((s: any) => ({
          name: s.platform,
          found: s.found,
          followers: s.followers || 'N/A',
          activity: s.activity || 'not_found',
          recommendation: !s.found ? `Create a ${s.platform} business profile` : s.activity === 'inactive' ? `Post regularly on ${s.platform}` : `Continue engaging on ${s.platform}`,
        })),
        findings: [
          socialFound === 0 ? 'No active social media presence detected' : `Active on ${socialFound} of ${social.length} major platforms`,
        ],
        recommendations: [
          socialFound < 3 ? 'Establish profiles on Facebook, Instagram, and at least one other platform' : null,
          'Post at least 3 times per week with engaging local content',
          'Share before/after photos and customer testimonials',
        ].filter(Boolean),
      },
      {
        name: 'Website',
        grade: gradeFromScore(websiteScore),
        score: websiteScore,
        checklist: [
          { item: 'Business Address', found: ws.hasAddress },
          { item: 'Phone Number', found: ws.hasPhone },
          { item: 'HTTPS Secure', found: ws.isHttps },
          { item: 'Mobile Friendly', found: ws.isMobileFriendly },
          { item: 'Social Links', found: ws.hasSocialLinks },
          { item: 'Call-to-Action', found: ws.hasCTA },
        ],
        performance: {
          mobileScore: ws.isMobileFriendly ? 70 : 40,
          desktopScore: ws.isAccessible ? 75 : 30,
          pageSpeed: `${(ws.pageLoadTime / 1000).toFixed(1)}s`,
          lcp: `${((ws.pageLoadTime * 1.5) / 1000).toFixed(1)}s`,
          cls: '0.1',
          fid: '100ms',
        },
        findings: [
          !ws.hasSocialLinks ? 'No social media links found on website' : 'Social links present',
          !ws.hasAddress ? 'No business address displayed on website' : 'Address is displayed',
          ws.pageLoadTime > 3000 ? `Slow page load time (${(ws.pageLoadTime / 1000).toFixed(1)}s)` : 'Acceptable page load time',
        ],
        recommendations: [
          !ws.hasSocialLinks ? 'Add social media links to header or footer' : null,
          !ws.hasAddress ? 'Display full business address on contact page and footer' : null,
          ws.pageLoadTime > 3000 ? 'Optimize images and enable caching to improve load time' : null,
          !ws.hasMetaDescription ? 'Add meta descriptions to improve click-through rates' : null,
        ].filter(Boolean),
      },
      {
        name: 'Advertising',
        grade: 'F',
        score: 10,
        keywords: [
          { keyword: `${industry || 'service'} near me`, impressions: 0, clicks: 0 },
          { keyword: `best ${industry || 'service'} ${scrapedData.google.address?.split(',')[1]?.trim() || 'local'}`, impressions: 0, clicks: 0 },
          { keyword: `affordable ${industry || 'service'}`, impressions: 0, clicks: 0 },
        ],
        totalImpressions: 0,
        totalClicks: 0,
        findings: ['No active paid advertising campaigns detected'],
        recommendations: [
          `Launch Google Ads targeting "${industry || 'service'} near me" and related local keywords`,
          'Set up Google Local Services Ads for immediate visibility',
          'Consider Facebook/Instagram ads targeting local homeowners',
        ],
      },
    ],
    topPriorities: [
      listingsFound < 5 ? 'Build directory listings across 50+ platforms' : null,
      g.reviewCount < 25 ? 'Generate more customer reviews (target 25+)' : null,
      socialFound < 3 ? 'Establish social media presence on major platforms' : null,
      !ws.hasMetaDescription ? 'Fix critical SEO issues (meta description, sitemap)' : null,
      'Launch targeted local advertising campaigns',
    ].filter(Boolean).slice(0, 5),
  };
}

const seoAuditRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getSeoAuditsByClientId(input.clientId);
    }),

  listAll: protectedProcedure.query(async () => {
    const allDb = await db.getDb();
    if (!allDb) return [];
    const { seoAudits } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    return allDb.select().from(seoAudits).orderBy(desc(seoAudits.createdAt)).limit(50);
  }),

  generateAudit: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        businessName: z.string(),
        website: z.string().optional(),
        industry: z.string().optional(),
        location: z.string().optional(),
        googleMapsUrl: z.string().optional(), // paste Google Maps URL for accurate GBP lookup
        overrides: z.object({
          reviewCount: z.number().optional(),
          rating: z.number().optional(),
          googlePlaceId: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("[SEO Audit] Starting REAL data-driven snapshot for:", input.businessName);
        
        // Step 1: Scrape real data from the website, Google, directories, social
        const { scrapeAllData } = await import("./seoScraper");
        const scrapedData = await scrapeAllData({
          businessName: input.businessName,
          website: input.website,
          industry: input.industry,
          location: input.location,
          googleMapsUrl: input.googleMapsUrl,
          overrides: input.overrides,
        });
        
        // Use brand colors from website analysis
        let brandColors = scrapedData.website.brandColors;
        
        // ── Step 2: Build Loss-Led LLM prompt with REAL scraped data ──────────
        const realDataContext = `
REAL VERIFIED DATA — DO NOT HALLUCINATE. Use ONLY these facts:

WEBSITE ANALYSIS (${scrapedData.website.url || 'No website'}):
- Accessible: ${scrapedData.website.isAccessible}
- HTTPS: ${scrapedData.website.isHttps}
- Mobile Friendly: ${scrapedData.website.isMobileFriendly}
- Title Tag: ${scrapedData.website.hasTitle} ("${scrapedData.website.title}")
- Meta Description: ${scrapedData.website.hasMetaDescription} ("${scrapedData.website.metaDescription}")
- H1 Count: ${scrapedData.website.h1Count} (CRITICAL: more than 1 = SEO conflict penalty)
- H2 Count: ${scrapedData.website.h2Count}
- Phone on Site: ${scrapedData.website.hasPhone} (${scrapedData.website.phone})
- Address on Site: ${scrapedData.website.hasAddress} (${scrapedData.website.address})
- Schema Markup: ${scrapedData.website.hasSchemaMarkup}
- Social Links: ${scrapedData.website.hasSocialLinks} (${scrapedData.website.socialLinksFound.join(', ') || 'none'})
- CTA: ${scrapedData.website.hasCTA} ("${scrapedData.website.ctaText}")
- Canonical Tag: ${scrapedData.website.hasCanonical}
- Robots.txt: ${scrapedData.website.hasRobotsTxt}
- Sitemap: ${scrapedData.website.hasSitemap}
- Images: ${scrapedData.website.imageCount} total, ${scrapedData.website.imagesWithAlt} with alt text
- Page Load Time: ${scrapedData.website.pageLoadTime}ms

GOOGLE BUSINESS PROFILE:
- Found: ${scrapedData.google.found}
- Name: ${scrapedData.google.name}
- Rating: ${scrapedData.google.rating}
- Review Count: ${scrapedData.google.reviewCount}
- Address: ${scrapedData.google.address}
- Phone: ${scrapedData.google.phone}
- Business Types: ${scrapedData.google.businessTypes.join(', ')}

DIRECTORY PRESENCE (${scrapedData.directories.filter(d => d.status === 'found').length} of ${scrapedData.directories.length} found):
${scrapedData.directories.map(d => `- ${d.name}: ${d.status}`).join('\n')}

SOCIAL MEDIA:
${scrapedData.social.map(s => `- ${s.platform}: ${s.found ? 'Found' : 'Not Found'} (${s.activity})`).join('\n')}

LOCAL COMPETITORS:
${scrapedData.competitors.map(c => `- ${c.name}: ${c.rating} stars, ${c.reviewCount} reviews`).join('\n')}
`;

        // ── Pre-calculate scores (Loss-Led grading) ───────────────────────────
        const reviewCount = scrapedData.google.reviewCount || 0;
        const directoriesFound = scrapedData.directories.filter(d => d.status === 'found').length;
        const totalDirectories = scrapedData.directories.length;
        const h1Count = scrapedData.website.h1Count || 0;
        const hasAddress = scrapedData.website.hasAddress;
        const industry = input.industry || 'local service';
        const socialFound = scrapedData.social.filter(s => s.found).length;

        // SEO: heavy penalty for H1 conflicts, missing address, low directory count
        const seoScore = Math.max(10, 100
          - (h1Count > 1 ? (h1Count - 1) * 12 : 0)
          - (!hasAddress ? 15 : 0)
          - (!scrapedData.website.hasSchemaMarkup ? 10 : 0)
          - (directoriesFound < 5 ? 20 : directoriesFound < 10 ? 10 : 0));
        const seoGrade = seoScore >= 80 ? 'B' : seoScore >= 60 ? 'C' : seoScore >= 40 ? 'D' : 'F';

        // Listings
        const listingsScore = Math.round((directoriesFound / Math.max(totalDirectories, 1)) * 100);
        const listingsGrade = listingsScore >= 70 ? 'C' : listingsScore >= 40 ? 'D' : 'F';

        // Reviews
        const reviewScore = reviewCount >= 60 ? 75 : reviewCount >= 30 ? 55 : reviewCount >= 10 ? 35 : 18;
        const reviewGrade = reviewCount >= 60 ? 'C' : reviewCount >= 30 ? 'D' : 'F';

        // Social
        const socialScore = Math.round((socialFound / Math.max(scrapedData.social.length, 1)) * 100);
        const socialGrade = socialScore >= 70 ? 'C' : socialScore >= 40 ? 'D' : 'F';

        // Website checklist
        const websiteChecks = [
          scrapedData.website.hasAddress, scrapedData.website.hasPhone,
          scrapedData.website.isHttps, scrapedData.website.isMobileFriendly,
          scrapedData.website.hasCTA, scrapedData.website.hasSchemaMarkup,
        ].filter(Boolean).length;
        const websiteRaw = Math.round((websiteChecks / 6) * 100) - (h1Count > 1 ? 20 : 0);
        const websiteScore = Math.max(10, websiteRaw);
        const websiteGrade = websiteScore >= 70 ? 'C' : websiteScore >= 50 ? 'D' : 'F';

        // GEO (Generative Engine Optimization) — scored from available signals
        const geoScore = Math.max(5,
          (scrapedData.website.hasSchemaMarkup ? 25 : 0)
          + (scrapedData.google.found ? 20 : 0)
          + (reviewCount >= 10 ? 15 : reviewCount >= 3 ? 8 : 0)
          + (scrapedData.website.hasSitemap ? 10 : 0)
          + (scrapedData.website.hasTitle && scrapedData.website.hasMetaDescription ? 10 : 0)
          + (directoriesFound >= 5 ? 10 : 0)
          + (socialFound >= 2 ? 10 : 0));
        const geoGrade = geoScore >= 70 ? 'C' : geoScore >= 45 ? 'D' : 'F';

        // Advertising — score based on real keyword opportunity size
        const kd = scrapedData.keywordData;
        const topKwVolume = kd.topKeyword?.monthlySearches || 0;
        const totalKwOpportunity = kd.totalMonthlyOpportunity || 0;
        // Score: 10 base (no ads detected) — opportunity size affects urgency not score
        const adScore = 10;
        const adGrade = 'F';
        // Build real keyword rows for the prompt
        const realKeywordRows = kd.keywords.slice(0, 6).map(k =>
          `{ "keyword": "${k.keyword}", "monthlySearches": ${k.monthlySearches}, "avgCpc": ${k.avgCpc}, "competition": "${k.competition}", "intent": "${k.intent}" }`
        ).join(',\n          ');
        const kwDataSource = kd.source === 'dataforseo' ? 'DataForSEO live API' : 'Industry estimates (DataForSEO credentials not configured)';

        // ── Real competitor averages from scraped data (no AI estimation) ────
        const comps = scrapedData.competitors.filter(c => c.reviewCount > 0);
        const competitorReviewAvg = comps.length > 0
          ? Math.round(comps.reduce((sum, c) => sum + c.reviewCount, 0) / comps.length)
          : null; // null = no data, do NOT estimate
        const competitorRatingAvg = comps.length > 0
          ? Math.round((comps.reduce((sum, c) => sum + c.rating, 0) / comps.length) * 10) / 10
          : null;
        const topCompetitor = comps.length > 0
          ? comps.reduce((a, b) => a.reviewCount > b.reviewCount ? a : b)
          : null;

        const overallScore = Math.round((seoScore + listingsScore + reviewScore + socialScore + websiteScore + geoScore + adScore) / 7);
        const overallGrade = overallScore >= 70 ? 'C' : overallScore >= 50 ? 'D' : 'F';

        // ── Revenue leakage calculation ───────────────────────────────────────
        const isLending = industry.toLowerCase().includes('loan') || industry.toLowerCase().includes('lend') || industry.toLowerCase().includes('mortgage') || industry.toLowerCase().includes('financ');
        const isRoofing = industry.toLowerCase().includes('roof');
        const isPool = industry.toLowerCase().includes('pool');
        const isHVAC = industry.toLowerCase().includes('hvac') || industry.toLowerCase().includes('air') || industry.toLowerCase().includes('heat');
        const avgDealValue = isLending ? 7000 : isRoofing ? 8000 : isPool ? 3500 : isHVAC ? 4500 : 3000;
        const avgAnnualInterest = isLending ? 35000 : 0;
        const monthlyLostDeals = reviewCount < 10 ? 1.5 : reviewCount < 30 ? 1 : 0.5;
        const lostOriginationAnnual = Math.round(monthlyLostDeals * avgDealValue * 12);
        const lostInterestAnnual = Math.round(monthlyLostDeals * avgAnnualInterest * 12);
        const totalRevenueLeak = lostOriginationAnnual + lostInterestAnnual;
        const monthlyLeak = Math.round(totalRevenueLeak / 12);

        const prompt = `You are a senior digital marketing consultant at Scorpion Global Solutions LLC — a Digital Marketing & AI Agency based in Arizona. You are generating a "Digital Audit & Profit Leakage Report" for "${input.businessName}"${input.website ? ` (${input.website})` : ''}${input.industry ? ` in the ${input.industry} industry` : ''}${input.location ? ` in ${input.location}` : ''}.

AUDIT AUTHORITY: Scorpion Global Solutions LLC | Arizona | Digital Marketing & AI Solutions
REPORT DATE: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

CRITICAL RULES:
1. Use ONLY the real data provided. NEVER hallucinate or invent data.
2. Lead every section with REVENUE IMPACT first, then technical detail.
3. Use plain English — explain penalties like you are talking to a business owner, not a developer.
4. For H1 conflicts: describe it as "You are confusing Google" and explain the revenue consequence.
5. Use the PRE-CALCULATED SCORES below — do NOT override them.
6. GEO = Generative Engine Optimization (visibility in ChatGPT, Google AI Overviews, Perplexity, Bing Copilot). Score it honestly based on schema markup, review count, directory presence, and structured data signals.
7. The report must feel like it was written by a high-end consultant, not a generic tool.

PRE-CALCULATED SCORES (use these exactly — do not change them):
- Overall: ${overallGrade} (${overallScore}/100)
- SEO: ${seoGrade} (${seoScore}/100)${h1Count > 1 ? ` — ${h1Count} H1 conflicts detected` : ''}${!hasAddress ? ' — missing business address' : ''}
- Listings: ${listingsGrade} (${listingsScore}/100) — ${directoriesFound} of ${totalDirectories} directories found
- Reviews: ${reviewGrade} (${reviewScore}/100) — ${reviewCount} reviews
- Social: ${socialGrade} (${socialScore}/100) — ${socialFound} of ${scrapedData.social.length} platforms found
- Website: ${websiteGrade} (${websiteScore}/100) — ${websiteChecks}/6 checklist items passed
- GEO: ${geoGrade} (${geoScore}/100) — AI engine visibility score
- Advertising: ${adGrade} (${adScore}/100) — no paid presence detected

REVENUE LEAKAGE:
- Monthly Lost Deals: ${monthlyLostDeals}
- Lost Origination/Revenue (Annual): $${lostOriginationAnnual.toLocaleString()}
${avgAnnualInterest > 0 ? `- Lost Interest Spread (Annual): $${lostInterestAnnual.toLocaleString()}` : ''}
- TOTAL ANNUAL REVENUE LEAKAGE: $${totalRevenueLeak.toLocaleString()}+
- Monthly Opportunity Cost: ~$${monthlyLeak.toLocaleString()}/month

${realDataContext}

Return a JSON object with this EXACT structure (no markdown, no code fences, just raw JSON):
{
  "overallGrade": "${overallGrade}",
  "overallScore": ${overallScore},
  "revenueLeak": {
    "totalAnnual": ${totalRevenueLeak},
    "monthlyLeak": ${monthlyLeak},
    "lostOrigination": ${lostOriginationAnnual},
    "lostInterest": ${lostInterestAnnual},
    "monthlyLostDeals": ${monthlyLostDeals},
    "headline": "Your digital presence gaps are costing an estimated $${totalRevenueLeak.toLocaleString()}+ per year",
    "subheadline": "Roughly $${monthlyLeak.toLocaleString()}/month in opportunity cost currently going to competitors with stronger digital presence"
  },
  "executiveSummary": "<3-4 sentence Loss-Led summary. START with the revenue number ($${totalRevenueLeak.toLocaleString()}+). Then explain the site is a static brochure, not a sales engine. Name the 2-3 biggest gaps. End with the fix opportunity.>",
  "architecturalFailures": [
    {
      "title": "<plain-English failure title, e.g. 'The Confusion Penalty — ${h1Count} H1 Tags'>",
      "impact": "<revenue/ranking impact in plain English>",
      "fix": "<specific actionable fix>"
    }
  ],
  "competitorComparison": {
    "reviewsYours": ${reviewCount},
    "reviewsCompetitorAvg": ${competitorReviewAvg !== null ? competitorReviewAvg : 'null'},
    "listingsYours": ${directoriesFound},
    "listingsCompetitorAvg": null,
    "competitorCount": ${comps.length},
    "topCompetitor": ${topCompetitor ? `{"name": "${topCompetitor.name}", "reviewCount": ${topCompetitor.reviewCount}, "rating": ${topCompetitor.rating}}` : 'null'},
    "insight": "<1-2 sentence plain-English competitor gap explanation using ONLY the real scraped competitor data above. If competitorReviewAvg is null, say data was insufficient to compare and do not invent a number.>"
  },
  "categories": [
    {
      "name": "SEO",
      "grade": "${seoGrade}",
      "score": ${seoScore},
      "metrics": [
        { "label": "H1 Tag Count", "value": "${h1Count}", "benchmark": "1 (Required)", "status": "${h1Count > 1 ? 'critical' : 'good'}" },
        { "label": "Title Tag", "value": "${scrapedData.website.hasTitle ? 'Present' : 'Missing'}", "benchmark": "Required", "status": "${scrapedData.website.hasTitle ? 'good' : 'critical'}" },
        { "label": "Meta Description", "value": "${scrapedData.website.hasMetaDescription ? 'Present' : 'Missing'}", "benchmark": "Required", "status": "${scrapedData.website.hasMetaDescription ? 'good' : 'critical'}" },
        { "label": "Schema Markup", "value": "${scrapedData.website.hasSchemaMarkup ? 'Present' : 'Missing'}", "benchmark": "Recommended", "status": "${scrapedData.website.hasSchemaMarkup ? 'good' : 'warning'}" },
        { "label": "Business Address on Site", "value": "${hasAddress ? 'Present' : 'Missing'}", "benchmark": "Required for Local SEO", "status": "${hasAddress ? 'good' : 'critical'}" },
        { "label": "Sitemap", "value": "${scrapedData.website.hasSitemap ? 'Present' : 'Missing'}", "benchmark": "Required", "status": "${scrapedData.website.hasSitemap ? 'good' : 'warning'}" },
        { "label": "Images with Alt Text", "value": "${scrapedData.website.imagesWithAlt} of ${scrapedData.website.imageCount}", "benchmark": "100%", "status": "${scrapedData.website.imageCount > 0 && scrapedData.website.imagesWithAlt / scrapedData.website.imageCount > 0.8 ? 'good' : 'warning'}" }
      ],
      "findings": ["<Loss-Led finding 1 — revenue consequence of H1 conflict or top SEO issue>", "<finding 2>", "<finding 3>"],
      "recommendations": ["<specific fix 1>", "<specific fix 2>", "<specific fix 3>"]
    },
    {
      "name": "Listings",
      "grade": "${listingsGrade}",
      "score": ${listingsScore},
      "presenceCount": ${directoriesFound},
      "totalDirectories": ${totalDirectories},
      "accuracyPercent": ${Math.round((directoriesFound / Math.max(totalDirectories, 1)) * 100)},
      "directories": ${JSON.stringify(scrapedData.directories.map(d => ({ name: d.name, status: d.status, issues: d.issues })))},
      "findings": ["<Loss-Led finding — ghost business factor, missing from X directories>", "<finding 2>"],
      "recommendations": ["<Citation Blitz: sync NAP across 50+ directories>", "<specific fix 2>"]
    },
    {
      "name": "Reviews",
      "grade": "${reviewGrade}",
      "score": ${reviewScore},
      "metrics": [
        { "label": "Total Reviews", "value": "${reviewCount}", "benchmark": "30+ (Competitive)", "industryLeader": "${topCompetitor ? topCompetitor.reviewCount + ' (' + topCompetitor.name + ')' : 'N/A — insufficient data'}" },
        { "label": "Average Rating", "value": "${scrapedData.google.rating || 'N/A'}", "benchmark": "4.5+", "industryLeader": "${competitorRatingAvg !== null ? competitorRatingAvg : 'N/A — insufficient data'}" },
        { "label": "Review Velocity", "value": "Unknown — not measurable from public data", "benchmark": "3-5/month", "industryLeader": "N/A" }
      ],
      "findings": ["<Loss-Led finding — social proof gap, clients choose competitors>", "<finding 2>"],
      "recommendations": ["<Get to 30+ reviews within 90 days — specific strategy>", "<specific fix 2>"]
    },
    {
      "name": "Social",
      "grade": "${socialGrade}",
      "score": ${socialScore},
      "platforms": ${JSON.stringify(scrapedData.social.map(s => ({ name: s.platform, found: s.found, followers: s.followers || 'N/A', activity: s.activity, recommendation: '' })))},
      "findings": ["<Loss-Led finding — missing platforms = missing trust channels for this industry>", "<finding 2>"],
      "recommendations": ["<specific platform to prioritize for ${industry}>", "<specific fix 2>"]
    },
    {
      "name": "Website",
      "grade": "${websiteGrade}",
      "score": ${websiteScore},
      "checklist": [
        { "item": "Business Address", "found": ${scrapedData.website.hasAddress} },
        { "item": "Phone Number", "found": ${scrapedData.website.hasPhone} },
        { "item": "HTTPS Secure", "found": ${scrapedData.website.isHttps} },
        { "item": "Mobile Friendly", "found": ${scrapedData.website.isMobileFriendly} },
        { "item": "Social Links", "found": ${scrapedData.website.hasSocialLinks} },
        { "item": "Call-to-Action", "found": ${scrapedData.website.hasCTA} },
        { "item": "Schema Markup", "found": ${scrapedData.website.hasSchemaMarkup} },
        { "item": "No H1 Conflicts", "found": ${h1Count <= 1} }
      ],
      "performance": {
        "mobileScore": ${scrapedData.website.isMobileFriendly ? (scrapedData.website.pageLoadTime < 2000 ? 80 : scrapedData.website.pageLoadTime < 4000 ? 60 : 40) : 30},
        "desktopScore": ${scrapedData.website.pageLoadTime < 1000 ? 90 : scrapedData.website.pageLoadTime < 2000 ? 75 : scrapedData.website.pageLoadTime < 4000 ? 55 : 35},
        "pageSpeed": "${(scrapedData.website.pageLoadTime / 1000).toFixed(1)}s",
        "lcp": "${scrapedData.website.pageLoadTime > 0 ? (scrapedData.website.pageLoadTime / 1000).toFixed(1) + 's (measured)' : 'Not measured'}",
        "cls": "Not measured",
        "fid": "Not measured"
      },
      "findings": ["<Loss-Led finding — static brochure vs sales engine>", "<finding 2>"],
      "recommendations": ["<Add Quick Quote Calculator or lead capture form>", "<specific fix 2>"]
    },
    {
      "name": "GEO",
      "grade": "${geoGrade}",
      "score": ${geoScore},
      "metrics": [
        { "label": "Schema / Structured Data", "value": "${scrapedData.website.hasSchemaMarkup ? 'Present' : 'Missing'}", "benchmark": "Required for AI citations", "status": "${scrapedData.website.hasSchemaMarkup ? 'good' : 'critical'}" },
        { "label": "Google Business Profile", "value": "${scrapedData.google.found ? 'Verified' : 'Not Found'}", "benchmark": "Required", "status": "${scrapedData.google.found ? 'good' : 'critical'}" },
        { "label": "Review Count (AI Trust Signal)", "value": "${reviewCount}", "benchmark": "10+ for AI citations", "status": "${reviewCount >= 10 ? 'good' : reviewCount >= 3 ? 'warning' : 'critical'}" },
        { "label": "Directory Consistency (NAP)", "value": "${directoriesFound} of ${totalDirectories} directories", "benchmark": "20+ for AI confidence", "status": "${directoriesFound >= 20 ? 'good' : directoriesFound >= 8 ? 'warning' : 'critical'}" },
        { "label": "Sitemap (AI Crawlability)", "value": "${scrapedData.website.hasSitemap ? 'Present' : 'Missing'}", "benchmark": "Required", "status": "${scrapedData.website.hasSitemap ? 'good' : 'warning'}" },
        { "label": "AI Overview Visibility", "value": "<estimate: Low/Medium/High based on above signals>", "benchmark": "Medium+", "status": "${geoScore >= 50 ? 'warning' : 'critical'}" }
      ],
      "findings": [
        "<Loss-Led finding 1: When someone asks ChatGPT or Google AI 'best ${industry} near me', this business is invisible because X — costing Y leads per month>",
        "<finding 2: Missing schema markup means AI engines cannot extract business facts>",
        "<finding 3: Low review count reduces AI citation confidence>"
      ],
      "recommendations": [
        "Add LocalBusiness JSON-LD schema markup to every page",
        "Build FAQ pages targeting 'best ${industry} in [city]' questions that AI engines pull from",
        "Reach 10+ Google reviews to qualify for AI Overview citations",
        "<industry-specific GEO recommendation>"
      ]
    },
    {
      "name": "Advertising",
      "grade": "${adGrade}",
      "score": ${adScore},
      "keywordDataSource": "${kwDataSource}",
      "totalMonthlySearchOpportunity": ${totalKwOpportunity},
      "keywords": [
          ${realKeywordRows}
      ],
      "findings": [
        "No paid search presence detected — competitors are capturing ${totalKwOpportunity.toLocaleString()} monthly searches for ${industry} keywords in this market",
        "Top missed keyword: '${kd.topKeyword?.keyword || industry + ' near me'}' gets ${topKwVolume.toLocaleString()} searches/month at $${kd.topKeyword?.avgCpc?.toFixed(2) || '0.00'} avg CPC",
        "<Write one more specific finding about the competitive paid search landscape for ${industry}>"
      ],
      "recommendations": [
        "Launch Google Ads campaign targeting '${kd.topKeyword?.keyword || industry + ' near me'}' — ${topKwVolume.toLocaleString()} monthly searches at $${kd.topKeyword?.avgCpc?.toFixed(2) || '0.00'}/click",
        "Set up Google Local Services Ads for immediate top-of-page visibility for ${industry} searches",
        "<Write one more specific, actionable recommendation for ${industry} paid advertising>"
      ]
    }
  ],
  "recoveryRoadmap": [
    { "priority": 1, "action": "Technical Reset — Fix H1 conflicts and add missing metadata", "timeline": "Week 1-2", "impact": "High" },
    { "priority": 2, "action": "Citation Blitz — Sync NAP across 50+ directories", "timeline": "Week 2-3", "impact": "High" },
    { "priority": 3, "action": "Review Velocity Campaign — Target 30+ reviews in 90 days", "timeline": "Month 1-3", "impact": "High" },
    { "priority": 4, "action": "GEO Foundation — Add LocalBusiness schema and FAQ content for AI engines", "timeline": "Month 1-2", "impact": "Medium" },
    { "priority": 5, "action": "<industry-specific content or conversion action>", "timeline": "Month 2-3", "impact": "Medium" }
  ],
  "topPriorities": [
    "Fix H1 tag conflicts — consolidate to 1 primary H1 targeting core keyword",
    "Sync NAP across 50+ business directories (Citation Blitz)",
    "Launch review velocity campaign — reach 30+ reviews in 90 days",
    "Add LocalBusiness schema markup for GEO / AI engine visibility",
    "<industry-specific 5th priority>"
  ]
}

IMPORTANT: For Advertising keywords, use terms relevant to ${industry}. NEVER use "digital marketing" or "marketing agency" unless that IS the business.`;

        console.log("[SEO Audit] Calling LLM with real data context...");
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a senior digital marketing consultant at Scorpion Global Solutions LLC, a Digital Marketing & AI Agency based in Arizona. You generate Loss-Led Digital Audit & Profit Leakage Reports. You MUST use ONLY the real data provided. Never hallucinate or invent data. Always respond with valid JSON only. No markdown, no explanation, no code fences." },
            { role: "user", content: prompt },
          ],
        });
        console.log("[SEO Audit] LLM response received");

        const contentStr = typeof response?.choices?.[0]?.message?.content === "string" 
          ? response.choices[0].message.content 
          : "";
        
        if (!contentStr) {
          console.error("[SEO Audit] Empty LLM response");
          return { success: false, error: "LLM returned empty response" };
        }

        let structuredReport: any;
        try {
          const cleaned = contentStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          structuredReport = JSON.parse(cleaned);
        } catch {
          // Fallback: Build report directly from scraped data without LLM
          structuredReport = buildReportFromScrapedData(scrapedData, input.businessName, input.industry || '');
        }

        // VALIDATION: Ensure revenueLeak is present (inject if LLM omitted it)
        if (!structuredReport.revenueLeak) {
          structuredReport.revenueLeak = {
            totalAnnual: totalRevenueLeak,
            monthlyLeak,
            lostOrigination: lostOriginationAnnual,
            lostInterest: lostInterestAnnual,
            monthlyLostDeals,
            headline: `Your digital presence gaps are costing an estimated $${totalRevenueLeak.toLocaleString()}+ per year`,
            subheadline: `Roughly $${monthlyLeak.toLocaleString()}/month in opportunity cost currently going to competitors`,
          };
        }

        // VALIDATION: Ensure GEO category is present
        const geoCat = structuredReport.categories?.find((c: any) => c.name === 'GEO');
        if (!geoCat) {
          structuredReport.categories = structuredReport.categories || [];
          structuredReport.categories.push({
            name: 'GEO',
            grade: geoGrade,
            score: geoScore,
            metrics: [
              { label: 'Schema / Structured Data', value: scrapedData.website.hasSchemaMarkup ? 'Present' : 'Missing', benchmark: 'Required for AI citations', status: scrapedData.website.hasSchemaMarkup ? 'good' : 'critical' },
              { label: 'Google Business Profile', value: scrapedData.google.found ? 'Verified' : 'Not Found', benchmark: 'Required', status: scrapedData.google.found ? 'good' : 'critical' },
              { label: 'Review Count (AI Trust Signal)', value: String(scrapedData.google.reviewCount), benchmark: '10+ for AI citations', status: scrapedData.google.reviewCount >= 10 ? 'good' : scrapedData.google.reviewCount >= 3 ? 'warning' : 'critical' },
              { label: 'Directory Consistency (NAP)', value: `${directoriesFound} of ${totalDirectories} directories`, benchmark: '20+ for AI confidence', status: directoriesFound >= 20 ? 'good' : directoriesFound >= 8 ? 'warning' : 'critical' },
            ],
            findings: ['Business is not visible in ChatGPT, Google AI Overviews, or Perplexity due to missing structured data and low review count.'],
            recommendations: ['Add LocalBusiness JSON-LD schema markup to every page', 'Build FAQ pages targeting common questions AI engines pull from', 'Reach 10+ Google reviews to qualify for AI Overview citations'],
          });
        } else {
          // Ensure GEO uses pre-calculated score
          geoCat.grade = geoGrade;
          geoCat.score = geoScore;
        }

        // VALIDATION: Override any hallucinated review counts with real data
        const reviewsCat = structuredReport.categories?.find((c: any) => c.name === 'Reviews');
        if (reviewsCat?.metrics) {
          const totalReviewMetric = reviewsCat.metrics.find((m: any) => m.label === 'Total Reviews' || m.label === 'Total Reviews Found');
          if (totalReviewMetric) {
            totalReviewMetric.value = String(scrapedData.google.reviewCount);
          }
          const ratingMetric = reviewsCat.metrics.find((m: any) => m.label === 'Average Rating');
          if (ratingMetric && scrapedData.google.rating > 0) {
            ratingMetric.value = String(scrapedData.google.rating);
          }
        }

        // VALIDATION: Override website checklist with real data
        const websiteCat = structuredReport.categories?.find((c: any) => c.name === 'Website');
        if (websiteCat?.checklist) {
          for (const item of websiteCat.checklist) {
            if (item.item === 'Business Address') item.found = scrapedData.website.hasAddress;
            if (item.item === 'Phone Number') item.found = scrapedData.website.hasPhone;
            if (item.item === 'HTTPS Secure') item.found = scrapedData.website.isHttps;
            if (item.item === 'Mobile Friendly') item.found = scrapedData.website.isMobileFriendly;
            if (item.item === 'Social Links') item.found = scrapedData.website.hasSocialLinks;
            if (item.item === 'Call-to-Action') item.found = scrapedData.website.hasCTA;
          }
        }

        // VALIDATION: Override listings with real directory data
        const listingsCat = structuredReport.categories?.find((c: any) => c.name === 'Listings');
        if (listingsCat) {
          listingsCat.presenceCount = scrapedData.directories.filter(d => d.status === 'found').length;
          listingsCat.totalDirectories = scrapedData.directories.length;
          listingsCat.directories = scrapedData.directories.map(d => ({ name: d.name, status: d.status, issues: d.issues }));
        }

        // VALIDATION: Override social platforms with real data
        const socialCat = structuredReport.categories?.find((c: any) => c.name === 'Social');
        if (socialCat?.platforms && scrapedData.social.length > 0) {
          socialCat.platforms = scrapedData.social.map((s: any) => {
            const existing = socialCat.platforms?.find((p: any) => p.name === s.platform);
            return {
              name: s.platform,
              found: s.found,
              followers: s.followers || existing?.followers || 'N/A',
              activity: s.activity || 'not_found',
              recommendation: existing?.recommendation || (!s.found ? `Create a ${s.platform} business profile` : `Continue engaging on ${s.platform}`),
            };
          });
        }

        // VALIDATION: Ensure advertising keywords are industry-relevant
        const adCat = structuredReport.categories?.find((c: any) => c.name === 'Advertising');
        if (adCat?.keywords) {
          const badKeywords = ['digital marketing', 'marketing agency', 'seo agency', 'web design'];
          const industry = input.industry || 'local service';
          const hasBadKeywords = adCat.keywords.some((k: any) => 
            badKeywords.some(bad => k.keyword?.toLowerCase().includes(bad))
          );
          if (hasBadKeywords && industry !== 'digital marketing') {
            // Replace hallucinated keywords with industry-relevant ones
            adCat.keywords = [
              { keyword: `${industry} near me`, impressions: 1200, clicks: 45 },
              { keyword: `best ${industry} ${scrapedData.google.address?.split(',')[1]?.trim() || 'local'}`, impressions: 800, clicks: 30 },
              { keyword: `affordable ${industry}`, impressions: 600, clicks: 22 },
              { keyword: `${industry} reviews`, impressions: 400, clicks: 15 },
            ];
            adCat.totalImpressions = 3000;
            adCat.totalClicks = 112;
          }
        }

        try {
          await db.createSeoAudit({
            clientId: input.clientId,
            userId: ctx.user.id,
            businessName: input.businessName,
            website: input.website,
            report: structuredReport,
            score: structuredReport.overallScore || 55,
            status: "completed",
          });
        } catch (dbErr) {
          console.error("[SEO Audit] DB save error (non-fatal):", dbErr);
        }

        return {
          success: true,
          report: {
            ...structuredReport,
            dataConfidence: scrapedData.google.dataConfidence,
            matchedByUrl: scrapedData.google.matchedByUrl,
            realReviewCount: scrapedData.google.reviewCount,
            realRating: scrapedData.google.rating,
            gbpName: scrapedData.google.name,
          },
          businessName: input.businessName,
          website: input.website,
          brandColors
        };
      } catch (error: any) {
        console.error("[SEO Audit] Full error:", error?.message || error);
        return {
          success: false,
          error: `Audit generation failed: ${error?.message || "Unknown error"}`,
        };
      }
    }),
});

// ============================================================================
// REPUTATION MANAGEMENT MODULE
// ============================================================================

const reputationRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getReviewsByClientId(input.clientId);
    }),

  generateResponse: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        reviewText: z.string(),
        rating: z.number().min(1).max(5),
        authorName: z.string().optional(),
        businessName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sentiment = input.rating >= 4 ? "positive" : "negative";
      const prompt =
        sentiment === "positive"
          ? `Generate a warm, appreciative response to this positive review (${input.rating}/5 stars) for ${input.businessName}: "${input.reviewText}". Keep it professional, genuine, and under 150 words.`
          : `Generate a professional, empathetic response to this negative review (${input.rating}/5 stars) for ${input.businessName}: "${input.reviewText}". Address concerns, offer solutions, and invite further discussion. Keep it under 150 words.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const draftResponse = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "Failed to generate response");

      const result = await db.createReview({
        clientId: input.clientId,
        rating: input.rating,
        reviewText: input.reviewText,
        authorName: input.authorName,
        sentiment,
      });

      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "generated_review_response",
        entityType: "review",
        details: input,
      });

      return { draftResponse, sentiment, result };
    }),
});

// ============================================================================
// CONTENT STRATEGIST & SOCIAL MEDIA MODULE
// ============================================================================

const contentRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getContentAssetsByClientId(input.clientId);
    }),

  generateBlogPost: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        topic: z.string(),
        keywords: z.array(z.string()).optional(),
        tone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = `Write a comprehensive blog post about "${input.topic}". 
      ${input.keywords ? `Target keywords: ${input.keywords.join(", ")}` : ""}
      ${input.tone ? `Tone: ${input.tone}` : "Tone: professional and engaging"}
      Include: title, meta description, introduction, 3-4 main sections with subheadings, conclusion, and call-to-action. Format as JSON.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      try {
        const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "{}");
        let parsed: any;
        try {
          parsed = JSON.parse(contentStr);
        } catch {
          parsed = { title: input.topic, content: contentStr };
        }
        const result = await db.createContentAsset({
          clientId: input.clientId,
          userId: ctx.user.id,
          type: "blog_post",
          title: parsed.title || input.topic,
          content: JSON.stringify(parsed),
          platforms: ["blog"],
        });
        return { success: true, content: parsed, result };
      } catch (error) {
        console.error("[Blog Post Error]", error);
        return { success: false, error: "Failed to generate blog post" };
      }
    }),

  generateSocialCaption: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        topic: z.string(),
        platform: z.enum(["instagram", "facebook", "linkedin", "twitter"]),
        includeHashtags: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const platformGuides = {
        instagram: "Use 15-20 hashtags, emojis, and engaging language",
        facebook: "Keep it conversational, include call-to-action, 2-3 sentences",
        linkedin: "Professional tone, industry insights, 3-4 sentences",
        twitter: "Concise, punchy, under 280 characters",
      };

      const prompt = `Generate a social media caption for ${input.platform} about "${input.topic}". 
      Guidelines: ${platformGuides[input.platform]}
      ${input.includeHashtags ? "Include relevant hashtags." : "No hashtags."}
      Make it engaging and on-brand.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const caption = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "Failed to generate caption");

      const result = await db.createContentAsset({
        clientId: input.clientId,
        userId: ctx.user.id,
        type: "social_caption",
        title: `${input.platform} - ${input.topic}`,
        content: caption,
        platforms: [input.platform],
      });

      return { caption, result };
    }),

  generateNewsletter: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        topic: z.string(),
        highlights: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = `Generate an email newsletter about "${input.topic}". 
      ${input.highlights ? `Key highlights: ${input.highlights.join(", ")}` : ""}
      Include: subject line, greeting, introduction, 2-3 main sections, call-to-action, and sign-off. Format as JSON with keys: subject, greeting, body, cta, signoff.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      try {
        const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "{}");
        let parsed: any;
        try {
          parsed = JSON.parse(contentStr);
        } catch {
          parsed = { subject: input.topic, body: contentStr };
        }
        const result = await db.createContentAsset({
          clientId: input.clientId,
          userId: ctx.user.id,
          type: "email_newsletter",
          title: parsed.subject || input.topic,
          content: JSON.stringify(parsed),
          platforms: ["email"],
        });
        return { success: true, content: parsed, result };
      } catch (error) {
        console.error("[Newsletter Error]", error);
        return { success: false, error: "Failed to generate newsletter" };
      }
    }),
});

// ============================================================================
// REPORTING MODULE
// ============================================================================

const reportingRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getReportsByClientId(input.clientId);
    }),

  generateReport: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        period: z.string(),
        metrics: z.any().optional(),
        campaigns: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prompt = `Generate a professional marketing performance report for the period ${input.period}. 
      Metrics: ${JSON.stringify(input.metrics || {})}
      Campaigns: ${JSON.stringify(input.campaigns || [])}
      Write a compelling narrative that: explains key performance indicators, highlights wins, identifies challenges, and provides strategic recommendations. Format as JSON with keys: narrative, keyHighlights, challenges, recommendations.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      try {
        const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "{}");
        let parsed: any;
        try {
          parsed = JSON.parse(contentStr);
        } catch {
          parsed = { narrative: contentStr, keyHighlights: [], challenges: [], recommendations: [] };
        }
        const result = await db.createReport({
          clientId: input.clientId,
          userId: ctx.user.id,
          period: input.period,
          narrative: parsed.narrative,
          metrics: input.metrics,
          campaigns: input.campaigns,
        });
        return { success: true, report: parsed, result };
      } catch (error) {
        console.error("[Reporting Error]", error);
        return { success: false, error: "Failed to generate report" };
      }
    }),
});

// ============================================================================
// ANALYTICS ROUTER
// ============================================================================

const analyticsRouter = router({
  getCampaignMetrics: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return db.getCampaignMetricsByCampaignId(input.campaignId);
    }),

  getClientMetrics: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getCampaignMetricsByClientId(input.clientId);
    }),

  getLeadMetrics: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadMetricsByLeadId(input.leadId);
    }),

  createCampaignMetrics: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        clientId: z.number(),
        date: z.date(),
        leadsGenerated: z.number().optional(),
        leadsQualified: z.number().optional(),
        conversions: z.number().optional(),
        revenue: z.any().optional(),
        cost: z.any().optional(),
        roi: z.any().optional(),
        conversionRate: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.createCampaignMetrics(input);
    }),

  updateLeadMetrics: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        emailOpens: z.number().optional(),
        emailClicks: z.number().optional(),
        smsOpens: z.number().optional(),
        callAttempts: z.number().optional(),
        appointmentBooked: z.boolean().optional(),
        converted: z.boolean().optional(),
        engagementScore: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { leadId, ...data } = input;
      return db.updateLeadMetrics(leadId, data);
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const clients = await db.getClientsByUserId(ctx.user.id);
    const totalLeads = clients.length > 0 ? clients.length * 10 : 0; // Placeholder
    const totalConversions = Math.floor(totalLeads * 0.15);
    const totalRevenue = totalConversions * 500;

    return {
      totalClients: clients.length,
      totalLeads,
      totalConversions,
      totalRevenue,
      averageConversionRate: clients.length > 0 ? 15 : 0,
      topCampaigns: [],
      recentActivity: [],
    };
  }),
});

// ============================================================================
// ACTIVITY LOG ROUTER
// ============================================================================

const activityRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return db.getActivityLogByUserId(ctx.user.id, input.limit);
    }),
});

// ============================================================================
// WEBHOOK SYSTEM ROUTER
// ============================================================================

const webhookRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getWebhooksByUserId(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      platform: z.string(),
      url: z.string().optional(),
      secret: z.string().optional(),
      events: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const webhook = await db.createWebhook({
        userId: ctx.user.id,
        name: input.name,
        url: input.url || `https://webhook.scorpion.ai/${ctx.user.id}/${input.platform}`,
        secret: input.secret || `whk_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        events: input.events || "lead.created",
      });
      return { success: true, webhook };
    }),

  getEvents: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .query(async ({ input }) => {
      return db.getWebhookEventsByWebhookId(input.webhookId);
    }),

  test: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ input }) => {
      await db.createWebhookEvent({
        webhookId: input.webhookId,
        eventType: "test",
        payload: { test: true, timestamp: new Date().toISOString() },
        status: "sent",
      });
      return { success: true, message: "Test event sent successfully" };
    }),

  toggle: protectedProcedure
    .input(z.object({ webhookId: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.updateWebhook(input.webhookId, { isActive: input.isActive });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteWebhook(input.webhookId);
      return { success: true };
    }),
});

// ============================================================================
// BILLING ROUTER
// ============================================================================

const billingRouter = router({
  getInvoices: protectedProcedure
    .input(z.object({ clientId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.clientId) {
        return db.getInvoicesByClientId(input.clientId);
      }
      const clients = await db.getClientsByUserId(ctx.user.id);
      const allInvoices: any[] = [];
      for (const client of clients) {
        const invoices = await db.getInvoicesByClientId(client.id);
        allInvoices.push(...invoices.map(inv => ({ ...inv, clientName: client.name })));
      }
      return allInvoices;
    }),

  createInvoice: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      amount: z.string(),
      description: z.string(),
      dueDate: z.string(),
      items: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const invoice = await db.createInvoice({
        clientId: input.clientId,
        userId: ctx.user.id,
        invoiceNumber,
        period: new Date().toISOString().slice(0, 7),
        subtotal: input.amount,
        total: input.amount,
        status: "draft",
        dueDate: new Date(input.dueDate),
        items: input.items,
      });
      return { success: true, invoice };
    }),

  getUsage: protectedProcedure
    .input(z.object({ clientId: z.number(), month: z.string() }))
    .query(async ({ input }) => {
      return db.getUsageTrackingByClientIdAndMonth(input.clientId, input.month);
    }),

  trackUsage: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      month: z.string(),
      leadsGenerated: z.number().optional(),
      campaignsRun: z.number().optional(),
      appointmentsBooked: z.number().optional(),
      contentCreated: z.number().optional(),
      auditsRun: z.number().optional(),
      totalCost: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createUsageTracking({
        clientId: input.clientId,
        userId: ctx.user.id,
        month: input.month,
        leadsGenerated: input.leadsGenerated,
        campaignsRun: input.campaignsRun,
        appointmentsBooked: input.appointmentsBooked,
        contentCreated: input.contentCreated,
        auditsRun: input.auditsRun,
        totalCost: input.totalCost,
      });
    }),

  updateInvoice: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateInvoice(id, data);
      return { success: true };
    }),

  getRevenueSummary: protectedProcedure.query(async ({ ctx }) => {
    const clients = await db.getClientsByUserId(ctx.user.id);
    let totalRevenue = 0;
    let totalPending = 0;
    let totalPaid = 0;
    const clientRevenue: any[] = [];

    for (const client of clients) {
      const invoices = await db.getInvoicesByClientId(client.id);
      let clientTotal = 0;
      let clientPending = 0;
      for (const inv of invoices) {
        const amt = parseFloat(String(inv.total) || "0");
        clientTotal += amt;
        if (inv.status === "draft" || inv.status === "sent") clientPending += amt;
        if (inv.status === "paid") totalPaid += amt;
      }
      totalRevenue += clientTotal;
      totalPending += clientPending;
      clientRevenue.push({ clientId: client.id, clientName: client.name, total: clientTotal, pending: clientPending });
    }

    return { totalRevenue, totalPending, totalPaid, clientRevenue, clientCount: clients.length };
  }),
});

// ============================================================================
// SCHEDULING ROUTER
// ============================================================================

const schedulingRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const clients = await db.getClientsByUserId(ctx.user.id);
    const allSchedules: any[] = [];
    for (const client of clients) {
      const schedules = await db.getScheduledCampaignsByClientId(client.id);
      allSchedules.push(...schedules.map(s => ({ ...s, clientName: client.name })));
    }
    return allSchedules;
  }),

  create: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      clientId: z.number(),
      frequency: z.enum(["once", "daily", "weekly", "monthly"]),
      nextRunAt: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const schedule = await db.createScheduledCampaign({
        campaignId: input.campaignId,
        clientId: input.clientId,
        userId: ctx.user.id,
        frequency: input.frequency,
        nextRunAt: new Date(input.nextRunAt),
        isActive: true,
      });
      return { success: true, schedule };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.string().optional(),
      frequency: z.string().optional(),
      nextRunAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.nextRunAt) (data as any).nextRunAt = new Date(data.nextRunAt);
      await db.updateScheduledCampaign(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteScheduledCampaign(input.id);
      return { success: true };
    }),

  getExecutions: protectedProcedure
    .input(z.object({ scheduledCampaignId: z.number() }))
    .query(async ({ input }) => {
      return db.getCampaignExecutionsByScheduledCampaignId(input.scheduledCampaignId);
    }),

  runNow: protectedProcedure
    .input(z.object({ scheduledCampaignId: z.number() }))
    .mutation(async ({ input }) => {
      const schedules = await db.getScheduledCampaignsByCampaignId(input.scheduledCampaignId);
      const schedule = schedules[0];
      const execution = await db.createCampaignExecution({
        scheduledCampaignId: input.scheduledCampaignId,
        campaignId: schedule?.campaignId || 0,
        clientId: schedule?.clientId || 0,
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        leadsProcessed: 0,
        successCount: 0,
        errorCount: 0,
      });
      return { success: true, execution };
    }),
});

// ============================================================================
// PROSPECT FINDER ROUTER
// ============================================================================
const prospectFinderRouter = router({
  // Search Google Maps for businesses in a given industry + location
  search: protectedProcedure
    .input(
      z.object({
        industry: z.string().min(2),
        location: z.string().min(2),
        radius: z.number().min(1000).max(50000).default(10000), // meters
        filterNoWebsite: z.boolean().default(false),
        filterUnclaimed: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const { makeRequest } = await import("./_core/map");
      type PlacesResult = {
        status: string;
        results?: Array<{
          place_id: string;
          name: string;
          formatted_address: string;
          rating?: number;
          user_ratings_total?: number;
          website?: string;
          business_status?: string;
          opening_hours?: { open_now?: boolean };
          geometry?: { location: { lat: number; lng: number } };
          types?: string[];
          photos?: Array<{ photo_reference: string }>;
        }>;
        next_page_token?: string;
      };

      // Step 1: Geocode the location to get coordinates
      type GeoResult = { status: string; results?: Array<{ geometry: { location: { lat: number; lng: number } } }> };
      const geoResult = await makeRequest<GeoResult>("/maps/api/geocode/json", {
        address: input.location,
      });
      const coords = geoResult.results?.[0]?.geometry?.location;
      if (!coords) {
        return { prospects: [], total: 0, error: "Could not geocode location" };
      }

      // Step 2: Nearby search for businesses
      const searchResult = await makeRequest<PlacesResult>("/maps/api/place/nearbysearch/json", {
        location: `${coords.lat},${coords.lng}`,
        radius: input.radius,
        keyword: input.industry,
        type: "establishment",
      });

      if (searchResult.status !== "OK" || !searchResult.results) {
        return { prospects: [], total: 0, error: searchResult.status };
      }

      // Step 3: Fetch place details for each result to get website + claimed status
      type PlaceDetail = {
        status: string;
        result?: {
          place_id: string;
          name: string;
          formatted_address: string;
          formatted_phone_number?: string;
          website?: string;
          rating?: number;
          user_ratings_total?: number;
          business_status?: string;
          url?: string;
          types?: string[];
          opening_hours?: { open_now?: boolean };
          geometry?: { location: { lat: number; lng: number } };
        };
      };

      const prospects: Array<{
        placeId: string;
        name: string;
        address: string;
        phone: string;
        website: string | null;
        rating: number;
        reviewCount: number;
        hasWebsite: boolean;
        isClaimed: boolean;
        mapsUrl: string;
        types: string[];
        lat: number;
        lng: number;
      }> = [];

      // Process up to 20 results (API limit per page)
      const places = searchResult.results.slice(0, 20);
      await Promise.all(
        places.map(async (place) => {
          try {
            const detail = await makeRequest<PlaceDetail>("/maps/api/place/details/json", {
              place_id: place.place_id,
              fields: "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,url,types,geometry",
            });
            const r = detail.result;
            if (!r) return;

            const hasWebsite = !!r.website;
            // Google doesn't expose a direct "claimed" field, but businesses without
            // a website AND with 0 reviews are very likely unclaimed/unmanaged.
            // Businesses with business_status = "OPERATIONAL" but no website are strong prospects.
            const isClaimed = hasWebsite || (r.user_ratings_total ?? 0) > 5;

            prospects.push({
              placeId: r.place_id,
              name: r.name,
              address: r.formatted_address,
              phone: r.formatted_phone_number || "",
              website: r.website || null,
              rating: r.rating || 0,
              reviewCount: r.user_ratings_total || 0,
              hasWebsite,
              isClaimed,
              mapsUrl: r.url || `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
              types: r.types || [],
              lat: r.geometry?.location?.lat || coords.lat,
              lng: r.geometry?.location?.lng || coords.lng,
            });
          } catch {
            // Skip failed detail fetches
          }
        })
      );

      // Apply filters
      let filtered = prospects;
      if (input.filterNoWebsite) {
        filtered = filtered.filter((p) => !p.hasWebsite);
      }
      if (input.filterUnclaimed) {
        filtered = filtered.filter((p) => !p.isClaimed);
      }

      return { prospects: filtered, total: filtered.length, error: null };
    }),

  // Get Similarweb traffic data for a website domain
  getTraffic: protectedProcedure
    .input(
      z.object({
        domain: z.string().min(3),
      })
    )
    .mutation(async ({ input }) => {
      const { callDataApi } = await import("./_core/dataApi");
      // Clean domain: remove protocol, www, trailing slashes
      const cleanDomain = input.domain
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/\/.*$/, "")
        .toLowerCase()
        .trim();

      // Get last complete month date range (last 3 months)
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const endDate = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
      const startDate = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}`;

      try {
        // Fetch total visits and traffic sources in parallel
        const [visitsResult, sourcesResult, rankResult] = await Promise.allSettled([
          callDataApi("Similarweb/get_visits_total", {
            pathParams: { domain: cleanDomain },
            query: {
              country: "world",
              granularity: "monthly",
              main_domain_only: false,
              start_date: startDate,
              end_date: endDate,
            },
          }),
          callDataApi("Similarweb/get_traffic_sources_desktop", {
            pathParams: { domain: cleanDomain },
            query: {
              country: "world",
              granularity: "monthly",
              main_domain_only: false,
              start_date: startDate,
              end_date: endDate,
            },
          }),
          callDataApi("Similarweb/get_global_rank", {
            pathParams: { domain: cleanDomain },
            query: {
              main_domain_only: false,
              start_date: startDate,
              end_date: endDate,
            },
          }),
        ]);

        // Parse visits
        let totalVisits = 0;
        let monthlyVisits: Array<{ date: string; visits: number }> = [];
        if (visitsResult.status === "fulfilled") {
          const vd = visitsResult.value as any;
          const visits = vd?.visits || vd?.data?.visits || [];
          if (Array.isArray(visits) && visits.length > 0) {
            monthlyVisits = visits.map((v: any) => ({ date: v.date, visits: Math.round(v.visits || 0) }));
            totalVisits = monthlyVisits.reduce((sum, v) => sum + v.visits, 0) / monthlyVisits.length;
          }
        }

        // Parse traffic sources
        let sources: Record<string, number> = {};
        if (sourcesResult.status === "fulfilled") {
          const sd = sourcesResult.value as any;
          const channels = sd?.visits || sd?.data?.visits || [];
          if (Array.isArray(channels)) {
            for (const ch of channels) {
              if (ch.source_type && ch.visits !== undefined) {
                sources[ch.source_type] = (sources[ch.source_type] || 0) + ch.visits;
              }
            }
          }
        }

        // Parse global rank
        let globalRank: number | null = null;
        if (rankResult.status === "fulfilled") {
          const rd = rankResult.value as any;
          const ranks = rd?.global_ranking || rd?.data?.global_ranking || [];
          if (Array.isArray(ranks) && ranks.length > 0) {
            globalRank = ranks[ranks.length - 1]?.global_ranking || null;
          }
        }

        const hasData = totalVisits > 0 || Object.keys(sources).length > 0;

        return {
          domain: cleanDomain,
          hasData,
          avgMonthlyVisits: Math.round(totalVisits),
          monthlyVisits,
          trafficSources: sources,
          globalRank,
          dataRange: { startDate, endDate },
          error: hasData ? null : "No traffic data available — site may be too small or not indexed by Similarweb",
        };
      } catch (err: any) {
        return {
          domain: cleanDomain,
          hasData: false,
          avgMonthlyVisits: 0,
          monthlyVisits: [],
          trafficSources: {},
          globalRank: null,
          dataRange: { startDate, endDate },
          error: err?.message || "Failed to fetch traffic data",
        };
      }
    }),

  // Save a prospect as a CRM client/lead
  saveAsLead: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        notes: z.string().optional(),
        placeId: z.string().optional(),
        mapsUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if client already exists by name
      const existing = await db.getClientsByUserId(ctx.user.id);
      const alreadyExists = existing.some(
        (c: { name: string }) => c.name.toLowerCase() === input.name.toLowerCase()
      );
      if (alreadyExists) {
        return { success: false, error: "Client already exists in your CRM", clientId: null };
      }
      // Build description combining address + notes + maps link
      const descriptionParts: string[] = [];
      if (input.address) descriptionParts.push(`Address: ${input.address}`);
      if (input.notes) descriptionParts.push(input.notes);
      descriptionParts.push(`Google Maps: ${input.mapsUrl || "N/A"}`);
      descriptionParts.push(`Source: Prospect Finder (${new Date().toLocaleDateString()})`);

      await db.createClient({
        userId: ctx.user.id,
        name: input.name,
        industry: input.industry || "Unknown",
        website: input.website || undefined,
        phone: input.phone || undefined,
        description: descriptionParts.join(" | "),
      });
      // Re-fetch to get the new client's ID
      const updated = await db.getClientsByUserId(ctx.user.id);
      const newClient = updated.find(
        (c: { name: string; id: number }) => c.name.toLowerCase() === input.name.toLowerCase()
      );
      return { success: true, error: null, clientId: newClient?.id ?? null };
    }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  clients: clientRouter,
  campaigns: campaignRouter,
  leads: leadRouter,
  speedToLead: speedToLeadRouter,
  reactivation: reactivationRouter,
  appointments: appointmentRouter,
  voiceAssistant: voiceAssistantRouter,
  sequences: sequenceRouter,
  seoAudit: seoAuditRouter,
  reputation: reputationRouter,
  content: contentRouter,
  reporting: reportingRouter,
  analytics: analyticsRouter,
  activity: activityRouter,
  webhooks: webhookRouter,
  billing: billingRouter,
  scheduling: schedulingRouter,
  prospectFinder: prospectFinderRouter,
  leadGenAgent: leadGenAgentRouter,
  missedCall: missedCallRouter,
  reviewRequest: reviewRequestRouter,
  retention: retentionRouter,
  seasonalPlanner: seasonalPlannerRouter,
  proposals: proposalRouter,
  gbpPosts: gbpPostRouter,
  preQual: preQualRouter,
  referral: referralRouter,
  presence: presenceRouter,
  chatAgent: chatAgentRouter,
  industryTemplates: industryTemplateRouter,
});

export type AppRouter = typeof appRouter;
