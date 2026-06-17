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

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

export const campaignMetrics = mysqlTable("campaignMetrics", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  clientId: int("clientId").notNull(),
  date: timestamp("date").notNull(),
  leadsGenerated: int("leadsGenerated").default(0),
  leadsQualified: int("leadsQualified").default(0),
  conversions: int("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  cost: decimal("cost", { precision: 12, scale: 2 }).default("0"),
  roi: decimal("roi", { precision: 5, scale: 2 }).default("0"),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignMetrics = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetrics = typeof campaignMetrics.$inferInsert;

export const leadMetrics = mysqlTable("leadMetrics", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  campaignId: int("campaignId").notNull(),
  clientId: int("clientId").notNull(),
  source: varchar("source", { length: 100 }),
  engagementScore: int("engagementScore").default(0),
  emailOpens: int("emailOpens").default(0),
  emailClicks: int("emailClicks").default(0),
  smsOpens: int("smsOpens").default(0),
  callAttempts: int("callAttempts").default(0),
  appointmentBooked: boolean("appointmentBooked").default(false),
  converted: boolean("converted").default(false),
  lastInteraction: timestamp("lastInteraction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadMetrics = typeof leadMetrics.$inferSelect;
export type InsertLeadMetrics = typeof leadMetrics.$inferInsert;

// ============================================================================
// WEBHOOKS
// ============================================================================

export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId"),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  events: json("events"), // Array of event types to listen for
  secret: varchar("secret", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

export const webhookEvents = mysqlTable("webhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: json("payload"),
  status: mysqlEnum("status", ["pending", "sent", "failed", "retrying"]).default("pending").notNull(),
  retryCount: int("retryCount").default(0),
  lastAttemptAt: timestamp("lastAttemptAt"),
  response: text("response"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

// ============================================================================
// BILLING & USAGE
// ============================================================================

export const usageTracking = mysqlTable("usageTracking", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  leadsGenerated: int("leadsGenerated").default(0),
  campaignsRun: int("campaignsRun").default(0),
  appointmentsBooked: int("appointmentsBooked").default(0),
  contentCreated: int("contentCreated").default(0),
  auditsRun: int("auditsRun").default(0),
  totalCost: decimal("totalCost", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue"]).default("draft").notNull(),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  items: json("items"), // Array of line items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================================
// SCHEDULED CAMPAIGNS
// ============================================================================

export const scheduledCampaigns = mysqlTable("scheduledCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  frequency: mysqlEnum("frequency", ["once", "daily", "weekly", "monthly"]).notNull(),
  dayOfWeek: int("dayOfWeek"), // 0-6 for weekly
  dayOfMonth: int("dayOfMonth"), // 1-31 for monthly
  time: varchar("time", { length: 5 }), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  isActive: boolean("isActive").default(true),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledCampaign = typeof scheduledCampaigns.$inferSelect;
export type InsertScheduledCampaign = typeof scheduledCampaigns.$inferInsert;

export const campaignExecutions = mysqlTable("campaignExecutions", {
  id: int("id").autoincrement().primaryKey(),
  scheduledCampaignId: int("scheduledCampaignId").notNull(),
  campaignId: int("campaignId").notNull(),
  clientId: int("clientId").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  leadsProcessed: int("leadsProcessed").default(0),
  successCount: int("successCount").default(0),
  errorCount: int("errorCount").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignExecution = typeof campaignExecutions.$inferSelect;
export type InsertCampaignExecution = typeof campaignExecutions.$inferInsert;

// ============================================================================
// LEAD GENERATION AGENT
// ============================================================================

export const leadGenAgents = mysqlTable("leadGenAgents", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  // Search targeting
  industry: varchar("industry", { length: 100 }),
  location: varchar("location", { length: 255 }),
  radius: int("radius").default(25), // miles
  targetKeywords: json("targetKeywords"), // string[]
  filters: json("filters"), // { noWebsite, unclaimed, lowReviews, minScore }
  // Outreach config
  outreachChannel: mysqlEnum("outreachChannel", ["sms", "email", "both"]).default("both"),
  outreachTone: mysqlEnum("outreachTone", ["professional", "friendly", "urgent", "consultative"]).default("friendly"),
  valueProposition: text("valueProposition"),
  // Status
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  lastRunAt: timestamp("lastRunAt"),
  totalProspectsFound: int("totalProspectsFound").default(0),
  totalLeadsSaved: int("totalLeadsSaved").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadGenAgent = typeof leadGenAgents.$inferSelect;
export type InsertLeadGenAgent = typeof leadGenAgents.$inferInsert;

export const leadGenResults = mysqlTable("leadGenResults", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  clientId: int("clientId").notNull(),
  // Prospect data
  businessName: varchar("businessName", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 30 }),
  website: varchar("website", { length: 500 }),
  googlePlaceId: varchar("googlePlaceId", { length: 255 }),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: int("reviewCount"),
  isUnclaimed: boolean("isUnclaimed").default(false),
  hasWebsite: boolean("hasWebsite").default(true),
  opportunityScore: int("opportunityScore").default(0), // 0-100
  // AI-generated outreach
  smsMessage: text("smsMessage"),
  emailSubject: varchar("emailSubject", { length: 255 }),
  emailBody: text("emailBody"),
  // Status
  status: mysqlEnum("status", ["new", "outreach_sent", "responded", "saved_as_lead", "dismissed"]).default("new").notNull(),
  savedLeadId: int("savedLeadId"), // FK to leads table if saved
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadGenResult = typeof leadGenResults.$inferSelect;
export type InsertLeadGenResult = typeof leadGenResults.$inferInsert;
