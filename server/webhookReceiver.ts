import { Express, Request, Response } from "express";
import * as db from "./db";

/**
 * Webhook Receiver Endpoint
 * 
 * Handles incoming POST requests from external platforms like Typeform, HubSpot, Zapier.
 * When a webhook is triggered, it:
 * 1. Validates the webhook exists and is active
 * 2. Logs the event to webhookEvents table
 * 3. Optionally triggers Speed-to-Lead response for lead.created events
 */
export function registerWebhookReceiver(app: Express) {
  // Public endpoint - no auth required (external platforms POST here)
  app.post("/api/webhooks/:webhookId", async (req: Request, res: Response) => {
    try {
      const { webhookId } = req.params;
      
      // Find the webhook by URL pattern (webhookId could be a slug or numeric id)
      // Try numeric ID first
      let webhook: any = null;
      const numericId = parseInt(webhookId);
      if (!isNaN(numericId)) {
        webhook = await db.getWebhookById(numericId);
      }
      
      // If not found by numeric ID, search by URL pattern
      if (!webhook) {
        const allWebhooks = await findWebhookBySlug(webhookId);
        webhook = allWebhooks;
      }

      if (!webhook) {
        return res.status(404).json({ 
          error: "Webhook not found",
          message: `No webhook registered for endpoint: ${webhookId}` 
        });
      }

      if (!webhook.isActive) {
        return res.status(403).json({ 
          error: "Webhook inactive",
          message: "This webhook endpoint is currently disabled" 
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
        lastTriggeredAt: new Date() 
      });

      // Process the lead if it's a lead creation event
      if (eventType === "lead.created" || eventType === "form.submitted") {
        const leadData = extractLeadData(req.body);
        if (leadData) {
          // Create a lead in the system
          try {
            await db.createLead({
              campaignId: 0,
              clientId: webhook.clientId || 0,
              name: leadData.name || "Unknown Lead",
              email: leadData.email || "",
              phone: leadData.phone || "",
              source: `webhook:${webhookId}`,
            });
          } catch (e) {
            console.warn("[Webhook] Failed to create lead from webhook:", e);
          }
        }
      }

      return res.status(200).json({ 
        success: true,
        message: "Webhook received and processed",
        eventType,
        webhookId: webhook.id,
      });
    } catch (error) {
      console.error("[Webhook Receiver] Error:", error);
      return res.status(500).json({ 
        error: "Internal server error",
        message: "Failed to process webhook" 
      });
    }
  });

  // Health check endpoint for webhook verification (some platforms send GET to verify)
  app.get("/api/webhooks/:webhookId", async (req: Request, res: Response) => {
    const { webhookId } = req.params;
    
    // Handle Typeform/HubSpot verification challenges
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
  // The webhook URL contains the slug, so we need to search
  // For now, try to parse the slug to extract a webhook ID
  // Slugs are formatted as: name-slug-timestamp
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
  // Check common webhook event type headers
  const typeformEvent = req.headers["typeform-signature"] ? "form.submitted" : null;
  const hubspotEvent = req.headers["x-hubspot-event-type"] as string;
  const zapierEvent = req.body?.event_type || req.body?.eventType;
  
  // Check body for event type indicators
  if (hubspotEvent) return hubspotEvent;
  if (zapierEvent) return zapierEvent;
  if (typeformEvent) return typeformEvent;
  
  // Check for common lead indicators in the body
  if (req.body) {
    if (req.body.form_response || req.body.formResponse) return "form.submitted";
    if (req.body.lead || req.body.contact) return "lead.created";
    if (req.body.appointment || req.body.booking) return "appointment.booked";
    if (req.body.review) return "review.received";
  }
  
  return "webhook.received";
}

/**
 * Extract lead data from various webhook payload formats
 */
function extractLeadData(body: any): { name?: string; email?: string; phone?: string } | null {
  if (!body) return null;
  
  // Direct fields
  if (body.email || body.name || body.phone) {
    return { name: body.name, email: body.email, phone: body.phone };
  }
  
  // Typeform format
  if (body.form_response?.answers) {
    const answers = body.form_response.answers;
    const email = answers.find((a: any) => a.type === "email")?.email;
    const name = answers.find((a: any) => a.type === "short_text" || a.field?.title?.toLowerCase().includes("name"))?.text;
    const phone = answers.find((a: any) => a.type === "phone_number")?.phone_number;
    return { name, email, phone };
  }
  
  // HubSpot format
  if (body.properties) {
    return {
      name: `${body.properties.firstname || ""} ${body.properties.lastname || ""}`.trim(),
      email: body.properties.email,
      phone: body.properties.phone,
    };
  }
  
  // Nested contact/lead object
  if (body.contact || body.lead) {
    const data = body.contact || body.lead;
    return { name: data.name, email: data.email, phone: data.phone };
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
