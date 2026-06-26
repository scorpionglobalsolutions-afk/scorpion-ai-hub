import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  clients,
  campaigns,
  leads,
  appointments,
  sequences,
  sequenceExecutions,
  voiceAssistants,
  callLogs,
  seoAudits,
  reviews,
  contentAssets,
  contentCalendar,
  reports,
  activityLog,
  campaignMetrics,
  leadMetrics,
  webhooks,
  webhookEvents,
  usageTracking,
  invoices,
  scheduledCampaigns,
  campaignExecutions,
  leadGenAgents,
  leadGenResults,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// CLIENT QUERIES
// ============================================================================

export async function getClientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}

export async function getClientById(clientId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);
  return result[0] || null;
}

export async function createClient(data: {
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(clients).values(data);
  return result;
}

// ============================================================================
// CAMPAIGN QUERIES
// ============================================================================

export async function getCampaignsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.clientId, clientId));
}

export async function getCampaignById(campaignId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);
  return result[0] || null;
}

export async function createCampaign(data: {
  clientId: number;
  userId: number;
  name: string;
  type: "speed_to_lead" | "reactivation" | "appointment_setting" | "follow_up" | "content" | "reputation";
  config?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaigns).values(data);
  return result;
}

// ============================================================================
// LEAD QUERIES
// ============================================================================

export async function getLeadsByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.campaignId, campaignId));
}

export async function getLeadById(leadId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  return result[0] || null;
}

export async function getAllLeads(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function updateLeadStatus(id: number, status: "new" | "contacted" | "qualified" | "converted" | "lost") {
  const db = await getDb();
  if (!db) return null;
  return db.update(leads).set({ status }).where(eq(leads.id, id));
}

export async function createLead(data: {
  campaignId: number;
  clientId: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leads).values(data);
  return result;
}

export async function updateLead(
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    notes?: string;
    status?: "new" | "contacted" | "qualified" | "converted" | "lost";
  }
) {
  const db = await getDb();
  if (!db) return null;
  await db.update(leads).set(data).where(eq(leads.id, id));
  return getLeadById(id);
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(leads).where(eq(leads.id, id));
  return { success: true };
}

// ============================================================================
// APPOINTMENT QUERIES
// ============================================================================

export async function getAppointmentsByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.campaignId, campaignId));
}

export async function createAppointment(data: {
  campaignId: number;
  leadId: number;
  clientId: number;
  scheduledAt?: Date;
  duration?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(appointments).values(data);
  return result;
}

// ============================================================================
// SEQUENCE QUERIES
// ============================================================================

export async function getSequencesByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sequences).where(eq(sequences.campaignId, campaignId));
}

export async function createSequence(data: {
  campaignId: number;
  clientId: number;
  userId: number;
  name: string;
  type: "email" | "sms" | "multi_channel";
  steps?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sequences).values(data);
  return result;
}

// ============================================================================
// VOICE ASSISTANT QUERIES
// ============================================================================

export async function getVoiceAssistantsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(voiceAssistants)
    .where(eq(voiceAssistants.clientId, clientId));
}

export async function createVoiceAssistant(data: {
  clientId: number;
  userId: number;
  name: string;
  type: "inbound" | "outbound";
  systemPrompt?: string;
  objectionHandling?: any;
  callScript?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(voiceAssistants).values(data);
  const [inserted] = await db
    .select()
    .from(voiceAssistants)
    .where(eq(voiceAssistants.clientId, data.clientId))
    .orderBy(voiceAssistants.createdAt)
    .limit(1);
  // Return the most recently inserted row by fetching the last one for this client
  const rows = await db
    .select()
    .from(voiceAssistants)
    .where(eq(voiceAssistants.clientId, data.clientId));
  return rows[rows.length - 1] ?? null;
}

export async function getVoiceAssistantById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(voiceAssistants).where(eq(voiceAssistants.id, id));
  return rows[0] ?? null;
}

