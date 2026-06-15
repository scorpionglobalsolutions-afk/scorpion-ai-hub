import { eq, and } from "drizzle-orm";
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

export async function createLead(data: {
  campaignId: number;
  clientId: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leads).values(data);
  return result;
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
  return result;
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
