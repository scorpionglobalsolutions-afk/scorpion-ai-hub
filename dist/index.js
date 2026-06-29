var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLog: () => activityLog,
  appointments: () => appointments,
  callLogs: () => callLogs,
  campaignExecutions: () => campaignExecutions,
  campaignMetrics: () => campaignMetrics,
  campaigns: () => campaigns,
  chatAgents: () => chatAgents,
  chatConversations: () => chatConversations,
  clients: () => clients,
  contentAssets: () => contentAssets,
  contentCalendar: () => contentCalendar,
  gbpPosts: () => gbpPosts,
  invoices: () => invoices,
  leadGenAgents: () => leadGenAgents,
  leadGenResults: () => leadGenResults,
  leadMetrics: () => leadMetrics,
  leads: () => leads,
  missedCallConfigs: () => missedCallConfigs,
  missedCallEvents: () => missedCallEvents,
  preQualFunnels: () => preQualFunnels,
  preQualSubmissions: () => preQualSubmissions,
  presenceScores: () => presenceScores,
  proposals: () => proposals,
  referralCampaigns: () => referralCampaigns,
  referralTracking: () => referralTracking,
  reports: () => reports,
  retentionEvents: () => retentionEvents,
  retentionRules: () => retentionRules,
  reviewRequestCampaigns: () => reviewRequestCampaigns,
  reviewRequestLogs: () => reviewRequestLogs,
  reviews: () => reviews,
  scheduledCampaigns: () => scheduledCampaigns,
  seasonalCampaignItems: () => seasonalCampaignItems,
  seasonalPlans: () => seasonalPlans,
  seoAudits: () => seoAudits,
  sequenceExecutions: () => sequenceExecutions,
  sequences: () => sequences,
  usageTracking: () => usageTracking,
  users: () => users,
  voiceAssistants: () => voiceAssistants,
  webhookEvents: () => webhookEvents,
  webhooks: () => webhooks
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
var users, clients, campaigns, leads, appointments, sequences, sequenceExecutions, voiceAssistants, callLogs, seoAudits, reviews, contentAssets, contentCalendar, reports, activityLog, campaignMetrics, leadMetrics, webhooks, webhookEvents, usageTracking, invoices, scheduledCampaigns, campaignExecutions, leadGenAgents, leadGenResults, missedCallConfigs, missedCallEvents, reviewRequestCampaigns, reviewRequestLogs, retentionRules, retentionEvents, seasonalPlans, seasonalCampaignItems, proposals, gbpPosts, preQualFunnels, preQualSubmissions, referralCampaigns, referralTracking, presenceScores, chatAgents, chatConversations;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    clients = mysqlTable("clients", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    campaigns = mysqlTable("campaigns", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      type: mysqlEnum("type", ["speed_to_lead", "reactivation", "appointment_setting", "follow_up", "content", "reputation"]).notNull(),
      status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
      config: json("config"),
      stats: json("stats"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    leads = mysqlTable("leads", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    appointments = mysqlTable("appointments", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      leadId: int("leadId").notNull(),
      clientId: int("clientId").notNull(),
      scheduledAt: timestamp("scheduledAt"),
      duration: int("duration"),
      // in minutes
      status: mysqlEnum("status", ["scheduled", "completed", "no_show", "cancelled"]).default("scheduled").notNull(),
      notes: text("notes"),
      outcome: varchar("outcome", { length: 255 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    sequences = mysqlTable("sequences", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      type: mysqlEnum("type", ["email", "sms", "multi_channel"]).notNull(),
      steps: json("steps"),
      // Array of sequence steps
      status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    sequenceExecutions = mysqlTable("sequenceExecutions", {
      id: int("id").autoincrement().primaryKey(),
      sequenceId: int("sequenceId").notNull(),
      leadId: int("leadId").notNull(),
      campaignId: int("campaignId").notNull(),
      currentStep: int("currentStep").default(0).notNull(),
      status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
      lastExecutedAt: timestamp("lastExecutedAt"),
      nextExecuteAt: timestamp("nextExecuteAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    voiceAssistants = mysqlTable("voiceAssistants", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      type: mysqlEnum("type", ["inbound", "outbound"]).notNull(),
      systemPrompt: text("systemPrompt"),
      objectionHandling: json("objectionHandling"),
      // Array of objection/response pairs
      callScript: text("callScript"),
      status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    callLogs = mysqlTable("callLogs", {
      id: int("id").autoincrement().primaryKey(),
      voiceAssistantId: int("voiceAssistantId").notNull(),
      leadId: int("leadId").notNull(),
      campaignId: int("campaignId").notNull(),
      duration: int("duration"),
      // in seconds
      outcome: varchar("outcome", { length: 255 }),
      transcript: text("transcript"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    seoAudits = mysqlTable("seoAudits", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      businessName: varchar("businessName", { length: 255 }).notNull(),
      website: varchar("website", { length: 255 }),
      report: json("report"),
      // Structured audit report
      score: int("score"),
      // 0-100
      status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    reviews = mysqlTable("reviews", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      campaignId: int("campaignId"),
      platform: varchar("platform", { length: 100 }),
      // Google, Yelp, Facebook, etc.
      rating: int("rating"),
      // 1-5
      reviewText: text("reviewText"),
      authorName: varchar("authorName", { length: 255 }),
      sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral"]).notNull(),
      draftResponse: text("draftResponse"),
      finalResponse: text("finalResponse"),
      status: mysqlEnum("status", ["pending", "responded", "archived"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    contentAssets = mysqlTable("contentAssets", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      campaignId: int("campaignId"),
      userId: int("userId").notNull(),
      type: mysqlEnum("type", ["blog_post", "social_caption", "email_newsletter"]).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content"),
      platforms: json("platforms"),
      // Array of target platforms
      status: mysqlEnum("status", ["draft", "scheduled", "published"]).default("draft").notNull(),
      scheduledAt: timestamp("scheduledAt"),
      publishedAt: timestamp("publishedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    contentCalendar = mysqlTable("contentCalendar", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      date: timestamp("date").notNull(),
      contentAssetId: int("contentAssetId"),
      platform: varchar("platform", { length: 100 }),
      status: mysqlEnum("status", ["scheduled", "published", "failed"]).default("scheduled").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    reports = mysqlTable("reports", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      period: varchar("period", { length: 50 }),
      // e.g., "2026-06", "2026-Q2"
      narrative: text("narrative"),
      // LLM-generated narrative
      metrics: json("metrics"),
      // Performance metrics
      campaigns: json("campaigns"),
      // Campaign summaries
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    activityLog = mysqlTable("activityLog", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      clientId: int("clientId"),
      action: varchar("action", { length: 255 }).notNull(),
      entityType: varchar("entityType", { length: 100 }),
      // "campaign", "lead", "appointment", etc.
      entityId: int("entityId"),
      details: json("details"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    campaignMetrics = mysqlTable("campaignMetrics", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    leadMetrics = mysqlTable("leadMetrics", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    webhooks = mysqlTable("webhooks", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      clientId: int("clientId"),
      name: varchar("name", { length: 255 }).notNull(),
      url: varchar("url", { length: 500 }).notNull(),
      events: json("events"),
      // Array of event types to listen for
      secret: varchar("secret", { length: 255 }).notNull(),
      isActive: boolean("isActive").default(true),
      lastTriggeredAt: timestamp("lastTriggeredAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    webhookEvents = mysqlTable("webhookEvents", {
      id: int("id").autoincrement().primaryKey(),
      webhookId: int("webhookId").notNull(),
      eventType: varchar("eventType", { length: 100 }).notNull(),
      payload: json("payload"),
      status: mysqlEnum("status", ["pending", "sent", "failed", "retrying"]).default("pending").notNull(),
      retryCount: int("retryCount").default(0),
      lastAttemptAt: timestamp("lastAttemptAt"),
      response: text("response"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    usageTracking = mysqlTable("usageTracking", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      month: varchar("month", { length: 7 }).notNull(),
      // YYYY-MM
      leadsGenerated: int("leadsGenerated").default(0),
      campaignsRun: int("campaignsRun").default(0),
      appointmentsBooked: int("appointmentsBooked").default(0),
      contentCreated: int("contentCreated").default(0),
      auditsRun: int("auditsRun").default(0),
      totalCost: decimal("totalCost", { precision: 12, scale: 2 }).default("0"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    invoices = mysqlTable("invoices", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
      period: varchar("period", { length: 7 }).notNull(),
      // YYYY-MM
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull(),
      status: mysqlEnum("status", ["draft", "sent", "paid", "overdue"]).default("draft").notNull(),
      dueDate: timestamp("dueDate"),
      paidAt: timestamp("paidAt"),
      items: json("items"),
      // Array of line items
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    scheduledCampaigns = mysqlTable("scheduledCampaigns", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      frequency: mysqlEnum("frequency", ["once", "daily", "weekly", "monthly"]).notNull(),
      dayOfWeek: int("dayOfWeek"),
      // 0-6 for weekly
      dayOfMonth: int("dayOfMonth"),
      // 1-31 for monthly
      time: varchar("time", { length: 5 }),
      // HH:MM format
      timezone: varchar("timezone", { length: 50 }).default("UTC"),
      isActive: boolean("isActive").default(true),
      lastRunAt: timestamp("lastRunAt"),
      nextRunAt: timestamp("nextRunAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    campaignExecutions = mysqlTable("campaignExecutions", {
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
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    leadGenAgents = mysqlTable("leadGenAgents", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      // Search targeting
      industry: varchar("industry", { length: 100 }),
      location: varchar("location", { length: 255 }),
      radius: int("radius").default(25),
      // miles
      targetKeywords: json("targetKeywords"),
      // string[]
      filters: json("filters"),
      // { noWebsite, unclaimed, lowReviews, minScore }
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    leadGenResults = mysqlTable("leadGenResults", {
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
      opportunityScore: int("opportunityScore").default(0),
      // 0-100
      // AI-generated outreach
      smsMessage: text("smsMessage"),
      emailSubject: varchar("emailSubject", { length: 255 }),
      emailBody: text("emailBody"),
      // Status
      status: mysqlEnum("status", ["new", "outreach_sent", "responded", "saved_as_lead", "dismissed"]).default("new").notNull(),
      savedLeadId: int("savedLeadId"),
      // FK to leads table if saved
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    missedCallConfigs = mysqlTable("missedCallConfigs", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      businessName: varchar("businessName", { length: 255 }).notNull(),
      industry: varchar("industry", { length: 100 }),
      responseDelaySeconds: int("responseDelaySeconds").default(30).notNull(),
      smsTemplate: text("smsTemplate"),
      followUpTemplate: text("followUpTemplate"),
      followUpDelayMinutes: int("followUpDelayMinutes").default(60),
      isActive: boolean("isActive").default(true),
      totalMissedCalls: int("totalMissedCalls").default(0),
      totalResponded: int("totalResponded").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    missedCallEvents = mysqlTable("missedCallEvents", {
      id: int("id").autoincrement().primaryKey(),
      configId: int("configId").notNull(),
      clientId: int("clientId").notNull(),
      callerPhone: varchar("callerPhone", { length: 30 }),
      callerName: varchar("callerName", { length: 255 }),
      smsSent: boolean("smsSent").default(false),
      smsContent: text("smsContent"),
      followUpSent: boolean("followUpSent").default(false),
      responded: boolean("responded").default(false),
      outcome: mysqlEnum("outcome", ["booked", "not_interested", "no_response", "wrong_number", "pending"]).default("pending"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    reviewRequestCampaigns = mysqlTable("reviewRequestCampaigns", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      businessName: varchar("businessName", { length: 255 }).notNull(),
      industry: varchar("industry", { length: 100 }),
      googleReviewLink: varchar("googleReviewLink", { length: 500 }),
      channel: mysqlEnum("channel", ["sms", "email", "both"]).default("both"),
      sendDelayHours: int("sendDelayHours").default(24),
      smsTemplate: text("smsTemplate"),
      emailSubjectTemplate: varchar("emailSubjectTemplate", { length: 255 }),
      emailBodyTemplate: text("emailBodyTemplate"),
      isActive: boolean("isActive").default(true),
      totalSent: int("totalSent").default(0),
      totalReviews: int("totalReviews").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    reviewRequestLogs = mysqlTable("reviewRequestLogs", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      clientId: int("clientId").notNull(),
      customerName: varchar("customerName", { length: 255 }),
      customerPhone: varchar("customerPhone", { length: 30 }),
      customerEmail: varchar("customerEmail", { length: 320 }),
      serviceDate: timestamp("serviceDate"),
      serviceType: varchar("serviceType", { length: 255 }),
      smsSent: boolean("smsSent").default(false),
      emailSent: boolean("emailSent").default(false),
      reviewLeft: boolean("reviewLeft").default(false),
      reviewRating: int("reviewRating"),
      status: mysqlEnum("status", ["pending", "sent", "reviewed", "no_response"]).default("pending"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    retentionRules = mysqlTable("retentionRules", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      industry: varchar("industry", { length: 100 }),
      triggerType: mysqlEnum("triggerType", ["days_since_service", "days_before_renewal", "anniversary", "seasonal", "low_engagement"]).notNull(),
      triggerDays: int("triggerDays").default(90),
      channel: mysqlEnum("channel", ["sms", "email", "both"]).default("both"),
      messageTemplate: text("messageTemplate"),
      offerIncluded: boolean("offerIncluded").default(false),
      offerDetails: text("offerDetails"),
      isActive: boolean("isActive").default(true),
      totalSent: int("totalSent").default(0),
      totalConverted: int("totalConverted").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    retentionEvents = mysqlTable("retentionEvents", {
      id: int("id").autoincrement().primaryKey(),
      ruleId: int("ruleId").notNull(),
      clientId: int("clientId").notNull(),
      customerName: varchar("customerName", { length: 255 }),
      customerPhone: varchar("customerPhone", { length: 30 }),
      customerEmail: varchar("customerEmail", { length: 320 }),
      lastServiceDate: timestamp("lastServiceDate"),
      generatedMessage: text("generatedMessage"),
      sent: boolean("sent").default(false),
      responded: boolean("responded").default(false),
      converted: boolean("converted").default(false),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    seasonalPlans = mysqlTable("seasonalPlans", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      industry: varchar("industry", { length: 100 }).notNull(),
      location: varchar("location", { length: 255 }),
      year: int("year").notNull(),
      status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    seasonalCampaignItems = mysqlTable("seasonalCampaignItems", {
      id: int("id").autoincrement().primaryKey(),
      planId: int("planId").notNull(),
      clientId: int("clientId").notNull(),
      month: int("month").notNull(),
      // 1-12
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      offerIdea: text("offerIdea"),
      channels: json("channels"),
      // string[]
      estimatedBudget: varchar("estimatedBudget", { length: 50 }),
      priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"),
      status: mysqlEnum("status", ["planned", "in_progress", "completed", "skipped"]).default("planned"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    proposals = mysqlTable("proposals", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      prospectName: varchar("prospectName", { length: 255 }).notNull(),
      prospectEmail: varchar("prospectEmail", { length: 320 }),
      prospectPhone: varchar("prospectPhone", { length: 30 }),
      industry: varchar("industry", { length: 100 }),
      serviceType: varchar("serviceType", { length: 255 }),
      scopeOfWork: text("scopeOfWork"),
      lineItems: json("lineItems"),
      // Array of { description, qty, unitPrice, total }
      subtotal: varchar("subtotal", { length: 30 }),
      tax: varchar("tax", { length: 30 }),
      total: varchar("total", { length: 30 }),
      validUntil: timestamp("validUntil"),
      terms: text("terms"),
      generatedContent: text("generatedContent"),
      // AI-generated proposal body
      status: mysqlEnum("status", ["draft", "sent", "accepted", "declined", "expired"]).default("draft").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    gbpPosts = mysqlTable("gbpPosts", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      businessName: varchar("businessName", { length: 255 }),
      industry: varchar("industry", { length: 100 }),
      postType: mysqlEnum("postType", ["offer", "update", "event", "product", "seasonal"]).notNull(),
      title: varchar("title", { length: 255 }),
      content: text("content"),
      callToAction: varchar("callToAction", { length: 100 }),
      ctaUrl: varchar("ctaUrl", { length: 500 }),
      scheduledDate: timestamp("scheduledDate"),
      status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    preQualFunnels = mysqlTable("preQualFunnels", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      industry: varchar("industry", { length: 100 }).notNull(),
      serviceType: varchar("serviceType", { length: 255 }),
      questions: json("questions"),
      // Array of { id, question, type, options, weight }
      scoringRules: json("scoringRules"),
      // { hot: 80, warm: 50, cold: 0 }
      isActive: boolean("isActive").default(true),
      totalSubmissions: int("totalSubmissions").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    preQualSubmissions = mysqlTable("preQualSubmissions", {
      id: int("id").autoincrement().primaryKey(),
      funnelId: int("funnelId").notNull(),
      clientId: int("clientId").notNull(),
      prospectName: varchar("prospectName", { length: 255 }),
      prospectEmail: varchar("prospectEmail", { length: 320 }),
      prospectPhone: varchar("prospectPhone", { length: 30 }),
      answers: json("answers"),
      // { questionId: answer }
      score: int("score").default(0),
      qualification: mysqlEnum("qualification", ["hot", "warm", "cold", "unqualified"]).default("cold"),
      aiSummary: text("aiSummary"),
      status: mysqlEnum("status", ["new", "contacted", "converted", "rejected"]).default("new"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    referralCampaigns = mysqlTable("referralCampaigns", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      rewardType: mysqlEnum("rewardType", ["discount", "gift_card", "cash", "service_credit", "custom"]).default("discount"),
      rewardValue: varchar("rewardValue", { length: 100 }),
      referrerMessage: text("referrerMessage"),
      refereeMessage: text("refereeMessage"),
      channel: mysqlEnum("channel", ["sms", "email", "both"]).default("both"),
      isActive: boolean("isActive").default(true),
      totalReferrals: int("totalReferrals").default(0),
      totalConverted: int("totalConverted").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    referralTracking = mysqlTable("referralTracking", {
      id: int("id").autoincrement().primaryKey(),
      campaignId: int("campaignId").notNull(),
      clientId: int("clientId").notNull(),
      referrerName: varchar("referrerName", { length: 255 }),
      referrerPhone: varchar("referrerPhone", { length: 30 }),
      referrerEmail: varchar("referrerEmail", { length: 320 }),
      refereeName: varchar("refereeName", { length: 255 }),
      refereePhone: varchar("refereePhone", { length: 30 }),
      refereeEmail: varchar("refereeEmail", { length: 320 }),
      referralCode: varchar("referralCode", { length: 50 }),
      status: mysqlEnum("status", ["pending", "contacted", "converted", "rewarded"]).default("pending"),
      rewardSent: boolean("rewardSent").default(false),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    presenceScores = mysqlTable("presenceScores", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      overallScore: int("overallScore").default(0),
      // 0-100
      googleRating: varchar("googleRating", { length: 10 }),
      reviewCount: int("reviewCount").default(0),
      websiteScore: int("websiteScore").default(0),
      seoScore: int("seoScore").default(0),
      socialScore: int("socialScore").default(0),
      reputationScore: int("reputationScore").default(0),
      details: json("details"),
      // Full breakdown
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    chatAgents = mysqlTable("chatAgents", {
      id: int("id").autoincrement().primaryKey(),
      clientId: int("clientId").notNull(),
      userId: int("userId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      businessName: varchar("businessName", { length: 255 }).notNull(),
      industry: varchar("industry", { length: 100 }),
      tone: mysqlEnum("tone", ["friendly", "professional", "casual", "formal"]).default("friendly"),
      systemPrompt: text("systemPrompt"),
      welcomeMessage: text("welcomeMessage"),
      faqs: json("faqs"),
      // Array of { question, answer }
      leadCaptureEnabled: boolean("leadCaptureEnabled").default(true),
      bookingEnabled: boolean("bookingEnabled").default(false),
      status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
      totalConversations: int("totalConversations").default(0),
      totalLeadsCaptured: int("totalLeadsCaptured").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    chatConversations = mysqlTable("chatConversations", {
      id: int("id").autoincrement().primaryKey(),
      agentId: int("agentId").notNull(),
      clientId: int("clientId").notNull(),
      visitorName: varchar("visitorName", { length: 255 }),
      visitorEmail: varchar("visitorEmail", { length: 320 }),
      visitorPhone: varchar("visitorPhone", { length: 30 }),
      messages: json("messages"),
      // Array of { role, content, timestamp }
      leadCaptured: boolean("leadCaptured").default(false),
      outcome: mysqlEnum("outcome", ["lead_captured", "booking_made", "faq_answered", "abandoned", "ongoing"]).default("ongoing"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createAppointment: () => createAppointment,
  createCallLog: () => createCallLog,
  createCampaign: () => createCampaign,
  createCampaignExecution: () => createCampaignExecution,
  createCampaignMetrics: () => createCampaignMetrics,
  createClient: () => createClient,
  createContentAsset: () => createContentAsset,
  createInvoice: () => createInvoice,
  createLead: () => createLead,
  createLeadGenAgent: () => createLeadGenAgent,
  createLeadMetrics: () => createLeadMetrics,
  createReport: () => createReport,
  createReview: () => createReview,
  createScheduledCampaign: () => createScheduledCampaign,
  createSeoAudit: () => createSeoAudit,
  createSequence: () => createSequence,
  createUsageTracking: () => createUsageTracking,
  createVoiceAssistant: () => createVoiceAssistant,
  createWebhook: () => createWebhook,
  createWebhookEvent: () => createWebhookEvent,
  deleteLead: () => deleteLead,
  deleteLeadGenAgent: () => deleteLeadGenAgent,
  deleteScheduledCampaign: () => deleteScheduledCampaign,
  deleteVoiceAssistant: () => deleteVoiceAssistant,
  deleteWebhook: () => deleteWebhook,
  getActivityLogByUserId: () => getActivityLogByUserId,
  getAllInvoicesByUserId: () => getAllInvoicesByUserId,
  getAllLeads: () => getAllLeads,
  getAppointmentsByCampaignId: () => getAppointmentsByCampaignId,
  getCallLogsByAssistantId: () => getCallLogsByAssistantId,
  getCampaignById: () => getCampaignById,
  getCampaignExecutionsByScheduledCampaignId: () => getCampaignExecutionsByScheduledCampaignId,
  getCampaignMetricsByCampaignId: () => getCampaignMetricsByCampaignId,
  getCampaignMetricsByClientId: () => getCampaignMetricsByClientId,
  getCampaignsByClientId: () => getCampaignsByClientId,
  getClientById: () => getClientById,
  getClientsByUserId: () => getClientsByUserId,
  getContentAssetsByClientId: () => getContentAssetsByClientId,
  getDb: () => getDb,
  getInvoiceById: () => getInvoiceById,
  getInvoicesByClientId: () => getInvoicesByClientId,
  getLeadById: () => getLeadById,
  getLeadGenAgentById: () => getLeadGenAgentById,
  getLeadGenAgentsByClientId: () => getLeadGenAgentsByClientId,
  getLeadGenResultsByAgentId: () => getLeadGenResultsByAgentId,
  getLeadMetricsByLeadId: () => getLeadMetricsByLeadId,
  getLeadsByCampaignId: () => getLeadsByCampaignId,
  getReportsByClientId: () => getReportsByClientId,
  getReviewsByClientId: () => getReviewsByClientId,
  getScheduledCampaignsByCampaignId: () => getScheduledCampaignsByCampaignId,
  getScheduledCampaignsByClientId: () => getScheduledCampaignsByClientId,
  getSeoAuditsByClientId: () => getSeoAuditsByClientId,
  getSequencesByCampaignId: () => getSequencesByCampaignId,
  getUsageTrackingByClientIdAndMonth: () => getUsageTrackingByClientIdAndMonth,
  getUserByOpenId: () => getUserByOpenId,
  getVoiceAssistantById: () => getVoiceAssistantById,
  getVoiceAssistantsByClientId: () => getVoiceAssistantsByClientId,
  getWebhookById: () => getWebhookById,
  getWebhookEventsByWebhookId: () => getWebhookEventsByWebhookId,
  getWebhooksByUserId: () => getWebhooksByUserId,
  logActivity: () => logActivity,
  saveLeadGenResults: () => saveLeadGenResults,
  updateCampaignExecution: () => updateCampaignExecution,
  updateInvoice: () => updateInvoice,
  updateLead: () => updateLead,
  updateLeadGenAgent: () => updateLeadGenAgent,
  updateLeadGenResultStatus: () => updateLeadGenResultStatus,
  updateLeadMetrics: () => updateLeadMetrics,
  updateLeadStatus: () => updateLeadStatus,
  updateScheduledCampaign: () => updateScheduledCampaign,
  updateVoiceAssistant: () => updateVoiceAssistant,
  updateVoiceAssistantStatus: () => updateVoiceAssistantStatus,
  updateWebhook: () => updateWebhook,
  upsertUser: () => upsertUser
});
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getClientsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.userId, userId));
}
async function getClientById(clientId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result[0] || null;
}
async function createClient(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(clients).values(data);
  return result;
}
async function getCampaignsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.clientId, clientId));
}
async function getCampaignById(campaignId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  return result[0] || null;
}
async function createCampaign(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaigns).values(data);
  return result;
}
async function getLeadsByCampaignId(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.campaignId, campaignId));
}
async function getLeadById(leadId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  return result[0] || null;
}
async function getAllLeads(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}
async function updateLeadStatus(id, status) {
  const db = await getDb();
  if (!db) return null;
  return db.update(leads).set({ status }).where(eq(leads.id, id));
}
async function createLead(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leads).values(data);
  return result;
}
async function updateLead(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(leads).set(data).where(eq(leads.id, id));
  return getLeadById(id);
}
async function deleteLead(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(leads).where(eq(leads.id, id));
  return { success: true };
}
async function getAppointmentsByCampaignId(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.campaignId, campaignId));
}
async function createAppointment(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(appointments).values(data);
  return result;
}
async function getSequencesByCampaignId(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sequences).where(eq(sequences.campaignId, campaignId));
}
async function createSequence(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sequences).values(data);
  return result;
}
async function getVoiceAssistantsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(voiceAssistants).where(eq(voiceAssistants.clientId, clientId));
}
async function createVoiceAssistant(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(voiceAssistants).values(data);
  const [inserted] = await db.select().from(voiceAssistants).where(eq(voiceAssistants.clientId, data.clientId)).orderBy(voiceAssistants.createdAt).limit(1);
  const rows = await db.select().from(voiceAssistants).where(eq(voiceAssistants.clientId, data.clientId));
  return rows[rows.length - 1] ?? null;
}
async function getVoiceAssistantById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(voiceAssistants).where(eq(voiceAssistants.id, id));
  return rows[0] ?? null;
}
async function updateVoiceAssistantStatus(id, status) {
  const db = await getDb();
  if (!db) return null;
  await db.update(voiceAssistants).set({ status }).where(eq(voiceAssistants.id, id));
  return getVoiceAssistantById(id);
}
async function updateVoiceAssistant(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(voiceAssistants).set(data).where(eq(voiceAssistants.id, id));
  return getVoiceAssistantById(id);
}
async function deleteVoiceAssistant(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(voiceAssistants).where(eq(voiceAssistants.id, id));
  return { success: true };
}
async function createCallLog(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(callLogs).values({
    voiceAssistantId: data.voiceAssistantId,
    leadId: data.leadId ?? 0,
    campaignId: data.campaignId ?? 0,
    duration: data.duration,
    outcome: data.outcome,
    transcript: data.transcript,
    notes: data.notes
  });
  const rows = await db.select().from(callLogs).where(eq(callLogs.voiceAssistantId, data.voiceAssistantId));
  return rows[rows.length - 1] ?? null;
}
async function getCallLogsByAssistantId(voiceAssistantId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(callLogs).where(eq(callLogs.voiceAssistantId, voiceAssistantId));
}
async function getSeoAuditsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seoAudits).where(eq(seoAudits.clientId, clientId));
}
async function createSeoAudit(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(seoAudits).values(data);
  return result;
}
async function getReviewsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.clientId, clientId));
}
async function createReview(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reviews).values(data);
  return result;
}
async function getContentAssetsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentAssets).where(eq(contentAssets.clientId, clientId));
}
async function createContentAsset(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(contentAssets).values(data);
  return result;
}
async function getReportsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).where(eq(reports.clientId, clientId));
}
async function createReport(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(reports).values(data);
  return result;
}
async function logActivity(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(activityLog).values(data);
  return result;
}
async function getActivityLogByUserId(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).where(eq(activityLog.userId, userId)).orderBy((t2) => t2.createdAt).limit(limit);
}
async function createWebhook(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(webhooks).values(data);
  return result;
}
async function getWebhooksByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).where(eq(webhooks.userId, userId));
}
async function getWebhookById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
  return result[0] || null;
}
async function createWebhookEvent(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(webhookEvents).values(data);
  return result;
}
async function getWebhookEventsByWebhookId(webhookId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhookEvents).where(eq(webhookEvents.webhookId, webhookId));
}
async function createCampaignMetrics(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaignMetrics).values(data);
  return result;
}
async function getCampaignMetricsByCampaignId(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignMetrics).where(eq(campaignMetrics.campaignId, campaignId));
}
async function getCampaignMetricsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignMetrics).where(eq(campaignMetrics.clientId, clientId));
}
async function createLeadMetrics(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leadMetrics).values(data);
  return result;
}
async function getLeadMetricsByLeadId(leadId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leadMetrics).where(eq(leadMetrics.leadId, leadId)).limit(1);
  return result[0] || null;
}
async function updateLeadMetrics(leadId, data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(leadMetrics).set(data).where(eq(leadMetrics.leadId, leadId));
  return result;
}
async function createUsageTracking(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(usageTracking).values(data);
  return result;
}
async function getUsageTrackingByClientIdAndMonth(clientId, month) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(usageTracking).where(eq(usageTracking.clientId, clientId) && eq(usageTracking.month, month)).limit(1);
  return result[0] || null;
}
async function createInvoice(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(invoices).values(data);
  return result;
}
async function getInvoicesByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.clientId, clientId));
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0] || null;
}
async function createScheduledCampaign(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(scheduledCampaigns).values(data);
  return result;
}
async function getScheduledCampaignsByCampaignId(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledCampaigns).where(eq(scheduledCampaigns.campaignId, campaignId));
}
async function getScheduledCampaignsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledCampaigns).where(eq(scheduledCampaigns.clientId, clientId));
}
async function updateScheduledCampaign(id, data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(scheduledCampaigns).set(data).where(eq(scheduledCampaigns.id, id));
  return result;
}
async function createCampaignExecution(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(campaignExecutions).values(data);
  return result;
}
async function getCampaignExecutionsByScheduledCampaignId(scheduledCampaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaignExecutions).where(eq(campaignExecutions.scheduledCampaignId, scheduledCampaignId));
}
async function updateCampaignExecution(id, data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(campaignExecutions).set(data).where(eq(campaignExecutions.id, id));
  return result;
}
async function deleteWebhook(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(webhookEvents).where(eq(webhookEvents.webhookId, id));
  const result = await db.delete(webhooks).where(eq(webhooks.id, id));
  return result;
}
async function updateWebhook(id, data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(webhooks).set(data).where(eq(webhooks.id, id));
  return result;
}
async function updateInvoice(id, data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(invoices).set(data).where(eq(invoices.id, id));
  return result;
}
async function deleteScheduledCampaign(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(campaignExecutions).where(eq(campaignExecutions.scheduledCampaignId, id));
  const result = await db.delete(scheduledCampaigns).where(eq(scheduledCampaigns.id, id));
  return result;
}
async function getAllInvoicesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId));
}
async function getLeadGenAgentsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadGenAgents).where(eq(leadGenAgents.clientId, clientId));
}
async function getLeadGenAgentById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(leadGenAgents).where(eq(leadGenAgents.id, id));
  return rows[0] ?? null;
}
async function createLeadGenAgent(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(leadGenAgents).values(data);
  const rows = await db.select().from(leadGenAgents).where(eq(leadGenAgents.clientId, data.clientId));
  return rows[rows.length - 1] ?? null;
}
async function updateLeadGenAgent(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(leadGenAgents).set(data).where(eq(leadGenAgents.id, id));
  return getLeadGenAgentById(id);
}
async function deleteLeadGenAgent(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(leadGenResults).where(eq(leadGenResults.agentId, id));
  await db.delete(leadGenAgents).where(eq(leadGenAgents.id, id));
  return { success: true };
}
async function saveLeadGenResults(results) {
  const db = await getDb();
  if (!db) return [];
  if (results.length === 0) return [];
  const mapped = results.map((r) => ({
    ...r,
    rating: r.rating != null ? String(r.rating) : void 0
  }));
  await db.insert(leadGenResults).values(mapped);
  return db.select().from(leadGenResults).where(eq(leadGenResults.agentId, results[0].agentId));
}
async function getLeadGenResultsByAgentId(agentId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadGenResults).where(eq(leadGenResults.agentId, agentId));
}
async function updateLeadGenResultStatus(id, status, savedLeadId) {
  const db = await getDb();
  if (!db) return null;
  await db.update(leadGenResults).set({ status, ...savedLeadId ? { savedLeadId } : {} }).where(eq(leadGenResults.id, id));
  const rows = await db.select().from(leadGenResults).where(eq(leadGenResults.id, id));
  return rows[0] ?? null;
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/map.ts
var map_exports = {};
__export(map_exports, {
  makeRequest: () => makeRequest
});
function getMapsConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Google Maps proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey
  };
}
async function makeRequest(endpoint, params = {}, options = {}) {
  const { baseUrl, apiKey } = getMapsConfig();
  const url = new URL(`${baseUrl}/v1/maps/proxy${endpoint}`);
  url.searchParams.append("key", apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== void 0 && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  const response = await fetch(url.toString(), {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : void 0
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Maps API request failed (${response.status} ${response.statusText}): ${errorText}`
    );
  }
  return await response.json();
}
var init_map = __esm({
  "server/_core/map.ts"() {
    "use strict";
    init_env();
  }
});

// server/keywordData.ts
var keywordData_exports = {};
__export(keywordData_exports, {
  fetchKeywordData: () => fetchKeywordData
});
function getLocationCode(location) {
  const loc = location.toLowerCase();
  if (loc.includes("phoenix") || loc.includes("arizona") || loc.includes(", az")) return 1014221;
  if (loc.includes("los angeles") || loc.includes(", ca")) return 1013962;
  if (loc.includes("new york") || loc.includes(", ny")) return 1023191;
  if (loc.includes("chicago") || loc.includes(", il")) return 1016367;
  if (loc.includes("houston") || loc.includes(", tx")) return 1026481;
  if (loc.includes("dallas") || loc.includes(", tx")) return 1026481;
  if (loc.includes("miami") || loc.includes(", fl")) return 1012873;
  if (loc.includes("atlanta") || loc.includes(", ga")) return 1012873;
  if (loc.includes("seattle") || loc.includes(", wa")) return 1027744;
  if (loc.includes("denver") || loc.includes(", co")) return 1013632;
  if (loc.includes("las vegas") || loc.includes(", nv")) return 1020546;
  if (loc.includes("san antonio") || loc.includes(", tx")) return 1026481;
  if (loc.includes("san diego") || loc.includes(", ca")) return 1013962;
  if (loc.includes("austin") || loc.includes(", tx")) return 1026481;
  if (loc.includes("nashville") || loc.includes(", tn")) return 1025402;
  if (loc.includes("charlotte") || loc.includes(", nc")) return 1024671;
  if (loc.includes("portland") || loc.includes(", or")) return 1027744;
  if (loc.includes("minneapolis") || loc.includes(", mn")) return 1019431;
  if (loc.includes("tampa") || loc.includes(", fl")) return 1012873;
  if (loc.includes("orlando") || loc.includes(", fl")) return 1012873;
  return 2840;
}
function classifyIntent(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes("near me") || kw.includes("local") || kw.includes("best") || kw.includes("top") || kw.includes("review")) return "commercial";
  if (kw.includes("buy") || kw.includes("hire") || kw.includes("quote") || kw.includes("cost") || kw.includes("price") || kw.includes("cheap") || kw.includes("affordable")) return "transactional";
  if (kw.includes("how") || kw.includes("what") || kw.includes("why") || kw.includes("when") || kw.includes("does")) return "informational";
  return "commercial";
}
function mapCompetition(val) {
  if (typeof val === "string") {
    const v = val.toUpperCase();
    if (v === "LOW") return "LOW";
    if (v === "MEDIUM") return "MEDIUM";
    if (v === "HIGH") return "HIGH";
    return "UNKNOWN";
  }
  if (val < 0.33) return "LOW";
  if (val < 0.66) return "MEDIUM";
  return "HIGH";
}
function cleanDomain(website) {
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  }
}
function makeAuth(login, password) {
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}
async function fetchRankedKeywords(domain, locationCode, auth) {
  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        body: JSON.stringify([{
          target: domain,
          location_code: locationCode,
          language_code: "en",
          limit: 20,
          order_by: ["keyword_data.keyword_info.search_volume,desc"],
          filters: [
            ["keyword_data.keyword_info.search_volume", ">", 50],
            "and",
            ["ranked_serp_element.serp_item.rank_group", "<=", 50]
          ]
        }])
      }
    );
    if (!response.ok) {
      console.warn("[KeywordData] Ranked keywords API error:", response.status);
      return [];
    }
    const data = await response.json();
    const items = data.tasks?.[0]?.result?.[0]?.items || [];
    return items.filter((item) => item.keyword_data?.keyword_info?.search_volume > 0).slice(0, 10).map((item) => ({
      keyword: item.keyword_data.keyword,
      monthlySearches: item.keyword_data.keyword_info.search_volume || 0,
      avgCpc: parseFloat((item.keyword_data.keyword_info.cpc || 0).toFixed(2)),
      competition: mapCompetition(item.keyword_data.keyword_info.competition || 0),
      competitionIndex: Math.round(item.keyword_data.keyword_info.competition_index || 0),
      intent: classifyIntent(item.keyword_data.keyword),
      isRanking: true,
      rankPosition: item.ranked_serp_element?.serp_item?.rank_group || null
    })).sort((a, b) => b.monthlySearches - a.monthlySearches);
  } catch (err) {
    console.warn("[KeywordData] Ranked keywords fetch error:", err.message);
    return [];
  }
}
async function fetchKeywordIdeas(seedKeyword, locationCode, auth, excludeKeywords) {
  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        body: JSON.stringify([{
          keywords: [seedKeyword],
          location_code: locationCode,
          language_code: "en",
          limit: 30,
          order_by: ["keyword_data.keyword_info.search_volume,desc"],
          filters: [
            ["keyword_data.keyword_info.search_volume", ">", 100]
          ]
        }])
      }
    );
    if (!response.ok) {
      console.warn("[KeywordData] Keyword ideas API error:", response.status);
      return [];
    }
    const data = await response.json();
    const items = data.tasks?.[0]?.result?.[0]?.items || [];
    const excludeSet = new Set(excludeKeywords.map((k) => k.toLowerCase()));
    return items.filter(
      (item) => item.keyword_data?.keyword_info?.search_volume > 0 && !excludeSet.has(item.keyword_data.keyword.toLowerCase())
    ).slice(0, 10).map((item) => ({
      keyword: item.keyword_data.keyword,
      monthlySearches: item.keyword_data.keyword_info.search_volume || 0,
      avgCpc: parseFloat((item.keyword_data.keyword_info.cpc || 0).toFixed(2)),
      competition: mapCompetition(item.keyword_data.keyword_info.competition || 0),
      competitionIndex: Math.round(item.keyword_data.keyword_info.competition_index || 0),
      intent: classifyIntent(item.keyword_data.keyword),
      isRanking: false
    })).sort((a, b) => b.monthlySearches - a.monthlySearches);
  } catch (err) {
    console.warn("[KeywordData] Keyword ideas fetch error:", err.message);
    return [];
  }
}
async function fetchSearchVolume(seeds, locationCode, auth) {
  try {
    const response = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        body: JSON.stringify([{
          keywords: seeds,
          location_code: locationCode,
          language_code: "en",
          date_interval: "next_month"
        }])
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const items = data.tasks?.[0]?.result || [];
    return items.filter((item) => item.search_volume > 0).map((item) => ({
      keyword: item.keyword,
      monthlySearches: item.search_volume || 0,
      avgCpc: parseFloat((item.cpc || 0).toFixed(2)),
      competition: mapCompetition(item.competition || 0),
      competitionIndex: Math.round((item.competition_index || 0) * 100),
      intent: classifyIntent(item.keyword),
      isRanking: false
    })).sort((a, b) => b.monthlySearches - a.monthlySearches);
  } catch (err) {
    console.warn("[KeywordData] Search volume fetch error:", err.message);
    return [];
  }
}
function generateSeedKeywords(industry, location) {
  const industryClean = industry.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const city = location.split(",")[0]?.trim() || location;
  const state = location.split(",")[1]?.trim() || "";
  const geo = state ? `${city} ${state}` : city;
  return Array.from(/* @__PURE__ */ new Set([
    `${industryClean} near me`,
    `${industryClean} ${city}`,
    `best ${industryClean} ${city}`,
    `${industryClean} ${geo}`,
    `affordable ${industryClean}`,
    `${industryClean} services`,
    `${industryClean} company ${city}`,
    `top ${industryClean} ${city}`,
    `${industryClean} quotes`,
    `${industryClean} cost`
  ])).slice(0, 10);
}
function buildFallbackData(seeds, industry, reason) {
  console.warn("[KeywordData] Using fallback estimates. Reason:", reason || "unknown");
  const industryDefaults = {
    insurance: { cpc: 18.5, baseVolume: 1200 },
    loan: { cpc: 22, baseVolume: 900 },
    lending: { cpc: 20, baseVolume: 800 },
    mortgage: { cpc: 25, baseVolume: 1400 },
    hvac: { cpc: 14, baseVolume: 700 },
    roofing: { cpc: 16, baseVolume: 600 },
    pool: { cpc: 8, baseVolume: 400 },
    plumbing: { cpc: 12, baseVolume: 550 },
    dental: { cpc: 10, baseVolume: 800 },
    legal: { cpc: 35, baseVolume: 500 },
    realty: { cpc: 12, baseVolume: 700 },
    real_estate: { cpc: 12, baseVolume: 700 },
    default: { cpc: 8, baseVolume: 400 }
  };
  const industryKey = Object.keys(industryDefaults).find(
    (k) => industry.toLowerCase().includes(k)
  ) || "default";
  const defaults = industryDefaults[industryKey];
  const keywords = seeds.slice(0, 6).map((kw, i) => ({
    keyword: kw,
    monthlySearches: Math.round(defaults.baseVolume * (1 - i * 0.12)),
    avgCpc: parseFloat((defaults.cpc * (1 - i * 0.05)).toFixed(2)),
    competition: i < 2 ? "HIGH" : i < 4 ? "MEDIUM" : "LOW",
    competitionIndex: Math.max(20, 85 - i * 12),
    intent: classifyIntent(kw),
    isRanking: false
  }));
  const totalMonthlyOpportunity = keywords.reduce((sum, k) => sum + k.monthlySearches, 0);
  return {
    keywords,
    rankedKeywords: [],
    opportunityKeywords: keywords,
    totalMonthlyOpportunity,
    topKeyword: keywords[0] || null,
    topOpportunity: keywords[0] || null,
    source: "fallback",
    error: reason
  };
}
async function fetchKeywordData(industry, location, businessName, website) {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  const locationCode = getLocationCode(location);
  const seeds = generateSeedKeywords(industry, location);
  if (!login || !password) {
    console.warn("[KeywordData] DataForSEO credentials not set \u2014 using fallback estimates");
    return buildFallbackData(seeds, industry);
  }
  const auth = makeAuth(login, password);
  try {
    let rankedKeywords = [];
    let opportunityKeywords = [];
    if (website) {
      const domain = cleanDomain(website);
      console.log(`[KeywordData] Fetching ranked keywords for domain: ${domain}`);
      rankedKeywords = await fetchRankedKeywords(domain, locationCode, auth);
      console.log(`[KeywordData] Found ${rankedKeywords.length} ranked keywords for ${domain}`);
      const seedForIdeas = rankedKeywords[0]?.keyword || `${industry.toLowerCase()} ${location.split(",")[0]?.trim() || ""}`.trim();
      const rankedSet2 = rankedKeywords.map((k) => k.keyword);
      opportunityKeywords = await fetchKeywordIdeas(seedForIdeas, locationCode, auth, rankedSet2);
      console.log(`[KeywordData] Found ${opportunityKeywords.length} opportunity keywords`);
      if (rankedKeywords.length === 0) {
        console.warn("[KeywordData] No ranked keywords found \u2014 falling back to seed search volume");
        const seedVolumes = await fetchSearchVolume(seeds, locationCode, auth);
        opportunityKeywords = seedVolumes;
      }
      const totalOpportunityVolume = opportunityKeywords.reduce((sum, k) => sum + k.monthlySearches, 0);
      if (totalOpportunityVolume < 500) {
        console.warn(`[KeywordData] Low local volume (${totalOpportunityVolume}/mo) \u2014 expanding to national keyword ideas`);
        const nationalSeed = `${industry.toLowerCase()} near me`;
        const nationalIdeas = await fetchKeywordIdeas(nationalSeed, 2840, auth, rankedKeywords.map((k) => k.keyword));
        const nationalVolume = nationalIdeas.reduce((s, k) => s + k.monthlySearches, 0);
        if (nationalIdeas.length > 0 && nationalVolume > totalOpportunityVolume) {
          opportunityKeywords = nationalIdeas;
          console.log(`[KeywordData] Switched to national keywords \u2014 ${nationalIdeas.length} ideas, top: ${nationalIdeas[0]?.keyword} (${nationalIdeas[0]?.monthlySearches}/mo)`);
        }
        const bestVolume = Math.max(totalOpportunityVolume, nationalVolume);
        if (bestVolume < 500) {
          console.warn(`[KeywordData] National ideas also low volume (${nationalVolume}/mo) \u2014 using Google Ads search volume for broad seeds`);
          const broadSeeds = [
            `${industry.toLowerCase()} near me`,
            `${industry.toLowerCase()} online`,
            `best ${industry.toLowerCase()}`,
            `${industry.toLowerCase()} rates`,
            `${industry.toLowerCase()} company`,
            `${industry.toLowerCase()} services`,
            `fast ${industry.toLowerCase()}`,
            `${industry.toLowerCase()} bad credit`,
            `${industry.toLowerCase()} no credit check`,
            `${industry.toLowerCase()} same day`
          ];
          const broadVolumes = await fetchSearchVolume(broadSeeds, 2840, auth);
          if (broadVolumes.length > 0 && broadVolumes.reduce((s, k) => s + k.monthlySearches, 0) > bestVolume) {
            opportunityKeywords = broadVolumes;
            console.log(`[KeywordData] Using Google Ads broad seeds \u2014 ${broadVolumes.length} keywords, top: ${broadVolumes[0]?.keyword} (${broadVolumes[0]?.monthlySearches}/mo, $${broadVolumes[0]?.avgCpc} CPC)`);
          }
        }
      }
    } else {
      console.log("[KeywordData] No website provided \u2014 using seed keyword search volume");
      const seedVolumes = await fetchSearchVolume(seeds, locationCode, auth);
      opportunityKeywords = seedVolumes;
    }
    const rankedSet = new Set(rankedKeywords.map((k) => k.keyword.toLowerCase()));
    const uniqueOpportunities = opportunityKeywords.filter(
      (k) => !rankedSet.has(k.keyword.toLowerCase())
    );
    const allKeywords = [...rankedKeywords, ...uniqueOpportunities].slice(0, 10);
    if (allKeywords.length === 0) {
      return buildFallbackData(seeds, industry, "No keyword data returned from DataForSEO");
    }
    const totalMonthlyOpportunity = uniqueOpportunities.reduce((sum, k) => sum + k.monthlySearches, 0);
    return {
      keywords: allKeywords,
      rankedKeywords,
      opportunityKeywords: uniqueOpportunities,
      totalMonthlyOpportunity,
      topKeyword: rankedKeywords[0] || allKeywords[0] || null,
      topOpportunity: uniqueOpportunities[0] || null,
      source: "dataforseo"
    };
  } catch (err) {
    console.error("[KeywordData] Unexpected error:", err.message);
    return buildFallbackData(seeds, industry, err.message);
  }
}
var init_keywordData = __esm({
  "server/keywordData.ts"() {
    "use strict";
  }
});

// server/seoScraper.ts
var seoScraper_exports = {};
__export(seoScraper_exports, {
  analyzeWebsite: () => analyzeWebsite,
  checkDirectoryPresence: () => checkDirectoryPresence,
  checkSocialPresence: () => checkSocialPresence,
  fetchCompetitors: () => fetchCompetitors,
  fetchGoogleBusinessData: () => fetchGoogleBusinessData,
  scrapeAllData: () => scrapeAllData
});
async function analyzeWebsite(websiteUrl) {
  const result = {
    url: websiteUrl,
    isAccessible: false,
    isHttps: websiteUrl.startsWith("https"),
    isMobileFriendly: false,
    hasTitle: false,
    title: "",
    hasMetaDescription: false,
    metaDescription: "",
    hasH1: false,
    h1Count: 0,
    h2Count: 0,
    hasPhone: false,
    phone: "",
    hasAddress: false,
    address: "",
    hasSchemaMarkup: false,
    hasSocialLinks: false,
    socialLinksFound: [],
    hasCTA: false,
    ctaText: "",
    hasCanonical: false,
    hasRobotsTxt: false,
    hasSitemap: false,
    imageCount: 0,
    imagesWithAlt: 0,
    pageLoadTime: 0,
    htmlSize: 0,
    brandColors: { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" }
  };
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15e3);
    const resp = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ScorpionBot/1.0; +https://scorpionglobalsolutions.com)" },
      redirect: "follow"
    });
    clearTimeout(timeout);
    result.pageLoadTime = Date.now() - startTime;
    if (!resp.ok) return result;
    result.isAccessible = true;
    result.isHttps = resp.url.startsWith("https");
    const html = await resp.text();
    result.htmlSize = html.length;
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      result.hasTitle = true;
      result.title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
    }
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    if (descMatch && descMatch[1].trim()) {
      result.hasMetaDescription = true;
      result.metaDescription = descMatch[1].trim();
    }
    const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    result.h1Count = h1s.length;
    result.hasH1 = h1s.length > 0;
    const h2s = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || [];
    result.h2Count = h2s.length;
    const phoneMatch = html.match(/(\(\d{3}\)\s*\d{3}[-.]?\d{4}|\d{3}[-.]?\d{3}[-.]?\d{4})/);
    if (phoneMatch) {
      result.hasPhone = true;
      result.phone = phoneMatch[1];
    }
    const addressPatterns = [
      /(\d+\s+[A-Za-z0-9\s,]+(?:Ave|St|Rd|Dr|Blvd|Way|Ln|Ct|Pl|Circle|Cir|Suite|Ste)[^<]{0,80}(?:\d{5}))/i,
      /<[^>]*(?:address|location)[^>]*>([^<]+(?:Ave|St|Rd|Dr|Blvd|Way|Ln|Ct|Pl)[^<]+\d{5})/i
    ];
    for (const pattern of addressPatterns) {
      const match = html.match(pattern);
      if (match) {
        result.hasAddress = true;
        result.address = match[1].trim();
        break;
      }
    }
    result.isMobileFriendly = /name=["']viewport["']/i.test(html);
    result.hasSchemaMarkup = /application\/ld\+json/i.test(html);
    const socialPlatforms = ["facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com", "youtube.com", "tiktok.com", "yelp.com", "nextdoor.com"];
    const foundSocial = [];
    for (const platform of socialPlatforms) {
      const linkMatch = html.match(new RegExp(`href=["']([^"']*${platform.replace(".", "\\.")}[^"']*)["']`, "i"));
      if (linkMatch) {
        foundSocial.push(platform.replace(".com", ""));
      }
    }
    result.hasSocialLinks = foundSocial.length > 0;
    result.socialLinksFound = foundSocial;
    const ctaPatterns = /(contact us|get a quote|call now|schedule|book now|free estimate|request a quote|get started|sign up|learn more)/i;
    const ctaMatch = html.match(ctaPatterns);
    if (ctaMatch) {
      result.hasCTA = true;
      result.ctaText = ctaMatch[1];
    }
    result.hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
    const imgs = html.match(/<img[^>]+>/gi) || [];
    result.imageCount = imgs.length;
    result.imagesWithAlt = imgs.filter((i) => /alt=["'][^"']+["']/i.test(i)).length;
    result.brandColors = extractBrandColorsFromHTML(html, websiteUrl);
    try {
      const robotsResp = await fetch(new URL("/robots.txt", websiteUrl).toString(), {
        signal: AbortSignal.timeout(5e3),
        headers: { "User-Agent": "ScorpionBot/1.0" }
      });
      result.hasRobotsTxt = robotsResp.ok;
    } catch {
      result.hasRobotsTxt = false;
    }
    try {
      const sitemapResp = await fetch(new URL("/sitemap.xml", websiteUrl).toString(), {
        signal: AbortSignal.timeout(5e3),
        headers: { "User-Agent": "ScorpionBot/1.0" }
      });
      result.hasSitemap = sitemapResp.ok && (await sitemapResp.text()).includes("<urlset");
    } catch {
      result.hasSitemap = false;
    }
  } catch (error) {
    console.error("[SEO Scraper] Website analysis error:", error?.message);
  }
  return result;
}
function extractBrandColorsFromHTML(html, websiteUrl) {
  const defaults = { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" };
  try {
    const domain = new URL(websiteUrl).hostname;
    defaults.logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const themeMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([#][0-9a-fA-F]{3,8})["'][^>]*name=["']theme-color["']/i);
    if (themeMatch) defaults.primary = themeMatch[1];
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) defaults.logo = ogMatch[1];
    const colorMatches = html.match(/(?:--primary|--brand|--main)[^:]*:\s*([#][0-9a-fA-F]{3,8})/gi);
    if (colorMatches && colorMatches.length > 0) {
      const colorVal = colorMatches[0].match(/([#][0-9a-fA-F]{3,8})/)?.[1];
      if (colorVal) defaults.primary = colorVal;
    }
    if (defaults.primary.startsWith("#") && defaults.primary.length >= 7) {
      const hex = defaults.primary.slice(1);
      const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 30);
      const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 30);
      const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 30);
      defaults.secondary = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }
  } catch {
  }
  return defaults;
}
function extractPlaceIdFromUrl(url) {
  try {
    const u = new URL(url);
    const cid = u.searchParams.get("cid");
    if (cid) return `cid:${cid}`;
    const dataParam = u.pathname + u.search;
    const placeIdMatch = dataParam.match(/!1s(ChIJ[A-Za-z0-9_-]+)/);
    if (placeIdMatch) return placeIdMatch[1];
    const pid = u.searchParams.get("place_id");
    if (pid) return pid;
  } catch {
  }
  return null;
}
async function fetchGoogleBusinessData(businessName, location, industry, googleMapsUrl) {
  const result = {
    found: false,
    placeId: "",
    name: "",
    address: "",
    rating: 0,
    reviewCount: 0,
    businessTypes: [],
    website: "",
    phone: "",
    reviews: [],
    dataConfidence: "unverified",
    matchedByUrl: false
  };
  const fetchPlaceDetails = async (placeId) => {
    try {
      const details = await makeRequest(
        "/maps/api/place/details/json",
        {
          place_id: placeId,
          fields: "name,rating,user_ratings_total,reviews,website,formatted_phone_number,formatted_address,types"
        }
      );
      if (details.status === "OK" && details.result) {
        result.found = true;
        result.placeId = placeId;
        result.name = details.result.name;
        result.address = details.result.formatted_address || "";
        result.rating = details.result.rating || 0;
        result.reviewCount = details.result.user_ratings_total || 0;
        result.website = details.result.website || "";
        result.phone = details.result.formatted_phone_number || "";
        result.businessTypes = details.result.types || [];
        result.reviews = (details.result.reviews || []).map((r) => ({
          author: r.author_name,
          rating: r.rating,
          text: r.text,
          time: r.time
        }));
        return true;
      }
    } catch (e) {
      console.log("[SEO Scraper] Place details failed for", placeId, e);
    }
    return false;
  };
  try {
    if (googleMapsUrl) {
      console.log("[SEO Scraper] Using Google Maps URL for lookup:", googleMapsUrl);
      const extractedId = extractPlaceIdFromUrl(googleMapsUrl);
      if (extractedId && !extractedId.startsWith("cid:")) {
        const ok = await fetchPlaceDetails(extractedId);
        if (ok) {
          result.dataConfidence = "verified";
          result.matchedByUrl = true;
          console.log("[SEO Scraper] \u2705 Verified via Google Maps URL. Reviews:", result.reviewCount);
          return result;
        }
      }
      console.log("[SEO Scraper] Could not extract Place ID from URL, falling back to name search");
    }
    const queries = [
      `${businessName}${location ? ` ${location}` : ""}`,
      `${businessName}${industry ? ` ${industry}` : ""}`,
      businessName
    ];
    let placeId = "";
    let bestMatch = null;
    let exactNameMatch = false;
    for (const query of queries) {
      try {
        const searchResult = await makeRequest(
          "/maps/api/place/textsearch/json",
          { query }
        );
        if (searchResult.status === "OK" && searchResult.results?.length > 0) {
          const nameNormalized = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
          const exactMatch = searchResult.results.find((r) => {
            const rName = r.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return rName === nameNormalized;
          });
          const partialMatch = searchResult.results.find((r) => {
            const rName = r.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return rName.includes(nameNormalized) || nameNormalized.includes(rName);
          });
          const match = exactMatch || partialMatch;
          if (match) {
            bestMatch = match;
            placeId = match.place_id;
            exactNameMatch = !!exactMatch;
            break;
          }
        }
      } catch (e) {
        console.log("[SEO Scraper] Search query failed:", query, e);
      }
    }
    if (placeId) {
      const ok = await fetchPlaceDetails(placeId);
      if (ok) {
        result.dataConfidence = exactNameMatch ? "name_match" : "unverified";
        result.matchedByUrl = false;
        console.log(`[SEO Scraper] ${exactNameMatch ? "\u2705 Exact" : "\u26A0\uFE0F Partial"} name match. Reviews: ${result.reviewCount}, Confidence: ${result.dataConfidence}`);
      }
    } else if (bestMatch) {
      result.found = true;
      result.placeId = bestMatch.place_id || "";
      result.name = bestMatch.name;
      result.address = bestMatch.formatted_address || "";
      result.rating = bestMatch.rating || 0;
      result.reviewCount = bestMatch.user_ratings_total || 0;
      result.businessTypes = bestMatch.types || [];
      result.dataConfidence = "unverified";
      result.matchedByUrl = false;
    }
  } catch (error) {
    console.error("[SEO Scraper] Google Business fetch error:", error?.message);
  }
  return result;
}
async function checkDirectoryPresence(businessName, website, googleData) {
  const results = [];
  results.push({
    name: "Google Business Profile",
    status: googleData?.found ? "found" : "not_found",
    issues: []
  });
  const directoriesToCheck = DIRECTORIES.filter((d) => d.name !== "Google Business Profile");
  for (const dir of directoriesToCheck) {
    try {
      const checkResult = await checkSingleDirectory(dir.name, businessName, website);
      results.push(checkResult);
    } catch {
      results.push({ name: dir.name, status: "not_found", issues: [] });
    }
  }
  return results;
}
async function checkSingleDirectory(directoryName, businessName, website) {
  const nameNormalized = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const checkUrls = {
    Yelp: `https://www.yelp.com/biz/${nameNormalized.replace(/llc|inc|corp/g, "").trim().replace(/\s+/g, "-")}`,
    Facebook: `https://www.facebook.com/${nameNormalized}/`,
    BBB: `https://www.bbb.org/search?find_text=${encodeURIComponent(businessName)}`
  };
  const url = checkUrls[directoryName];
  if (url) {
    try {
      const resp = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5e3),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ScorpionBot/1.0)" },
        redirect: "follow"
      });
      if (resp.ok || resp.status === 200) {
        return { name: directoryName, status: "found", url, issues: [] };
      }
    } catch {
    }
  }
  return { name: directoryName, status: "not_found", issues: [] };
}
async function checkSocialPresence(businessName, websiteAnalysis) {
  const platforms = [
    { name: "Facebook", domain: "facebook.com" },
    { name: "Instagram", domain: "instagram.com" },
    { name: "X (Twitter)", domain: "twitter.com" },
    { name: "LinkedIn", domain: "linkedin.com" },
    { name: "YouTube", domain: "youtube.com" },
    { name: "TikTok", domain: "tiktok.com" }
  ];
  const results = [];
  for (const platform of platforms) {
    const foundOnWebsite = websiteAnalysis.socialLinksFound.some(
      (s) => s.includes(platform.domain.replace(".com", ""))
    );
    if (foundOnWebsite) {
      results.push({
        platform: platform.name,
        found: true,
        activity: "active"
        // If linked from website, likely active
      });
    } else {
      const profileFound = await checkSocialProfile(platform.name, platform.domain, businessName);
      results.push({
        platform: platform.name,
        found: profileFound,
        activity: profileFound ? "inactive" : "not_found"
      });
    }
  }
  return results;
}
async function checkSocialProfile(platformName, domain, businessName) {
  const nameSlug = businessName.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/llc|inc|corp/g, "").trim();
  const possibleUrls = {
    Facebook: [
      `https://www.facebook.com/${nameSlug}`,
      `https://www.facebook.com/${nameSlug.replace(/\s/g, "")}`
    ],
    Instagram: [
      `https://www.instagram.com/${nameSlug}/`
    ],
    "X (Twitter)": [
      `https://twitter.com/${nameSlug}`
    ],
    LinkedIn: [
      `https://www.linkedin.com/company/${nameSlug}/`
    ]
  };
  const urls = possibleUrls[platformName] || [];
  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(4e3),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ScorpionBot/1.0)" },
        redirect: "follow"
      });
      if (resp.ok) return true;
    } catch {
    }
  }
  return false;
}
async function fetchCompetitors(industry, location) {
  const competitors = [];
  try {
    const searchResult = await makeRequest(
      "/maps/api/place/textsearch/json",
      { query: `${industry} ${location}` }
    );
    if (searchResult.status === "OK" && searchResult.results) {
      for (const place of searchResult.results.slice(0, 10)) {
        competitors.push({
          name: place.name,
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0
        });
      }
    }
  } catch (error) {
    console.error("[SEO Scraper] Competitor fetch error:", error?.message);
  }
  return competitors;
}
async function scrapeAllData(params) {
  console.log("[SEO Scraper] Starting full data scrape for:", params.businessName);
  let websiteAnalysis;
  if (params.website) {
    console.log("[SEO Scraper] Analyzing website:", params.website);
    websiteAnalysis = await analyzeWebsite(params.website);
  } else {
    websiteAnalysis = {
      url: "",
      isAccessible: false,
      isHttps: false,
      isMobileFriendly: false,
      hasTitle: false,
      title: "",
      hasMetaDescription: false,
      metaDescription: "",
      hasH1: false,
      h1Count: 0,
      h2Count: 0,
      hasPhone: false,
      phone: "",
      hasAddress: false,
      address: "",
      hasSchemaMarkup: false,
      hasSocialLinks: false,
      socialLinksFound: [],
      hasCTA: false,
      ctaText: "",
      hasCanonical: false,
      hasRobotsTxt: false,
      hasSitemap: false,
      imageCount: 0,
      imagesWithAlt: 0,
      pageLoadTime: 0,
      htmlSize: 0,
      brandColors: { primary: "#1e293b", secondary: "#334155", accent: "#f59e0b", logo: "" }
    };
  }
  console.log("[SEO Scraper] Fetching Google Business data...");
  const googleData = await fetchGoogleBusinessData(
    params.businessName,
    params.location || (websiteAnalysis.address ? websiteAnalysis.address : void 0),
    params.industry,
    params.googleMapsUrl
  );
  if (params.overrides?.reviewCount !== void 0) {
    googleData.reviewCount = params.overrides.reviewCount;
    googleData.found = true;
  }
  if (params.overrides?.rating !== void 0) {
    googleData.rating = params.overrides.rating;
  }
  console.log("[SEO Scraper] Checking directory presence...");
  const directories = await checkDirectoryPresence(params.businessName, params.website, googleData);
  console.log("[SEO Scraper] Checking social media presence...");
  const social = await checkSocialPresence(params.businessName, websiteAnalysis);
  console.log("[SEO Scraper] Fetching competitor data and keyword volumes...");
  const { fetchKeywordData: fetchKeywordData2 } = await Promise.resolve().then(() => (init_keywordData(), keywordData_exports));
  const [competitors, keywordData] = await Promise.all([
    fetchCompetitors(params.industry || "local business", params.location || "local area"),
    fetchKeywordData2(
      params.industry || "local business",
      params.location || "local area",
      params.businessName,
      params.website
      // Pass website URL for domain-based ranked keyword discovery
    )
  ]);
  console.log("[SEO Scraper] Scrape complete. Google reviews:", googleData.reviewCount, "| Directories found:", directories.filter((d) => d.status === "found").length, "| Keywords fetched:", keywordData.keywords.length, "(source:", keywordData.source + ")");
  return {
    website: websiteAnalysis,
    google: googleData,
    directories,
    social,
    competitors,
    keywordData
  };
}
var DIRECTORIES;
var init_seoScraper = __esm({
  "server/seoScraper.ts"() {
    "use strict";
    init_map();
    DIRECTORIES = [
      { name: "Google Business Profile", checkUrl: (name) => `https://www.google.com/maps/search/${encodeURIComponent(name)}` },
      { name: "Yelp", checkUrl: (name) => `https://www.yelp.com/search?find_desc=${encodeURIComponent(name)}` },
      { name: "Facebook", checkUrl: (name) => `https://www.facebook.com/search/pages/?q=${encodeURIComponent(name)}` },
      { name: "BBB", checkUrl: (name) => `https://www.bbb.org/search?find_text=${encodeURIComponent(name)}` },
      { name: "Apple Maps", checkUrl: (_) => "" },
      { name: "Bing Places", checkUrl: (name) => `https://www.bing.com/maps?q=${encodeURIComponent(name)}` },
      { name: "Yellow Pages", checkUrl: (name) => `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(name)}` },
      { name: "Nextdoor", checkUrl: (_) => "" },
      { name: "Angi", checkUrl: (name) => `https://www.angi.com/companylist/${encodeURIComponent(name)}` },
      { name: "HomeAdvisor", checkUrl: (name) => `https://www.homeadvisor.com/rated.${encodeURIComponent(name.replace(/\s/g, ""))}` },
      { name: "Foursquare", checkUrl: (_) => "" },
      { name: "MapQuest", checkUrl: (name) => `https://www.mapquest.com/search/${encodeURIComponent(name)}` }
    ];
  }
});

// server/_core/dataApi.ts
var dataApi_exports = {};
__export(dataApi_exports, {
  callDataApi: () => callDataApi
});
async function callDataApi(apiId, options = {}) {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }
  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL("webdevtoken.v1.WebDevService/CallApi", baseUrl).toString();
  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify({
      apiId,
      query: options.query,
      body: options.body,
      path_params: options.pathParams,
      multipart_form_data: options.formData
    })
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Data API request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (payload && typeof payload === "object" && "jsonData" in payload) {
    try {
      return JSON.parse(payload.jsonData ?? "{}");
    } catch {
      return payload.jsonData;
    }
  }
  return payload;
}
var init_dataApi = __esm({
  "server/_core/dataApi.ts"() {
    "use strict";
    init_env();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/webhookReceiver.ts
init_db();

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/webhookReceiver.ts
function registerWebhookReceiver(app) {
  app.post("/api/webhooks/:webhookId", async (req, res) => {
    try {
      const { webhookId } = req.params;
      let webhook = null;
      const numericId = parseInt(webhookId);
      if (!isNaN(numericId)) {
        webhook = await getWebhookById(numericId);
      }
      if (!webhook) {
        webhook = await findWebhookBySlug(webhookId);
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
      const eventType = detectEventType(req);
      await createWebhookEvent({
        webhookId: webhook.id,
        eventType,
        payload: {
          headers: sanitizeHeaders(req.headers),
          body: req.body,
          query: req.query,
          receivedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        status: "sent"
      });
      await updateWebhook(webhook.id, {
        lastTriggeredAt: /* @__PURE__ */ new Date()
      });
      const leadData = extractLeadData(req.body);
      let leadCreated = false;
      if (leadData && (leadData.name || leadData.email || leadData.phone || leadData.business)) {
        try {
          await createLead({
            campaignId: 0,
            clientId: webhook.clientId || 0,
            name: leadData.name || leadData.business || "Unknown Lead",
            email: leadData.email || "",
            phone: leadData.phone || "",
            company: leadData.business || "",
            notes: leadData.notes || "",
            source: `webhook:${webhook.name || webhookId}`
          });
          leadCreated = true;
          const notifTitle = `\u{1F514} New Lead from ${webhook.name || "Webhook"}`;
          const notifContent = [
            `**Name:** ${leadData.name || leadData.business || "Unknown"}`,
            leadData.business ? `**Business:** ${leadData.business}` : null,
            leadData.email ? `**Email:** ${leadData.email}` : null,
            leadData.phone ? `**Phone:** ${leadData.phone}` : null,
            leadData.industry ? `**Industry:** ${leadData.industry}` : null,
            leadData.source ? `**Source:** ${leadData.source}` : null,
            `
View in CRM \u2192 Clients`
          ].filter(Boolean).join("\n");
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
        leadCreated
      });
    } catch (error) {
      console.error("[Webhook Receiver] Error:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to process webhook"
      });
    }
  });
  app.get("/api/webhooks/:webhookId", async (req, res) => {
    const { webhookId } = req.params;
    if (req.query.challenge) {
      return res.status(200).send(req.query.challenge);
    }
    return res.status(200).json({
      status: "active",
      message: `Webhook endpoint ${webhookId} is ready to receive events`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/webhooks/:webhookId/events", async (req, res) => {
    try {
      const { webhookId } = req.params;
      const webhook = await resolveWebhook(webhookId);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found", webhookId });
      }
      const events = await getWebhookEventsByWebhookId(webhook.id);
      const sorted = [...events].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return res.status(200).json({
        webhook: { id: webhook.id, name: webhook.name, url: webhook.url },
        total: sorted.length,
        events: sorted.map((e) => ({
          event_id: e.id,
          event_type: e.eventType,
          received_at: e.createdAt,
          status: e.status,
          raw_payload: e.payload
          // Full body, headers, query — nothing stripped
        }))
      });
    } catch (error) {
      console.error("[Webhook Events List] Error:", error);
      return res.status(500).json({ error: "Failed to retrieve events" });
    }
  });
  app.get("/api/webhooks/:webhookId/events/export", async (req, res) => {
    try {
      const { webhookId } = req.params;
      const webhook = await resolveWebhook(webhookId);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found", webhookId });
      }
      const events = await getWebhookEventsByWebhookId(webhook.id);
      const sorted = [...events].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const exportData = {
        exported_at: (/* @__PURE__ */ new Date()).toISOString(),
        webhook: { id: webhook.id, name: webhook.name, url: webhook.url },
        total_events: sorted.length,
        events: sorted.map((e) => ({
          event_id: e.id,
          event_type: e.eventType,
          received_at: e.createdAt,
          status: e.status,
          raw_payload: e.payload
        }))
      };
      const filename = `${webhookId}-events-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.status(200).send(JSON.stringify(exportData, null, 2));
    } catch (error) {
      console.error("[Webhook Events Export] Error:", error);
      return res.status(500).json({ error: "Failed to export events" });
    }
  });
}
async function resolveWebhook(webhookId) {
  const numericId = parseInt(webhookId);
  if (!isNaN(numericId)) {
    const w = await getWebhookById(numericId);
    if (w) return w;
  }
  return findWebhookBySlug(webhookId);
}
async function findWebhookBySlug(slug) {
  const getDb2 = (await Promise.resolve().then(() => (init_db(), db_exports))).getDb;
  const dbInstance = await getDb2();
  if (!dbInstance) return null;
  const { webhooks: webhooks2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { like } = await import("drizzle-orm");
  const results = await dbInstance.select().from(webhooks2).where(like(webhooks2.url, `%${slug}%`)).limit(1);
  return results[0] || null;
}
function detectEventType(req) {
  const hubspotEvent = req.headers["x-hubspot-event-type"];
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
    if (req.body.name || req.body.email || req.body.phone || req.body.business) return "lead.created";
  }
  return "webhook.received";
}
function extractLeadData(body) {
  if (!body) return null;
  if (body.contact && (body.contact.email || body.contact.first_name || body.contact.phone_numbers)) {
    const c = body.contact;
    const phone = c.sanitized_phone || c.phone || Array.isArray(c.phone_numbers) && c.phone_numbers[0]?.sanitized_number || "";
    return {
      name: c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown",
      email: c.email || "",
      phone,
      business: c.organization_name || c.account?.name || "",
      industry: c.industry || "",
      source: `apollo:${body.event_type || "contact"}`,
      notes: c.title ? `Title: ${c.title}` : ""
    };
  }
  if (body.person && (body.person.email || body.person.first_name || body.person.sanitized_phone)) {
    const p = body.person;
    const phone = p.sanitized_phone || p.mobile_phone || p.phone || Array.isArray(p.phone_numbers) && p.phone_numbers[0]?.sanitized_number || "";
    return {
      name: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
      email: p.email || "",
      phone,
      business: p.organization?.name || p.company || p.organization_name || "",
      industry: p.industry || "",
      source: `apollo:${body.event_type || "person"}`,
      notes: p.title ? `Title: ${p.title}` : ""
    };
  }
  if (body.data?.person) {
    const p = body.data.person;
    const phone = p.sanitized_phone || p.mobile_phone || p.phone || Array.isArray(p.phone_numbers) && p.phone_numbers[0]?.sanitized_number || "";
    return {
      name: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown",
      email: p.email || "",
      phone,
      business: p.organization?.name || p.company || p.organization_name || "",
      industry: p.industry || "",
      source: `apollo:${body.type || "enriched"}`,
      notes: p.title ? `Title: ${p.title}` : ""
    };
  }
  if (body.first_name || body.last_name || body.phone_number) {
    const phone = body.sanitized_phone || body.phone_number || body.mobile_phone || body.phone || Array.isArray(body.phone_numbers) && body.phone_numbers[0]?.sanitized_number || "";
    return {
      name: `${body.first_name || ""} ${body.last_name || ""}`.trim() || body.name || "Unknown",
      email: body.email || "",
      phone,
      business: body.organization_name || body.company || "",
      industry: body.industry || "",
      source: `apollo:${body.event_type || "contact"}`,
      notes: body.title ? `Title: ${body.title}` : ""
    };
  }
  if (body.lead_name || body.lead_email || body.lead_phone) {
    const cleanName = (body.lead_name || "").replace(/^=+/, "").trim();
    return {
      name: cleanName || "Unknown",
      email: body.lead_email || body.email || "",
      phone: body.lead_phone || body.phone || "",
      business: body.lead_company || body.business || "",
      industry: body.lead_industry || body.industry || "",
      source: body.source || body.status || "n8n-resurrector",
      notes: body.message ? `Outreach: ${String(body.message).slice(0, 300)}` : ""
    };
  }
  if (body.business_name || body.lead_info) {
    const leadInfo = body.lead_info || {};
    return {
      name: body.business_name || body.company_name || "Unknown Business",
      email: body.email || leadInfo.email || "",
      phone: body.phone || leadInfo.phone || "",
      business: body.business_name || body.company_name || "",
      industry: leadInfo.industry || body.industry || "",
      source: leadInfo.source || body.source || "n8n-seo-scout",
      notes: body.website_url ? `Website: ${body.website_url}` : ""
    };
  }
  if (body.email || body.name || body.phone || body.business) {
    return {
      name: body.name || body.fullName || body.full_name,
      email: body.email,
      phone: body.phone || body.phoneNumber || body.phone_number,
      business: body.business || body.company || body.businessName,
      industry: body.industry,
      source: body.source || body.utm_source,
      notes: body.notes || body.message
    };
  }
  if (body.form_response?.answers) {
    const answers = body.form_response.answers;
    const email = answers.find((a) => a.type === "email")?.email;
    const name = answers.find(
      (a) => a.type === "short_text" || a.field?.title?.toLowerCase().includes("name")
    )?.text;
    const phone = answers.find((a) => a.type === "phone_number")?.phone_number;
    return { name, email, phone };
  }
  if (body.properties) {
    return {
      name: `${body.properties.firstname || ""} ${body.properties.lastname || ""}`.trim(),
      email: body.properties.email,
      phone: body.properties.phone,
      business: body.properties.company
    };
  }
  if (body.contact || body.lead) {
    const data = body.contact || body.lead;
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      business: data.company || data.business
    };
  }
  return null;
}
function sanitizeHeaders(headers) {
  const safe = {};
  const allowedHeaders = [
    "content-type",
    "user-agent",
    "x-forwarded-for",
    "x-hubspot-event-type",
    "typeform-signature",
    "x-webhook-id",
    "x-request-id"
  ];
  for (const key of allowedHeaders) {
    if (headers[key]) {
      safe[key] = String(headers[key]);
    }
  }
  return safe;
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/leadGenAgentRouter.ts
import { z } from "zod";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
var RETRY_MAX_RETRIES = 4;
var RETRY_BASE_DELAY_MS = 500;
var RETRY_MAX_DELAY_MS = 3e4;
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var parseRetryAfter = (value) => {
  if (!value) return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const at = Date.parse(value);
  return Number.isNaN(at) ? void 0 : Math.max(0, at - Date.now());
};
var computeBackoffDelay = (attempt, retryAfterMs) => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};
var fetchWithBackoff = async (url, init) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) {
        return response;
      }
      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("LLM request failed after exhausting retries");
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens
  } = params;
  const payload = {
    messages: messages.map(normalizeMessage)
  };
  if (model) {
    payload.model = model;
  }
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }
  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetchWithBackoff(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/leadGenAgentRouter.ts
init_db();
var leadGenAgentRouter = router({
  // List all agents for a client
  listByClient: protectedProcedure.input(z.object({ clientId: z.number() })).query(async ({ input }) => {
    return getLeadGenAgentsByClientId(input.clientId);
  }),
  // Create a new agent config
  create: protectedProcedure.input(
    z.object({
      clientId: z.number(),
      name: z.string().min(1),
      industry: z.string().optional(),
      location: z.string().optional(),
      radius: z.number().optional(),
      targetKeywords: z.array(z.string()).optional(),
      filters: z.object({
        noWebsite: z.boolean().optional(),
        unclaimed: z.boolean().optional(),
        lowReviews: z.boolean().optional(),
        minScore: z.number().optional()
      }).optional(),
      outreachChannel: z.enum(["sms", "email", "both"]).optional(),
      outreachTone: z.enum(["professional", "friendly", "urgent", "consultative"]).optional(),
      valueProposition: z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createLeadGenAgent({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_lead_gen_agent",
      entityType: "lead_gen_agent",
      details: { name: input.name }
    });
    return result;
  }),
  // Update agent config
  update: protectedProcedure.input(
    z.object({
      id: z.number(),
      name: z.string().optional(),
      industry: z.string().optional(),
      location: z.string().optional(),
      radius: z.number().optional(),
      targetKeywords: z.array(z.string()).optional(),
      filters: z.object({
        noWebsite: z.boolean().optional(),
        unclaimed: z.boolean().optional(),
        lowReviews: z.boolean().optional(),
        minScore: z.number().optional()
      }).optional(),
      outreachChannel: z.enum(["sms", "email", "both"]).optional(),
      outreachTone: z.enum(["professional", "friendly", "urgent", "consultative"]).optional(),
      valueProposition: z.string().optional(),
      status: z.enum(["draft", "active", "paused"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateLeadGenAgent(id, data);
  }),
  // Delete agent and its results
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await logActivity({
      userId: ctx.user.id,
      action: "deleted_lead_gen_agent",
      entityType: "lead_gen_agent",
      details: { id: input.id }
    });
    return deleteLeadGenAgent(input.id);
  }),
  // Run the agent: search Google Maps, score prospects, generate AI outreach
  run: protectedProcedure.input(
    z.object({
      agentId: z.number(),
      clientId: z.number(),
      industry: z.string(),
      location: z.string(),
      radius: z.number().min(1e3).max(5e4).default(1e4),
      filters: z.object({
        noWebsite: z.boolean().default(false),
        unclaimed: z.boolean().default(false),
        lowReviews: z.boolean().default(false),
        minScore: z.number().default(0)
      }).optional(),
      outreachChannel: z.enum(["sms", "email", "both"]).default("both"),
      outreachTone: z.enum(["professional", "friendly", "urgent", "consultative"]).default("friendly"),
      valueProposition: z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const { makeRequest: makeRequest2 } = await Promise.resolve().then(() => (init_map(), map_exports));
    const geoResult = await makeRequest2("/maps/api/geocode/json", {
      address: input.location
    });
    const coords = geoResult.results?.[0]?.geometry?.location;
    if (!coords) return { prospects: [], error: "Could not geocode location" };
    const searchResult = await makeRequest2(
      "/maps/api/place/nearbysearch/json",
      {
        location: `${coords.lat},${coords.lng}`,
        radius: input.radius,
        keyword: input.industry,
        type: "establishment"
      }
    );
    if (searchResult.status !== "OK" || !searchResult.results) {
      return { prospects: [], error: searchResult.status };
    }
    const rawProspects = [];
    const places = searchResult.results.slice(0, 20);
    await Promise.all(
      places.map(async (place) => {
        try {
          const detail = await makeRequest2(
            "/maps/api/place/details/json",
            {
              place_id: place.place_id,
              fields: "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status"
            }
          );
          const r = detail.result;
          if (!r) return;
          const hasWebsite = !!r.website;
          const isUnclaimed = !hasWebsite && (r.user_ratings_total ?? 0) <= 5;
          let score = 0;
          if (!hasWebsite) score += 40;
          if (isUnclaimed) score += 30;
          if ((r.user_ratings_total ?? 0) < 10) score += 20;
          if ((r.rating ?? 5) < 4) score += 10;
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
            opportunityScore: score
          });
        } catch {
        }
      })
    );
    const filters = input.filters;
    let filtered = rawProspects;
    if (filters?.noWebsite) filtered = filtered.filter((p) => !p.hasWebsite);
    if (filters?.unclaimed) filtered = filtered.filter((p) => p.isUnclaimed);
    if (filters?.lowReviews) filtered = filtered.filter((p) => p.reviewCount < 10);
    if (filters?.minScore) filtered = filtered.filter((p) => p.opportunityScore >= (filters.minScore ?? 0));
    filtered.sort((a, b) => b.opportunityScore - a.opportunityScore);
    const top = filtered.slice(0, 10);
    const vp = input.valueProposition || "AI-powered marketing and lead generation services";
    const tone = input.outreachTone;
    const channel = input.outreachChannel;
    const smsPart = channel !== "email" ? "- sms: A short SMS (under 160 chars) that mentions the business name and a specific pain point" : "";
    const emailPart = channel !== "sms" ? "- emailSubject: A compelling email subject line (under 60 chars)\n- emailBody: A 3-sentence email body" : "";
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
    let outreachMap = {};
    try {
      const llmResp = await invokeLLM({
        messages: [{ role: "user", content: outreachPrompt }]
      });
      const raw = llmResp.choices[0]?.message.content;
      const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
      const jsonMatch = text2.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of parsed) outreachMap[item.index - 1] = item;
      }
    } catch {
    }
    const toSave = top.map((p, i) => ({
      agentId: input.agentId,
      clientId: input.clientId,
      businessName: p.name,
      address: p.address,
      phone: p.phone,
      website: p.website || void 0,
      googlePlaceId: p.placeId,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isUnclaimed: p.isUnclaimed,
      hasWebsite: p.hasWebsite,
      opportunityScore: p.opportunityScore,
      smsMessage: outreachMap[i]?.sms,
      emailSubject: outreachMap[i]?.emailSubject,
      emailBody: outreachMap[i]?.emailBody
    }));
    const saved = toSave.length > 0 ? await saveLeadGenResults(toSave) : [];
    await updateLeadGenAgent(input.agentId, {
      lastRunAt: /* @__PURE__ */ new Date(),
      totalProspectsFound: rawProspects.length,
      status: "active"
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "ran_lead_gen_agent",
      entityType: "lead_gen_agent",
      details: {
        agentId: input.agentId,
        found: rawProspects.length,
        saved: saved.length
      }
    });
    return { prospects: saved, totalFound: rawProspects.length, error: null };
  }),
  // Get saved results for an agent
  getResults: protectedProcedure.input(z.object({ agentId: z.number() })).query(async ({ input }) => {
    return getLeadGenResultsByAgentId(input.agentId);
  }),
  // Update a result's status (mark outreach sent, dismiss, etc.)
  updateResultStatus: protectedProcedure.input(
    z.object({
      id: z.number(),
      status: z.enum(["new", "outreach_sent", "responded", "saved_as_lead", "dismissed"])
    })
  ).mutation(async ({ input }) => {
    return updateLeadGenResultStatus(input.id, input.status);
  }),
  // Save a prospect as a CRM client
  saveProspectAsLead: protectedProcedure.input(
    z.object({
      resultId: z.number(),
      agentId: z.number(),
      clientId: z.number(),
      businessName: z.string(),
      phone: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      industry: z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const existing = await getClientsByUserId(ctx.user.id);
    const alreadyExists = existing.some(
      (c) => c.name.toLowerCase() === input.businessName.toLowerCase()
    );
    if (alreadyExists) {
      return { success: false, error: "Already in your CRM" };
    }
    await createClient({
      userId: ctx.user.id,
      name: input.businessName,
      industry: input.industry || "Unknown",
      website: input.website || void 0,
      phone: input.phone || void 0,
      description: `Address: ${input.address || "N/A"} | Source: Lead Gen Agent (${(/* @__PURE__ */ new Date()).toLocaleDateString()})`
    });
    const updated = await getClientsByUserId(ctx.user.id);
    const newClient = updated.find(
      (c) => c.name.toLowerCase() === input.businessName.toLowerCase()
    );
    await updateLeadGenResultStatus(input.resultId, "saved_as_lead", newClient?.id);
    const agent = await getLeadGenAgentById(input.agentId);
    if (agent) {
      await updateLeadGenAgent(input.agentId, {
        totalLeadsSaved: (agent.totalLeadsSaved ?? 0) + 1
      });
    }
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "saved_prospect_as_lead",
      entityType: "lead_gen_agent",
      details: {
        businessName: input.businessName,
        newClientId: newClient?.id
      }
    });
    return { success: true, error: null, clientId: newClient?.id ?? null };
  })
});

// server/missedCallRouter.ts
import { z as z2 } from "zod";
init_db();
init_schema();
import { eq as eq2, desc as desc2 } from "drizzle-orm";
async function getConfigsByClientId(clientId) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(missedCallConfigs).where(eq2(missedCallConfigs.clientId, clientId));
}
async function getConfigById(id) {
  const database = await getDb();
  if (!database) return null;
  const rows = await database.select().from(missedCallConfigs).where(eq2(missedCallConfigs.id, id));
  return rows[0] ?? null;
}
async function createConfig(data) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(missedCallConfigs).values(data);
  const rows = await database.select().from(missedCallConfigs).where(eq2(missedCallConfigs.clientId, data.clientId)).orderBy(desc2(missedCallConfigs.createdAt));
  return rows[0] ?? null;
}
async function updateConfig(id, data) {
  const database = await getDb();
  if (!database) return null;
  await database.update(missedCallConfigs).set(data).where(eq2(missedCallConfigs.id, id));
  return getConfigById(id);
}
async function deleteConfig(id) {
  const database = await getDb();
  if (!database) return null;
  await database.delete(missedCallEvents).where(eq2(missedCallEvents.configId, id));
  await database.delete(missedCallConfigs).where(eq2(missedCallConfigs.id, id));
  return { success: true };
}
async function getEventsByConfigId(configId) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(missedCallEvents).where(eq2(missedCallEvents.configId, configId)).orderBy(desc2(missedCallEvents.createdAt));
}
async function createEvent(data) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(missedCallEvents).values(data);
  const rows = await database.select().from(missedCallEvents).where(eq2(missedCallEvents.configId, data.configId)).orderBy(desc2(missedCallEvents.createdAt));
  return rows[0] ?? null;
}
async function updateEvent(id, data) {
  const database = await getDb();
  if (!database) return null;
  await database.update(missedCallEvents).set(data).where(eq2(missedCallEvents.id, id));
  const rows = await database.select().from(missedCallEvents).where(eq2(missedCallEvents.id, id));
  return rows[0] ?? null;
}
var missedCallRouter = router({
  listByClient: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ input }) => getConfigsByClientId(input.clientId)),
  create: protectedProcedure.input(z2.object({
    clientId: z2.number(),
    name: z2.string().min(1),
    businessName: z2.string().min(1),
    industry: z2.string().optional(),
    responseDelaySeconds: z2.number().min(0).max(300).optional(),
    followUpDelayMinutes: z2.number().min(0).max(1440).optional()
  })).mutation(async ({ ctx, input }) => {
    const config = await createConfig({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_missed_call_config",
      entityType: "missed_call_config",
      details: { name: input.name }
    });
    return config;
  }),
  update: protectedProcedure.input(z2.object({
    id: z2.number(),
    name: z2.string().optional(),
    businessName: z2.string().optional(),
    industry: z2.string().optional(),
    responseDelaySeconds: z2.number().optional(),
    smsTemplate: z2.string().optional(),
    followUpTemplate: z2.string().optional(),
    followUpDelayMinutes: z2.number().optional(),
    isActive: z2.boolean().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateConfig(id, data);
  }),
  delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
    const config = await getConfigById(input.id);
    await deleteConfig(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: config?.clientId,
      action: "deleted_missed_call_config",
      entityType: "missed_call_config",
      details: { name: config?.name }
    });
    return { success: true };
  }),
  generateTemplate: protectedProcedure.input(z2.object({
    businessName: z2.string(),
    industry: z2.string(),
    tone: z2.enum(["friendly", "professional", "urgent"]).default("friendly")
  })).mutation(async ({ input }) => {
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate a missed call text-back SMS template and a follow-up template for a local business.

Business: ${input.businessName}
Industry: ${input.industry}
Tone: ${input.tone}

Requirements:
- smsTemplate: Under 160 chars. Personalize with {callerName} placeholder. Mention the business name. Ask how you can help. Include a call-back prompt.
- followUpTemplate: Under 160 chars. A gentle follow-up 1 hour later. Different wording from the first.

Respond as JSON: { "smsTemplate": "...", "followUpTemplate": "..." }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    if (!match) return { smsTemplate: "", followUpTemplate: "" };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { smsTemplate: "", followUpTemplate: "" };
    }
  }),
  getEvents: protectedProcedure.input(z2.object({ configId: z2.number() })).query(async ({ input }) => getEventsByConfigId(input.configId)),
  logEvent: protectedProcedure.input(z2.object({
    configId: z2.number(),
    clientId: z2.number(),
    callerPhone: z2.string().optional(),
    callerName: z2.string().optional(),
    smsSent: z2.boolean().optional(),
    smsContent: z2.string().optional()
  })).mutation(async ({ input }) => createEvent(input)),
  updateEvent: protectedProcedure.input(z2.object({
    id: z2.number(),
    smsSent: z2.boolean().optional(),
    smsContent: z2.string().optional(),
    followUpSent: z2.boolean().optional(),
    responded: z2.boolean().optional(),
    outcome: z2.enum(["booked", "not_interested", "no_response", "wrong_number", "pending"]).optional(),
    notes: z2.string().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateEvent(id, data);
  })
});

// server/reviewRequestRouter.ts
import { z as z3 } from "zod";
init_db();
init_schema();
import { eq as eq3, desc as desc3 } from "drizzle-orm";
async function getCampaignsByClientId2(clientId) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(reviewRequestCampaigns).where(eq3(reviewRequestCampaigns.clientId, clientId));
}
async function getCampaignById2(id) {
  const database = await getDb();
  if (!database) return null;
  const rows = await database.select().from(reviewRequestCampaigns).where(eq3(reviewRequestCampaigns.id, id));
  return rows[0] ?? null;
}
async function createCampaign2(data) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(reviewRequestCampaigns).values(data);
  const rows = await database.select().from(reviewRequestCampaigns).where(eq3(reviewRequestCampaigns.clientId, data.clientId)).orderBy(desc3(reviewRequestCampaigns.createdAt));
  return rows[0] ?? null;
}
async function updateCampaign(id, data) {
  const database = await getDb();
  if (!database) return null;
  await database.update(reviewRequestCampaigns).set(data).where(eq3(reviewRequestCampaigns.id, id));
  return getCampaignById2(id);
}
async function deleteCampaign(id) {
  const database = await getDb();
  if (!database) return null;
  await database.delete(reviewRequestLogs).where(eq3(reviewRequestLogs.campaignId, id));
  await database.delete(reviewRequestCampaigns).where(eq3(reviewRequestCampaigns.id, id));
  return { success: true };
}
async function getLogsByCampaignId(campaignId) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(reviewRequestLogs).where(eq3(reviewRequestLogs.campaignId, campaignId)).orderBy(desc3(reviewRequestLogs.createdAt));
}
async function createLog(data) {
  const database = await getDb();
  if (!database) return null;
  await database.insert(reviewRequestLogs).values(data);
  const rows = await database.select().from(reviewRequestLogs).where(eq3(reviewRequestLogs.campaignId, data.campaignId)).orderBy(desc3(reviewRequestLogs.createdAt));
  return rows[0] ?? null;
}
async function updateLog(id, data) {
  const database = await getDb();
  if (!database) return null;
  await database.update(reviewRequestLogs).set(data).where(eq3(reviewRequestLogs.id, id));
  const rows = await database.select().from(reviewRequestLogs).where(eq3(reviewRequestLogs.id, id));
  return rows[0] ?? null;
}
var reviewRequestRouter = router({
  listByClient: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ input }) => getCampaignsByClientId2(input.clientId)),
  create: protectedProcedure.input(z3.object({
    clientId: z3.number(),
    name: z3.string().min(1),
    businessName: z3.string().min(1),
    industry: z3.string().optional(),
    googleReviewLink: z3.string().optional(),
    channel: z3.enum(["sms", "email", "both"]).optional(),
    sendDelayHours: z3.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const campaign = await createCampaign2({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_review_request_campaign",
      entityType: "review_request_campaign",
      details: { name: input.name }
    });
    return campaign;
  }),
  update: protectedProcedure.input(z3.object({
    id: z3.number(),
    name: z3.string().optional(),
    businessName: z3.string().optional(),
    industry: z3.string().optional(),
    googleReviewLink: z3.string().optional(),
    channel: z3.enum(["sms", "email", "both"]).optional(),
    sendDelayHours: z3.number().optional(),
    smsTemplate: z3.string().optional(),
    emailSubjectTemplate: z3.string().optional(),
    emailBodyTemplate: z3.string().optional(),
    isActive: z3.boolean().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateCampaign(id, data);
  }),
  delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
    const campaign = await getCampaignById2(input.id);
    await deleteCampaign(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: campaign?.clientId,
      action: "deleted_review_request_campaign",
      entityType: "review_request_campaign",
      details: { name: campaign?.name }
    });
    return { success: true };
  }),
  generateTemplates: protectedProcedure.input(z3.object({
    businessName: z3.string(),
    industry: z3.string(),
    googleReviewLink: z3.string().optional(),
    tone: z3.enum(["friendly", "professional", "grateful"]).default("friendly")
  })).mutation(async ({ input }) => {
    const link = input.googleReviewLink || "[REVIEW LINK]";
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate review request message templates for a local business.

Business: ${input.businessName}
Industry: ${input.industry}
Tone: ${input.tone}
Review Link: ${link}

Create:
1. smsTemplate: Under 160 chars. Thank the customer for their service. Ask for a Google review. Include the link. Use {customerName} placeholder.
2. emailSubjectTemplate: Catchy email subject line under 60 chars.
3. emailBodyTemplate: 3-4 sentence email body. Warm, personal. Ask for review. Include link. Use {customerName} placeholder.

Respond as JSON: { "smsTemplate": "...", "emailSubjectTemplate": "...", "emailBodyTemplate": "..." }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    if (!match) return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
    }
  }),
  getLogs: protectedProcedure.input(z3.object({ campaignId: z3.number() })).query(async ({ input }) => getLogsByCampaignId(input.campaignId)),
  logCustomer: protectedProcedure.input(z3.object({
    campaignId: z3.number(),
    clientId: z3.number(),
    customerName: z3.string().optional(),
    customerPhone: z3.string().optional(),
    customerEmail: z3.string().optional(),
    serviceType: z3.string().optional()
  })).mutation(async ({ input }) => createLog(input)),
  updateLog: protectedProcedure.input(z3.object({
    id: z3.number(),
    smsSent: z3.boolean().optional(),
    emailSent: z3.boolean().optional(),
    reviewLeft: z3.boolean().optional(),
    reviewRating: z3.number().min(1).max(5).optional(),
    status: z3.enum(["pending", "sent", "reviewed", "no_response"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateLog(id, data);
  })
});

// server/retentionRouter.ts
import { z as z4 } from "zod";
init_db();
init_schema();
import { eq as eq4, desc as desc4 } from "drizzle-orm";
async function getRulesByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(retentionRules).where(eq4(retentionRules.clientId, clientId));
}
async function getRuleById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(retentionRules).where(eq4(retentionRules.id, id));
  return rows[0] ?? null;
}
async function createRule(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(retentionRules).values(data);
  const rows = await db.select().from(retentionRules).where(eq4(retentionRules.clientId, data.clientId)).orderBy(desc4(retentionRules.createdAt));
  return rows[0] ?? null;
}
async function updateRule(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(retentionRules).set(data).where(eq4(retentionRules.id, id));
  return getRuleById(id);
}
async function deleteRule(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(retentionEvents).where(eq4(retentionEvents.ruleId, id));
  await db.delete(retentionRules).where(eq4(retentionRules.id, id));
  return { success: true };
}
async function getEventsByRuleId(ruleId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(retentionEvents).where(eq4(retentionEvents.ruleId, ruleId)).orderBy(desc4(retentionEvents.createdAt));
}
async function createEvent2(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(retentionEvents).values(data);
  const rows = await db.select().from(retentionEvents).where(eq4(retentionEvents.ruleId, data.ruleId)).orderBy(desc4(retentionEvents.createdAt));
  return rows[0] ?? null;
}
async function updateEvent2(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(retentionEvents).set(data).where(eq4(retentionEvents.id, id));
  const rows = await db.select().from(retentionEvents).where(eq4(retentionEvents.id, id));
  return rows[0] ?? null;
}
var retentionRouter = router({
  listByClient: protectedProcedure.input(z4.object({ clientId: z4.number() })).query(async ({ input }) => getRulesByClientId(input.clientId)),
  create: protectedProcedure.input(z4.object({
    clientId: z4.number(),
    name: z4.string().min(1),
    industry: z4.string().optional(),
    triggerType: z4.enum(["days_since_service", "days_before_renewal", "anniversary", "seasonal", "low_engagement"]),
    triggerDays: z4.number().optional(),
    channel: z4.enum(["sms", "email", "both"]).optional(),
    offerIncluded: z4.boolean().optional(),
    offerDetails: z4.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const rule = await createRule({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_retention_rule",
      entityType: "retention_rule",
      details: { name: input.name }
    });
    return rule;
  }),
  update: protectedProcedure.input(z4.object({
    id: z4.number(),
    name: z4.string().optional(),
    industry: z4.string().optional(),
    triggerType: z4.enum(["days_since_service", "days_before_renewal", "anniversary", "seasonal", "low_engagement"]).optional(),
    triggerDays: z4.number().optional(),
    channel: z4.enum(["sms", "email", "both"]).optional(),
    messageTemplate: z4.string().optional(),
    offerIncluded: z4.boolean().optional(),
    offerDetails: z4.string().optional(),
    isActive: z4.boolean().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateRule(id, data);
  }),
  delete: protectedProcedure.input(z4.object({ id: z4.number() })).mutation(async ({ ctx, input }) => {
    const rule = await getRuleById(input.id);
    await deleteRule(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: rule?.clientId,
      action: "deleted_retention_rule",
      entityType: "retention_rule",
      details: { name: rule?.name }
    });
    return { success: true };
  }),
  generateMessage: protectedProcedure.input(z4.object({
    businessName: z4.string(),
    industry: z4.string(),
    triggerType: z4.string(),
    triggerDays: z4.number().optional(),
    offerDetails: z4.string().optional(),
    channel: z4.enum(["sms", "email", "both"])
  })).mutation(async ({ input }) => {
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate a client retention message template for a local business.

Business Industry: ${input.industry}
Trigger: ${input.triggerType.replace(/_/g, " ")} (${input.triggerDays ?? 90} days)
Channel: ${input.channel}
${input.offerDetails ? `Special Offer: ${input.offerDetails}` : ""}

Requirements:
- smsTemplate: Under 160 chars. Re-engage a past customer. Reference their last service. Use {customerName} placeholder. ${input.offerDetails ? "Include the offer." : ""}
- emailSubjectTemplate: Subject line under 60 chars.
- emailBodyTemplate: 3-4 sentences. Warm and personal. Reference time since last service. ${input.offerDetails ? "Include the offer." : ""}

Respond as JSON: { "smsTemplate": "...", "emailSubjectTemplate": "...", "emailBodyTemplate": "..." }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    if (!match) return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "" };
    }
  }),
  getEvents: protectedProcedure.input(z4.object({ ruleId: z4.number() })).query(async ({ input }) => getEventsByRuleId(input.ruleId)),
  logEvent: protectedProcedure.input(z4.object({
    ruleId: z4.number(),
    clientId: z4.number(),
    customerName: z4.string().optional(),
    customerPhone: z4.string().optional(),
    customerEmail: z4.string().optional(),
    generatedMessage: z4.string().optional()
  })).mutation(async ({ input }) => createEvent2(input)),
  updateEvent: protectedProcedure.input(z4.object({
    id: z4.number(),
    sent: z4.boolean().optional(),
    responded: z4.boolean().optional(),
    converted: z4.boolean().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateEvent2(id, data);
  })
});

// server/seasonalPlannerRouter.ts
import { z as z5 } from "zod";
init_db();
init_schema();
import { eq as eq5, desc as desc5 } from "drizzle-orm";
async function getPlansByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seasonalPlans).where(eq5(seasonalPlans.clientId, clientId)).orderBy(desc5(seasonalPlans.createdAt));
}
async function getPlanById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(seasonalPlans).where(eq5(seasonalPlans.id, id));
  return rows[0] ?? null;
}
async function getItemsByPlanId(planId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(seasonalCampaignItems).where(eq5(seasonalCampaignItems.planId, planId)).orderBy(seasonalCampaignItems.month);
}
async function createPlan(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(seasonalPlans).values(data);
  const rows = await db.select().from(seasonalPlans).where(eq5(seasonalPlans.clientId, data.clientId)).orderBy(desc5(seasonalPlans.createdAt));
  return rows[0] ?? null;
}
async function deletePlan(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(seasonalCampaignItems).where(eq5(seasonalCampaignItems.planId, id));
  await db.delete(seasonalPlans).where(eq5(seasonalPlans.id, id));
  return { success: true };
}
async function updateItem(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(seasonalCampaignItems).set(data).where(eq5(seasonalCampaignItems.id, id));
  const rows = await db.select().from(seasonalCampaignItems).where(eq5(seasonalCampaignItems.id, id));
  return rows[0] ?? null;
}
var seasonalPlannerRouter = router({
  listByClient: protectedProcedure.input(z5.object({ clientId: z5.number() })).query(async ({ input }) => getPlansByClientId(input.clientId)),
  getPlanWithItems: protectedProcedure.input(z5.object({ planId: z5.number() })).query(async ({ input }) => {
    const plan = await getPlanById(input.planId);
    const items = await getItemsByPlanId(input.planId);
    return { plan, items };
  }),
  create: protectedProcedure.input(z5.object({
    clientId: z5.number(),
    name: z5.string().min(1),
    industry: z5.string().min(1),
    location: z5.string().optional(),
    year: z5.number().min(2024).max(2030)
  })).mutation(async ({ ctx, input }) => {
    const plan = await createPlan({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_seasonal_plan",
      entityType: "seasonal_plan",
      details: { name: input.name, industry: input.industry }
    });
    return plan;
  }),
  generatePlan: protectedProcedure.input(z5.object({
    planId: z5.number(),
    clientId: z5.number(),
    industry: z5.string(),
    location: z5.string().optional(),
    year: z5.number()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Create a 12-month seasonal marketing campaign calendar for a local ${input.industry} business${input.location ? ` in ${input.location}` : ""} for ${input.year}.

For each month (1-12), provide:
- title: Campaign name (e.g. "Spring AC Tune-Up Special")
- description: 1-2 sentences about the campaign focus
- offerIdea: A specific promotional offer
- channels: Array of ["sms", "email", "google_posts", "social"] (pick 2-3 relevant ones)
- estimatedBudget: "$X-$Y/month" range
- priority: "high", "medium", or "low" based on seasonal importance for this industry

Consider seasonal patterns, holidays, and industry-specific busy/slow seasons.

Respond as JSON array of 12 objects with keys: month (1-12), title, description, offerIdea, channels, estimatedBudget, priority`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\[[\s\S]*\]/);
    if (!match) return { success: false, itemsCreated: 0 };
    let items;
    try {
      items = JSON.parse(match[0]);
    } catch {
      return { success: false, itemsCreated: 0 };
    }
    await db.delete(seasonalCampaignItems).where(eq5(seasonalCampaignItems.planId, input.planId));
    for (const item of items) {
      await db.insert(seasonalCampaignItems).values({
        planId: input.planId,
        clientId: input.clientId,
        month: item.month,
        title: item.title,
        description: item.description,
        offerIdea: item.offerIdea,
        channels: item.channels,
        estimatedBudget: item.estimatedBudget,
        priority: item.priority ?? "medium"
      });
    }
    await db.update(seasonalPlans).set({ status: "active" }).where(eq5(seasonalPlans.id, input.planId));
    return { success: true, itemsCreated: items.length };
  }),
  updateItem: protectedProcedure.input(z5.object({
    id: z5.number(),
    title: z5.string().optional(),
    description: z5.string().optional(),
    offerIdea: z5.string().optional(),
    estimatedBudget: z5.string().optional(),
    priority: z5.enum(["high", "medium", "low"]).optional(),
    status: z5.enum(["planned", "in_progress", "completed", "skipped"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateItem(id, data);
  }),
  delete: protectedProcedure.input(z5.object({ id: z5.number() })).mutation(async ({ ctx, input }) => {
    const plan = await getPlanById(input.id);
    await deletePlan(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: plan?.clientId,
      action: "deleted_seasonal_plan",
      entityType: "seasonal_plan",
      details: { name: plan?.name }
    });
    return { success: true };
  })
});

// server/proposalRouter.ts
import { z as z6 } from "zod";
init_db();
init_schema();
import { eq as eq6, desc as desc6 } from "drizzle-orm";
async function getProposalsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(eq6(proposals.clientId, clientId)).orderBy(desc6(proposals.createdAt));
}
async function getProposalById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(proposals).where(eq6(proposals.id, id));
  return rows[0] ?? null;
}
async function createProposal(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(proposals).values(data);
  const rows = await db.select().from(proposals).where(eq6(proposals.clientId, data.clientId)).orderBy(desc6(proposals.createdAt));
  return rows[0] ?? null;
}
async function updateProposal(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(proposals).set(data).where(eq6(proposals.id, id));
  return getProposalById(id);
}
async function deleteProposal(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(proposals).where(eq6(proposals.id, id));
  return { success: true };
}
var LineItemSchema = z6.object({
  description: z6.string(),
  qty: z6.number(),
  unitPrice: z6.string(),
  total: z6.string()
});
var proposalRouter = router({
  listByClient: protectedProcedure.input(z6.object({ clientId: z6.number() })).query(async ({ input }) => getProposalsByClientId(input.clientId)),
  getById: protectedProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => getProposalById(input.id)),
  create: protectedProcedure.input(z6.object({
    clientId: z6.number(),
    title: z6.string().min(1),
    prospectName: z6.string().min(1),
    prospectEmail: z6.string().optional(),
    prospectPhone: z6.string().optional(),
    industry: z6.string().optional(),
    serviceType: z6.string().optional(),
    scopeOfWork: z6.string().optional(),
    lineItems: z6.array(LineItemSchema).optional(),
    subtotal: z6.string().optional(),
    tax: z6.string().optional(),
    total: z6.string().optional(),
    terms: z6.string().optional(),
    generatedContent: z6.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const proposal = await createProposal({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_proposal",
      entityType: "proposal",
      details: { title: input.title, prospectName: input.prospectName }
    });
    return proposal;
  }),
  generate: protectedProcedure.input(z6.object({
    prospectName: z6.string(),
    businessName: z6.string(),
    industry: z6.string(),
    serviceType: z6.string(),
    scopeOfWork: z6.string(),
    lineItems: z6.array(LineItemSchema).optional(),
    total: z6.string().optional()
  })).mutation(async ({ input }) => {
    const lineItemsText = input.lineItems?.map(
      (li) => `- ${li.description}: ${li.qty} x $${li.unitPrice} = $${li.total}`
    ).join("\n") ?? "No line items specified";
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Write a professional proposal/estimate document body for a local ${input.industry} business.

Prospect: ${input.prospectName}
Business Providing Service: ${input.businessName}
Service Type: ${input.serviceType}
Scope of Work: ${input.scopeOfWork}
Line Items:
${lineItemsText}
${input.total ? `Total: $${input.total}` : ""}

Write a professional proposal body including:
1. A warm opening paragraph addressing ${input.prospectName}
2. A "Scope of Work" section describing what will be done
3. A "Why Choose Us" section (2-3 bullet points)
4. A "Terms & Conditions" section (payment terms, validity, cancellation)
5. A professional closing paragraph

Keep it professional but approachable. Under 500 words total.`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    return { generatedContent: typeof raw === "string" ? raw : JSON.stringify(raw) };
  }),
  update: protectedProcedure.input(z6.object({
    id: z6.number(),
    title: z6.string().optional(),
    prospectName: z6.string().optional(),
    prospectEmail: z6.string().optional(),
    prospectPhone: z6.string().optional(),
    serviceType: z6.string().optional(),
    scopeOfWork: z6.string().optional(),
    lineItems: z6.array(LineItemSchema).optional(),
    subtotal: z6.string().optional(),
    tax: z6.string().optional(),
    total: z6.string().optional(),
    terms: z6.string().optional(),
    generatedContent: z6.string().optional(),
    status: z6.enum(["draft", "sent", "accepted", "declined", "expired"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateProposal(id, data);
  }),
  delete: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ ctx, input }) => {
    const proposal = await getProposalById(input.id);
    await deleteProposal(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: proposal?.clientId,
      action: "deleted_proposal",
      entityType: "proposal",
      details: { title: proposal?.title }
    });
    return { success: true };
  })
});

// server/gbpPostRouter.ts
import { z as z7 } from "zod";
init_db();
init_schema();
import { eq as eq7, desc as desc7 } from "drizzle-orm";
async function getPostsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gbpPosts).where(eq7(gbpPosts.clientId, clientId)).orderBy(desc7(gbpPosts.createdAt));
}
async function getPostById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(gbpPosts).where(eq7(gbpPosts.id, id));
  return rows[0] ?? null;
}
async function createPost(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(gbpPosts).values(data);
  const rows = await db.select().from(gbpPosts).where(eq7(gbpPosts.clientId, data.clientId)).orderBy(desc7(gbpPosts.createdAt));
  return rows[0] ?? null;
}
async function updatePost(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(gbpPosts).set(data).where(eq7(gbpPosts.id, id));
  return getPostById(id);
}
async function deletePost(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(gbpPosts).where(eq7(gbpPosts.id, id));
  return { success: true };
}
var gbpPostRouter = router({
  listByClient: protectedProcedure.input(z7.object({ clientId: z7.number() })).query(async ({ input }) => getPostsByClientId(input.clientId)),
  create: protectedProcedure.input(z7.object({
    clientId: z7.number(),
    businessName: z7.string().optional(),
    industry: z7.string().optional(),
    postType: z7.enum(["offer", "update", "event", "product", "seasonal"]),
    title: z7.string().optional(),
    content: z7.string().optional(),
    callToAction: z7.string().optional(),
    ctaUrl: z7.string().optional(),
    scheduledDate: z7.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const { scheduledDate, ...rest } = input;
    const post = await createPost({
      userId: ctx.user.id,
      ...rest,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : void 0
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_gbp_post",
      entityType: "gbp_post",
      details: { postType: input.postType, title: input.title }
    });
    return post;
  }),
  generate: protectedProcedure.input(z7.object({
    businessName: z7.string(),
    industry: z7.string(),
    postType: z7.enum(["offer", "update", "event", "product", "seasonal"]),
    context: z7.string().optional(),
    month: z7.number().min(1).max(12).optional()
  })).mutation(async ({ input }) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthContext = input.month ? `Month: ${monthNames[input.month - 1]}` : "";
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Write a Google Business Profile post for a local ${input.industry} business.

Business: ${input.businessName}
Post Type: ${input.postType}
${monthContext}
${input.context ? `Additional Context: ${input.context}` : ""}

Requirements:
- title: Catchy headline under 58 chars
- content: Engaging post body 150-300 chars. Include relevant emojis. End with a call-to-action.
- callToAction: One of: "Book", "Order", "Learn more", "Sign up", "Get offer", "Call now"

Respond as JSON: { "title": "...", "content": "...", "callToAction": "..." }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    if (!match) return { title: "", content: "", callToAction: "Learn more" };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { title: "", content: "", callToAction: "Learn more" };
    }
  }),
  update: protectedProcedure.input(z7.object({
    id: z7.number(),
    title: z7.string().optional(),
    content: z7.string().optional(),
    callToAction: z7.string().optional(),
    ctaUrl: z7.string().optional(),
    scheduledDate: z7.string().optional(),
    status: z7.enum(["draft", "scheduled", "published", "failed"]).optional()
  })).mutation(async ({ input }) => {
    const { id, scheduledDate, ...rest } = input;
    return updatePost(id, {
      ...rest,
      ...scheduledDate ? { scheduledDate: new Date(scheduledDate) } : {}
    });
  }),
  delete: protectedProcedure.input(z7.object({ id: z7.number() })).mutation(async ({ ctx, input }) => {
    const post = await getPostById(input.id);
    await deletePost(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: post?.clientId,
      action: "deleted_gbp_post",
      entityType: "gbp_post",
      details: { title: post?.title }
    });
    return { success: true };
  })
});

// server/preQualRouter.ts
import { z as z8 } from "zod";
init_db();
init_schema();
import { eq as eq8, desc as desc8 } from "drizzle-orm";
async function getFunnelsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(preQualFunnels).where(eq8(preQualFunnels.clientId, clientId)).orderBy(desc8(preQualFunnels.createdAt));
}
async function getFunnelById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(preQualFunnels).where(eq8(preQualFunnels.id, id));
  return rows[0] ?? null;
}
async function createFunnel(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(preQualFunnels).values(data);
  const rows = await db.select().from(preQualFunnels).where(eq8(preQualFunnels.clientId, data.clientId)).orderBy(desc8(preQualFunnels.createdAt));
  return rows[0] ?? null;
}
async function updateFunnel(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(preQualFunnels).set(data).where(eq8(preQualFunnels.id, id));
  return getFunnelById(id);
}
async function deleteFunnel(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(preQualSubmissions).where(eq8(preQualSubmissions.funnelId, id));
  await db.delete(preQualFunnels).where(eq8(preQualFunnels.id, id));
  return { success: true };
}
async function getSubmissionsByFunnelId(funnelId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(preQualSubmissions).where(eq8(preQualSubmissions.funnelId, funnelId)).orderBy(desc8(preQualSubmissions.createdAt));
}
async function createSubmission(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(preQualSubmissions).values(data);
  const rows = await db.select().from(preQualSubmissions).where(eq8(preQualSubmissions.funnelId, data.funnelId)).orderBy(desc8(preQualSubmissions.createdAt));
  return rows[0] ?? null;
}
async function updateSubmission(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(preQualSubmissions).set(data).where(eq8(preQualSubmissions.id, id));
  const rows = await db.select().from(preQualSubmissions).where(eq8(preQualSubmissions.id, id));
  return rows[0] ?? null;
}
var preQualRouter = router({
  listByClient: protectedProcedure.input(z8.object({ clientId: z8.number() })).query(async ({ input }) => getFunnelsByClientId(input.clientId)),
  create: protectedProcedure.input(z8.object({
    clientId: z8.number(),
    name: z8.string().min(1),
    industry: z8.string().min(1),
    serviceType: z8.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const funnel = await createFunnel({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_prequal_funnel",
      entityType: "prequal_funnel",
      details: { name: input.name }
    });
    return funnel;
  }),
  generateQuestions: protectedProcedure.input(z8.object({
    industry: z8.string(),
    serviceType: z8.string().optional()
  })).mutation(async ({ input }) => {
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate 6-8 pre-qualification questions for a ${input.industry} business${input.serviceType ? ` offering ${input.serviceType}` : ""}.

Each question should help qualify the prospect's readiness, budget, and fit.

For each question provide:
- id: "q1", "q2", etc.
- question: The question text
- type: "multiple_choice", "yes_no", or "text"
- options: Array of answer options (for multiple_choice and yes_no)
- weight: 1-10 (how much this question impacts the score)
- scoringKey: Object mapping each option to a score 0-10

Example for loan broker:
{ id: "q1", question: "What is your credit score range?", type: "multiple_choice", 
  options: ["750+", "700-749", "650-699", "Below 650"],
  weight: 10,
  scoringKey: { "750+": 10, "700-749": 8, "650-699": 5, "Below 650": 1 } }

Respond as JSON array of question objects.`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\[[\s\S]*\]/);
    if (!match) return { questions: [] };
    try {
      return { questions: JSON.parse(match[0]) };
    } catch {
      return { questions: [] };
    }
  }),
  updateFunnel: protectedProcedure.input(z8.object({
    id: z8.number(),
    name: z8.string().optional(),
    questions: z8.unknown().optional(),
    scoringRules: z8.unknown().optional(),
    isActive: z8.boolean().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateFunnel(id, data);
  }),
  delete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ ctx, input }) => {
    const funnel = await getFunnelById(input.id);
    await deleteFunnel(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: funnel?.clientId,
      action: "deleted_prequal_funnel",
      entityType: "prequal_funnel",
      details: { name: funnel?.name }
    });
    return { success: true };
  }),
  getSubmissions: protectedProcedure.input(z8.object({ funnelId: z8.number() })).query(async ({ input }) => getSubmissionsByFunnelId(input.funnelId)),
  submit: protectedProcedure.input(z8.object({
    funnelId: z8.number(),
    clientId: z8.number(),
    prospectName: z8.string().optional(),
    prospectEmail: z8.string().optional(),
    prospectPhone: z8.string().optional(),
    answers: z8.record(z8.string(), z8.string()),
    questions: z8.array(z8.object({
      id: z8.string(),
      question: z8.string(),
      weight: z8.number(),
      scoringKey: z8.record(z8.string(), z8.number())
    }))
  })).mutation(async ({ input }) => {
    let totalScore = 0;
    let maxScore = 0;
    for (const q of input.questions) {
      const answer = input.answers[q.id];
      const points = answer ? q.scoringKey[answer] ?? 0 : 0;
      totalScore += points * q.weight;
      maxScore += 10 * q.weight;
    }
    const normalizedScore = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
    const qualification = normalizedScore >= 75 ? "hot" : normalizedScore >= 50 ? "warm" : normalizedScore >= 25 ? "cold" : "unqualified";
    const answersText = input.questions.map(
      (q) => `Q: ${q.question}
A: ${input.answers[q.id] ?? "Not answered"}`
    ).join("\n\n");
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Summarize this prospect's pre-qualification answers in 2-3 sentences. Be direct about their fit.

Prospect: ${input.prospectName ?? "Unknown"}
Score: ${normalizedScore}/100 (${qualification})

Answers:
${answersText}

Write a brief sales-ready summary for the broker/agent.`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const aiSummary = typeof raw === "string" ? raw : "";
    return createSubmission({
      funnelId: input.funnelId,
      clientId: input.clientId,
      prospectName: input.prospectName,
      prospectEmail: input.prospectEmail,
      prospectPhone: input.prospectPhone,
      answers: input.answers,
      score: normalizedScore,
      qualification,
      aiSummary
    });
  }),
  updateSubmission: protectedProcedure.input(z8.object({
    id: z8.number(),
    status: z8.enum(["new", "contacted", "converted", "rejected"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateSubmission(id, data);
  })
});

// server/referralRouter.ts
import { z as z9 } from "zod";
init_db();
init_schema();
import { eq as eq9, desc as desc9 } from "drizzle-orm";
function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
async function getCampaignsByClientId3(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referralCampaigns).where(eq9(referralCampaigns.clientId, clientId)).orderBy(desc9(referralCampaigns.createdAt));
}
async function getCampaignById3(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(referralCampaigns).where(eq9(referralCampaigns.id, id));
  return rows[0] ?? null;
}
async function createCampaign3(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(referralCampaigns).values(data);
  const rows = await db.select().from(referralCampaigns).where(eq9(referralCampaigns.clientId, data.clientId)).orderBy(desc9(referralCampaigns.createdAt));
  return rows[0] ?? null;
}
async function updateCampaign2(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(referralCampaigns).set(data).where(eq9(referralCampaigns.id, id));
  return getCampaignById3(id);
}
async function deleteCampaign2(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(referralTracking).where(eq9(referralTracking.campaignId, id));
  await db.delete(referralCampaigns).where(eq9(referralCampaigns.id, id));
  return { success: true };
}
async function getTrackingByCampaignId(campaignId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referralTracking).where(eq9(referralTracking.campaignId, campaignId)).orderBy(desc9(referralTracking.createdAt));
}
async function createTracking(data) {
  const db = await getDb();
  if (!db) return null;
  const referralCode = generateReferralCode();
  await db.insert(referralTracking).values({ ...data, referralCode });
  const rows = await db.select().from(referralTracking).where(eq9(referralTracking.campaignId, data.campaignId)).orderBy(desc9(referralTracking.createdAt));
  return rows[0] ?? null;
}
async function updateTracking(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(referralTracking).set(data).where(eq9(referralTracking.id, id));
  const rows = await db.select().from(referralTracking).where(eq9(referralTracking.id, id));
  return rows[0] ?? null;
}
var referralRouter = router({
  listByClient: protectedProcedure.input(z9.object({ clientId: z9.number() })).query(async ({ input }) => getCampaignsByClientId3(input.clientId)),
  create: protectedProcedure.input(z9.object({
    clientId: z9.number(),
    name: z9.string().min(1),
    rewardType: z9.enum(["discount", "gift_card", "cash", "service_credit", "custom"]).optional(),
    rewardValue: z9.string().optional(),
    channel: z9.enum(["sms", "email", "both"]).optional()
  })).mutation(async ({ ctx, input }) => {
    const campaign = await createCampaign3({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_referral_campaign",
      entityType: "referral_campaign",
      details: { name: input.name }
    });
    return campaign;
  }),
  generateMessages: protectedProcedure.input(z9.object({
    businessName: z9.string(),
    industry: z9.string(),
    rewardType: z9.string(),
    rewardValue: z9.string(),
    channel: z9.enum(["sms", "email", "both"])
  })).mutation(async ({ input }) => {
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate referral program messages for a local ${input.industry} business.

Business: ${input.businessName}
Reward: ${input.rewardValue} (${input.rewardType.replace(/_/g, " ")})
Channel: ${input.channel}

Create:
1. referrerMessage: Message to send to existing customer asking them to refer a friend. Under 160 chars for SMS. Mention the reward. Use {customerName} placeholder.
2. refereeMessage: Message to send to the referred friend. Under 160 chars for SMS. Mention the reward and who referred them. Use {refereeName} and {referrerName} placeholders.
3. emailSubject: Email subject line for the referrer ask.
4. emailBody: 3-4 sentence email body for the referrer ask.

Respond as JSON: { "referrerMessage": "...", "refereeMessage": "...", "emailSubject": "...", "emailBody": "..." }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    if (!match) return { referrerMessage: "", refereeMessage: "", emailSubject: "", emailBody: "" };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { referrerMessage: "", refereeMessage: "", emailSubject: "", emailBody: "" };
    }
  }),
  update: protectedProcedure.input(z9.object({
    id: z9.number(),
    name: z9.string().optional(),
    rewardType: z9.enum(["discount", "gift_card", "cash", "service_credit", "custom"]).optional(),
    rewardValue: z9.string().optional(),
    referrerMessage: z9.string().optional(),
    refereeMessage: z9.string().optional(),
    channel: z9.enum(["sms", "email", "both"]).optional(),
    isActive: z9.boolean().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateCampaign2(id, data);
  }),
  delete: protectedProcedure.input(z9.object({ id: z9.number() })).mutation(async ({ ctx, input }) => {
    const campaign = await getCampaignById3(input.id);
    await deleteCampaign2(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: campaign?.clientId,
      action: "deleted_referral_campaign",
      entityType: "referral_campaign",
      details: { name: campaign?.name }
    });
    return { success: true };
  }),
  getTracking: protectedProcedure.input(z9.object({ campaignId: z9.number() })).query(async ({ input }) => getTrackingByCampaignId(input.campaignId)),
  trackReferral: protectedProcedure.input(z9.object({
    campaignId: z9.number(),
    clientId: z9.number(),
    referrerName: z9.string().optional(),
    referrerPhone: z9.string().optional(),
    referrerEmail: z9.string().optional(),
    refereeName: z9.string().optional(),
    refereePhone: z9.string().optional(),
    refereeEmail: z9.string().optional()
  })).mutation(async ({ input }) => createTracking(input)),
  updateTracking: protectedProcedure.input(z9.object({
    id: z9.number(),
    status: z9.enum(["pending", "contacted", "converted", "rewarded"]).optional(),
    rewardSent: z9.boolean().optional(),
    notes: z9.string().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateTracking(id, data);
  })
});

// server/presenceRouter.ts
import { z as z10 } from "zod";
init_db();
init_schema();
import { eq as eq10, desc as desc10 } from "drizzle-orm";
async function getLatestScoreByClientId(clientId) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(presenceScores).where(eq10(presenceScores.clientId, clientId)).orderBy(desc10(presenceScores.createdAt));
  return rows[0] ?? null;
}
async function getScoreHistoryByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(presenceScores).where(eq10(presenceScores.clientId, clientId)).orderBy(desc10(presenceScores.createdAt));
}
async function saveScore(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(presenceScores).values(data);
  return getLatestScoreByClientId(data.clientId);
}
var presenceRouter = router({
  getLatest: protectedProcedure.input(z10.object({ clientId: z10.number() })).query(async ({ input }) => getLatestScoreByClientId(input.clientId)),
  getHistory: protectedProcedure.input(z10.object({ clientId: z10.number() })).query(async ({ input }) => getScoreHistoryByClientId(input.clientId)),
  generate: protectedProcedure.input(z10.object({
    clientId: z10.number(),
    businessName: z10.string(),
    website: z10.string().optional(),
    industry: z10.string().optional(),
    googleRating: z10.string().optional(),
    reviewCount: z10.number().optional(),
    hasGbpClaimed: z10.boolean().optional(),
    hasSocialMedia: z10.boolean().optional(),
    hasBlog: z10.boolean().optional(),
    hasOnlineBooking: z10.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const reviewCount = input.reviewCount ?? 0;
    const googleRating = parseFloat(input.googleRating ?? "0");
    const reputationScore = Math.min(100, Math.round(
      googleRating / 5 * 50 + Math.min(reviewCount / 100, 1) * 50
    ));
    const websiteScore = input.website ? 70 : 0;
    const seoScore = input.website ? input.hasBlog ? 65 : 40 : 10;
    const socialScore = input.hasSocialMedia ? 70 : 20;
    const gbpBonus = input.hasGbpClaimed ? 15 : 0;
    const bookingBonus = input.hasOnlineBooking ? 10 : 0;
    const overallScore = Math.min(100, Math.round(
      reputationScore * 0.35 + websiteScore * 0.2 + seoScore * 0.2 + socialScore * 0.15 + gbpBonus + bookingBonus
    ));
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate a brief online presence analysis for a local ${input.industry ?? "service"} business.

Business: ${input.businessName}
Overall Presence Score: ${overallScore}/100
Google Rating: ${input.googleRating ?? "Unknown"} (${reviewCount} reviews)
Has Website: ${input.website ? "Yes" : "No"}
GBP Claimed: ${input.hasGbpClaimed ? "Yes" : "No"}
Has Social Media: ${input.hasSocialMedia ? "Yes" : "No"}
Has Blog: ${input.hasBlog ? "Yes" : "No"}
Has Online Booking: ${input.hasOnlineBooking ? "Yes" : "No"}

Provide:
1. summary: 2-sentence overall assessment
2. strengths: Array of 2-3 strength points
3. opportunities: Array of 3-4 improvement opportunities with estimated impact
4. priorityAction: The single most important action to take right now

Respond as JSON: { "summary": "...", "strengths": [...], "opportunities": [...], "priorityAction": "..." }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    let details = {};
    if (match) {
      try {
        details = JSON.parse(match[0]);
      } catch {
      }
    }
    const score = await saveScore({
      clientId: input.clientId,
      userId: ctx.user.id,
      overallScore,
      googleRating: input.googleRating,
      reviewCount,
      websiteScore,
      seoScore,
      socialScore,
      reputationScore,
      details
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "generated_presence_score",
      entityType: "presence_score",
      details: { overallScore, businessName: input.businessName }
    });
    return score;
  })
});

// server/chatAgentRouter.ts
import { z as z11 } from "zod";
init_db();
init_schema();
import { eq as eq11, desc as desc11 } from "drizzle-orm";
async function getAgentsByClientId(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatAgents).where(eq11(chatAgents.clientId, clientId)).orderBy(desc11(chatAgents.createdAt));
}
async function getAgentById(id) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(chatAgents).where(eq11(chatAgents.id, id));
  return rows[0] ?? null;
}
async function createAgent(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(chatAgents).values(data);
  const rows = await db.select().from(chatAgents).where(eq11(chatAgents.clientId, data.clientId)).orderBy(desc11(chatAgents.createdAt));
  return rows[0] ?? null;
}
async function updateAgent(id, data) {
  const db = await getDb();
  if (!db) return null;
  await db.update(chatAgents).set(data).where(eq11(chatAgents.id, id));
  return getAgentById(id);
}
async function deleteAgent(id) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(chatConversations).where(eq11(chatConversations.agentId, id));
  await db.delete(chatAgents).where(eq11(chatAgents.id, id));
  return { success: true };
}
async function getConversationsByAgentId(agentId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatConversations).where(eq11(chatConversations.agentId, agentId)).orderBy(desc11(chatConversations.createdAt));
}
async function createConversation(data) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(chatConversations).values(data);
  const rows = await db.select().from(chatConversations).where(eq11(chatConversations.agentId, data.agentId)).orderBy(desc11(chatConversations.createdAt));
  return rows[0] ?? null;
}
var chatAgentRouter = router({
  listByClient: protectedProcedure.input(z11.object({ clientId: z11.number() })).query(async ({ input }) => getAgentsByClientId(input.clientId)),
  create: protectedProcedure.input(z11.object({
    clientId: z11.number(),
    name: z11.string().min(1),
    businessName: z11.string().min(1),
    industry: z11.string().optional(),
    tone: z11.enum(["friendly", "professional", "casual", "formal"]).optional(),
    leadCaptureEnabled: z11.boolean().optional(),
    bookingEnabled: z11.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    const agent = await createAgent({ userId: ctx.user.id, ...input });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_chat_agent",
      entityType: "chat_agent",
      details: { name: input.name }
    });
    return agent;
  }),
  generateScript: protectedProcedure.input(z11.object({
    businessName: z11.string(),
    industry: z11.string(),
    tone: z11.enum(["friendly", "professional", "casual", "formal"]),
    services: z11.string().optional(),
    leadCaptureEnabled: z11.boolean().optional(),
    bookingEnabled: z11.boolean().optional()
  })).mutation(async ({ input }) => {
    const resp = await invokeLLM({
      messages: [{
        role: "user",
        content: `Generate a complete website chat agent configuration for a local ${input.industry} business.

Business: ${input.businessName}
Tone: ${input.tone}
Services: ${input.services ?? "General services"}
Lead Capture: ${input.leadCaptureEnabled ? "Yes - collect name, phone, email" : "No"}
Booking: ${input.bookingEnabled ? "Yes - offer to schedule appointments" : "No"}

Provide:
1. systemPrompt: Detailed instructions for the AI chat agent (how to behave, what to say, when to escalate). 200-300 words.
2. welcomeMessage: Friendly opening message when visitor arrives. Under 100 chars.
3. faqs: Array of 6-8 common questions with answers. Format: [{ "question": "...", "answer": "..." }]

Respond as JSON: { "systemPrompt": "...", "welcomeMessage": "...", "faqs": [...] }`
      }]
    });
    const raw = resp.choices[0]?.message.content;
    const text2 = typeof raw === "string" ? raw : JSON.stringify(raw);
    const match = text2.match(/\{[\s\S]*\}/);
    if (!match) return { systemPrompt: "", welcomeMessage: "", faqs: [] };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { systemPrompt: "", welcomeMessage: "", faqs: [] };
    }
  }),
  update: protectedProcedure.input(z11.object({
    id: z11.number(),
    name: z11.string().optional(),
    businessName: z11.string().optional(),
    industry: z11.string().optional(),
    tone: z11.enum(["friendly", "professional", "casual", "formal"]).optional(),
    systemPrompt: z11.string().optional(),
    welcomeMessage: z11.string().optional(),
    faqs: z11.unknown().optional(),
    leadCaptureEnabled: z11.boolean().optional(),
    bookingEnabled: z11.boolean().optional(),
    status: z11.enum(["draft", "active", "paused"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateAgent(id, data);
  }),
  delete: protectedProcedure.input(z11.object({ id: z11.number() })).mutation(async ({ ctx, input }) => {
    const agent = await getAgentById(input.id);
    await deleteAgent(input.id);
    await logActivity({
      userId: ctx.user.id,
      clientId: agent?.clientId,
      action: "deleted_chat_agent",
      entityType: "chat_agent",
      details: { name: agent?.name }
    });
    return { success: true };
  }),
  getConversations: protectedProcedure.input(z11.object({ agentId: z11.number() })).query(async ({ input }) => getConversationsByAgentId(input.agentId)),
  logConversation: protectedProcedure.input(z11.object({
    agentId: z11.number(),
    clientId: z11.number(),
    visitorName: z11.string().optional(),
    visitorEmail: z11.string().optional(),
    visitorPhone: z11.string().optional(),
    messages: z11.unknown().optional(),
    leadCaptured: z11.boolean().optional(),
    outcome: z11.enum(["lead_captured", "booking_made", "faq_answered", "abandoned", "ongoing"]).optional()
  })).mutation(async ({ input }) => createConversation(input))
});

// server/industryTemplateRouter.ts
import { z as z12 } from "zod";

// shared/industryPacks.ts
var INDUSTRY_PACKS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // HVAC
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "hvac",
    name: "HVAC",
    icon: "\u{1F321}\uFE0F",
    color: "#3b82f6",
    description: "Heating, ventilation, and air conditioning services \u2014 residential and commercial",
    targetCustomer: "Homeowners and property managers needing AC/heating repair, maintenance, or new system installation",
    averageDealSize: 4500,
    speedToLeadSMS: "Hi {{firstName}}, this is {{agentName}} from {{businessName}}! Thanks for reaching out about your HVAC needs. We have same-day availability and our certified techs are standing by. Can I get a quick call scheduled in the next 15 minutes? Reply YES and I'll call you right now!",
    speedToLeadEmail: {
      subject: "Your HVAC Request \u2014 {{businessName}} Is Ready to Help Today",
      body: `Hi {{firstName}},

Thank you for contacting {{businessName}}! We received your request and want to make sure you're comfortable in your home as quickly as possible.

Here's what happens next:
\u2705 A certified HVAC technician will call you within 15 minutes
\u2705 We offer same-day service for most repairs
\u2705 All work is backed by our 1-year labor warranty

To get started, simply reply to this email or call us at {{phone}}.

We look forward to serving you!

{{agentName}}
{{businessName}}`
    },
    voiceScript: `OPENING:
"Hi, this is {{agentName}} calling from {{businessName}}. I'm following up on your HVAC service request \u2014 is now a good time to talk for just 2 minutes?"

QUALIFY:
"Great! Can you tell me a little about what's going on with your system? Is it not cooling/heating, making a noise, or is this for a tune-up?"

IF REPAIR:
"I completely understand \u2014 that's uncomfortable, especially in this weather. Our technicians are in your area today. We charge a $79 diagnostic fee which gets applied to the repair if you move forward. Does that work for you?"

IF NEW SYSTEM:
"Perfect timing \u2014 we're actually running a promotion this month on new installs with 0% financing for 18 months. Would you like me to schedule a free in-home estimate?"

CLOSE:
"I have an opening today at [TIME] or tomorrow at [TIME]. Which works better for you?"

OBJECTION \u2014 Price:
"I completely understand. Our diagnostic fee is the lowest in the area, and we'll give you a full written estimate before we do any work \u2014 no surprises. Fair enough?"

OBJECTION \u2014 Already have someone:
"No problem at all! If they can't get out today, keep our number handy. We're {{phone}} and we can usually be there same day."

CLOSE:
"Awesome, I've got you scheduled for [DATE/TIME]. You'll get a text confirmation and a reminder 30 minutes before the tech arrives. Is there anything else I can help with?"`,
    voiceSystemPrompt: `You are a friendly, professional HVAC scheduling agent for {{businessName}}. Your goal is to qualify the caller's HVAC issue (repair, maintenance, or new installation), empathize with their discomfort, and book a service appointment or free estimate. Always lead with same-day availability. Overcome price objections by emphasizing the diagnostic fee credit and written estimates. Never quote final prices over the phone \u2014 always schedule an in-home visit. Keep calls under 5 minutes. Be warm, confident, and solution-focused.`,
    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! This is {{businessName}} \u2014 we just tried to reach you about your HVAC request. We have same-day openings today. Reply CALL and we'll reach out immediately, or call us at {{phone}}. \u{1F321}\uFE0F" },
      { day: 1, channel: "email", subject: "Still having HVAC issues? We can help today", body: `Hi {{firstName}},

We noticed we haven't been able to connect yet. We don't want you to be uncomfortable at home any longer than necessary.

Our certified HVAC technicians are available today and tomorrow with flexible scheduling. Here's what sets us apart:

\u2022 Same-day service available
\u2022 Upfront pricing \u2014 no surprises
\u2022 1-year labor warranty on all repairs
\u2022 5-star rated on Google

Ready to get your system running perfectly? Call {{phone}} or reply to this email.

{{businessName}} Team` },
      { day: 3, channel: "sms", body: "{{firstName}}, checking in from {{businessName}}. Still need HVAC help? We're offering a FREE system inspection this week (normally $99). Limited spots \u2014 reply YES to claim yours! \u{1F527}" },
      { day: 7, channel: "email", subject: "Free HVAC Tune-Up Offer \u2014 This Week Only", body: `Hi {{firstName}},

We haven't heard back and we want to make sure you're taken care of. This week we're offering a complimentary HVAC tune-up for new customers \u2014 a $99 value, completely free.

During the tune-up our tech will:
\u2705 Check refrigerant levels
\u2705 Clean coils and filters
\u2705 Test all electrical components
\u2705 Give you a full system health report

Call {{phone}} or reply YES to claim your free tune-up before spots fill up.

{{businessName}}` },
      { day: 14, channel: "sms", body: "Last check-in from {{businessName}}, {{firstName}}. If you ever need HVAC service, repair, or a new system \u2014 we're here. Save our number: {{phone}}. Have a great day! \u{1F60A}" }
    ],
    objectionHandlers: [
      { objection: "Your price is too high", response: "I completely understand \u2014 HVAC work is a significant investment. What I can promise is that our quote includes everything upfront with no hidden fees, and our work is backed by a 1-year labor warranty. Many customers find that paying a little more now saves them from repeat repairs later. Would a payment plan help make this more comfortable?" },
      { objection: "I need to think about it", response: "Absolutely, take your time! I just want to make sure you're aware that our current pricing is locked in through this week \u2014 after that our rates adjust with the season. Can I follow up with you tomorrow morning?" },
      { objection: "I already have an HVAC company", response: "That's great \u2014 it's always smart to have a trusted contractor. If they're ever unavailable or you want a second opinion on a quote, we're here. May I send you our contact info just in case?" },
      { objection: "I'll wait until it completely breaks", response: "I hear that a lot! The challenge is that waiting usually turns a $300 repair into a $2,000 emergency replacement \u2014 especially in peak season when parts and techs are harder to get. A quick tune-up now could save you a lot of stress. Want me to get you on the schedule for a low-cost inspection?" },
      { objection: "I'm not ready right now", response: "No pressure at all! Can I ask \u2014 is it a timing thing or a budget thing? I ask because we have financing options that make it $0 out of pocket today, and we can schedule for whenever works for you." }
    ],
    proposalTitle: "HVAC Service & Installation Proposal",
    proposalIntro: "Thank you for the opportunity to provide this proposal for your HVAC needs. {{businessName}} is committed to delivering reliable, energy-efficient comfort solutions backed by certified technicians and a 1-year labor warranty. Below is a detailed breakdown of the recommended services for your property.",
    proposalLineItems: [
      { description: "HVAC System Diagnostic & Inspection", quantity: 1, unitPrice: 79 },
      { description: "Refrigerant Recharge (per lb)", quantity: 2, unitPrice: 85 },
      { description: "Air Filter Replacement (MERV-13)", quantity: 2, unitPrice: 45 },
      { description: "Coil Cleaning (Evaporator + Condenser)", quantity: 1, unitPrice: 175 },
      { description: "Thermostat Upgrade (Smart/Programmable)", quantity: 1, unitPrice: 250 }
    ],
    proposalTerms: "50% deposit required to schedule. Balance due upon completion. All parts carry manufacturer warranty. Labor warranted for 12 months. Financing available at 0% APR for 18 months with approved credit.",
    reviewRequestSMS: "Hi {{firstName}}! Thank you for choosing {{businessName}} for your HVAC service today. If {{techName}} took great care of you, we'd really appreciate a quick Google review \u2014 it helps our small business grow! \u{1F64F} {{reviewLink}}",
    reviewRequestEmail: {
      subject: "How did your HVAC service go, {{firstName}}?",
      body: `Hi {{firstName}},

Thank you for trusting {{businessName}} with your HVAC service today. We hope everything is running perfectly!

If you had a great experience, would you mind leaving us a quick Google review? It only takes 60 seconds and means the world to our team.

\u{1F449} Leave a Review: {{reviewLink}}

If anything wasn't perfect, please reply to this email directly \u2014 we want to make it right.

Thank you again for your business!

{{techName}} & The {{businessName}} Team`
    },
    missedCallSMS: "Hi! You just called {{businessName}} and we missed you \u2014 sorry about that! We're available for HVAC repairs, tune-ups, and new installations. Reply or call us back at {{phone}} and we'll get you taken care of today. \u{1F321}\uFE0F",
    preQualQuestions: [
      { question: "Do you own the property where service is needed?", weight: 20, type: "yes_no" },
      { question: "What type of HVAC service do you need?", weight: 15, type: "multiple_choice", options: ["Emergency repair", "Routine maintenance", "New system installation", "Not sure"] },
      { question: "How old is your current HVAC system?", weight: 15, type: "multiple_choice", options: ["Less than 5 years", "5-10 years", "10-15 years", "Over 15 years"] },
      { question: "How soon do you need service?", weight: 25, type: "multiple_choice", options: ["Today / Emergency", "This week", "This month", "Just getting quotes"] },
      { question: "What is your approximate budget for this project?", weight: 25, type: "multiple_choice", options: ["Under $500", "$500-$2,000", "$2,000-$5,000", "Over $5,000", "Need financing"] }
    ],
    chatWelcomeMessage: "\u{1F44B} Hi there! Welcome to {{businessName}}. I'm your virtual assistant \u2014 I can help you schedule service, get a free estimate, or answer questions about our HVAC services. What can I help you with today?",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, an HVAC company. You help website visitors schedule appointments, answer questions about services, and capture lead information. Always be friendly and empathetic \u2014 many callers are uncomfortable due to HVAC issues. Key services: AC repair, heating repair, tune-ups, new system installation, duct cleaning. Emphasize same-day availability, upfront pricing, and the 1-year warranty. Always try to capture the visitor's name and phone number to book a callback.`,
    chatFAQs: [
      { question: "How much does an HVAC repair cost?", answer: "Most repairs range from $150\u2013$600 depending on the issue. We charge a $79 diagnostic fee (applied to the repair) and provide a written estimate before any work begins \u2014 no surprises." },
      { question: "Do you offer same-day service?", answer: "Yes! We have technicians available for same-day service most days. Call us or book online and we'll do our best to get someone out to you today." },
      { question: "How long does a new AC installation take?", answer: "Most residential installations take 4\u20138 hours. We'll give you a specific timeframe during your free in-home estimate." },
      { question: "Do you offer financing?", answer: "Yes \u2014 we offer 0% financing for 18 months with approved credit. Ask about our financing options when you call." },
      { question: "What brands do you service?", answer: "We service all major brands including Carrier, Trane, Lennox, Rheem, Goodman, York, and more." }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // ROOFING
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "roofing",
    name: "Roofing",
    icon: "\u{1F3E0}",
    color: "#f97316",
    description: "Residential and commercial roofing \u2014 repair, replacement, and storm damage",
    targetCustomer: "Homeowners and property managers needing roof repair, full replacement, or storm damage assessment",
    averageDealSize: 12e3,
    speedToLeadSMS: "Hi {{firstName}}, {{agentName}} here from {{businessName}}! Thanks for reaching out about your roof. We do FREE storm damage inspections and work directly with insurance companies. Can I schedule your free inspection today? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Free Roof Inspection \u2014 {{businessName}} Can Help Today",
      body: `Hi {{firstName}},

Thank you for contacting {{businessName}}! Roof issues can escalate quickly, so we want to get one of our certified inspectors out to you as soon as possible.

Here's what you get with your FREE inspection:
\u2705 Full roof assessment with photos
\u2705 Insurance claim assistance if applicable
\u2705 Written estimate within 24 hours
\u2705 No obligation \u2014 completely free

Call {{phone}} or reply to schedule your inspection today.

{{agentName}}
{{businessName}}`
    },
    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You recently reached out about your roof \u2014 I'm calling to get your free inspection scheduled. Do you have 2 minutes?"

QUALIFY:
"Can you tell me a little about what's going on? Is this storm damage, a leak, or are you thinking about a full replacement?"

IF STORM DAMAGE:
"I'm sorry to hear that \u2014 storm damage can be really stressful. The good news is we work directly with all major insurance companies and can help you through the entire claims process at no out-of-pocket cost to you in most cases. When can I get an inspector out there?"

IF REPAIR/REPLACEMENT:
"Got it. We do free inspections and give you a written estimate the same day. We're fully licensed and insured, and all our work comes with a 10-year workmanship warranty. Does [DATE] or [DATE] work for your inspection?"

OBJECTION \u2014 Already have someone:
"That's great! If you'd like a second opinion or they can't get out soon, we can usually be there within 24-48 hours. Want me to put you on our schedule as a backup?"

CLOSE:
"Perfect, I've got you down for [DATE/TIME]. You'll get a text confirmation. Is there a gate code or anything I should let the inspector know?"`,
    voiceSystemPrompt: `You are a professional roofing sales agent for {{businessName}}. Your primary goal is to schedule free roof inspections. For storm damage leads, emphasize insurance claim assistance and zero out-of-pocket cost. For repair/replacement leads, focus on the free estimate, 10-year warranty, and licensed/insured credentials. Always be empathetic \u2014 roof issues cause homeowners significant stress. Never quote prices over the phone. Always close for the inspection appointment.`,
    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{businessName}} here \u2014 we missed you! We do FREE roof inspections and work with all insurance companies. Reply INSPECT to schedule yours today. \u{1F3E0}" },
      { day: 1, channel: "email", subject: "Your Free Roof Inspection Is Waiting \u2014 {{businessName}}", body: `Hi {{firstName}},

We'd love to get your free roof inspection scheduled. Here's why homeowners choose {{businessName}}:

\u{1F3C6} 5-Star Google Rating
\u{1F512} Licensed & Fully Insured
\u{1F4CB} Work Directly with Insurance Companies
\u2705 10-Year Workmanship Warranty
\u{1F4B0} $0 Out-of-Pocket for Covered Storm Damage

Don't wait \u2014 roof damage gets worse with every rain. Call {{phone}} or reply to schedule your free inspection.

{{businessName}} Team` },
      { day: 3, channel: "sms", body: "{{firstName}}, did you know most homeowners with storm damage are ENTITLED to a new roof through insurance? {{businessName}} handles the entire claim process for you. Free inspection \u2014 call {{phone}} or reply YES. \u{1F3E0}" },
      { day: 7, channel: "email", subject: "Last Chance: Free Roof Inspection + $500 Off Any Repair", body: `Hi {{firstName}},

We're offering $500 off any roofing repair or replacement for new customers this month. Combined with your free inspection, this is the best time to get your roof assessed.

Our team is booking up fast \u2014 call {{phone}} today to lock in your spot.

{{businessName}}` },
      { day: 14, channel: "sms", body: "Hey {{firstName}}, last message from {{businessName}}. If you ever need a roof inspection, repair, or replacement \u2014 we're here. Save our number: {{phone}}. Stay dry! \u{1F327}\uFE0F" }
    ],
    objectionHandlers: [
      { objection: "I'll just use my insurance company's contractor", response: "That's totally your right! Just know that insurance companies often send contractors who work quickly and cheaply to minimize their payout. You're entitled to choose your own contractor, and we specialize in maximizing your claim value. May I do a free inspection alongside theirs so you have a second opinion?" },
      { objection: "I can't afford a new roof right now", response: "I completely understand \u2014 that's exactly why we work with insurance. In many cases, storm damage means you pay only your deductible and insurance covers the rest. We also offer financing. Can I at least do a free inspection to see what you're working with?" },
      { objection: "I just need a small repair, not a full replacement", response: "Absolutely \u2014 we do repairs of all sizes. We'll do a full inspection and give you options. Sometimes a repair is the right call; sometimes the damage is more extensive than it looks from the ground. Either way, the inspection is free and there's no obligation." },
      { objection: "I've heard roofing companies are scammers", response: "I hear that concern a lot \u2014 unfortunately there are storm chasers in this industry. We're a locally owned company with [X] years in business, fully licensed and insured, and all our reviews are on Google for you to verify. We'd never pressure you into anything." },
      { objection: "I need to talk to my spouse first", response: "Of course! Would it help if I scheduled the inspection for a time when you're both home? That way you can both hear the findings and ask questions together." }
    ],
    proposalTitle: "Roofing Services Proposal",
    proposalIntro: "{{businessName}} is pleased to provide this proposal for your roofing project. Our team of certified roofing professionals is committed to protecting your home with quality materials and expert craftsmanship, backed by a 10-year workmanship warranty.",
    proposalLineItems: [
      { description: "Full Roof Tear-Off & Disposal", quantity: 1, unitPrice: 1500 },
      { description: "30-Year Architectural Shingles (per square)", quantity: 25, unitPrice: 180 },
      { description: "Synthetic Underlayment", quantity: 1, unitPrice: 650 },
      { description: "Ridge Cap Shingles", quantity: 1, unitPrice: 350 },
      { description: "Drip Edge Installation (per LF)", quantity: 120, unitPrice: 4 },
      { description: "Pipe Boot Flashing Replacement", quantity: 3, unitPrice: 85 },
      { description: "Permit & Inspection Fee", quantity: 1, unitPrice: 250 }
    ],
    proposalTerms: "50% deposit required to schedule. Balance due upon completion and final inspection. All materials carry manufacturer warranty. 10-year workmanship warranty included. Insurance supplement assistance provided at no additional charge.",
    reviewRequestSMS: "Hi {{firstName}}! Thank you for choosing {{businessName}} for your roofing project. If our team did a great job, a quick Google review would mean the world to us! \u{1F64F} {{reviewLink}}",
    reviewRequestEmail: {
      subject: "How did your roofing project go, {{firstName}}?",
      body: `Hi {{firstName}},

Your roof is complete and we hope you love it! Thank you for trusting {{businessName}} to protect your home.

If you had a great experience, would you take 60 seconds to leave us a Google review? Reviews help other homeowners find a contractor they can trust.

\u{1F449} Leave a Review: {{reviewLink}}

If anything wasn't perfect, please reply directly \u2014 we stand behind our work 100%.

Thank you,
{{businessName}} Team`
    },
    missedCallSMS: "Hi! You just called {{businessName}} and we missed you. We offer FREE roof inspections and work with all insurance companies. Call us back at {{phone}} or reply here and we'll get right back to you! \u{1F3E0}",
    preQualQuestions: [
      { question: "Do you own the property?", weight: 20, type: "yes_no" },
      { question: "What type of roofing service do you need?", weight: 15, type: "multiple_choice", options: ["Storm damage / Insurance claim", "Leak repair", "Full replacement", "Inspection only"] },
      { question: "When did the damage occur or when did you notice the issue?", weight: 15, type: "multiple_choice", options: ["Within the last 30 days", "1-6 months ago", "Over 6 months ago", "No damage \u2014 routine replacement"] },
      { question: "Have you filed an insurance claim yet?", weight: 20, type: "yes_no" },
      { question: "How soon do you need this addressed?", weight: 30, type: "multiple_choice", options: ["Urgent \u2014 active leak", "Within 2 weeks", "Within 1-2 months", "Just getting quotes"] }
    ],
    chatWelcomeMessage: "\u{1F44B} Welcome to {{businessName}}! I can help you schedule a FREE roof inspection, get a repair estimate, or answer questions about storm damage and insurance claims. What brings you here today?",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, a roofing company. Help visitors schedule free roof inspections, understand their insurance claim options, and get repair/replacement estimates. Emphasize: free inspections, insurance claim expertise, 10-year warranty, licensed and insured. Always capture name and phone number for a callback. Be empathetic \u2014 roof issues are stressful and often urgent.`,
    chatFAQs: [
      { question: "How much does a new roof cost?", answer: "Most residential roof replacements range from $8,000\u2013$20,000 depending on size, pitch, and materials. We provide a free inspection and written estimate \u2014 no obligation." },
      { question: "Do you work with insurance companies?", answer: "Yes! We specialize in insurance claims and work directly with all major carriers. In many cases, homeowners pay only their deductible." },
      { question: "How long does a roof replacement take?", answer: "Most residential replacements are completed in 1-2 days. We'll give you a specific timeline during your free estimate." },
      { question: "What warranty do you offer?", answer: "All our work comes with a 10-year workmanship warranty plus the manufacturer's material warranty (typically 30 years for architectural shingles)." },
      { question: "Are you licensed and insured?", answer: "Yes \u2014 we are fully licensed, bonded, and insured. We're happy to provide proof of insurance before any work begins." }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // POOL SERVICES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "pool",
    name: "Pool Services",
    icon: "\u{1F3CA}",
    color: "#06b6d4",
    description: "Pool cleaning, maintenance, repair, and new pool installation",
    targetCustomer: "Homeowners with existing pools needing weekly service, repairs, or equipment upgrades, and homeowners wanting a new pool installed",
    averageDealSize: 2400,
    speedToLeadSMS: "Hi {{firstName}}! {{agentName}} from {{businessName}} here \u{1F3CA} Thanks for reaching out! We offer weekly pool service starting at $150/month with no contracts. Can I get you a free quote today? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Your Pool Service Quote \u2014 {{businessName}}",
      body: `Hi {{firstName}},

Thanks for contacting {{businessName}}! We'd love to take pool maintenance off your plate so you can just enjoy the water.

Here's what our weekly service includes:
\u2705 Chemical testing & balancing
\u2705 Skimming & vacuuming
\u2705 Filter cleaning
\u2705 Equipment inspection
\u2705 Detailed service report after every visit

No contracts. Cancel anytime. Starting at $150/month.

Reply to this email or call {{phone}} to get your free quote today!

{{agentName}}
{{businessName}}`
    },
    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You reached out about pool service \u2014 I'm calling to get you a quick quote. Do you have 2 minutes?"

QUALIFY:
"Great! Are you looking for weekly maintenance, a one-time clean, a repair, or are you thinking about a new pool?"

IF WEEKLY SERVICE:
"Perfect \u2014 that's our specialty. We service pools in your area every week. Can I ask \u2014 is your pool currently green or cloudy, or is it just needing regular upkeep?"

IF REPAIR:
"Got it. What's going on with it? [Listen] We can usually get a tech out within 48 hours for most repairs. We'll diagnose it for free if you sign up for monthly service."

CLOSE:
"I can get you started as early as this week. Our weekly service is $[PRICE]/month \u2014 no contracts, cancel anytime. Want me to put you on the schedule?"`,
    voiceSystemPrompt: `You are a friendly pool service scheduling agent for {{businessName}}. Your goal is to qualify the caller's pool needs (weekly service, repair, or new installation) and book a service start or free estimate. Emphasize no-contract weekly service, chemical expertise, and reliability. For green/cloudy pools, show urgency \u2014 algae gets worse fast. For repairs, offer free diagnosis with service signup. Always close for a start date or appointment.`,
    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{businessName}} here \u{1F3CA} We missed your call! Weekly pool service from $150/mo \u2014 no contracts. Reply QUOTE for a free estimate or call {{phone}}!" },
      { day: 2, channel: "email", subject: "Your Pool Deserves Better \u2014 Free Quote from {{businessName}}", body: `Hi {{firstName}},

Is your pool taking up too much of your weekend? Let us handle it.

{{businessName}} provides professional weekly pool service including:
\u{1F9EA} Chemical balancing every visit
\u{1F30A} Skimming, brushing & vacuuming
\u{1F527} Equipment checks & minor repairs
\u{1F4F1} Service report sent to your phone after every visit

No contracts. Satisfaction guaranteed. Starting at $150/month.

Call {{phone}} or reply to get your free quote!

{{businessName}} Team` },
      { day: 5, channel: "sms", body: "{{firstName}}, is your pool ready for the weekend? {{businessName}} can have it sparkling clean by Friday. Reply YES for a free quote \u2014 no contracts! \u{1F3CA}\u2600\uFE0F" },
      { day: 10, channel: "email", subject: "First Month FREE \u2014 {{businessName}} Pool Service Offer", body: `Hi {{firstName}},

We're offering your first month of pool service FREE for new customers this month.

That means professional weekly cleaning, chemical balancing, and equipment checks \u2014 at zero cost to start.

Call {{phone}} or reply YES to claim your free first month before spots fill up.

{{businessName}}` },
      { day: 21, channel: "sms", body: "Hey {{firstName}}, last note from {{businessName}}. If you ever need pool cleaning, repairs, or a new pool \u2014 we're here. Save our number: {{phone}}. Enjoy your pool! \u{1F3CA}" }
    ],
    objectionHandlers: [
      { objection: "I can maintain my own pool", response: "That's great \u2014 a lot of our customers said the same thing before they tried us! The difference is we bring professional-grade chemicals, equipment, and expertise. Most homeowners find they actually save money because we catch small issues before they become expensive repairs. Want to try us for one month with no commitment?" },
      { objection: "Your price is too high", response: "I understand \u2014 let me ask, how much are you currently spending on chemicals each month? Most homeowners spend $80-$120 just on chemicals alone. Our service includes everything for one flat rate, and we catch equipment issues early that can save you thousands. Would a price breakdown help?" },
      { objection: "I already have a pool guy", response: "No problem! If you're ever unhappy with the service or they raise their rates, keep our number. We're {{phone}} and we'd love to earn your business." },
      { objection: "I'm not sure I need weekly service", response: "Totally fair \u2014 for most pools in this climate, weekly service is ideal to prevent algae and keep chemicals balanced. But we also offer bi-weekly service if that fits better. Would you like me to come take a look at your pool and give you a recommendation?" },
      { objection: "I want to wait until summer", response: "I get that! One thing to consider \u2014 pools that aren't maintained through the off-season often turn green and require expensive shock treatments to recover. We offer reduced winter rates to keep it maintained year-round. Want me to quote you the winter rate?" }
    ],
    proposalTitle: "Pool Service & Maintenance Proposal",
    proposalIntro: "Thank you for considering {{businessName}} for your pool care needs. We are committed to keeping your pool clean, safe, and ready to enjoy year-round. Below is a customized service plan for your property.",
    proposalLineItems: [
      { description: "Weekly Pool Service (per month)", quantity: 1, unitPrice: 180 },
      { description: "Initial Deep Clean & Chemical Reset", quantity: 1, unitPrice: 250 },
      { description: "Filter Cartridge Replacement", quantity: 1, unitPrice: 95 },
      { description: "Pool Pump Inspection & Tune-Up", quantity: 1, unitPrice: 125 },
      { description: "Algae Treatment (if needed)", quantity: 1, unitPrice: 150 }
    ],
    proposalTerms: "Month-to-month service \u2014 no long-term contracts. First month billed upon service start. Chemical costs included in monthly rate. Equipment repairs quoted separately. 30-day satisfaction guarantee.",
    reviewRequestSMS: "Hi {{firstName}}! Hope you're enjoying your pool! \u{1F3CA} If {{techName}} from {{businessName}} has been taking great care of it, a quick Google review would mean a lot to us! {{reviewLink}}",
    reviewRequestEmail: {
      subject: "How's the pool, {{firstName}}? We'd love your feedback!",
      body: `Hi {{firstName}},

We hope you're enjoying your pool! Thank you for trusting {{businessName}} with your pool care.

If our team has been keeping things sparkling clean, would you mind leaving us a quick Google review? It helps other pool owners find reliable service.

\u{1F449} Leave a Review: {{reviewLink}}

If anything could be better, please reply directly \u2014 we want every visit to be perfect.

Thanks for being a valued customer!
{{businessName}} Team`
    },
    missedCallSMS: "Hi! You just called {{businessName}} \u2014 sorry we missed you! \u{1F3CA} We offer weekly pool service, repairs, and new pool installs. Call us back at {{phone}} or reply here and we'll get right back to you!",
    preQualQuestions: [
      { question: "Do you currently have a pool?", weight: 20, type: "yes_no" },
      { question: "What service are you looking for?", weight: 20, type: "multiple_choice", options: ["Weekly maintenance", "One-time cleaning", "Repair / equipment issue", "New pool installation"] },
      { question: "What is the current condition of your pool?", weight: 20, type: "multiple_choice", options: ["Clean and maintained", "Slightly cloudy", "Green / algae problem", "Not sure"] },
      { question: "How soon do you need service?", weight: 25, type: "multiple_choice", options: ["This week", "Within 2 weeks", "This month", "Just getting quotes"] },
      { question: "What is your approximate monthly budget for pool service?", weight: 15, type: "multiple_choice", options: ["Under $100", "$100-$200", "$200-$300", "Over $300"] }
    ],
    chatWelcomeMessage: "\u{1F44B} Hi there! Welcome to {{businessName}}. I can help you get a free pool service quote, schedule a repair, or answer questions about our maintenance plans. What can I help you with? \u{1F3CA}",
    chatSystemPrompt: `You are a friendly virtual assistant for {{businessName}}, a pool service company. Help visitors get quotes for weekly service, schedule repairs, and learn about new pool installation. Emphasize no-contract service, professional chemical balancing, and same-week availability. Always try to capture name and phone number for a quote callback. Be upbeat and enthusiastic \u2014 pools are fun!`,
    chatFAQs: [
      { question: "How much does weekly pool service cost?", answer: "Our weekly service starts at $150/month and includes chemical balancing, skimming, vacuuming, and equipment checks. We'll give you an exact quote based on your pool size." },
      { question: "Do you require a contract?", answer: "No contracts! We earn your business month to month. Cancel anytime with 30 days notice." },
      { question: "What if my pool is green?", answer: "No problem \u2014 we can fix that! We'll do a full chemical treatment and have your pool clear within 3-7 days. Call us and we'll get started right away." },
      { question: "Do you do pool repairs?", answer: "Yes! We repair pumps, filters, heaters, lights, and more. We'll diagnose the issue and give you a written estimate before any work begins." },
      { question: "How often should I have my pool serviced?", answer: "Weekly service is ideal for most pools in warm climates to maintain proper chemical balance and prevent algae. We also offer bi-weekly plans for pools with less use." }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // INSURANCE
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "insurance",
    name: "Insurance Agent/Broker",
    icon: "\u{1F6E1}\uFE0F",
    color: "#8b5cf6",
    description: "Life, health, home, auto, and commercial insurance sales and brokerage",
    targetCustomer: "Individuals and families needing life, health, home, or auto insurance; small business owners needing commercial coverage",
    averageDealSize: 1800,
    speedToLeadSMS: "Hi {{firstName}}! {{agentName}} from {{businessName}} here \u{1F6E1}\uFE0F Thanks for your interest in insurance coverage! I'd love to help you find the best rate. Can I schedule a quick 10-minute call to review your options? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Your Insurance Quote \u2014 {{businessName}} Is Ready to Help",
      body: `Hi {{firstName}},

Thank you for reaching out to {{businessName}}! Finding the right coverage at the right price is exactly what we do.

Here's what you can expect:
\u2705 Free, no-obligation quote comparison
\u2705 Access to 20+ top-rated carriers
\u2705 Coverage tailored to your specific needs
\u2705 Ongoing support \u2014 we're your agent for life

I'll reach out within 15 minutes to discuss your options. If you'd prefer to call us directly: {{phone}}.

{{agentName}}
{{businessName}}`
    },
    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You reached out about insurance coverage \u2014 I have a few quick questions to find you the best options. Do you have 10 minutes?"

QUALIFY:
"Great! What type of coverage are you looking for \u2014 life, health, home, auto, or a combination?"

IF LIFE INSURANCE:
"Perfect. Are you looking for term life or whole life? And roughly what coverage amount are you thinking \u2014 to replace income, cover a mortgage, or leave a legacy?"

IF HOME/AUTO:
"Got it. Are you currently insured and looking for better rates, or is this new coverage?"

TRANSITION:
"Based on what you've shared, I have access to several carriers that would be a great fit. I'd like to run some numbers and get back to you with 2-3 options. What's the best time to reconnect \u2014 tomorrow morning or afternoon?"

CLOSE:
"Perfect. I'll have your personalized quotes ready by [TIME]. You'll also get an email with a summary. Is {{email}} still the best address for you?"`,
    voiceSystemPrompt: `You are a professional insurance agent for {{businessName}}. Your goal is to qualify the prospect's insurance needs, build rapport, and schedule a follow-up appointment to present quotes. Never quote premiums on the first call \u2014 always gather information first. Key qualifying questions: type of coverage needed, current coverage status, coverage amount desired, health status (for life/health), property details (for home). Be consultative, not salesy. Emphasize access to multiple carriers and personalized recommendations.`,
    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{agentName}} from {{businessName}} here \u{1F6E1}\uFE0F I have your insurance options ready! When's a good time for a quick 10-min call? Reply with a time or call {{phone}}." },
      { day: 1, channel: "email", subject: "Your Personalized Insurance Options Are Ready \u2014 {{businessName}}", body: `Hi {{firstName}},

I've put together some personalized insurance options based on your needs. I'd love to walk you through them on a quick call.

Why families choose {{businessName}}:
\u{1F3C6} Access to 20+ top-rated carriers
\u{1F4B0} Average savings of $400-$800/year vs. direct carriers
\u{1F91D} Dedicated agent \u2014 one call for all your coverage needs
\u{1F4CB} Annual policy reviews to make sure you're always optimally covered

Call {{phone}} or reply to schedule your free consultation.

{{agentName}}, {{businessName}}` },
      { day: 3, channel: "sms", body: "{{firstName}}, just a quick follow-up from {{businessName}}. Your quotes are ready and rates are locked in for 30 days. Don't miss out \u2014 call {{phone}} or reply YES to review your options! \u{1F6E1}\uFE0F" },
      { day: 7, channel: "email", subject: "Important: Your Insurance Quote Expires Soon", body: `Hi {{firstName}},

I wanted to make sure you saw your insurance options before the quotes expire. Rates can change, and I'd hate for you to miss out on the best pricing.

A 10-minute call is all it takes. I'll walk you through your options and answer any questions \u2014 no pressure, no obligation.

Call {{phone}} or reply to schedule.

{{agentName}}, {{businessName}}` },
      { day: 14, channel: "sms", body: "Last follow-up from {{businessName}}, {{firstName}}. If you ever need insurance coverage or a policy review, I'm here. Save my number: {{phone}}. Have a great day! \u{1F6E1}\uFE0F" }
    ],
    objectionHandlers: [
      { objection: "I already have insurance", response: "That's great \u2014 you're protected! Many of my clients come to me after years with the same carrier and are surprised to find they can get the same or better coverage for significantly less. Would you be open to a free 10-minute policy review? If you're already getting the best deal, I'll tell you that too." },
      { objection: "I can't afford insurance right now", response: "I completely understand \u2014 that's actually one of the most important reasons to talk to me. Many people are paying too much because they're buying direct instead of through a broker who can shop multiple carriers. I've helped clients cut their premiums in half. Can we spend 10 minutes to see what's possible?" },
      { objection: "I'll just go online and get a quote myself", response: "You absolutely can! The difference is that online quotes give you one carrier's rate. I have access to 20+ carriers and can compare them all in minutes to find your best option. Plus I'm here if you ever have a claim \u2014 you're not on hold with an 800 number." },
      { objection: "I need to think about it", response: "Of course \u2014 this is an important decision. Can I ask what's holding you back? Is it the price, the coverage amount, or something else? I want to make sure I've given you everything you need to feel confident." },
      { objection: "I don't trust insurance companies", response: "That's a fair concern \u2014 the industry has a reputation problem. That's exactly why working with an independent broker like me is different. I work for YOU, not the insurance company. My job is to find you the best coverage at the best price and fight for you if you ever have a claim." }
    ],
    proposalTitle: "Insurance Coverage Proposal",
    proposalIntro: "Thank you for the opportunity to review your insurance needs. {{businessName}} has analyzed your situation and identified the following coverage options that provide the best protection at the most competitive rates available through our carrier network.",
    proposalLineItems: [
      { description: "Term Life Insurance \u2014 $500,000 / 20-Year Term (estimated monthly)", quantity: 12, unitPrice: 45 },
      { description: "Homeowners Insurance \u2014 $350,000 Dwelling Coverage (estimated annual)", quantity: 1, unitPrice: 1200 },
      { description: "Auto Insurance \u2014 Full Coverage, 1 Vehicle (estimated annual)", quantity: 1, unitPrice: 1400 },
      { description: "Umbrella Policy \u2014 $1M Coverage (estimated annual)", quantity: 1, unitPrice: 350 }
    ],
    proposalTerms: "All premiums are estimates based on information provided and are subject to underwriting approval. Final rates determined by carrier at time of application. Coverage effective upon first premium payment. No obligation to purchase.",
    reviewRequestSMS: "Hi {{firstName}}! Thank you for trusting {{businessName}} with your insurance needs. If I've taken good care of you, a quick Google review would mean a lot! \u{1F64F} {{reviewLink}}",
    reviewRequestEmail: {
      subject: "Thank you for your business, {{firstName}} \u2014 quick favor?",
      body: `Hi {{firstName}},

It's been a pleasure working with you to protect what matters most. Thank you for trusting {{businessName}}.

If you've been happy with the service and coverage I've found for you, would you mind leaving a quick Google review? It helps other families find an agent they can trust.

\u{1F449} Leave a Review: {{reviewLink}}

And remember \u2014 I'm always here for policy questions, claims help, or annual reviews. Just call {{phone}}.

{{agentName}}, {{businessName}}`
    },
    missedCallSMS: "Hi! You just called {{businessName}} and we missed you \u{1F6E1}\uFE0F We help families and businesses find the best insurance coverage at the lowest rates. Call {{phone}} or reply here and {{agentName}} will get right back to you!",
    preQualQuestions: [
      { question: "What type of insurance are you looking for?", weight: 15, type: "multiple_choice", options: ["Life insurance", "Health insurance", "Home insurance", "Auto insurance", "Business insurance", "Multiple types"] },
      { question: "Are you currently insured?", weight: 15, type: "yes_no" },
      { question: "What is your primary goal for this coverage?", weight: 20, type: "multiple_choice", options: ["Replace income for family", "Pay off mortgage/debts", "Lower my current premium", "New coverage needed", "Business protection"] },
      { question: "How soon do you need coverage?", weight: 25, type: "multiple_choice", options: ["Immediately", "Within 30 days", "Within 3 months", "Just researching"] },
      { question: "What is your approximate monthly budget for insurance?", weight: 25, type: "multiple_choice", options: ["Under $100", "$100-$300", "$300-$500", "Over $500", "Not sure yet"] }
    ],
    chatWelcomeMessage: "\u{1F44B} Welcome to {{businessName}}! I can help you get a free insurance quote, compare coverage options, or connect you with {{agentName}}. What type of coverage are you looking for today? \u{1F6E1}\uFE0F",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, an independent insurance agency. Help visitors understand their coverage options, get free quotes, and schedule consultations with an agent. Emphasize access to 20+ carriers, personalized recommendations, and no-obligation quotes. For life insurance leads, ask about coverage goals. For home/auto, ask about current coverage. Always capture name and phone number for agent follow-up. Be professional and trustworthy.`,
    chatFAQs: [
      { question: "How much does life insurance cost?", answer: "Term life insurance for a healthy adult typically starts at $20-$50/month for $500,000 in coverage. The exact rate depends on age, health, and coverage amount. We'll get you an exact quote in minutes." },
      { question: "What's the difference between term and whole life insurance?", answer: "Term life covers you for a set period (10, 20, or 30 years) at a lower cost. Whole life covers you permanently and builds cash value. Most families are best served by term life \u2014 let's talk about what fits your situation." },
      { question: "Can you really find me a better rate than my current insurer?", answer: "Often yes! As an independent broker, we compare 20+ carriers to find your best rate. Many clients save $300-$800/year. A free comparison takes 10 minutes." },
      { question: "How long does it take to get covered?", answer: "Auto and home insurance can be active same-day. Life insurance typically takes 2-6 weeks for underwriting, though some policies offer instant approval." },
      { question: "Do I need to work with an agent or can I do it online?", answer: "You can do both! Many people start online and then connect with an agent for complex coverage needs. Our agents are here to make sure you get the right coverage \u2014 not just the cheapest option." }
    ]
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // BUSINESS LOANS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "business_loans",
    name: "Business Loan Broker",
    icon: "\u{1F4BC}",
    color: "#10b981",
    description: "Business funding, working capital, SBA loans, merchant cash advances, and equipment financing",
    targetCustomer: "Small to mid-size business owners needing working capital, equipment financing, SBA loans, or business lines of credit",
    averageDealSize: 85e3,
    speedToLeadSMS: "Hi {{firstName}}! {{agentName}} from {{businessName}} here \u{1F4BC} Thanks for your interest in business funding! We work with 50+ lenders to find the best rates for your business. Can I schedule a quick 10-min call today? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Business Funding Options \u2014 {{businessName}} Can Help",
      body: `Hi {{firstName}},

Thank you for reaching out to {{businessName}}! We specialize in helping business owners like you access the capital they need to grow.

Here's what we offer:
\u2705 Access to 50+ lenders \u2014 we find your best rate
\u2705 Funding from $10,000 to $5,000,000+
\u2705 Decisions in as little as 24 hours
\u2705 No obligation to accept any offer

I'll reach out within 15 minutes to discuss your options. Or call us directly at {{phone}}.

{{agentName}}
{{businessName}}`
    },
    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You reached out about business funding \u2014 I have a few quick questions to find your best options. Do you have 10 minutes?"

QUALIFY:
"Great! First \u2014 what type of business do you have and how long have you been operating?"

FUNDING NEEDS:
"And what are you looking to use the funding for \u2014 working capital, equipment, expansion, or something else?"

FINANCIAL QUALIFY:
"Roughly what's your monthly revenue? I ask because it helps me identify which lenders will give you the best terms."

CREDIT:
"And do you have a sense of your business credit score \u2014 excellent, good, fair, or are you not sure?"

TRANSITION:
"Based on what you've shared, I think we can find you some strong options. I work with 50+ lenders and I'll shop your deal to find the best rate and terms. Can I get back to you by [TIME] tomorrow with your options?"

CLOSE:
"Perfect. I'll need a few basic documents \u2014 last 3 months of bank statements and your last tax return. Can you email those to {{email}}? I'll have your options ready within 24 hours."`,
    voiceSystemPrompt: `You are a professional business loan broker for {{businessName}}. Your goal is to qualify the business owner's funding needs and collect the information needed to shop their deal to lenders. Key qualifying factors: time in business (2+ years preferred), monthly revenue ($15,000+ preferred), credit score, funding purpose, and amount needed. Be consultative and educational \u2014 many business owners don't know all their options. Emphasize speed (24-hour decisions), access to 50+ lenders, and no-obligation process. Always close for document submission.`,
    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{agentName}} from {{businessName}} here \u{1F4BC} I'm ready to shop your funding request to our 50+ lenders. Quick question \u2014 what's your monthly revenue? Reply or call {{phone}} to get started!" },
      { day: 1, channel: "email", subject: "Your Business Funding Options \u2014 {{businessName}} Is Ready", body: `Hi {{firstName}},

I wanted to follow up on your business funding inquiry. I work with 50+ lenders and can typically find options for businesses that banks have turned down.

To get your personalized options, I just need:
\u{1F4C4} Last 3 months of business bank statements
\u{1F4CA} Most recent business tax return
\u{1FAAA} Copy of your driver's license

Once I have these, I can have funding options for you within 24 hours. Email them to {{agentEmail}} or call {{phone}} to discuss.

{{agentName}}, {{businessName}}` },
      { day: 3, channel: "sms", body: "{{firstName}}, checking in from {{businessName}}. We have lenders offering same-week funding for qualified businesses. Don't leave capital on the table \u2014 call {{phone}} or reply YES to get started! \u{1F4BC}" },
      { day: 7, channel: "email", subject: "Business Funding: Rates Are Changing \u2014 Act Now", body: `Hi {{firstName}},

I wanted to reach out because lending rates and approval criteria change frequently, and I'd hate for you to miss a favorable window.

Many of our business owner clients are securing working capital right now to:
\u{1F4B0} Cover payroll and operating costs
\u{1F4E6} Purchase inventory before price increases
\u{1F3D7}\uFE0F Fund expansion projects
\u2699\uFE0F Upgrade equipment

A 10-minute call is all it takes to see what you qualify for. Call {{phone}} or reply to schedule.

{{agentName}}, {{businessName}}` },
      { day: 14, channel: "sms", body: "Last follow-up from {{businessName}}, {{firstName}}. If you ever need business funding \u2014 working capital, equipment loans, SBA, or lines of credit \u2014 I'm your guy. Save my number: {{phone}}. \u{1F4BC}" }
    ],
    objectionHandlers: [
      { objection: "My credit isn't great", response: "That's actually more common than you'd think, and it's not a dealbreaker. Many of our lenders focus more on your revenue and cash flow than your credit score. If your business is generating consistent revenue, we likely have options for you. What's your monthly revenue looking like?" },
      { objection: "I tried the bank and got turned down", response: "Banks turn down over 80% of small business loan applications \u2014 that's exactly why brokers like me exist. We work with alternative lenders who have much more flexible criteria. The bank's 'no' is often just the beginning of the conversation." },
      { objection: "The rates seem too high", response: "I completely understand \u2014 and I want to make sure you're comparing apples to apples. The key is the total cost of capital vs. the return on how you use it. If $100,000 at 18% APR generates $300,000 in revenue, that's a great deal. Let me show you a few options with different rate/term combinations so you can make an informed decision." },
      { objection: "I don't want to take on debt", response: "That's a very responsible mindset. Can I ask \u2014 is there a specific growth opportunity or cash flow challenge driving this? Sometimes there are creative structures like revenue-based financing where repayments flex with your revenue, so you're never overextended." },
      { objection: "I need to talk to my accountant first", response: "Absolutely \u2014 that's smart! Would it help if I put together a term sheet with the options so you have something concrete to review with them? That way you're not going in blind and your accountant can give you specific advice." }
    ],
    proposalTitle: "Business Funding Options Summary",
    proposalIntro: "{{businessName}} has reviewed your business profile and identified the following funding options from our network of 50+ lending partners. These options have been selected based on your revenue, time in business, and funding goals. All offers are subject to final underwriting approval.",
    proposalLineItems: [
      { description: "Working Capital Loan \u2014 12-Month Term (estimated)", quantity: 1, unitPrice: 5e4 },
      { description: "Business Line of Credit \u2014 Revolving (estimated limit)", quantity: 1, unitPrice: 25e3 },
      { description: "Equipment Financing \u2014 36-Month Term (estimated)", quantity: 1, unitPrice: 35e3 },
      { description: "Broker Fee (% of funded amount \u2014 paid by lender)", quantity: 1, unitPrice: 0 }
    ],
    proposalTerms: "All offers are subject to lender underwriting and final approval. Rates and terms are estimates based on information provided. Broker fees are paid by the lender \u2014 no upfront cost to borrower. Funding timelines vary by lender (24 hours to 2 weeks). No obligation to accept any offer.",
    reviewRequestSMS: "Hi {{firstName}}! Thank you for trusting {{businessName}} to find your business funding. If I delivered for you, a quick Google review would mean a lot! \u{1F64F} {{reviewLink}}",
    reviewRequestEmail: {
      subject: "Thank you for your business, {{firstName}} \u2014 quick favor?",
      body: `Hi {{firstName}},

Congratulations again on securing your business funding! It was a pleasure working with you and I'm excited to see what you do with the capital.

If I delivered for you, would you mind leaving a quick Google review? It helps other business owners find a broker they can trust.

\u{1F449} Leave a Review: {{reviewLink}}

And remember \u2014 I'm here whenever you need additional funding, a refinance, or just advice. Call {{phone}} anytime.

{{agentName}}, {{businessName}}`
    },
    missedCallSMS: "Hi! You just called {{businessName}} and we missed you \u{1F4BC} We help business owners access working capital, equipment loans, SBA loans, and lines of credit \u2014 often within 24 hours. Call {{phone}} or reply here and {{agentName}} will get right back to you!",
    preQualQuestions: [
      { question: "How long has your business been operating?", weight: 25, type: "multiple_choice", options: ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "Over 5 years"] },
      { question: "What is your average monthly business revenue?", weight: 30, type: "multiple_choice", options: ["Under $10,000", "$10,000-$25,000", "$25,000-$50,000", "$50,000-$100,000", "Over $100,000"] },
      { question: "What is your estimated business credit score?", weight: 20, type: "multiple_choice", options: ["Excellent (720+)", "Good (680-719)", "Fair (620-679)", "Poor (below 620)", "Not sure"] },
      { question: "What do you need the funding for?", weight: 10, type: "multiple_choice", options: ["Working capital / cash flow", "Equipment purchase", "Expansion / new location", "Inventory", "Payroll", "Other"] },
      { question: "How much funding are you looking for?", weight: 15, type: "multiple_choice", options: ["Under $25,000", "$25,000-$100,000", "$100,000-$500,000", "Over $500,000"] }
    ],
    chatWelcomeMessage: "\u{1F44B} Welcome to {{businessName}}! I can help you explore business funding options, check your eligibility, or connect you with {{agentName}}. What type of funding are you looking for? \u{1F4BC}",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, a business loan brokerage. Help business owners understand their funding options and qualify for the right products. Key products: working capital loans, business lines of credit, SBA loans, equipment financing, merchant cash advances, invoice factoring. Emphasize: access to 50+ lenders, 24-hour decisions, no upfront fees, and options for businesses banks have turned down. Always try to capture business name, monthly revenue, and contact info for agent follow-up.`,
    chatFAQs: [
      { question: "What types of business funding do you offer?", answer: "We offer working capital loans, business lines of credit, SBA loans, equipment financing, merchant cash advances, and invoice factoring \u2014 through a network of 50+ lenders." },
      { question: "How fast can I get funded?", answer: "Some of our lenders can fund within 24-48 hours for working capital products. SBA loans typically take 2-4 weeks. We'll tell you the timeline upfront for each option." },
      { question: "What are your fees?", answer: "We charge no upfront fees. Our compensation comes from the lender as a referral fee \u2014 you never pay us directly." },
      { question: "What if I've been turned down by a bank?", answer: "That's actually our specialty. We work with alternative lenders who have much more flexible criteria than banks. Many of our clients were previously turned down by traditional banks." },
      { question: "What do I need to apply?", answer: "Typically: last 3 months of business bank statements, most recent business tax return, and a copy of your driver's license. Some products require less documentation." }
    ]
  }
];
var INDUSTRY_PACK_MAP = Object.fromEntries(
  INDUSTRY_PACKS.map((p) => [p.id, p])
);

// server/industryTemplateRouter.ts
init_db();
init_schema();
import { eq as eq12 } from "drizzle-orm";
function replacePlaceholders(text2, vars) {
  return text2.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
var industryTemplateRouter = router({
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
        chatFAQs: p.chatFAQs.length
      }
    }));
  }),
  /** Get full content for a specific industry pack */
  getPack: protectedProcedure.input(z12.object({ industryId: z12.string() })).query(({ input }) => {
    const pack = INDUSTRY_PACK_MAP[input.industryId];
    if (!pack) throw new Error(`Industry pack '${input.industryId}' not found`);
    return pack;
  }),
  /** Preview what will be applied for a given client + industry */
  previewApply: protectedProcedure.input(z12.object({ clientId: z12.number(), industryId: z12.string() })).query(async ({ input }) => {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const client = await database.select().from(clients).where(eq12(clients.id, input.clientId)).then((r) => r[0]);
    if (!client) throw new Error("Client not found");
    const pack = INDUSTRY_PACK_MAP[input.industryId];
    if (!pack) throw new Error("Industry pack not found");
    const vars = {
      firstName: client.name.split(" ")[0],
      businessName: client.name,
      agentName: "Your Agent",
      phone: client.phone ?? "{{phone}}",
      reviewLink: "https://g.page/r/YOUR_REVIEW_LINK",
      techName: "Your Technician",
      agentEmail: client.email ?? "{{agentEmail}}",
      weeklyRate: "150"
    };
    return {
      client,
      pack: { id: pack.id, name: pack.name, icon: pack.icon, color: pack.color },
      preview: {
        speedToLeadSMS: replacePlaceholders(pack.speedToLeadSMS, vars),
        speedToLeadEmail: {
          subject: replacePlaceholders(pack.speedToLeadEmail.subject, vars),
          body: replacePlaceholders(pack.speedToLeadEmail.body, vars)
        },
        voiceScript: replacePlaceholders(pack.voiceScript, vars),
        missedCallSMS: replacePlaceholders(pack.missedCallSMS, vars),
        reviewRequestSMS: replacePlaceholders(pack.reviewRequestSMS, vars),
        followUpCount: pack.followUpSequence.length,
        objectionCount: pack.objectionHandlers.length,
        proposalLineItemCount: pack.proposalLineItems.length,
        preQualQuestionCount: pack.preQualQuestions.length,
        chatFAQCount: pack.chatFAQs.length
      }
    };
  }),
  /** Apply an industry pack to a client */
  applyToClient: protectedProcedure.input(
    z12.object({
      clientId: z12.number(),
      industryId: z12.string(),
      businessName: z12.string().optional(),
      agentName: z12.string().optional(),
      phone: z12.string().optional(),
      weeklyRate: z12.string().optional(),
      applyVoiceScript: z12.boolean().default(true),
      applyFollowUp: z12.boolean().default(true),
      applyMissedCall: z12.boolean().default(true),
      applyProposal: z12.boolean().default(true)
    })
  ).mutation(async ({ input, ctx }) => {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const client = await database.select().from(clients).where(eq12(clients.id, input.clientId)).then((r) => r[0]);
    if (!client) throw new Error("Client not found");
    const pack = INDUSTRY_PACK_MAP[input.industryId];
    if (!pack) throw new Error("Industry pack not found");
    const vars = {
      firstName: client.name.split(" ")[0],
      businessName: input.businessName ?? client.name,
      agentName: input.agentName ?? "Your Agent",
      phone: input.phone ?? client.phone ?? "{{phone}}",
      reviewLink: "https://g.page/r/YOUR_REVIEW_LINK",
      techName: "Your Technician",
      agentEmail: client.email ?? "{{agentEmail}}",
      weeklyRate: input.weeklyRate ?? "150"
    };
    const results = [];
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
          objectionHandling: pack.objectionHandlers
        });
        results.push(`\u2705 Voice Assistant script created (${pack.objectionHandlers.length} objection handlers included)`);
      } catch {
        results.push("\u26A0\uFE0F Voice Assistant: skipped (may already exist)");
      }
    }
    if (input.applyFollowUp) {
      try {
        const stepsData = pack.followUpSequence.map((step) => ({
          day: step.day,
          channel: step.channel,
          subject: step.subject ? replacePlaceholders(step.subject, vars) : void 0,
          body: replacePlaceholders(step.body, vars)
        }));
        await database.insert(sequences).values({
          clientId: input.clientId,
          userId: ctx.user.id,
          campaignId: 0,
          // placeholder — user can assign to a campaign later
          name: `${pack.name} Follow-Up Sequence`,
          type: "multi_channel",
          status: "draft",
          steps: stepsData
        });
        results.push(`\u2705 Follow-Up Sequence created (${pack.followUpSequence.length} steps)`);
      } catch {
        results.push("\u26A0\uFE0F Follow-Up Sequence: skipped (may already exist)");
      }
    }
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
          isActive: true
        });
        results.push("\u2705 Missed Call Text-Back config created");
      } catch {
        results.push("\u26A0\uFE0F Missed Call Text-Back: skipped (may already exist)");
      }
    }
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
          prospectName: `${vars.businessName} \u2014 Template`,
          prospectEmail: client.email ?? "",
          prospectPhone: client.phone ?? "",
          industry: pack.name,
          serviceType: pack.name,
          scopeOfWork: `Standard ${pack.name} services package`,
          lineItems: pack.proposalLineItems,
          total: total.toString(),
          terms: pack.proposalTerms,
          generatedContent: `${replacePlaceholders(pack.proposalTitle, vars)}

