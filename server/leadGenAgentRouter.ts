import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export const leadGenAgentRouter = router({
  // List all agents for a client
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadGenAgentsByClientId(input.clientId);
    }),

  // Create a new agent config
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        name: z.string().min(1),
        industry: z.string().optional(),
        location: z.string().optional(),
        radius: z.number().optional(),
        targetKeywords: z.array(z.string()).optional(),
        filters: z
          .object({
            noWebsite: z.boolean().optional(),
            unclaimed: z.boolean().optional(),
            lowReviews: z.boolean().optional(),
            minScore: z.number().optional(),
          })
          .optional(),
        outreachChannel: z.enum(["sms", "email", "both"]).optional(),
        outreachTone: z
          .enum(["professional", "friendly", "urgent", "consultative"])
          .optional(),
        valueProposition: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await db.createLeadGenAgent({ userId: ctx.user.id, ...input });
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "created_lead_gen_agent",
        entityType: "lead_gen_agent",
        details: { name: input.name },
      });
      return result;
    }),

  // Update agent config
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        industry: z.string().optional(),
        location: z.string().optional(),
        radius: z.number().optional(),
        targetKeywords: z.array(z.string()).optional(),
        filters: z
          .object({
            noWebsite: z.boolean().optional(),
            unclaimed: z.boolean().optional(),
            lowReviews: z.boolean().optional(),
            minScore: z.number().optional(),
          })
          .optional(),
        outreachChannel: z.enum(["sms", "email", "both"]).optional(),
        outreachTone: z
          .enum(["professional", "friendly", "urgent", "consultative"])
          .optional(),
        valueProposition: z.string().optional(),
        status: z.enum(["draft", "active", "paused"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateLeadGenAgent(id, data);
    }),

  // Delete agent and its results
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.logActivity({
        userId: ctx.user.id,
        action: "deleted_lead_gen_agent",
        entityType: "lead_gen_agent",
        details: { id: input.id },
      });
      return db.deleteLeadGenAgent(input.id);
    }),

  // Run the agent: search Google Maps, score prospects, generate AI outreach
  run: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        clientId: z.number(),
        industry: z.string(),
        location: z.string(),
        radius: z.number().min(1000).max(50000).default(10000),
        filters: z
          .object({
            noWebsite: z.boolean().default(false),
            unclaimed: z.boolean().default(false),
            lowReviews: z.boolean().default(false),
            minScore: z.number().default(0),
          })
          .optional(),
        outreachChannel: z.enum(["sms", "email", "both"]).default("both"),
        outreachTone: z
          .enum(["professional", "friendly", "urgent", "consultative"])
          .default("friendly"),
        valueProposition: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { makeRequest } = await import("./_core/map");

      // Step 1: Geocode
      type GeoResult = {
        status: string;
        results?: Array<{ geometry: { location: { lat: number; lng: number } } }>;
      };
      const geoResult = await makeRequest<GeoResult>("/maps/api/geocode/json", {
        address: input.location,
      });
      const coords = geoResult.results?.[0]?.geometry?.location;
      if (!coords) return { prospects: [], error: "Could not geocode location" };

      // Step 2: Nearby search
      type PlacesResult = {
        status: string;
        results?: Array<{
          place_id: string;
          name: string;
          rating?: number;
          user_ratings_total?: number;
          geometry?: { location: { lat: number; lng: number } };
        }>;
      };
      const searchResult = await makeRequest<PlacesResult>(
        "/maps/api/place/nearbysearch/json",
        {
          location: `${coords.lat},${coords.lng}`,
          radius: input.radius,
          keyword: input.industry,
          type: "establishment",
        }
      );
      if (searchResult.status !== "OK" || !searchResult.results) {
        return { prospects: [], error: searchResult.status };
      }

      // Step 3: Fetch place details
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
        };
      };
      const rawProspects: Array<{
        placeId: string;
        name: string;
        address: string;
        phone: string;
        website: string | null;
        rating: number;
        reviewCount: number;
        hasWebsite: boolean;
        isUnclaimed: boolean;
        opportunityScore: number;
      }> = [];

      const places = searchResult.results.slice(0, 20);
      await Promise.all(
        places.map(async (place) => {
          try {
            const detail = await makeRequest<PlaceDetail>(
              "/maps/api/place/details/json",
              {
                place_id: place.place_id,
                fields:
                  "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status",
              }
            );
            const r = detail.result;
            if (!r) return;
            const hasWebsite = !!r.website;
            const isUnclaimed = !hasWebsite && (r.user_ratings_total ?? 0) <= 5;
            // Opportunity scoring
            let score = 0;
            if (!hasWebsite) score += 40;
            if (isUnclaimed) score += 30;
            if ((r.user_ratings_total ?? 0) < 10) score += 20;
            if ((r.rating ?? 5) < 4.0) score += 10;
            rawProspects.push({
              placeId: r.place_id,
              name: r.name,
              address: r.formatted_address,
              phone: r.formatted_phone_number || "",
              website: r.website || null,
              rating: r.rating || 0,
              reviewCount: r.user_ratings_total || 0,
              hasWebsite,
              isUnclaimed,
              opportunityScore: score,
            });
          } catch {
            /* skip failed places */
          }
        })
      );

      // Step 4: Apply filters
      const filters = input.filters;
      let filtered = rawProspects;
      if (filters?.noWebsite) filtered = filtered.filter((p) => !p.hasWebsite);
      if (filters?.unclaimed) filtered = filtered.filter((p) => p.isUnclaimed);
      if (filters?.lowReviews) filtered = filtered.filter((p) => p.reviewCount < 10);
      if (filters?.minScore) filtered = filtered.filter((p) => p.opportunityScore >= (filters.minScore ?? 0));
      filtered.sort((a, b) => b.opportunityScore - a.opportunityScore);

      // Step 5: Generate AI outreach for top 10 prospects
      const top = filtered.slice(0, 10);
      const vp = input.valueProposition || "AI-powered marketing and lead generation services";
      const tone = input.outreachTone;
      const channel = input.outreachChannel;

      const smsPart =
        channel !== "email"
          ? "- sms: A short SMS (under 160 chars) that mentions the business name and a specific pain point"
          : "";
      const emailPart =
        channel !== "sms"
          ? "- emailSubject: A compelling email subject line (under 60 chars)\n- emailBody: A 3-sentence email body"
          : "";

      const outreachPrompt = `You are an expert sales copywriter. Generate personalized outreach messages for local businesses.

Service being offered: ${vp}
Tone: ${tone}
Channel(s): ${channel}

For each business below, write:
${smsPart}
${emailPart}

Businesses:
${top.map((p, i) => `${i + 1}. ${p.name} | Rating: ${p.rating} | Reviews: ${p.reviewCount} | Has website: ${p.hasWebsite}`).join("\n")}

Respond as a JSON array with objects: { index, sms, emailSubject, emailBody }`;

      let outreachMap: Record<
        number,
        { sms?: string; emailSubject?: string; emailBody?: string }
      > = {};
      try {
        const llmResp = await invokeLLM({
          messages: [{ role: "user", content: outreachPrompt }],
        });
        const raw = llmResp.choices[0]?.message.content;
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);
        // Use [\ s\S] instead of /s flag for broader ES target compatibility
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as Array<{
            index: number;
            sms?: string;
            emailSubject?: string;
            emailBody?: string;
          }>;
          for (const item of parsed) outreachMap[item.index - 1] = item;
        }
      } catch {
        /* outreach generation failed, continue without */
      }

      // Step 6: Save results to DB
      const toSave = top.map((p, i) => ({
        agentId: input.agentId,
        clientId: input.clientId,
        businessName: p.name,
        address: p.address,
        phone: p.phone,
        website: p.website || undefined,
        googlePlaceId: p.placeId,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isUnclaimed: p.isUnclaimed,
        hasWebsite: p.hasWebsite,
        opportunityScore: p.opportunityScore,
        smsMessage: outreachMap[i]?.sms,
        emailSubject: outreachMap[i]?.emailSubject,
        emailBody: outreachMap[i]?.emailBody,
      }));

      const saved = toSave.length > 0 ? await db.saveLeadGenResults(toSave) : [];

      // Update agent stats
      await db.updateLeadGenAgent(input.agentId, {
        lastRunAt: new Date(),
        totalProspectsFound: rawProspects.length,
        status: "active",
      });

      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "ran_lead_gen_agent",
        entityType: "lead_gen_agent",
        details: {
          agentId: input.agentId,
          found: rawProspects.length,
          saved: saved.length,
        },
      });

      return { prospects: saved, totalFound: rawProspects.length, error: null };
    }),

  // Get saved results for an agent
  getResults: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return db.getLeadGenResultsByAgentId(input.agentId);
    }),

  // Update a result's status (mark outreach sent, dismiss, etc.)
  updateResultStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "outreach_sent", "responded", "saved_as_lead", "dismissed"]),
      })
    )
    .mutation(async ({ input }) => {
      return db.updateLeadGenResultStatus(input.id, input.status);
    }),

  // Save a prospect as a CRM client
  saveProspectAsLead: protectedProcedure
    .input(
      z.object({
        resultId: z.number(),
        agentId: z.number(),
        clientId: z.number(),
        businessName: z.string(),
        phone: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate
      const existing = await db.getClientsByUserId(ctx.user.id);
      const alreadyExists = existing.some(
        (c: { name: string }) =>
          c.name.toLowerCase() === input.businessName.toLowerCase()
      );
      if (alreadyExists) {
        return { success: false, error: "Already in your CRM" };
      }
      // Create client record
      await db.createClient({
        userId: ctx.user.id,
        name: input.businessName,
        industry: input.industry || "Unknown",
        website: input.website || undefined,
        phone: input.phone || undefined,
        description: `Address: ${input.address || "N/A"} | Source: Lead Gen Agent (${new Date().toLocaleDateString()})`,
      });
      const updated = await db.getClientsByUserId(ctx.user.id);
      const newClient = updated.find(
        (c: { name: string; id: number }) =>
          c.name.toLowerCase() === input.businessName.toLowerCase()
      );
      // Mark result as saved
      await db.updateLeadGenResultStatus(input.resultId, "saved_as_lead", newClient?.id);
      // Update agent saved count
      const agent = await db.getLeadGenAgentById(input.agentId);
      if (agent) {
        await db.updateLeadGenAgent(input.agentId, {
          totalLeadsSaved: (agent.totalLeadsSaved ?? 0) + 1,
        });
      }
      await db.logActivity({
        userId: ctx.user.id,
        clientId: input.clientId,
        action: "saved_prospect_as_lead",
        entityType: "lead_gen_agent",
        details: {
          businessName: input.businessName,
          newClientId: newClient?.id,
        },
      });
      return { success: true, error: null, clientId: newClient?.id ?? null };
    }),
});