export async function updateVoiceAssistantStatus(
  id: number,
  status: "draft" | "active" | "paused"
) {
  const db = await getDb();
  if (!db) return null;
  await db.update(voiceAssistants).set({ status }).where(eq(voiceAssistants.id, id));
  return getVoiceAssistantById(id);
}

export async function updateVoiceAssistant(
  id: number,
  data: {
    name?: string;
    systemPrompt?: string;
    callScript?: string;
    objectionHandling?: any;
  }
) {
  const db = await getDb();
  if (!db) return null;
  await db.update(voiceAssistants).set(data).where(eq(voiceAssistants.id, id));
  return getVoiceAssistantById(id);
}

export async function deleteVoiceAssistant(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(voiceAssistants).where(eq(voiceAssistants.id, id));
  return { success: true };
}

export async function createCallLog(data: {
  voiceAssistantId: number;
  leadId?: number;
  campaignId?: number;
  duration?: number;
  outcome?: string;
  transcript?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(callLogs).values({
    voiceAssistantId: data.voiceAssistantId,
    leadId: data.leadId ?? 0,
    campaignId: data.campaignId ?? 0,
    duration: data.duration,
    outcome: data.outcome,
    transcript: data.transcript,
    notes: data.notes,
  });
  const rows = await db
    .select()
    .from(callLogs)
    .where(eq(callLogs.voiceAssistantId, data.voiceAssistantId));
  return rows[rows.length - 1] ?? null;
}

export async function getCallLogsByAssistantId(voiceAssistantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(callLogs)
    .where(eq(callLogs.voiceAssistantId, voiceAssistantId));
}

// ============================================================================
// SEO AUDIT QUERIES
// ============================================================================

export async function getSeoAuditsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seoAudits).where(eq(seoAudits.clientId, clientId));
}

export async function createSeoAudit(data: {
  clientId: number;
  userId: number;
  businessName: string;
  website?: string;
  report?: any;
  score?: number;
  status?: "pending" | "completed" | "failed";
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(seoAudits).values(data);
  return result;
}

// ============================================================================
// REVIEW QUERIES
// ============================================================================

export async function getReviewsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.clientId, clientId));
}

export async function createReview(data: {
  clientId: number;
  platform?: string;
  rating?: number;
  reviewText?: string;
  authorName?: string;
  sentiment: "positive" | "negative" | "neutral";
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reviews).values(data);
  return result;
}

// ============================================================================
// CONTENT ASSET QUERIES
// ============================================================================

export async function getContentAssetsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contentAssets)
    .where(eq(contentAssets.clientId, clientId));
}

export async function createContentAsset(data: {
  clientId: number;
  userId: number;
  type: "blog_post" | "social_caption" | "email_newsletter";
  title: string;
  content?: string;
  platforms?: any;
  scheduledAt?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(contentAssets).values(data);
  return result;
}

// ============================================================================
// REPORT QUERIES
// ============================================================================

export async function getReportsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.clientId, clientId));
}

export async function createReport(data: {
  clientId: number;
  userId: number;
  period?: string;
  narrative?: string;
  metrics?: any;
  campaigns?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reports).values(data);
  return result;
}

// ============================================================================
// ACTIVITY LOG QUERIES
// ============================================================================

export async function logActivity(data: {
  userId: number;
  clientId?: number;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(activityLog).values(data);
  return result;
}

export async function getActivityLogByUserId(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}

// ============================================================================
// WEBHOOK QUERIES
// ============================================================================

export async function createWebhook(data: {
  userId: number;
  clientId?: number;
  name: string;
  url: string;
  events: any;
  secret: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(webhooks).values(data);
  return result;
}

export async function getWebhooksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).where(eq(webhooks.userId, userId));
}

export async function getWebhookById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
  return result[0] || null;
}

export async function createWebhookEvent(data: {
  webhookId: number;
  eventType: string;
  payload: any;
  status?: "pending" | "sent" | "failed" | "retrying";
  retryCount?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(webhookEvents).values(data);
  return result;
}

export async function getWebhookEventsByWebhookId(webhookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhookEvents).where(eq(webhookEvents.webhookId, webhookId));
}