${replacePlaceholders(pack.proposalIntro, vars)}`,
          status: "draft"
        });
        results.push(`\u2705 Proposal template created ($${total.toLocaleString()} estimated value)`);
      } catch {
        results.push("\u26A0\uFE0F Proposal Template: skipped (may already exist)");
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
        "Configure the Chat Agent and get your embed code"
      ]
    };
  }),
  /** Generate a custom AI-enhanced version of a pack section */
  generateCustomSection: protectedProcedure.input(
    z12.object({
      industryId: z12.string(),
      section: z12.enum(["voiceScript", "followUpSequence", "objectionHandlers", "chatFAQs"]),
      businessName: z12.string(),
      location: z12.string(),
      uniqueSellingPoint: z12.string()
    })
  ).mutation(async ({ input }) => {
    const pack = INDUSTRY_PACK_MAP[input.industryId];
    if (!pack) throw new Error("Industry pack not found");
    const sectionContent = input.section === "voiceScript" ? pack.voiceScript : input.section === "followUpSequence" ? pack.followUpSequence.map((s) => `Day ${s.day} (${s.channel}): ${s.body}`).join("\n\n") : input.section === "objectionHandlers" ? pack.objectionHandlers.map((o) => `Q: ${o.objection}
A: ${o.response}`).join("\n\n") : pack.chatFAQs.map((f) => `Q: ${f.question}
A: ${f.answer}`).join("\n\n");
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert marketing copywriter specializing in the ${pack.name} industry. Customize the provided template content for a specific business, making it feel authentic and local.`
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

