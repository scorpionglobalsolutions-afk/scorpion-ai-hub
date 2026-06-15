import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive", "paused"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================================
// CAMPAIGNS & LEADS
// ============================================================================

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["speed_to_lead", "reactivation", "appointment_setting", "follow_up", "content", "reputation"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  config: json("config"),
  stats: json("stats"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  source: varchar("source", { length: 100 }),
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================================================
// APPOINTMENTS
// ============================================================================

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  leadId: int("leadId").notNull(),
  clientId: int("clientId").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  duration: int("duration"), // in minutes
  status: mysqlEnum("status", ["scheduled", "completed", "no_show", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  outcome: varchar("outcome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ============================================================================
// SEQUENCES (Follow-up, Reactivation, etc.)
// ============================================================================

export const sequences = mysqlTable("sequences", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["email", "sms", "multi_channel"]).notNull(),
  steps: json("steps"), // Array of sequence steps
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sequence = typeof sequences.$inferSelect;
export type InsertSequence = typeof sequences.$inferInsert;

export const sequenceExecutions = mysqlTable("sequenceExecutions", {
  id: int("id").autoincrement().primaryKey(),
  sequenceId: int("sequenceId").notNull(),
  leadId: int("leadId").notNull(),
  campaignId: int("campaignId").notNull(),
  currentStep: int("currentStep").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  lastExecutedAt: timestamp("lastExecutedAt"),
  nextExecuteAt: timestamp("nextExecuteAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SequenceExecution = typeof sequenceExecutions.$inferSelect;
export type InsertSequenceExecution = typeof sequenceExecutions.$inferInsert;

// ============================================================================
// VOICE ASSISTANT CONFIGURATION
// ============================================================================

export const voiceAssistants = mysqlTable("voiceAssistants", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["inbound", "outbound"]).notNull(),
  systemPrompt: text("systemPrompt"),
  objectionHandling: json("objectionHandling"), // Array of objection/response pairs
  callScript: text("callScript"),
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoiceAssistant = typeof voiceAssistants.$inferSelect;
export type InsertVoiceAssistant = typeof voiceAssistants.$inferInsert;

export const callLogs = mysqlTable("callLogs", {
  id: int("id").autoincrement().primaryKey(),
  voiceAssistantId: int("voiceAssistantId").notNull(),
  leadId: int("leadId").notNull(),
  campaignId: int("campaignId").notNull(),
  duration: int("duration"), // in seconds
  outcome: varchar("outcome", { length: 255 }),
  transcript: text("transcript"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;

// ============================================================================
// SEO & REPUTATION AUDITS
// ============================================================================

export const seoAudits = mysqlTable("seoAudits", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  report: json("report"), // Structured audit report
  score: int("score"), // 0-100
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SeoAudit = typeof seoAudits.$inferSelect;
export type InsertSeoAudit = typeof seoAudits.$inferInsert;

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  campaignId: int("campaignId"),
  platform: varchar("platform", { length: 100 }), // Google, Yelp, Facebook, etc.
  rating: int("rating"), // 1-5
  reviewText: text("reviewText"),
  authorName: varchar("authorName", { length: 255 }),
  sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral"]).notNull(),
  draftResponse: text("draftResponse"),
  finalResponse: text("finalResponse"),
  status: mysqlEnum("status", ["pending", "responded", "archived"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================================================
// CONTENT & SOCIAL MEDIA
// ============================================================================

export const contentAssets = mysqlTable("contentAssets", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  campaignId: int("campaignId"),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["blog_post", "social_caption", "email_newsletter"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  platforms: json("platforms"), // Array of target platforms
  status: mysqlEnum("status", ["draft", "scheduled", "published"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentAsset = typeof contentAssets.$inferSelect;
export type InsertContentAsset = typeof contentAssets.$inferInsert;

export const contentCalendar = mysqlTable("contentCalendar", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  contentAssetId: int("contentAssetId"),
  platform: varchar("platform", { length: 100 }),
  status: mysqlEnum("status", ["scheduled", "published", "failed"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentCalendar = typeof contentCalendar.$inferSelect;
export type InsertContentCalendar = typeof contentCalendar.$inferInsert;

// ============================================================================
// REPORTING
// ============================================================================

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  period: varchar("period", { length: 50 }), // e.g., "2026-06", "2026-Q2"
  narrative: text("narrative"), // LLM-generated narrative
  metrics: json("metrics"), // Performance metrics
  campaigns: json("campaigns"), // Campaign summaries
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }), // "campaign", "lead", "appointment", etc.
  entityId: int("entityId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