// ============================================================================
// CAMPAIGN METRICS QUERIES
// ============================================================================

export async function createCampaignMetrics(data: {
  campaignId: number;
  clientId: number;
  date: Date;
  leadsGenerated?: number;
  leadsQualified?: number;
  conversions?: number;
  revenue?: any;
  cost?: any;
  roi?: any;
  conversionRate?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaignMetrics).values(data);
  return result;
}

export async function getCampaignMetricsByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignMetrics).where(eq(campaignMetrics.campaignId, campaignId));
}

export async function getCampaignMetricsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignMetrics).where(eq(campaignMetrics.clientId, clientId));
}

// ============================================================================
// LEAD METRICS QUERIES
// ============================================================================

export async function createLeadMetrics(data: {
  leadId: number;
  campaignId: number;
  clientId: number;
  source?: string;
  engagementScore?: number;
  emailOpens?: number;
  emailClicks?: number;
  smsOpens?: number;
  callAttempts?: number;
  appointmentBooked?: boolean;
  converted?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leadMetrics).values(data);
  return result;
}

export async function getLeadMetricsByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leadMetrics).where(eq(leadMetrics.leadId, leadId)).limit(1);
  return result[0] || null;
}

export async function updateLeadMetrics(leadId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(leadMetrics).set(data).where(eq(leadMetrics.leadId, leadId));
  return result;
}

// ============================================================================
// USAGE TRACKING QUERIES
// ============================================================================

export async function createUsageTracking(data: {
  clientId: number;
  userId: number;
  month: string;
  leadsGenerated?: number;
  campaignsRun?: number;
  appointmentsBooked?: number;
  contentCreated?: number;
  auditsRun?: number;
  totalCost?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(usageTracking).values(data);
  return result;
}

export async function getUsageTrackingByClientIdAndMonth(clientId: number, month: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(usageTracking)
    .where(eq(usageTracking.clientId, clientId) && eq(usageTracking.month, month))
    .limit(1);
  return result[0] || null;
}

// ============================================================================
// INVOICE QUERIES
// ============================================================================

export async function createInvoice(data: {
  clientId: number;
  userId: number;
  invoiceNumber: string;
  period: string;
  subtotal: any;
  tax?: any;
  total: any;
  status?: "draft" | "sent" | "paid" | "overdue";
  dueDate?: Date;
  items?: any;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(invoices).values(data);
  return result;
}

export async function getInvoicesByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.clientId, clientId));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0] || null;
}

// ============================================================================
// SCHEDULED CAMPAIGN QUERIES
// ============================================================================

export async function createScheduledCampaign(data: {
  campaignId: number;
  clientId: number;
  userId: number;
  frequency: "once" | "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
  timezone?: string;
  isActive?: boolean;
  nextRunAt?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(scheduledCampaigns).values(data);
  return result;
}

export async function getScheduledCampaignsByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledCampaigns).where(eq(scheduledCampaigns.campaignId, campaignId));
}

export async function getScheduledCampaignsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledCampaigns).where(eq(scheduledCampaigns.clientId, clientId));
}

export async function updateScheduledCampaign(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(scheduledCampaigns).set(data).where(eq(scheduledCampaigns.id, id));
  return result;
}

// ============================================================================
// CAMPAIGN EXECUTION QUERIES
// ============================================================================

export async function createCampaignExecution(data: {
  scheduledCampaignId: number;
  campaignId: number;
  clientId: number;
  status?: "pending" | "running" | "completed" | "failed";
  leadsProcessed?: number;
  successCount?: number;
  errorCount?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaignExecutions).values(data);
  return result;
}

export async function getCampaignExecutionsByScheduledCampaignId(scheduledCampaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(campaignExecutions)
    .where(eq(campaignExecutions.scheduledCampaignId, scheduledCampaignId));
}

export async function updateCampaignExecution(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(campaignExecutions).set(data).where(eq(campaignExecutions.id, id));
  return result;
}