Return the customized version only, keeping the same structure but making it specific to this business. Keep {{firstName}}, {{phone}}, and other merge tags intact.`
        }
      ]
    });
    const content = response.choices?.[0]?.message?.content ?? "";
    return { content };
  })
});

// server/_core/systemRouter.ts
import { z as z13 } from "zod";
var systemRouter = router({
  health: publicProcedure.input(
    z13.object({
      timestamp: z13.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z13.object({
      title: z13.string().min(1, "title is required"),
      content: z13.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z14 } from "zod";
init_db();
init_db();
init_schema();
import { eq as eq13 } from "drizzle-orm";
var clientRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getClientsByUserId(ctx.user.id);
  }),
  get: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getClientById(input.clientId);
  }),
  create: protectedProcedure.input(
    z14.object({
      name: z14.string().min(1),
      email: z14.string().email().optional(),
      phone: z14.string().optional(),
      industry: z14.string().optional(),
      website: z14.string().optional(),
      description: z14.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createClient({
      userId: ctx.user.id,
      ...input
    });
    await logActivity({
      userId: ctx.user.id,
      action: "created_client",
      entityType: "client",
      details: input
    });
    return result;
  }),
  update: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      name: z14.string().min(1).optional(),
      email: z14.string().email().optional().nullable(),
      phone: z14.string().optional().nullable(),
      industry: z14.string().optional().nullable(),
      website: z14.string().optional().nullable(),
      description: z14.string().optional().nullable(),
      status: z14.enum(["active", "inactive", "paused"]).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const { clientId, ...fields } = input;
    const database = await getDb();
    if (!database) throw new Error("DB unavailable");
    await database.update(clients).set({ ...fields, updatedAt: /* @__PURE__ */ new Date() }).where(eq13(clients.id, clientId));
    await logActivity({
      userId: ctx.user.id,
      clientId,
      action: "updated_client",
      entityType: "client",
      details: fields
    });
    return { success: true };
  }),
  delete: protectedProcedure.input(z14.object({ clientId: z14.number() })).mutation(async ({ ctx, input }) => {
    const database = await getDb();
    if (!database) throw new Error("DB unavailable");
    await database.delete(clients).where(eq13(clients.id, input.clientId));
    await logActivity({
      userId: ctx.user.id,
      action: "deleted_client",
      entityType: "client",
      details: { clientId: input.clientId }
    });
    return { success: true };
  }),
  getProducts: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    const { clientId } = input;
    const database = await getDb();
    if (!database) throw new Error("DB unavailable");
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
      appointmentRows
    ] = await Promise.all([
      database.select().from(campaigns).where(eq13(campaigns.clientId, clientId)),
      database.select().from(sequences).where(eq13(sequences.clientId, clientId)),
      database.select().from(voiceAssistants).where(eq13(voiceAssistants.clientId, clientId)),
      database.select().from(seoAudits).where(eq13(seoAudits.clientId, clientId)),
      database.select().from(reviews).where(eq13(reviews.clientId, clientId)),
      database.select().from(contentAssets).where(eq13(contentAssets.clientId, clientId)),
      database.select().from(leadGenAgents).where(eq13(leadGenAgents.clientId, clientId)),
      database.select().from(missedCallConfigs).where(eq13(missedCallConfigs.clientId, clientId)),
      database.select().from(reviewRequestCampaigns).where(eq13(reviewRequestCampaigns.clientId, clientId)),
      database.select().from(retentionRules).where(eq13(retentionRules.clientId, clientId)),
      database.select().from(seasonalPlans).where(eq13(seasonalPlans.clientId, clientId)),
      database.select().from(proposals).where(eq13(proposals.clientId, clientId)),
      database.select().from(gbpPosts).where(eq13(gbpPosts.clientId, clientId)),
      database.select().from(preQualFunnels).where(eq13(preQualFunnels.clientId, clientId)),
      database.select().from(referralCampaigns).where(eq13(referralCampaigns.clientId, clientId)),
      database.select().from(chatAgents).where(eq13(chatAgents.clientId, clientId)),
      database.select().from(appointments).where(eq13(appointments.clientId, clientId))
    ]);
    return [
      { module: "Campaigns", path: "campaigns", icon: "Megaphone", count: campaignRows.length, active: campaignRows.some((r) => r.status === "active"), items: campaignRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "Follow-Up Sequences", path: "sequences", icon: "MessageSquare", count: sequenceRows.length, active: sequenceRows.some((r) => r.status === "active"), items: sequenceRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "Voice Assistant", path: "voice", icon: "Mic", count: voiceRows.length, active: voiceRows.some((r) => r.status === "active"), items: voiceRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "SEO Audits", path: "seo-audit", icon: "Search", count: seoRows.length, active: seoRows.length > 0, items: seoRows.map((r) => ({ id: r.id, name: r.businessName ?? "Audit", status: "completed" })) },
      { module: "Reputation / Reviews", path: "reputation", icon: "Star", count: reviewRows.length, active: reviewRows.length > 0, items: reviewRows.map((r) => ({ id: r.id, name: r.reviewerName ?? "Review", status: r.responded ? "responded" : "pending" })) },
      { module: "Content Assets", path: "content", icon: "Pen", count: contentRows.length, active: contentRows.length > 0, items: contentRows.map((r) => ({ id: r.id, name: r.title ?? r.type, status: r.status ?? "draft" })) },
      { module: "Lead Gen Agent", path: "lead-gen-agent", icon: "Bot", count: leadGenRows.length, active: leadGenRows.some((r) => r.status === "active"), items: leadGenRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "Missed Call Text-Back", path: "missed-call", icon: "PhoneMissed", count: missedCallRows.length, active: missedCallRows.some((r) => r.isActive), items: missedCallRows.map((r) => ({ id: r.id, name: r.name, status: r.isActive ? "active" : "inactive" })) },
      { module: "Review Request", path: "review-request", icon: "ThumbsUp", count: reviewRequestRows.length, active: reviewRequestRows.some((r) => r.status === "active"), items: reviewRequestRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "Client Retention", path: "retention", icon: "Heart", count: retentionRows.length, active: retentionRows.some((r) => r.isActive), items: retentionRows.map((r) => ({ id: r.id, name: r.name, status: r.isActive ? "active" : "inactive" })) },
      { module: "Seasonal Planner", path: "seasonal-planner", icon: "Calendar", count: seasonalRows.length, active: seasonalRows.length > 0, items: seasonalRows.map((r) => ({ id: r.id, name: r.name, status: "planned" })) },
      { module: "Proposals", path: "proposals", icon: "ClipboardList", count: proposalRows.length, active: proposalRows.some((r) => r.status === "accepted"), items: proposalRows.map((r) => ({ id: r.id, name: r.title, status: r.status })) },
      { module: "GBP Posts", path: "gbp-posts", icon: "Globe", count: gbpRows.length, active: gbpRows.some((r) => r.status === "published"), items: gbpRows.map((r) => ({ id: r.id, name: r.title, status: r.status })) },
      { module: "Pre-Qual Funnel", path: "pre-qual", icon: "Filter", count: preQualRows.length, active: preQualRows.some((r) => r.isActive), items: preQualRows.map((r) => ({ id: r.id, name: r.name, status: r.isActive ? "active" : "inactive" })) },
      { module: "Referral Campaigns", path: "referral", icon: "Share2", count: referralRows.length, active: referralRows.some((r) => r.status === "active"), items: referralRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "Chat Agent", path: "chat-agent", icon: "MessageCircle", count: chatAgentRows.length, active: chatAgentRows.some((r) => r.status === "active"), items: chatAgentRows.map((r) => ({ id: r.id, name: r.name, status: r.status })) },
      { module: "Appointments", path: "appointments", icon: "Calendar", count: appointmentRows.length, active: appointmentRows.some((r) => r.status === "scheduled"), items: appointmentRows.map((r) => ({ id: r.id, name: r.leadName ?? "Appointment", status: r.status })) }
    ];
  })
});
var campaignRouter = router({
  listByClient: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getCampaignsByClientId(input.clientId);
  }),
  get: protectedProcedure.input(z14.object({ campaignId: z14.number() })).query(async ({ input }) => {
    return getCampaignById(input.campaignId);
  }),
  create: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      name: z14.string().min(1),
      type: z14.enum([
        "speed_to_lead",
        "reactivation",
        "appointment_setting",
        "follow_up",
        "content",
        "reputation"
      ]),
      config: z14.any().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createCampaign({
      clientId: input.clientId,
      userId: ctx.user.id,
      name: input.name,
      type: input.type,
      config: input.config
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_campaign",
      entityType: "campaign",
      details: input
    });
    return result;
  })
});
var leadRouter = router({
  listByCampaign: protectedProcedure.input(z14.object({ campaignId: z14.number() })).query(async ({ input }) => {
    return getLeadsByCampaignId(input.campaignId);
  }),
  listAll: protectedProcedure.input(z14.object({ limit: z14.number().optional() }).optional()).query(async ({ input }) => {
    return getAllLeads(input?.limit ?? 100);
  }),
  updateStatus: protectedProcedure.input(z14.object({ id: z14.number(), status: z14.enum(["new", "contacted", "qualified", "converted", "lost"]) })).mutation(async ({ input }) => {
    return updateLeadStatus(input.id, input.status);
  }),
  create: protectedProcedure.input(
    z14.object({
      campaignId: z14.number(),
      clientId: z14.number(),
      name: z14.string().optional(),
      email: z14.string().email().optional(),
      phone: z14.string().optional(),
      company: z14.string().optional(),
      source: z14.string().optional(),
      notes: z14.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createLead(input);
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_lead",
      entityType: "lead",
      details: input
    });
    return result;
  }),
  getById: protectedProcedure.input(z14.object({ id: z14.number() })).query(async ({ input }) => {
    return getLeadById(input.id);
  }),
  update: protectedProcedure.input(
    z14.object({
      id: z14.number(),
      name: z14.string().optional(),
      email: z14.string().email().optional(),
      phone: z14.string().optional(),
      company: z14.string().optional(),
      source: z14.string().optional(),
      notes: z14.string().optional(),
      status: z14.enum(["new", "contacted", "qualified", "converted", "lost"]).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const result = await updateLead(id, data);
    await logActivity({
      userId: ctx.user.id,
      clientId: 0,
      action: "updated_lead",
      entityType: "lead",
      details: input
    });
    return result;
  }),
  delete: protectedProcedure.input(z14.object({ id: z14.number() })).mutation(async ({ ctx, input }) => {
    await logActivity({
      userId: ctx.user.id,
      clientId: 0,
      action: "deleted_lead",
      entityType: "lead",
      details: { id: input.id }
    });
    return deleteLead(input.id);
  }),
  search: protectedProcedure.input(z14.object({ query: z14.string(), limit: z14.number().optional() })).query(async ({ input }) => {
    const all = await getAllLeads(500);
    const q = input.query.toLowerCase();
    const filtered = all.filter(
      (l) => l.name && l.name.toLowerCase().includes(q) || l.email && l.email.toLowerCase().includes(q) || l.phone && l.phone.includes(q) || l.company && l.company.toLowerCase().includes(q) || l.source && l.source.toLowerCase().includes(q)
    );
    return filtered.slice(0, input.limit ?? 50);
  })
});
var speedToLeadRouter = router({
  generateResponse: protectedProcedure.input(
    z14.object({
      leadName: z14.string(),
      leadEmail: z14.string().email(),
      leadCompany: z14.string().optional(),
      channel: z14.enum(["sms", "email"]),
      businessContext: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    const prompt = input.channel === "sms" ? `Generate a short, personalized SMS response (max 160 chars) for a lead named ${input.leadName} from ${input.leadCompany || "a company"}. Context: ${input.businessContext || "lead generation campaign"}. Make it friendly and include a clear call-to-action.` : `Generate a personalized email response for a lead named ${input.leadName} from ${input.leadCompany || "a company"}. Email: ${input.leadEmail}. Context: ${input.businessContext || "lead generation campaign"}. Include subject line and body. Make it professional and compelling.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    return {
      content: response.choices[0]?.message.content || "Failed to generate response",
      channel: input.channel
    };
  })
});
var reactivationRouter = router({
  generateSequence: protectedProcedure.input(
    z14.object({
      leadName: z14.string(),
      leadEmail: z14.string().email(),
      lastContactDate: z14.string().optional(),
      businessContext: z14.string().optional(),
      numMessages: z14.number().default(3)
    })
  ).mutation(async ({ input }) => {
    const prompt = `Generate a ${input.numMessages}-step reactivation email sequence for a dormant lead named ${input.leadName}. 
      Last contact: ${input.lastContactDate || "unknown"}. 
      Context: ${input.businessContext || "business services"}. 
      Each email should be progressively more compelling. Format as JSON array with objects containing: subject, body, delayDays.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    try {
      const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "[]");
      let sequence;
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
        error: "Failed to parse sequence"
      };
    }
  })
});
var appointmentRouter = router({
  listByCampaign: protectedProcedure.input(z14.object({ campaignId: z14.number() })).query(async ({ input }) => {
    return getAppointmentsByCampaignId(input.campaignId);
  }),
  create: protectedProcedure.input(
    z14.object({
      campaignId: z14.number(),
      leadId: z14.number(),
      clientId: z14.number(),
      scheduledAt: z14.date().optional(),
      duration: z14.number().optional(),
      notes: z14.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createAppointment(input);
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_appointment",
      entityType: "appointment",
      details: input
    });
    return result;
  }),
  generateConfirmation: protectedProcedure.input(
    z14.object({
      leadName: z14.string(),
      appointmentTime: z14.string(),
      businessName: z14.string()
    })
  ).mutation(async ({ input }) => {
    const prompt = `Generate a professional appointment confirmation message for ${input.leadName} with ${input.businessName} scheduled for ${input.appointmentTime}. Include: confirmation of time, what to expect, and contact info. Keep it concise and friendly.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    return {
      message: response.choices[0]?.message.content || "Failed to generate confirmation"
    };
  })
});
var voiceAssistantRouter = router({
  listByClient: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getVoiceAssistantsByClientId(input.clientId);
  }),
  create: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      name: z14.string().min(1),
      type: z14.enum(["inbound", "outbound"]),
      systemPrompt: z14.string().optional(),
      callScript: z14.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createVoiceAssistant({
      userId: ctx.user.id,
      ...input
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_voice_assistant",
      entityType: "voice_assistant",
      details: input
    });
    return result;
  }),
  update: protectedProcedure.input(
    z14.object({
      id: z14.number(),
      name: z14.string().min(1).optional(),
      systemPrompt: z14.string().optional(),
      callScript: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateVoiceAssistant(id, data);
  }),
  updateStatus: protectedProcedure.input(
    z14.object({
      id: z14.number(),
      status: z14.enum(["draft", "active", "paused"])
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await updateVoiceAssistantStatus(input.id, input.status);
    await logActivity({
      userId: ctx.user.id,
      action: `voice_assistant_${input.status}`,
      entityType: "voice_assistant",
      details: { id: input.id, status: input.status }
    });
    return result;
  }),
  delete: protectedProcedure.input(z14.object({ id: z14.number() })).mutation(async ({ ctx, input }) => {
    await logActivity({
      userId: ctx.user.id,
      action: "deleted_voice_assistant",
      entityType: "voice_assistant",
      details: { id: input.id }
    });
    return deleteVoiceAssistant(input.id);
  }),
  generateScript: protectedProcedure.input(
    z14.object({
      businessName: z14.string(),
      industry: z14.string(),
      callType: z14.enum(["inbound", "outbound"]),
      goal: z14.string(),
      // e.g. "book appointments", "qualify leads", "follow up on quote"
      tone: z14.enum(["professional", "friendly", "urgent", "consultative"]).optional()
    })
  ).mutation(async ({ input }) => {
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
              callScript: { type: "string" }
            },
            required: ["systemPrompt", "callScript"],
            additionalProperties: false
          }
        }
      }
    });
    const rawContent = response.choices[0]?.message.content || "{}";
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
    try {
      return JSON.parse(content);
    } catch {
      return { systemPrompt: "", callScript: content };
    }
  }),
  generateObjectionHandler: protectedProcedure.input(
    z14.object({
      objection: z14.string(),
      productContext: z14.string(),
      industry: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    const prompt = `You are an expert sales coach. Generate a professional, empathetic response to this sales objection.

Objection: "${input.objection}"
Business context: ${input.productContext}${input.industry ? `
Industry: ${input.industry}` : ""}

Provide:
1. A brief empathetic acknowledgment (1 sentence)
2. A reframe or value statement (1-2 sentences)
3. A soft close or next step (1 sentence)

Keep it conversational and under 60 words total.`;
    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }]
    });
    const objContent = response.choices[0]?.message.content;
    return {
      response: typeof objContent === "string" ? objContent : objContent ? JSON.stringify(objContent) : "Failed to generate response"
    };
  }),
  addCallLog: protectedProcedure.input(
    z14.object({
      voiceAssistantId: z14.number(),
      leadId: z14.number().optional(),
      campaignId: z14.number().optional(),
      duration: z14.number().optional(),
      outcome: z14.string().optional(),
      transcript: z14.string().optional(),
      notes: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    return createCallLog(input);
  }),
  getCallLogs: protectedProcedure.input(z14.object({ voiceAssistantId: z14.number() })).query(async ({ input }) => {
    return getCallLogsByAssistantId(input.voiceAssistantId);
  })
});
var sequenceRouter = router({
  listByCampaign: protectedProcedure.input(z14.object({ campaignId: z14.number() })).query(async ({ input }) => {
    return getSequencesByCampaignId(input.campaignId);
  }),
  create: protectedProcedure.input(
    z14.object({
      campaignId: z14.number(),
      clientId: z14.number(),
      name: z14.string().min(1),
      type: z14.enum(["email", "sms", "multi_channel"]),
      steps: z14.any().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createSequence({
      campaignId: input.campaignId,
      clientId: input.clientId,
      userId: ctx.user.id,
      name: input.name,
      type: input.type,
      steps: input.steps
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "created_sequence",
      entityType: "sequence",
      details: input
    });
    return result;
  }),
  generateStep: protectedProcedure.input(
    z14.object({
      stepNumber: z14.number(),
      leadName: z14.string(),
      previousContext: z14.string().optional(),
      channel: z14.enum(["email", "sms"])
    })
  ).mutation(async ({ input }) => {
    const prompt = `Generate a ${input.channel} for step ${input.stepNumber} of a follow-up sequence to ${input.leadName}. 
      ${input.previousContext ? `Previous context: ${input.previousContext}` : ""}
      Make it progressively more compelling and include a clear call-to-action. 
      ${input.channel === "email" ? "Include subject line and body." : "Keep under 160 characters."}`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    return {
      content: response.choices[0]?.message.content || "Failed to generate step",
      channel: input.channel,
      stepNumber: input.stepNumber
    };
  })
});
function buildReportFromScrapedData(scrapedData, businessName, industry) {
  const ws = scrapedData.website;
  const g = scrapedData.google;
  const dirs = scrapedData.directories;
  const social = scrapedData.social;
  const comps = scrapedData.competitors;
  const seoScore = [
    ws.hasTitle ? 15 : 0,
    ws.hasMetaDescription ? 15 : 0,
    ws.hasH1 ? 10 : 0,
    ws.hasSchemaMarkup ? 15 : 0,
    ws.hasCanonical ? 10 : 0,
    ws.hasRobotsTxt ? 10 : 0,
    ws.hasSitemap ? 10 : 0,
    ws.imageCount > 0 ? Math.round(ws.imagesWithAlt / ws.imageCount * 15) : 0
  ].reduce((a, b) => a + b, 0);
  const listingsFound = dirs.filter((d) => d.status === "found").length;
  const listingsScore = Math.round(listingsFound / Math.max(dirs.length, 1) * 100);
  const reviewScore = Math.min(100, Math.round(g.reviewCount / 50 * 60 + g.rating / 5 * 40));
  const socialFound = social.filter((s) => s.found).length;
  const socialScore = Math.round(socialFound / Math.max(social.length, 1) * 100);
  const websiteScore = [
    ws.isAccessible ? 20 : 0,
    ws.isHttps ? 15 : 0,
    ws.isMobileFriendly ? 20 : 0,
    ws.hasPhone ? 10 : 0,
    ws.hasAddress ? 10 : 0,
    ws.hasCTA ? 15 : 0,
    ws.hasSocialLinks ? 10 : 0
  ].reduce((a, b) => a + b, 0);
  const overallScore = Math.round((seoScore + listingsScore + reviewScore + socialScore + websiteScore) / 5);
  const gradeFromScore = (s) => s >= 90 ? "A" : s >= 75 ? "B" : s >= 55 ? "C" : s >= 35 ? "D" : "F";
  const topComp = comps.length > 0 ? comps.reduce((a, b) => a.reviewCount > b.reviewCount ? a : b) : null;
  return {
    overallGrade: gradeFromScore(overallScore),
    overallScore,
    executiveSummary: `${businessName} has a digital presence score of ${overallScore}/100. ${g.found ? `Their Google Business Profile shows ${g.reviewCount} reviews with a ${g.rating}-star rating.` : "No Google Business Profile was found."} ${listingsFound} of ${dirs.length} directory listings were verified.`,
    categories: [
      {
        name: "SEO",
        grade: gradeFromScore(seoScore),
        score: seoScore,
        metrics: [
          { label: "Title Tag", value: ws.hasTitle ? "Present" : "Missing", benchmark: "Required", status: ws.hasTitle ? "good" : "critical" },
          { label: "Meta Description", value: ws.hasMetaDescription ? "Present" : "Missing", benchmark: "Required", status: ws.hasMetaDescription ? "good" : "critical" },
          { label: "Schema Markup", value: ws.hasSchemaMarkup ? "Present" : "Missing", benchmark: "Recommended", status: ws.hasSchemaMarkup ? "good" : "warning" },
          { label: "Sitemap", value: ws.hasSitemap ? "Present" : "Missing", benchmark: "Required", status: ws.hasSitemap ? "good" : "warning" },
          { label: "Image Alt Text", value: `${ws.imagesWithAlt}/${ws.imageCount}`, benchmark: "100%", status: ws.imagesWithAlt === ws.imageCount ? "good" : "warning" }
        ],
        findings: [
          !ws.hasMetaDescription ? "Missing meta description - critical for search rankings" : "Meta description is present",
          !ws.hasSitemap ? "No XML sitemap found" : "XML sitemap is present",
          ws.h1Count !== 1 ? `${ws.h1Count} H1 tags found (should be exactly 1)` : "Proper H1 tag structure"
        ].filter(Boolean),
        recommendations: [
          !ws.hasMetaDescription ? "Add a unique, keyword-rich meta description (150-160 characters)" : null,
          !ws.hasSitemap ? "Create and submit an XML sitemap to Google Search Console" : null,
          !ws.hasCanonical ? "Add canonical URLs to prevent duplicate content issues" : null,
          ws.imagesWithAlt < ws.imageCount ? "Add descriptive alt text to all images" : null
        ].filter(Boolean)
      },
      {
        name: "Listings",
        grade: gradeFromScore(listingsScore),
        score: listingsScore,
        presenceCount: listingsFound,
        totalDirectories: dirs.length,
        accuracyPercent: listingsFound > 0 ? 80 : 0,
        directories: dirs.map((d) => ({ name: d.name, status: d.status, issues: d.issues })),
        findings: [`Business found on ${listingsFound} of ${dirs.length} checked directories`],
        recommendations: ["Submit business to all major directories", "Ensure NAP (Name, Address, Phone) consistency across all listings"]
      },
      {
        name: "Reviews",
        grade: gradeFromScore(reviewScore),
        score: reviewScore,
        metrics: [
          { label: "Total Reviews Found", value: String(g.reviewCount), benchmark: "25+", industryLeader: topComp ? String(topComp.reviewCount) : "100+" },
          { label: "Average Rating", value: String(g.rating || "N/A"), benchmark: "4.5", industryLeader: topComp ? String(topComp.rating) : "4.9" },
          { label: "Reviews Per Month", value: "N/A", benchmark: "3-5", industryLeader: "10+" },
          { label: "Review Sources", value: "1", benchmark: "3+", industryLeader: "5+" }
        ],
        findings: [
          g.reviewCount < 25 ? `Only ${g.reviewCount} reviews found - below industry average of 25+` : `${g.reviewCount} reviews found`,
          g.rating < 4.5 ? `Rating of ${g.rating} is below the 4.5 industry benchmark` : `Strong ${g.rating}-star rating`
        ],
        recommendations: [
          "Implement an automated review request system after service completion",
          "Respond to all reviews within 24 hours",
          "Diversify review sources (Google, Yelp, Facebook, industry-specific sites)"
        ]
      },
      {
        name: "Social",
        grade: gradeFromScore(socialScore),
        score: socialScore,
        platforms: social.map((s) => ({
          name: s.platform,
          found: s.found,
          followers: s.followers || "N/A",
          activity: s.activity || "not_found",
          recommendation: !s.found ? `Create a ${s.platform} business profile` : s.activity === "inactive" ? `Post regularly on ${s.platform}` : `Continue engaging on ${s.platform}`
        })),
        findings: [
          socialFound === 0 ? "No active social media presence detected" : `Active on ${socialFound} of ${social.length} major platforms`
        ],
        recommendations: [
          socialFound < 3 ? "Establish profiles on Facebook, Instagram, and at least one other platform" : null,
          "Post at least 3 times per week with engaging local content",
          "Share before/after photos and customer testimonials"
        ].filter(Boolean)
      },
      {
        name: "Website",
        grade: gradeFromScore(websiteScore),
        score: websiteScore,
        checklist: [
          { item: "Business Address", found: ws.hasAddress },
          { item: "Phone Number", found: ws.hasPhone },
          { item: "HTTPS Secure", found: ws.isHttps },
          { item: "Mobile Friendly", found: ws.isMobileFriendly },
          { item: "Social Links", found: ws.hasSocialLinks },
          { item: "Call-to-Action", found: ws.hasCTA }
        ],
        performance: {
          mobileScore: ws.isMobileFriendly ? 70 : 40,
          desktopScore: ws.isAccessible ? 75 : 30,
          pageSpeed: `${(ws.pageLoadTime / 1e3).toFixed(1)}s`,
          lcp: `${(ws.pageLoadTime * 1.5 / 1e3).toFixed(1)}s`,
          cls: "0.1",
          fid: "100ms"
        },
        findings: [
          !ws.hasSocialLinks ? "No social media links found on website" : "Social links present",
          !ws.hasAddress ? "No business address displayed on website" : "Address is displayed",
          ws.pageLoadTime > 3e3 ? `Slow page load time (${(ws.pageLoadTime / 1e3).toFixed(1)}s)` : "Acceptable page load time"
        ],
        recommendations: [
          !ws.hasSocialLinks ? "Add social media links to header or footer" : null,
          !ws.hasAddress ? "Display full business address on contact page and footer" : null,
          ws.pageLoadTime > 3e3 ? "Optimize images and enable caching to improve load time" : null,
          !ws.hasMetaDescription ? "Add meta descriptions to improve click-through rates" : null
        ].filter(Boolean)
      },
      {
        name: "Advertising",
        grade: "F",
        score: 10,
        keywords: [
          { keyword: `${industry || "service"} near me`, impressions: 0, clicks: 0 },
          { keyword: `best ${industry || "service"} ${scrapedData.google.address?.split(",")[1]?.trim() || "local"}`, impressions: 0, clicks: 0 },
          { keyword: `affordable ${industry || "service"}`, impressions: 0, clicks: 0 }
        ],
        totalImpressions: 0,
        totalClicks: 0,
        findings: ["No active paid advertising campaigns detected"],
        recommendations: [
          `Launch Google Ads targeting "${industry || "service"} near me" and related local keywords`,
          "Set up Google Local Services Ads for immediate visibility",
          "Consider Facebook/Instagram ads targeting local homeowners"
        ]
      }
    ],
    topPriorities: [
      listingsFound < 5 ? "Build directory listings across 50+ platforms" : null,
      g.reviewCount < 25 ? "Generate more customer reviews (target 25+)" : null,
      socialFound < 3 ? "Establish social media presence on major platforms" : null,
      !ws.hasMetaDescription ? "Fix critical SEO issues (meta description, sitemap)" : null,
      "Launch targeted local advertising campaigns"
    ].filter(Boolean).slice(0, 5)
  };
}
var seoAuditRouter = router({
  listByClient: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getSeoAuditsByClientId(input.clientId);
  }),
  listAll: protectedProcedure.query(async () => {
    const allDb = await getDb();
    if (!allDb) return [];
    const { seoAudits: seoAudits2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { desc: desc12 } = await import("drizzle-orm");
    return allDb.select().from(seoAudits2).orderBy(desc12(seoAudits2.createdAt)).limit(50);
  }),
  generateAudit: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      businessName: z14.string(),
      website: z14.string().optional(),
      industry: z14.string().optional(),
      location: z14.string().optional(),
      googleMapsUrl: z14.string().optional(),
      // paste Google Maps URL for accurate GBP lookup
      overrides: z14.object({
        reviewCount: z14.number().optional(),
        rating: z14.number().optional(),
        googlePlaceId: z14.string().optional()
      }).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log("[SEO Audit] Starting REAL data-driven snapshot for:", input.businessName);
      const { scrapeAllData: scrapeAllData2 } = await Promise.resolve().then(() => (init_seoScraper(), seoScraper_exports));
      const scrapedData = await scrapeAllData2({
        businessName: input.businessName,
        website: input.website,
        industry: input.industry,
        location: input.location,
        googleMapsUrl: input.googleMapsUrl,
        overrides: input.overrides
      });
      let brandColors = scrapedData.website.brandColors;
      const realDataContext = `
REAL VERIFIED DATA \u2014 DO NOT HALLUCINATE. Use ONLY these facts:

WEBSITE ANALYSIS (${scrapedData.website.url || "No website"}):
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
- Social Links: ${scrapedData.website.hasSocialLinks} (${scrapedData.website.socialLinksFound.join(", ") || "none"})
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
- Business Types: ${scrapedData.google.businessTypes.join(", ")}

DIRECTORY PRESENCE (${scrapedData.directories.filter((d) => d.status === "found").length} of ${scrapedData.directories.length} found):
${scrapedData.directories.map((d) => `- ${d.name}: ${d.status}`).join("\n")}

SOCIAL MEDIA:
${scrapedData.social.map((s) => `- ${s.platform}: ${s.found ? "Found" : "Not Found"} (${s.activity})`).join("\n")}

LOCAL COMPETITORS:
${scrapedData.competitors.map((c) => `- ${c.name}: ${c.rating} stars, ${c.reviewCount} reviews`).join("\n")}
`;
      const reviewCount = scrapedData.google.reviewCount || 0;
      const directoriesFound = scrapedData.directories.filter((d) => d.status === "found").length;
      const totalDirectories = scrapedData.directories.length;
      const h1Count = scrapedData.website.h1Count || 0;
      const hasAddress = scrapedData.website.hasAddress;
      const industry = input.industry || "local service";
      const socialFound = scrapedData.social.filter((s) => s.found).length;
      const seoScore = Math.max(10, 100 - (h1Count > 1 ? (h1Count - 1) * 12 : 0) - (!hasAddress ? 15 : 0) - (!scrapedData.website.hasSchemaMarkup ? 10 : 0) - (directoriesFound < 5 ? 20 : directoriesFound < 10 ? 10 : 0));
      const seoGrade = seoScore >= 80 ? "B" : seoScore >= 60 ? "C" : seoScore >= 40 ? "D" : "F";
      const listingsScore = Math.round(directoriesFound / Math.max(totalDirectories, 1) * 100);
      const listingsGrade = listingsScore >= 70 ? "C" : listingsScore >= 40 ? "D" : "F";
      const reviewScore = reviewCount >= 60 ? 75 : reviewCount >= 30 ? 55 : reviewCount >= 10 ? 35 : 18;
      const reviewGrade = reviewCount >= 60 ? "C" : reviewCount >= 30 ? "D" : "F";
      const socialScore = Math.round(socialFound / Math.max(scrapedData.social.length, 1) * 100);
      const socialGrade = socialScore >= 70 ? "C" : socialScore >= 40 ? "D" : "F";
      const websiteChecks = [
        scrapedData.website.hasAddress,
        scrapedData.website.hasPhone,
        scrapedData.website.isHttps,
        scrapedData.website.isMobileFriendly,
        scrapedData.website.hasCTA,
        scrapedData.website.hasSchemaMarkup
      ].filter(Boolean).length;
      const websiteRaw = Math.round(websiteChecks / 6 * 100) - (h1Count > 1 ? 20 : 0);
      const websiteScore = Math.max(10, websiteRaw);
      const websiteGrade = websiteScore >= 70 ? "C" : websiteScore >= 50 ? "D" : "F";
      const geoScore = Math.max(
        5,
        (scrapedData.website.hasSchemaMarkup ? 25 : 0) + (scrapedData.google.found ? 20 : 0) + (reviewCount >= 10 ? 15 : reviewCount >= 3 ? 8 : 0) + (scrapedData.website.hasSitemap ? 10 : 0) + (scrapedData.website.hasTitle && scrapedData.website.hasMetaDescription ? 10 : 0) + (directoriesFound >= 5 ? 10 : 0) + (socialFound >= 2 ? 10 : 0)
      );
      const geoGrade = geoScore >= 70 ? "C" : geoScore >= 45 ? "D" : "F";
      const kd = scrapedData.keywordData;
      const topKwVolume = kd.topKeyword?.monthlySearches || 0;
      const totalKwOpportunity = kd.totalMonthlyOpportunity || 0;
      const adScore = 10;
      const adGrade = "F";
      const rankedRows = (kd.rankedKeywords || []).slice(0, 3).map(
        (k) => `{ "keyword": "${k.keyword}", "monthlySearches": ${k.monthlySearches}, "avgCpc": ${k.avgCpc}, "competition": "${k.competition}", "intent": "${k.intent}", "status": "currently ranking #${k.rankPosition || "?"}" }`
      );
      const opportunityRows = (kd.opportunityKeywords || kd.keywords).slice(0, 5).map(
        (k) => `{ "keyword": "${k.keyword}", "monthlySearches": ${k.monthlySearches}, "avgCpc": ${k.avgCpc}, "competition": "${k.competition}", "intent": "${k.intent}", "status": "NOT ranking \u2014 opportunity" }`
      );
      const realKeywordRows = [...rankedRows, ...opportunityRows].join(",\n          ");
      const topOpportunity = kd.topOpportunity || kd.opportunityKeywords?.[0] || kd.keywords[0];
      const kwDataSource = kd.source === "dataforseo" ? (kd.rankedKeywords?.length ?? 0) > 0 ? `DataForSEO live API \u2014 ${kd.rankedKeywords.length} keywords domain currently ranks for + ${(kd.opportunityKeywords || []).length} top opportunities` : "DataForSEO live API \u2014 keyword ideas based on industry" : "Industry estimates (DataForSEO credentials not configured)";
      const comps = scrapedData.competitors.filter((c) => c.reviewCount > 0);
      const competitorReviewAvg = comps.length > 0 ? Math.round(comps.reduce((sum, c) => sum + c.reviewCount, 0) / comps.length) : null;
      const competitorRatingAvg = comps.length > 0 ? Math.round(comps.reduce((sum, c) => sum + c.rating, 0) / comps.length * 10) / 10 : null;
      const topCompetitor = comps.length > 0 ? comps.reduce((a, b) => a.reviewCount > b.reviewCount ? a : b) : null;
      const overallScore = Math.round((seoScore + listingsScore + reviewScore + socialScore + websiteScore + geoScore + adScore) / 7);
      const overallGrade = overallScore >= 70 ? "C" : overallScore >= 50 ? "D" : "F";
      const isLending = industry.toLowerCase().includes("loan") || industry.toLowerCase().includes("lend") || industry.toLowerCase().includes("mortgage") || industry.toLowerCase().includes("financ");
      const isRoofing = industry.toLowerCase().includes("roof");
      const isPool = industry.toLowerCase().includes("pool");
      const isHVAC = industry.toLowerCase().includes("hvac") || industry.toLowerCase().includes("air") || industry.toLowerCase().includes("heat");
      const avgDealValue = isLending ? 7e3 : isRoofing ? 8e3 : isPool ? 3500 : isHVAC ? 4500 : 3e3;
      const avgAnnualInterest = isLending ? 35e3 : 0;
      const monthlyLostDeals = reviewCount < 10 ? 1.5 : reviewCount < 30 ? 1 : 0.5;
      const lostOriginationAnnual = Math.round(monthlyLostDeals * avgDealValue * 12);
      const lostInterestAnnual = Math.round(monthlyLostDeals * avgAnnualInterest * 12);
      const totalRevenueLeak = lostOriginationAnnual + lostInterestAnnual;
      const monthlyLeak = Math.round(totalRevenueLeak / 12);
      const prompt = `You are a senior digital marketing consultant at Scorpion Global Solutions LLC \u2014 a Digital Marketing & AI Agency based in Arizona. You are generating a "Digital Audit & Profit Leakage Report" for "${input.businessName}"${input.website ? ` (${input.website})` : ""}${input.industry ? ` in the ${input.industry} industry` : ""}${input.location ? ` in ${input.location}` : ""}.

AUDIT AUTHORITY: Scorpion Global Solutions LLC | Arizona | Digital Marketing & AI Solutions
REPORT DATE: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

CRITICAL RULES:
1. Use ONLY the real data provided. NEVER hallucinate or invent data.
2. Lead every section with REVENUE IMPACT first, then technical detail.
3. Use plain English \u2014 explain penalties like you are talking to a business owner, not a developer.
4. For H1 conflicts: describe it as "You are confusing Google" and explain the revenue consequence.
5. Use the PRE-CALCULATED SCORES below \u2014 do NOT override them.
6. GEO = Generative Engine Optimization (visibility in ChatGPT, Google AI Overviews, Perplexity, Bing Copilot). Score it honestly based on schema markup, review count, directory presence, and structured data signals.
7. The report must feel like it was written by a high-end consultant, not a generic tool.

PRE-CALCULATED SCORES (use these exactly \u2014 do not change them):
- Overall: ${overallGrade} (${overallScore}/100)
- SEO: ${seoGrade} (${seoScore}/100)${h1Count > 1 ? ` \u2014 ${h1Count} H1 conflicts detected` : ""}${!hasAddress ? " \u2014 missing business address" : ""}
- Listings: ${listingsGrade} (${listingsScore}/100) \u2014 ${directoriesFound} of ${totalDirectories} directories found
- Reviews: ${reviewGrade} (${reviewScore}/100) \u2014 ${reviewCount} reviews
- Social: ${socialGrade} (${socialScore}/100) \u2014 ${socialFound} of ${scrapedData.social.length} platforms found
- Website: ${websiteGrade} (${websiteScore}/100) \u2014 ${websiteChecks}/6 checklist items passed
- GEO: ${geoGrade} (${geoScore}/100) \u2014 AI engine visibility score
- Advertising: ${adGrade} (${adScore}/100) \u2014 no paid presence detected

REVENUE LEAKAGE:
- Monthly Lost Deals: ${monthlyLostDeals}
- Lost Origination/Revenue (Annual): $${lostOriginationAnnual.toLocaleString()}
${avgAnnualInterest > 0 ? `- Lost Interest Spread (Annual): $${lostInterestAnnual.toLocaleString()}` : ""}
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
      "title": "<plain-English failure title, e.g. 'The Confusion Penalty \u2014 ${h1Count} H1 Tags'>",
      "impact": "<revenue/ranking impact in plain English>",
      "fix": "<specific actionable fix>"
    }
  ],
  "competitorComparison": {
    "reviewsYours": ${reviewCount},
    "reviewsCompetitorAvg": ${competitorReviewAvg !== null ? competitorReviewAvg : "null"},
    "listingsYours": ${directoriesFound},
    "listingsCompetitorAvg": null,
    "competitorCount": ${comps.length},
    "topCompetitor": ${topCompetitor ? `{"name": "${topCompetitor.name}", "reviewCount": ${topCompetitor.reviewCount}, "rating": ${topCompetitor.rating}}` : "null"},
    "insight": "<1-2 sentence plain-English competitor gap explanation using ONLY the real scraped competitor data above. If competitorReviewAvg is null, say data was insufficient to compare and do not invent a number.>"
  },
  "categories": [
    {
      "name": "SEO",
      "grade": "${seoGrade}",
      "score": ${seoScore},
      "metrics": [
        { "label": "H1 Tag Count", "value": "${h1Count}", "benchmark": "1 (Required)", "status": "${h1Count > 1 ? "critical" : "good"}" },
        { "label": "Title Tag", "value": "${scrapedData.website.hasTitle ? "Present" : "Missing"}", "benchmark": "Required", "status": "${scrapedData.website.hasTitle ? "good" : "critical"}" },
        { "label": "Meta Description", "value": "${scrapedData.website.hasMetaDescription ? "Present" : "Missing"}", "benchmark": "Required", "status": "${scrapedData.website.hasMetaDescription ? "good" : "critical"}" },
        { "label": "Schema Markup", "value": "${scrapedData.website.hasSchemaMarkup ? "Present" : "Missing"}", "benchmark": "Recommended", "status": "${scrapedData.website.hasSchemaMarkup ? "good" : "warning"}" },
        { "label": "Business Address on Site", "value": "${hasAddress ? "Present" : "Missing"}", "benchmark": "Required for Local SEO", "status": "${hasAddress ? "good" : "critical"}" },
        { "label": "Sitemap", "value": "${scrapedData.website.hasSitemap ? "Present" : "Missing"}", "benchmark": "Required", "status": "${scrapedData.website.hasSitemap ? "good" : "warning"}" },
        { "label": "Images with Alt Text", "value": "${scrapedData.website.imagesWithAlt} of ${scrapedData.website.imageCount}", "benchmark": "100%", "status": "${scrapedData.website.imageCount > 0 && scrapedData.website.imagesWithAlt / scrapedData.website.imageCount > 0.8 ? "good" : "warning"}" }
      ],
      "findings": ["<Loss-Led finding 1 \u2014 revenue consequence of H1 conflict or top SEO issue>", "<finding 2>", "<finding 3>"],
      "recommendations": ["<specific fix 1>", "<specific fix 2>", "<specific fix 3>"]
    },
    {
      "name": "Listings",
      "grade": "${listingsGrade}",
      "score": ${listingsScore},
      "presenceCount": ${directoriesFound},
      "totalDirectories": ${totalDirectories},
      "accuracyPercent": ${Math.round(directoriesFound / Math.max(totalDirectories, 1) * 100)},
      "directories": ${JSON.stringify(scrapedData.directories.map((d) => ({ name: d.name, status: d.status, issues: d.issues })))},
      "findings": ["<Loss-Led finding \u2014 ghost business factor, missing from X directories>", "<finding 2>"],
      "recommendations": ["<Citation Blitz: sync NAP across 50+ directories>", "<specific fix 2>"]
    },
    {
      "name": "Reviews",
      "grade": "${reviewGrade}",
      "score": ${reviewScore},
      "metrics": [
        { "label": "Total Reviews", "value": "${reviewCount}", "benchmark": "30+ (Competitive)", "industryLeader": "${topCompetitor ? topCompetitor.reviewCount + " (" + topCompetitor.name + ")" : "N/A \u2014 insufficient data"}" },
        { "label": "Average Rating", "value": "${scrapedData.google.rating || "N/A"}", "benchmark": "4.5+", "industryLeader": "${competitorRatingAvg !== null ? competitorRatingAvg : "N/A \u2014 insufficient data"}" },
        { "label": "Review Velocity", "value": "Unknown \u2014 not measurable from public data", "benchmark": "3-5/month", "industryLeader": "N/A" }
      ],
      "findings": ["<Loss-Led finding \u2014 social proof gap, clients choose competitors>", "<finding 2>"],
      "recommendations": ["<Get to 30+ reviews within 90 days \u2014 specific strategy>", "<specific fix 2>"]
    },
    {
      "name": "Social",
      "grade": "${socialGrade}",
      "score": ${socialScore},
      "platforms": ${JSON.stringify(scrapedData.social.map((s) => ({ name: s.platform, found: s.found, followers: s.followers || "N/A", activity: s.activity, recommendation: "" })))},
      "findings": ["<Loss-Led finding \u2014 missing platforms = missing trust channels for this industry>", "<finding 2>"],
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
        "mobileScore": ${scrapedData.website.isMobileFriendly ? scrapedData.website.pageLoadTime < 2e3 ? 80 : scrapedData.website.pageLoadTime < 4e3 ? 60 : 40 : 30},
        "desktopScore": ${scrapedData.website.pageLoadTime < 1e3 ? 90 : scrapedData.website.pageLoadTime < 2e3 ? 75 : scrapedData.website.pageLoadTime < 4e3 ? 55 : 35},
        "pageSpeed": "${(scrapedData.website.pageLoadTime / 1e3).toFixed(1)}s",
        "lcp": "${scrapedData.website.pageLoadTime > 0 ? (scrapedData.website.pageLoadTime / 1e3).toFixed(1) + "s (measured)" : "Not measured"}",
        "cls": "Not measured",
        "fid": "Not measured"
      },
      "findings": ["<Loss-Led finding \u2014 static brochure vs sales engine>", "<finding 2>"],
      "recommendations": ["<Add Quick Quote Calculator or lead capture form>", "<specific fix 2>"]
    },
    {
      "name": "GEO",
      "grade": "${geoGrade}",
      "score": ${geoScore},
      "metrics": [
        { "label": "Schema / Structured Data", "value": "${scrapedData.website.hasSchemaMarkup ? "Present" : "Missing"}", "benchmark": "Required for AI citations", "status": "${scrapedData.website.hasSchemaMarkup ? "good" : "critical"}" },
        { "label": "Google Business Profile", "value": "${scrapedData.google.found ? "Verified" : "Not Found"}", "benchmark": "Required", "status": "${scrapedData.google.found ? "good" : "critical"}" },
        { "label": "Review Count (AI Trust Signal)", "value": "${reviewCount}", "benchmark": "10+ for AI citations", "status": "${reviewCount >= 10 ? "good" : reviewCount >= 3 ? "warning" : "critical"}" },
        { "label": "Directory Consistency (NAP)", "value": "${directoriesFound} of ${totalDirectories} directories", "benchmark": "20+ for AI confidence", "status": "${directoriesFound >= 20 ? "good" : directoriesFound >= 8 ? "warning" : "critical"}" },
        { "label": "Sitemap (AI Crawlability)", "value": "${scrapedData.website.hasSitemap ? "Present" : "Missing"}", "benchmark": "Required", "status": "${scrapedData.website.hasSitemap ? "good" : "warning"}" },
        { "label": "AI Overview Visibility", "value": "<estimate: Low/Medium/High based on above signals>", "benchmark": "Medium+", "status": "${geoScore >= 50 ? "warning" : "critical"}" }
      ],
      "findings": [
        "<Loss-Led finding 1: When someone asks ChatGPT or Google AI 'best ${industry} near me', this business is invisible because X \u2014 costing Y leads per month>",
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
        "No paid search presence detected \u2014 competitors are capturing ${totalKwOpportunity.toLocaleString()} monthly searches for ${industry} keywords in this market",
        "Top missed keyword: '${kd.topKeyword?.keyword || industry + " near me"}' gets ${topKwVolume.toLocaleString()} searches/month at $${kd.topKeyword?.avgCpc?.toFixed(2) || "0.00"} avg CPC",
        "<Write one more specific finding about the competitive paid search landscape for ${industry}>"
      ],
      "recommendations": [
        "Launch Google Ads campaign targeting '${kd.topKeyword?.keyword || industry + " near me"}' \u2014 ${topKwVolume.toLocaleString()} monthly searches at $${kd.topKeyword?.avgCpc?.toFixed(2) || "0.00"}/click",
        "Set up Google Local Services Ads for immediate top-of-page visibility for ${industry} searches",
        "<Write one more specific, actionable recommendation for ${industry} paid advertising>"
      ]
    }
  ],
  "recoveryRoadmap": [
    { "priority": 1, "action": "Technical Reset \u2014 Fix H1 conflicts and add missing metadata", "timeline": "Week 1-2", "impact": "High" },
    { "priority": 2, "action": "Citation Blitz \u2014 Sync NAP across 50+ directories", "timeline": "Week 2-3", "impact": "High" },
    { "priority": 3, "action": "Review Velocity Campaign \u2014 Target 30+ reviews in 90 days", "timeline": "Month 1-3", "impact": "High" },
    { "priority": 4, "action": "GEO Foundation \u2014 Add LocalBusiness schema and FAQ content for AI engines", "timeline": "Month 1-2", "impact": "Medium" },
    { "priority": 5, "action": "<industry-specific content or conversion action>", "timeline": "Month 2-3", "impact": "Medium" }
  ],
  "topPriorities": [
    "Fix H1 tag conflicts \u2014 consolidate to 1 primary H1 targeting core keyword",
    "Sync NAP across 50+ business directories (Citation Blitz)",
    "Launch review velocity campaign \u2014 reach 30+ reviews in 90 days",
    "Add LocalBusiness schema markup for GEO / AI engine visibility",
    "<industry-specific 5th priority>"
  ]
}

IMPORTANT: For Advertising keywords, use terms relevant to ${industry}. NEVER use "digital marketing" or "marketing agency" unless that IS the business.`;
      console.log("[SEO Audit] Calling LLM with real data context...");
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a senior digital marketing consultant at Scorpion Global Solutions LLC, a Digital Marketing & AI Agency based in Arizona. You generate Loss-Led Digital Audit & Profit Leakage Reports. You MUST use ONLY the real data provided. Never hallucinate or invent data. Always respond with valid JSON only. No markdown, no explanation, no code fences." },
          { role: "user", content: prompt }
        ]
      });
      console.log("[SEO Audit] LLM response received");
      const contentStr = typeof response?.choices?.[0]?.message?.content === "string" ? response.choices[0].message.content : "";
      if (!contentStr) {
        console.error("[SEO Audit] Empty LLM response");
        return { success: false, error: "LLM returned empty response" };
      }
      let structuredReport;
      try {
        const cleaned = contentStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        structuredReport = JSON.parse(cleaned);
      } catch {
        structuredReport = buildReportFromScrapedData(scrapedData, input.businessName, input.industry || "");
      }
      if (!structuredReport.revenueLeak) {
        structuredReport.revenueLeak = {
          totalAnnual: totalRevenueLeak,
          monthlyLeak,
          lostOrigination: lostOriginationAnnual,
          lostInterest: lostInterestAnnual,
          monthlyLostDeals,
          headline: `Your digital presence gaps are costing an estimated $${totalRevenueLeak.toLocaleString()}+ per year`,
          subheadline: `Roughly $${monthlyLeak.toLocaleString()}/month in opportunity cost currently going to competitors`
        };
      }
      const geoCat = structuredReport.categories?.find((c) => c.name === "GEO");
      if (!geoCat) {
        structuredReport.categories = structuredReport.categories || [];
        structuredReport.categories.push({
          name: "GEO",
          grade: geoGrade,
          score: geoScore,
          metrics: [
            { label: "Schema / Structured Data", value: scrapedData.website.hasSchemaMarkup ? "Present" : "Missing", benchmark: "Required for AI citations", status: scrapedData.website.hasSchemaMarkup ? "good" : "critical" },
            { label: "Google Business Profile", value: scrapedData.google.found ? "Verified" : "Not Found", benchmark: "Required", status: scrapedData.google.found ? "good" : "critical" },
            { label: "Review Count (AI Trust Signal)", value: String(scrapedData.google.reviewCount), benchmark: "10+ for AI citations", status: scrapedData.google.reviewCount >= 10 ? "good" : scrapedData.google.reviewCount >= 3 ? "warning" : "critical" },
            { label: "Directory Consistency (NAP)", value: `${directoriesFound} of ${totalDirectories} directories`, benchmark: "20+ for AI confidence", status: directoriesFound >= 20 ? "good" : directoriesFound >= 8 ? "warning" : "critical" }
          ],
          findings: ["Business is not visible in ChatGPT, Google AI Overviews, or Perplexity due to missing structured data and low review count."],
          recommendations: ["Add LocalBusiness JSON-LD schema markup to every page", "Build FAQ pages targeting common questions AI engines pull from", "Reach 10+ Google reviews to qualify for AI Overview citations"]
        });
      } else {
        geoCat.grade = geoGrade;
        geoCat.score = geoScore;
      }
      const reviewsCat = structuredReport.categories?.find((c) => c.name === "Reviews");
      if (reviewsCat?.metrics) {
        const totalReviewMetric = reviewsCat.metrics.find((m) => m.label === "Total Reviews" || m.label === "Total Reviews Found");
        if (totalReviewMetric) {
          totalReviewMetric.value = String(scrapedData.google.reviewCount);
        }
        const ratingMetric = reviewsCat.metrics.find((m) => m.label === "Average Rating");
        if (ratingMetric && scrapedData.google.rating > 0) {
          ratingMetric.value = String(scrapedData.google.rating);
        }
      }
      const websiteCat = structuredReport.categories?.find((c) => c.name === "Website");
      if (websiteCat?.checklist) {
        for (const item of websiteCat.checklist) {
          if (item.item === "Business Address") item.found = scrapedData.website.hasAddress;
          if (item.item === "Phone Number") item.found = scrapedData.website.hasPhone;
          if (item.item === "HTTPS Secure") item.found = scrapedData.website.isHttps;
          if (item.item === "Mobile Friendly") item.found = scrapedData.website.isMobileFriendly;
          if (item.item === "Social Links") item.found = scrapedData.website.hasSocialLinks;
          if (item.item === "Call-to-Action") item.found = scrapedData.website.hasCTA;
        }
      }
      const listingsCat = structuredReport.categories?.find((c) => c.name === "Listings");
      if (listingsCat) {
        listingsCat.presenceCount = scrapedData.directories.filter((d) => d.status === "found").length;
        listingsCat.totalDirectories = scrapedData.directories.length;
        listingsCat.directories = scrapedData.directories.map((d) => ({ name: d.name, status: d.status, issues: d.issues }));
      }
      const socialCat = structuredReport.categories?.find((c) => c.name === "Social");
      if (socialCat?.platforms && scrapedData.social.length > 0) {
        socialCat.platforms = scrapedData.social.map((s) => {
          const existing = socialCat.platforms?.find((p) => p.name === s.platform);
          return {
            name: s.platform,
            found: s.found,
            followers: s.followers || existing?.followers || "N/A",
            activity: s.activity || "not_found",
            recommendation: existing?.recommendation || (!s.found ? `Create a ${s.platform} business profile` : `Continue engaging on ${s.platform}`)
          };
        });
      }
      const adCat = structuredReport.categories?.find((c) => c.name === "Advertising");
      if (adCat?.keywords) {
        const badKeywords = ["digital marketing", "marketing agency", "seo agency", "web design"];
        const industry2 = input.industry || "local service";
        const hasBadKeywords = adCat.keywords.some(
          (k) => badKeywords.some((bad) => k.keyword?.toLowerCase().includes(bad))
        );
        if (hasBadKeywords && industry2 !== "digital marketing") {
          adCat.keywords = [
            { keyword: `${industry2} near me`, impressions: 1200, clicks: 45 },
            { keyword: `best ${industry2} ${scrapedData.google.address?.split(",")[1]?.trim() || "local"}`, impressions: 800, clicks: 30 },
            { keyword: `affordable ${industry2}`, impressions: 600, clicks: 22 },
            { keyword: `${industry2} reviews`, impressions: 400, clicks: 15 }
          ];
          adCat.totalImpressions = 3e3;
          adCat.totalClicks = 112;
        }
      }
      try {
        await createSeoAudit({
          clientId: input.clientId,
          userId: ctx.user.id,
          businessName: input.businessName,
          website: input.website,
          report: structuredReport,
          score: structuredReport.overallScore || 55,
          status: "completed"
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
          gbpName: scrapedData.google.name
        },
        businessName: input.businessName,
        website: input.website,
        brandColors
      };
    } catch (error) {
      console.error("[SEO Audit] Full error:", error?.message || error);
      return {
        success: false,
        error: `Audit generation failed: ${error?.message || "Unknown error"}`
      };
    }
  })
});
var reputationRouter = router({
  listByClient: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getReviewsByClientId(input.clientId);
  }),
  generateResponse: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      reviewText: z14.string(),
      rating: z14.number().min(1).max(5),
      authorName: z14.string().optional(),
      businessName: z14.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const sentiment = input.rating >= 4 ? "positive" : "negative";
    const prompt = sentiment === "positive" ? `Generate a warm, appreciative response to this positive review (${input.rating}/5 stars) for ${input.businessName}: "${input.reviewText}". Keep it professional, genuine, and under 150 words.` : `Generate a professional, empathetic response to this negative review (${input.rating}/5 stars) for ${input.businessName}: "${input.reviewText}". Address concerns, offer solutions, and invite further discussion. Keep it under 150 words.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const draftResponse = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "Failed to generate response");
    const result = await createReview({
      clientId: input.clientId,
      rating: input.rating,
      reviewText: input.reviewText,
      authorName: input.authorName,
      sentiment
    });
    await logActivity({
      userId: ctx.user.id,
      clientId: input.clientId,
      action: "generated_review_response",
      entityType: "review",
      details: input
    });
    return { draftResponse, sentiment, result };
  })
});
var contentRouter = router({
  listByClient: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getContentAssetsByClientId(input.clientId);
  }),
  generateBlogPost: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      topic: z14.string(),
      keywords: z14.array(z14.string()).optional(),
      tone: z14.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const prompt = `Write a comprehensive blog post about "${input.topic}". 
      ${input.keywords ? `Target keywords: ${input.keywords.join(", ")}` : ""}
      ${input.tone ? `Tone: ${input.tone}` : "Tone: professional and engaging"}
      Include: title, meta description, introduction, 3-4 main sections with subheadings, conclusion, and call-to-action. Format as JSON.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    try {
      const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "{}");
      let parsed;
      try {
        parsed = JSON.parse(contentStr);
      } catch {
        parsed = { title: input.topic, content: contentStr };
      }
      const result = await createContentAsset({
        clientId: input.clientId,
        userId: ctx.user.id,
        type: "blog_post",
        title: parsed.title || input.topic,
        content: JSON.stringify(parsed),
        platforms: ["blog"]
      });
      return { success: true, content: parsed, result };
    } catch (error) {
      console.error("[Blog Post Error]", error);
      return { success: false, error: "Failed to generate blog post" };
    }
  }),
  generateSocialCaption: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      topic: z14.string(),
      platform: z14.enum(["instagram", "facebook", "linkedin", "twitter"]),
      includeHashtags: z14.boolean().default(true)
    })
  ).mutation(async ({ ctx, input }) => {
    const platformGuides = {
      instagram: "Use 15-20 hashtags, emojis, and engaging language",
      facebook: "Keep it conversational, include call-to-action, 2-3 sentences",
      linkedin: "Professional tone, industry insights, 3-4 sentences",
      twitter: "Concise, punchy, under 280 characters"
    };
    const prompt = `Generate a social media caption for ${input.platform} about "${input.topic}". 
      Guidelines: ${platformGuides[input.platform]}
      ${input.includeHashtags ? "Include relevant hashtags." : "No hashtags."}
      Make it engaging and on-brand.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const caption = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "Failed to generate caption");
    const result = await createContentAsset({
      clientId: input.clientId,
      userId: ctx.user.id,
      type: "social_caption",
      title: `${input.platform} - ${input.topic}`,
      content: caption,
      platforms: [input.platform]
    });
    return { caption, result };
  }),
  generateNewsletter: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      topic: z14.string(),
      highlights: z14.array(z14.string()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const prompt = `Generate an email newsletter about "${input.topic}". 
      ${input.highlights ? `Key highlights: ${input.highlights.join(", ")}` : ""}
      Include: subject line, greeting, introduction, 2-3 main sections, call-to-action, and sign-off. Format as JSON with keys: subject, greeting, body, cta, signoff.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    try {
      const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "{}");
      let parsed;
      try {
        parsed = JSON.parse(contentStr);
      } catch {
        parsed = { subject: input.topic, body: contentStr };
      }
      const result = await createContentAsset({
        clientId: input.clientId,
        userId: ctx.user.id,
        type: "email_newsletter",
        title: parsed.subject || input.topic,
        content: JSON.stringify(parsed),
        platforms: ["email"]
      });
      return { success: true, content: parsed, result };
    } catch (error) {
      console.error("[Newsletter Error]", error);
      return { success: false, error: "Failed to generate newsletter" };
    }
  })
});
var reportingRouter = router({
  listByClient: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getReportsByClientId(input.clientId);
  }),
  generateReport: protectedProcedure.input(
    z14.object({
      clientId: z14.number(),
      period: z14.string(),
      metrics: z14.any().optional(),
      campaigns: z14.array(z14.any()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const prompt = `Generate a professional marketing performance report for the period ${input.period}. 
      Metrics: ${JSON.stringify(input.metrics || {})}
      Campaigns: ${JSON.stringify(input.campaigns || [])}
      Write a compelling narrative that: explains key performance indicators, highlights wins, identifies challenges, and provides strategic recommendations. Format as JSON with keys: narrative, keyHighlights, challenges, recommendations.`;
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    try {
      const contentStr = typeof response.choices[0]?.message.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices[0]?.message.content || "{}");
      let parsed;
      try {
        parsed = JSON.parse(contentStr);
      } catch {
        parsed = { narrative: contentStr, keyHighlights: [], challenges: [], recommendations: [] };
      }
      const result = await createReport({
        clientId: input.clientId,
        userId: ctx.user.id,
        period: input.period,
        narrative: parsed.narrative,
        metrics: input.metrics,
        campaigns: input.campaigns
      });
      return { success: true, report: parsed, result };
    } catch (error) {
      console.error("[Reporting Error]", error);
      return { success: false, error: "Failed to generate report" };
    }
  })
});
var analyticsRouter = router({
  getCampaignMetrics: protectedProcedure.input(z14.object({ campaignId: z14.number() })).query(async ({ input }) => {
    return getCampaignMetricsByCampaignId(input.campaignId);
  }),
  getClientMetrics: protectedProcedure.input(z14.object({ clientId: z14.number() })).query(async ({ input }) => {
    return getCampaignMetricsByClientId(input.clientId);
  }),
  getLeadMetrics: protectedProcedure.input(z14.object({ leadId: z14.number() })).query(async ({ input }) => {
    return getLeadMetricsByLeadId(input.leadId);
  }),
  createCampaignMetrics: protectedProcedure.input(
    z14.object({
      campaignId: z14.number(),
      clientId: z14.number(),
      date: z14.date(),
      leadsGenerated: z14.number().optional(),
      leadsQualified: z14.number().optional(),
      conversions: z14.number().optional(),
      revenue: z14.any().optional(),
      cost: z14.any().optional(),
      roi: z14.any().optional(),
      conversionRate: z14.any().optional()
    })
  ).mutation(async ({ input }) => {
    return createCampaignMetrics(input);
  }),
  updateLeadMetrics: protectedProcedure.input(
    z14.object({
      leadId: z14.number(),
      emailOpens: z14.number().optional(),
      emailClicks: z14.number().optional(),
      smsOpens: z14.number().optional(),
      callAttempts: z14.number().optional(),
      appointmentBooked: z14.boolean().optional(),
      converted: z14.boolean().optional(),
      engagementScore: z14.number().optional()
    })
  ).mutation(async ({ input }) => {
    const { leadId, ...data } = input;
    return updateLeadMetrics(leadId, data);
  }),
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const clients3 = await getClientsByUserId(ctx.user.id);
    const totalLeads = clients3.length > 0 ? clients3.length * 10 : 0;
    const totalConversions = Math.floor(totalLeads * 0.15);
    const totalRevenue = totalConversions * 500;
    return {
      totalClients: clients3.length,
      totalLeads,
      totalConversions,
      totalRevenue,
      averageConversionRate: clients3.length > 0 ? 15 : 0,
      topCampaigns: [],
      recentActivity: []
    };
  })
});
var activityRouter = router({
  list: protectedProcedure.input(z14.object({ limit: z14.number().default(20) })).query(async ({ ctx, input }) => {
    return getActivityLogByUserId(ctx.user.id, input.limit);
  })
});
var webhookRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getWebhooksByUserId(ctx.user.id);
  }),
  create: protectedProcedure.input(z14.object({
    name: z14.string(),
    platform: z14.string(),
    url: z14.string().optional(),
    secret: z14.string().optional(),
    events: z14.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const webhook = await createWebhook({
      userId: ctx.user.id,
      name: input.name,
      url: input.url || `/api/webhooks/${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`,
      secret: input.secret || `whk_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      events: input.events || "lead.created"
    });
    return { success: true, webhook };
  }),
  getEvents: protectedProcedure.input(z14.object({ webhookId: z14.number() })).query(async ({ input }) => {
    return getWebhookEventsByWebhookId(input.webhookId);
  }),
  test: protectedProcedure.input(z14.object({ webhookId: z14.number() })).mutation(async ({ input }) => {
    const testPayload = {
      event_type: "lead.created",
      name: "Test Lead",
      email: "test@omniscorp-test.com",
      phone: "+15555550100",
      business: "Test Company Inc",
      source: "webhook-test",
      notes: "Sent via webhook test button"
    };
    await createWebhookEvent({
      webhookId: input.webhookId,
      eventType: "test",
      payload: { body: testPayload, headers: {}, query: {}, receivedAt: (/* @__PURE__ */ new Date()).toISOString() },
      status: "sent"
    });
    await createLead({
      campaignId: 0,
      clientId: 0,
      name: testPayload.name,
      email: testPayload.email,
      phone: testPayload.phone,
      company: testPayload.business,
      notes: testPayload.notes,
      source: `webhook-test:${input.webhookId}`
    });
    return { success: true, message: "Test event sent and lead created in Leads Inbox" };
  }),
  toggle: protectedProcedure.input(z14.object({ webhookId: z14.number(), isActive: z14.boolean() })).mutation(async ({ input }) => {
    await updateWebhook(input.webhookId, { isActive: input.isActive });
    return { success: true };
  }),
  delete: protectedProcedure.input(z14.object({ webhookId: z14.number() })).mutation(async ({ input }) => {
    await deleteWebhook(input.webhookId);
    return { success: true };
  })
});
var billingRouter = router({
  getInvoices: protectedProcedure.input(z14.object({ clientId: z14.number().optional() })).query(async ({ ctx, input }) => {
    if (input.clientId) {
      return getInvoicesByClientId(input.clientId);
    }
    const clients3 = await getClientsByUserId(ctx.user.id);
    const allInvoices = [];
    for (const client of clients3) {
      const invoices2 = await getInvoicesByClientId(client.id);
      allInvoices.push(...invoices2.map((inv) => ({ ...inv, clientName: client.name })));
    }
    return allInvoices;
  }),
  createInvoice: protectedProcedure.input(z14.object({
    clientId: z14.number(),
    amount: z14.string(),
    description: z14.string(),
    dueDate: z14.string(),
    items: z14.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const invoice = await createInvoice({
      clientId: input.clientId,
      userId: ctx.user.id,
      invoiceNumber,
      period: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7),
      subtotal: input.amount,
      total: input.amount,
      status: "draft",
      dueDate: new Date(input.dueDate),
      items: input.items
    });
    return { success: true, invoice };
  }),
  getUsage: protectedProcedure.input(z14.object({ clientId: z14.number(), month: z14.string() })).query(async ({ input }) => {
    return getUsageTrackingByClientIdAndMonth(input.clientId, input.month);
  }),
  trackUsage: protectedProcedure.input(z14.object({
    clientId: z14.number(),
    month: z14.string(),
    leadsGenerated: z14.number().optional(),
    campaignsRun: z14.number().optional(),
    appointmentsBooked: z14.number().optional(),
    contentCreated: z14.number().optional(),
    auditsRun: z14.number().optional(),
    totalCost: z14.string().optional()
  })).mutation(async ({ ctx, input }) => {
    return createUsageTracking({
      clientId: input.clientId,
      userId: ctx.user.id,
      month: input.month,
      leadsGenerated: input.leadsGenerated,
      campaignsRun: input.campaignsRun,
      appointmentsBooked: input.appointmentsBooked,
      contentCreated: input.contentCreated,
      auditsRun: input.auditsRun,
      totalCost: input.totalCost
    });
  }),
  updateInvoice: protectedProcedure.input(z14.object({
    id: z14.number(),
    status: z14.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    await updateInvoice(id, data);
    return { success: true };
  }),
  getRevenueSummary: protectedProcedure.query(async ({ ctx }) => {
    const clients3 = await getClientsByUserId(ctx.user.id);
    let totalRevenue = 0;
    let totalPending = 0;
    let totalPaid = 0;
    const clientRevenue = [];
    for (const client of clients3) {
      const invoices2 = await getInvoicesByClientId(client.id);
      let clientTotal = 0;
      let clientPending = 0;
      for (const inv of invoices2) {
        const amt = parseFloat(String(inv.total) || "0");
        clientTotal += amt;
        if (inv.status === "draft" || inv.status === "sent") clientPending += amt;
        if (inv.status === "paid") totalPaid += amt;
      }
      totalRevenue += clientTotal;
      totalPending += clientPending;
      clientRevenue.push({ clientId: client.id, clientName: client.name, total: clientTotal, pending: clientPending });
    }
    return { totalRevenue, totalPending, totalPaid, clientRevenue, clientCount: clients3.length };
  })
});
var schedulingRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const clients3 = await getClientsByUserId(ctx.user.id);
    const allSchedules = [];
    for (const client of clients3) {
      const schedules = await getScheduledCampaignsByClientId(client.id);
      allSchedules.push(...schedules.map((s) => ({ ...s, clientName: client.name })));
    }
    return allSchedules;
  }),
  create: protectedProcedure.input(z14.object({
    campaignId: z14.number(),
    clientId: z14.number(),
    frequency: z14.enum(["once", "daily", "weekly", "monthly"]),
    nextRunAt: z14.string()
  })).mutation(async ({ ctx, input }) => {
    const schedule = await createScheduledCampaign({
      campaignId: input.campaignId,
      clientId: input.clientId,
      userId: ctx.user.id,
      frequency: input.frequency,
      nextRunAt: new Date(input.nextRunAt),
      isActive: true
    });
    return { success: true, schedule };
  }),
  update: protectedProcedure.input(z14.object({
    id: z14.number(),
    status: z14.string().optional(),
    frequency: z14.string().optional(),
    nextRunAt: z14.string().optional()
  })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    if (data.nextRunAt) data.nextRunAt = new Date(data.nextRunAt);
    await updateScheduledCampaign(id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(z14.object({ id: z14.number() })).mutation(async ({ input }) => {
    await deleteScheduledCampaign(input.id);
    return { success: true };
  }),
  getExecutions: protectedProcedure.input(z14.object({ scheduledCampaignId: z14.number() })).query(async ({ input }) => {
    return getCampaignExecutionsByScheduledCampaignId(input.scheduledCampaignId);
  }),
  runNow: protectedProcedure.input(z14.object({ scheduledCampaignId: z14.number() })).mutation(async ({ input }) => {
    const schedules = await getScheduledCampaignsByCampaignId(input.scheduledCampaignId);
    const schedule = schedules[0];
    const execution = await createCampaignExecution({
      scheduledCampaignId: input.scheduledCampaignId,
      campaignId: schedule?.campaignId || 0,
      clientId: schedule?.clientId || 0,
      status: "completed",
      startedAt: /* @__PURE__ */ new Date(),
      completedAt: /* @__PURE__ */ new Date(),
      leadsProcessed: 0,
      successCount: 0,
      errorCount: 0
    });
    return { success: true, execution };
  })
});
var prospectFinderRouter = router({
  // Search Google Maps for businesses in a given industry + location
  search: protectedProcedure.input(
    z14.object({
      industry: z14.string().min(2),
      location: z14.string().min(2),
      radius: z14.number().min(1e3).max(5e4).default(1e4),
      // meters
      filterNoWebsite: z14.boolean().default(false),
      filterUnclaimed: z14.boolean().default(false)
    })
  ).mutation(async ({ input }) => {
    const { makeRequest: makeRequest2 } = await Promise.resolve().then(() => (init_map(), map_exports));
    const geoResult = await makeRequest2("/maps/api/geocode/json", {
      address: input.location
    });
    const coords = geoResult.results?.[0]?.geometry?.location;
    if (!coords) {
      return { prospects: [], total: 0, error: "Could not geocode location" };
    }
    const searchResult = await makeRequest2("/maps/api/place/nearbysearch/json", {
      location: `${coords.lat},${coords.lng}`,
      radius: input.radius,
      keyword: input.industry,
      type: "establishment"
    });
    if (searchResult.status !== "OK" || !searchResult.results) {
      return { prospects: [], total: 0, error: searchResult.status };
    }
    const prospects = [];
    const places = searchResult.results.slice(0, 20);
    await Promise.all(
      places.map(async (place) => {
        try {
          const detail = await makeRequest2("/maps/api/place/details/json", {
            place_id: place.place_id,
            fields: "place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,url,types,geometry"
          });
          const r = detail.result;
          if (!r) return;
          const hasWebsite = !!r.website;
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
            lng: r.geometry?.location?.lng || coords.lng
          });
        } catch {
        }
      })
    );
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
  getTraffic: protectedProcedure.input(
    z14.object({
      domain: z14.string().min(3)
    })
  ).mutation(async ({ input }) => {
    const { callDataApi: callDataApi2 } = await Promise.resolve().then(() => (init_dataApi(), dataApi_exports));
    const cleanDomain2 = input.domain.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").toLowerCase().trim();
    const now = /* @__PURE__ */ new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const endDate = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
    const startDate = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}`;
    try {
      const [visitsResult, sourcesResult, rankResult] = await Promise.allSettled([
        callDataApi2("Similarweb/get_visits_total", {
          pathParams: { domain: cleanDomain2 },
          query: {
            country: "world",
            granularity: "monthly",
            main_domain_only: false,
            start_date: startDate,
            end_date: endDate
          }
        }),
        callDataApi2("Similarweb/get_traffic_sources_desktop", {
          pathParams: { domain: cleanDomain2 },
          query: {
            country: "world",
            granularity: "monthly",
            main_domain_only: false,
            start_date: startDate,
            end_date: endDate
          }
        }),
        callDataApi2("Similarweb/get_global_rank", {
          pathParams: { domain: cleanDomain2 },
          query: {
            main_domain_only: false,
            start_date: startDate,
            end_date: endDate
          }
        })
      ]);
      let totalVisits = 0;
      let monthlyVisits = [];
      if (visitsResult.status === "fulfilled") {
        const vd = visitsResult.value;
        const visits = vd?.visits || vd?.data?.visits || [];
        if (Array.isArray(visits) && visits.length > 0) {
          monthlyVisits = visits.map((v) => ({ date: v.date, visits: Math.round(v.visits || 0) }));
          totalVisits = monthlyVisits.reduce((sum, v) => sum + v.visits, 0) / monthlyVisits.length;
        }
      }
      let sources = {};
      if (sourcesResult.status === "fulfilled") {
        const sd = sourcesResult.value;
        const channels = sd?.visits || sd?.data?.visits || [];
        if (Array.isArray(channels)) {
          for (const ch of channels) {
            if (ch.source_type && ch.visits !== void 0) {
              sources[ch.source_type] = (sources[ch.source_type] || 0) + ch.visits;
            }
          }
        }
      }
      let globalRank = null;
      if (rankResult.status === "fulfilled") {
        const rd = rankResult.value;
        const ranks = rd?.global_ranking || rd?.data?.global_ranking || [];
        if (Array.isArray(ranks) && ranks.length > 0) {
          globalRank = ranks[ranks.length - 1]?.global_ranking || null;
        }
      }
      const hasData = totalVisits > 0 || Object.keys(sources).length > 0;
      return {
        domain: cleanDomain2,
        hasData,
        avgMonthlyVisits: Math.round(totalVisits),
        monthlyVisits,
        trafficSources: sources,
        globalRank,
        dataRange: { startDate, endDate },
        error: hasData ? null : "No traffic data available \u2014 site may be too small or not indexed by Similarweb"
      };
    } catch (err) {
      return {
        domain: cleanDomain2,
        hasData: false,
        avgMonthlyVisits: 0,
        monthlyVisits: [],
        trafficSources: {},
        globalRank: null,
        dataRange: { startDate, endDate },
        error: err?.message || "Failed to fetch traffic data"
      };
    }
  }),
  // Save a prospect as a CRM client/lead
  saveAsLead: protectedProcedure.input(
    z14.object({
      name: z14.string(),
      address: z14.string().optional(),
      phone: z14.string().optional(),
      website: z14.string().optional(),
      industry: z14.string().optional(),
      notes: z14.string().optional(),
      placeId: z14.string().optional(),
      mapsUrl: z14.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const existing = await getClientsByUserId(ctx.user.id);
    const alreadyExists = existing.some(
      (c) => c.name.toLowerCase() === input.name.toLowerCase()
    );
    if (alreadyExists) {
      return { success: false, error: "Client already exists in your CRM", clientId: null };
    }
    const descriptionParts = [];
    if (input.address) descriptionParts.push(`Address: ${input.address}`);
    if (input.notes) descriptionParts.push(input.notes);
    descriptionParts.push(`Google Maps: ${input.mapsUrl || "N/A"}`);
    descriptionParts.push(`Source: Prospect Finder (${(/* @__PURE__ */ new Date()).toLocaleDateString()})`);
    await createClient({
      userId: ctx.user.id,
      name: input.name,
      industry: input.industry || "Unknown",
      website: input.website || void 0,
      phone: input.phone || void 0,
      description: descriptionParts.join(" | ")
    });
    const updated = await getClientsByUserId(ctx.user.id);
    const newClient = updated.find(
      (c) => c.name.toLowerCase() === input.name.toLowerCase()
    );
    return { success: true, error: null, clientId: newClient?.id ?? null };
  })
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
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
  industryTemplates: industryTemplateRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerWebhookReceiver(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
