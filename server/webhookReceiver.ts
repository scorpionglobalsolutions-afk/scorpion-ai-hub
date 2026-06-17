import { Express, Request, Response } from "express";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Webhook Receiver Endpoint
 *
 * Handles incoming POST requests from external platforms like n8n, Typeform, HubSpot, Zapier.
 * When a webhook is triggered, it:
 * 1. Validates the webhook exists and is active
 * 2. Logs the event to webhookEvents table
 * 3. Always creates a lead record if any contact info is present
 * 4. Sends an owner notification so you know immediately
 */
export function registerWebhookReceiver(app: Express) {
  // Public endpoint - no auth required (external platforms POST here)
  app.post("/api/webhooks/:webhookId", async (req: Request, res: Response) => {
    try {
      const { webhookId } = req.params;

      // Find the webhook by URL pattern (webhookId could be a slug or numeric id)
      let webhook: any = null;
      const numericId = parseInt(webhookId);
      if (!isNaN(numericId)) {
        webhook = await db.getWebhookById(numericId);
      }

      // If not found by numeric ID, search by URL pattern
      if (!webhook) {
        webhook = await findWebhookBySlug(webhookId);
      }

      if (!webhook) {
        return res.status(404).json({
          error: "Webhook not found",
          message: `No webhook registered for endpoint: ${webhookId}`,
        });
      }

      if (!webhook.isActive) {
        return res.status(403).json({
          error: "Webhook inactive",
          message: "This webhook endpoint is currently disabled",
        });
      }

      // Determine event type from payload or headers
      const eventType = detectEventType(req);

      // Log the webhook event
      await db.createWebhookEvent({
        webhookId: webhook.id,
        eventType,
        payload: {
          headers: sanitizeHeaders(req.headers),
          body: req.body,
          query: req.query,
          receivedAt: new Date().toISOString(),
        },
        status: "sent",
      });

      // Update last triggered timestamp
      await db.updateWebhook(webhook.id, {
        lastTriggeredAt: new Date(),
      });

      // Always try to extract lead data from ANY incoming payload
      const leadData = extractLeadData(req.body);
      let leadCreated = false;

      if (leadData && (leadData.name || leadData.email || leadData.phone || leadData.business)) {
        try {
          await db.createLead({
            campaignId: 0,
            clientId: webhook.clientId || 0,
            name: leadData.name || leadData.business || "Unknown Lead",
            email: leadData.email || "",
            phone: leadData.phone || "",
            company: leadData.business || "",
            source: `webhook:${webhook.name || webhookId}`,
          });
          leadCreated = true;

          // Send owner notification immediately
          const notifTitle = `🔔 New Lead from ${webhook.name || "Webhook"}`;
          const notifContent = [
            `**Name:** ${leadData.name || leadData.business || "Unknown"}`,
            leadData.business ? `**Business:** ${leadData.business}` : null,
            leadData.email ? `**Email:** ${leadData.email}` : null,
            leadData.phone ? `**Phone:** ${leadData.phone}` : null,
            leadData.industry ? `**Industry:** ${leadData.industry}` : null,
            leadData.source ? `**Source:** ${leadData.source}` : null,
            `\nView in CRM → Clients`,
          ]
            .filter(Boolean)
            .join("\n");

          await notifyOwner({ title: notifTitle, content: notifContent });
        } catch (e) {
          console.warn("[Webhook] Failed to create lead or send notification:", e);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Webhook received and processed",
        eventType,
        webhookId: webhook.id,
        leadCreated,
      });
    } catch (error) {
      console.error("[Webhook Receiver] Error:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to process webhook",
      });
    }
  });

  // Health check endpoint for webhook verification (some platforms send GET to verify)
  app.get("/api/webhooks/:webhookId", async (req: Request, res: Response) => {
    const { webhookId } = req.params;
    if (req.query.challenge) {
      return res.status(200).send(req.query.challenge);
    }
    return res.status(200).json({
      status: "active",
      message: `Webhook endpoint ${webhookId} is ready to receive events`,
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * Find a webhook by URL slug
 */
async function findWebhookBySlug(slug: string): Promise<any> {
  const getDb = (await import("./db")).getDb;
  const dbInstance = await getDb();
  if (!dbInstance) return null;
  const { webhooks } = await import("../drizzle/schema");
  const { like } = await import("drizzle-orm");
  const results = await dbInstance
    .select()
    .from(webhooks)
    .where(like(webhooks.url, `%${slug}%`))
    .limit(1);
  return results[0] || null;
}

/**
 * Detect the event type from the request
 */
function detectEventType(req: Request): string {
  const hubspotEvent = req.headers["x-hubspot-event-type"] as string;
  const zapierEvent = req.body?.event_type || req.body?.eventType;
  const typeformEvent = req.headers["typeform-signature"] ? "form.submitted" : null;

  if (hubspotEvent) return hubspotEvent;
  if (zapierEvent) return zapierEvent;
  if (typeformEvent) return typeformEvent;

  if (req.body) {
    if (req.body.form_response || req.body.formResponse) return "form.submitted";
    if (req.body.lead || req.body.contact) return "lead.created";
    if (req.body.appointment || req.body.booking) return "appointment.booked";
    if (req.body.review) return "review.received";
    // n8n / generic lead payloads
    if (req.body.name || req.body.email || req.body.phone || req.body.business) return "lead.created";
  }
  return "webhook.received";
}

/**
 * Extract lead data from various webhook payload formats (n8n, Typeform, HubSpot, generic)
 */
function extractLeadData(body: any): {
  name?: string;
  email?: string;
  phone?: string;
  business?: string;
  industry?: string;
  source?: string;
  notes?: string;
} | null {
  if (!body) return null;

  // Direct / n8n flat fields
  if (body.email || body.name || body.phone || body.business) {
    return {
      name: body.name || body.fullName || body.full_name,
      email: body.email,
      phone: body.phone || body.phoneNumber || body.phone_number,
      business: body.business || body.company || body.businessName,
      industry: body.industry,
      source: body.source || body.utm_source,
      notes: body.notes || body.message,
    };
  }

  // Typeform format
  if (body.form_response?.answers) {
    const answers = body.form_response.answers;
    const email = answers.find((a: any) => a.type === "email")?.email;
    const name = answers.find(
      (a: any) =>
        a.type === "short_text" || a.field?.title?.toLowerCase().includes("name")
    )?.text;
    const phone = answers.find((a: any) => a.type === "phone_number")?.phone_number;
    return { name, email, phone };
  }

  // HubSpot format
  if (body.properties) {
    return {
      name: `${body.properties.firstname || ""} ${body.properties.lastname || ""}`.trim(),
      email: body.properties.email,
      phone: body.properties.phone,
      business: body.properties.company,
    };
  }

  // Nested contact/lead object
  if (body.contact || body.lead) {
    const data = body.contact || body.lead;
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      business: data.company || data.business,
    };
  }

  return null;
}

/**
 * Sanitize headers to remove sensitive information before storing
 */
function sanitizeHeaders(headers: any): Record<string, string> {
  const safe: Record<string, string> = {};
  const allowedHeaders = [
    "content-type",
    "user-agent",
    "x-forwarded-for",
    "x-hubspot-event-type",
    "typeform-signature",
    "x-webhook-id",
    "x-request-id",
  ];
  for (const key of allowedHeaders) {
    if (headers[key]) {
      safe[key] = String(headers[key]);
    }
  }
  return safe;
}