export async function deleteWebhook(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(webhookEvents).where(eq(webhookEvents.webhookId, id));
  const result = await db.delete(webhooks).where(eq(webhooks.id, id));
  return result;
}

export async function updateWebhook(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(webhooks).set(data).where(eq(webhooks.id, id));
  return result;
}

export async function updateInvoice(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(invoices).set(data).where(eq(invoices.id, id));
  return result;
}

export async function deleteScheduledCampaign(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(campaignExecutions).where(eq(campaignExecutions.scheduledCampaignId, id));
  const result = await db.delete(scheduledCampaigns).where(eq(scheduledCampaigns.id, id));
  return result;
}

export async function getAllInvoicesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId));
}

// ============================================================================
// LEAD GENERATION AGENT QUERIES
// ============================================================================

export async function getLeadGenAgentsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadGenAgents).where(eq(leadGenAgents.clientId, clientId));
}

export async function getLeadGenAgentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(leadGenAgents).where(eq(leadGenAgents.id, id));
  return rows[0] ?? null;
}

export async function createLeadGenAgent(data: {
  clientId: number;
  userId: number;
  name: string;
  industry?: string;
  location?: string;
  radius?: number;
  targetKeywords?: any;
  filters?: any;
  outreachChannel?: "sms" | "email" | "both";
  outreachTone?: "professional" | "friendly" | "urgent" | "consultative";
  valueProposition?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(leadGenAgents).values(data);
  const rows = await db
    .select()
    .from(leadGenAgents)
    .where(eq(leadGenAgents.clientId, data.clientId));
  return rows[rows.length - 1] ?? null;
}

export async function updateLeadGenAgent(
  id: number,
  data: {
    name?: string;
    industry?: string;
    location?: string;
    radius?: number;
    targetKeywords?: any;
    filters?: any;
    outreachChannel?: "sms" | "email" | "both";
    outreachTone?: "professional" | "friendly" | "urgent" | "consultative";
    valueProposition?: string;
    status?: "draft" | "active" | "paused";
    lastRunAt?: Date;
    totalProspectsFound?: number;
    totalLeadsSaved?: number;
  }
) {
  const db = await getDb();
  if (!db) return null;
  await db.update(leadGenAgents).set(data).where(eq(leadGenAgents.id, id));
  return getLeadGenAgentById(id);
}

export async function deleteLeadGenAgent(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(leadGenResults).where(eq(leadGenResults.agentId, id));
  await db.delete(leadGenAgents).where(eq(leadGenAgents.id, id));
  return { success: true };
}

export async function saveLeadGenResults(
  results: Array<{
    agentId: number;
    clientId: number;
    businessName: string;
    address?: string;
    phone?: string;
    website?: string;
    googlePlaceId?: string;
    rating?: number;
    reviewCount?: number;
    isUnclaimed?: boolean;
    hasWebsite?: boolean;
    opportunityScore?: number;
    smsMessage?: string;
    emailSubject?: string;
    emailBody?: string;
  }>
) {
  const db = await getDb();
  if (!db) return [];
  if (results.length === 0) return [];
  // Drizzle MySQL decimal columns require string values
  const mapped = results.map((r) => ({
    ...r,
    rating: r.rating != null ? String(r.rating) : undefined,
  }));
  await db.insert(leadGenResults).values(mapped);
  return db
    .select()
    .from(leadGenResults)
    .where(eq(leadGenResults.agentId, results[0].agentId));
}

export async function getLeadGenResultsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(leadGenResults)
    .where(eq(leadGenResults.agentId, agentId));
}

export async function updateLeadGenResultStatus(
  id: number,
  status: "new" | "outreach_sent" | "responded" | "saved_as_lead" | "dismissed",
  savedLeadId?: number
) {
  const db = await getDb();
  if (!db) return null;
  await db
    .update(leadGenResults)
    .set({ status, ...(savedLeadId ? { savedLeadId } : {}) })
    .where(eq(leadGenResults.id, id));
  const rows = await db.select().from(leadGenResults).where(eq(leadGenResults.id, id));
  return rows[0] ?? null;
}
