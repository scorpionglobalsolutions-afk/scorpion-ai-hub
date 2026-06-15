import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

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

  generateObjectionHandler: protectedProcedure
    .input(
      z.object({
        objection: z.string(),
        productContext: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `Generate a professional response to this sales objection: "${input.objection}". Context: ${input.productContext}. Provide a concise, empathetic response that addresses the concern and moves the conversation forward.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return {
        response:
          response.choices[0]?.message.content ||
          "Failed to generate response",
      };
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
// LOCAL SEO & GBP AUDITOR MODULE
// ============================================================================

const seoAuditRouter = router({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getSeoAuditsByClientId(input.clientId);
    }),

  generateAudit: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        businessName: z.string(),
        website: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("[SEO Audit] Starting audit for:", input.businessName);
        const prompt = `Generate a comprehensive local SEO and Google Business Profile audit report for ${input.businessName}${input.website ? ` (${input.website})` : ""}${input.industry ? ` in the ${input.industry} industry` : ""}. 
        Include sections for: On-Page SEO, NAP Consistency, GBP Optimization, Local Citations, Reviews & Reputation, and Recommendations. 
        Provide your response as plain text with clear section headers.`;

        console.log("[SEO Audit] Calling LLM...");
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert SEO auditor. Provide detailed, actionable SEO audit reports." },
            { role: "user", content: prompt },
          ],
        });
        console.log("[SEO Audit] LLM response received");

        const contentStr = response?.choices?.[0]?.message?.content || "";
        
        if (!contentStr) {
          console.error("[SEO Audit] Empty LLM response", JSON.stringify(response));
          return { success: false, error: "LLM returned empty response" };
        }

        const report = {
          sections: [
            {
              title: "SEO Audit Report",
              findings: contentStr,
              recommendations: "See detailed findings above",
              score: 75,
            },
          ],
          overallScore: 75,
          topPriorities: ["Review full audit report for detailed recommendations"],
        };

        try {
          await db.createSeoAudit({
            clientId: input.clientId,
            userId: ctx.user.id,
            businessName: input.businessName,
            website: input.website,
            report,
            score: 75,
            status: "completed",
          });
        } catch (dbErr) {
          console.error("[SEO Audit] DB save error (non-fatal):", dbErr);
        }

        return { success: true, report: contentStr };
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
});

export type AppRouter = typeof appRouter;
