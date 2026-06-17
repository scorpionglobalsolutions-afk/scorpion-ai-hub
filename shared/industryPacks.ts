// Industry Starter Packs — GHL Snapshot Equivalent
// Pre-built content for HVAC, Roofing, Pool Services, Insurance, Business Loans

export type IndustryPackId = "hvac" | "roofing" | "pool" | "insurance" | "business_loans";

export interface FollowUpStep {
  day: number;
  channel: "sms" | "email";
  subject?: string;
  body: string;
}

export interface ObjectionHandler {
  objection: string;
  response: string;
}

export interface ProposalLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IndustryPack {
  id: IndustryPackId;
  name: string;
  icon: string;
  color: string;
  description: string;
  targetCustomer: string;
  averageDealSize: number;
  // Speed to Lead
  speedToLeadSMS: string;
  speedToLeadEmail: { subject: string; body: string };
  // Voice Assistant
  voiceScript: string;
  voiceSystemPrompt: string;
  // Follow-Up Sequences
  followUpSequence: FollowUpStep[];
  // Objection Handlers
  objectionHandlers: ObjectionHandler[];
  // Proposal Template
  proposalTitle: string;
  proposalIntro: string;
  proposalLineItems: ProposalLineItem[];
  proposalTerms: string;
  // Review Request
  reviewRequestSMS: string;
  reviewRequestEmail: { subject: string; body: string };
  // Missed Call Text-Back
  missedCallSMS: string;
  // Pre-Qual Questions
  preQualQuestions: { question: string; weight: number; type: "yes_no" | "multiple_choice" | "text"; options?: string[] }[];
  // Chat Agent
  chatWelcomeMessage: string;
  chatSystemPrompt: string;
  chatFAQs: { question: string; answer: string }[];
}

export const INDUSTRY_PACKS: IndustryPack[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // HVAC
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "hvac",
    name: "HVAC",
    icon: "🌡️",
    color: "#3b82f6",
    description: "Heating, ventilation, and air conditioning services — residential and commercial",
    targetCustomer: "Homeowners and property managers needing AC/heating repair, maintenance, or new system installation",
    averageDealSize: 4500,

    speedToLeadSMS: "Hi {{firstName}}, this is {{agentName}} from {{businessName}}! Thanks for reaching out about your HVAC needs. We have same-day availability and our certified techs are standing by. Can I get a quick call scheduled in the next 15 minutes? Reply YES and I'll call you right now!",
    speedToLeadEmail: {
      subject: "Your HVAC Request — {{businessName}} Is Ready to Help Today",
      body: `Hi {{firstName}},

Thank you for contacting {{businessName}}! We received your request and want to make sure you're comfortable in your home as quickly as possible.

Here's what happens next:
✅ A certified HVAC technician will call you within 15 minutes
✅ We offer same-day service for most repairs
✅ All work is backed by our 1-year labor warranty

To get started, simply reply to this email or call us at {{phone}}.

We look forward to serving you!

{{agentName}}
{{businessName}}`
    },

    voiceScript: `OPENING:
"Hi, this is {{agentName}} calling from {{businessName}}. I'm following up on your HVAC service request — is now a good time to talk for just 2 minutes?"

QUALIFY:
"Great! Can you tell me a little about what's going on with your system? Is it not cooling/heating, making a noise, or is this for a tune-up?"

IF REPAIR:
"I completely understand — that's uncomfortable, especially in this weather. Our technicians are in your area today. We charge a $79 diagnostic fee which gets applied to the repair if you move forward. Does that work for you?"

IF NEW SYSTEM:
"Perfect timing — we're actually running a promotion this month on new installs with 0% financing for 18 months. Would you like me to schedule a free in-home estimate?"

CLOSE:
"I have an opening today at [TIME] or tomorrow at [TIME]. Which works better for you?"

OBJECTION — Price:
"I completely understand. Our diagnostic fee is the lowest in the area, and we'll give you a full written estimate before we do any work — no surprises. Fair enough?"

OBJECTION — Already have someone:
"No problem at all! If they can't get out today, keep our number handy. We're {{phone}} and we can usually be there same day."

CLOSE:
"Awesome, I've got you scheduled for [DATE/TIME]. You'll get a text confirmation and a reminder 30 minutes before the tech arrives. Is there anything else I can help with?"`,

    voiceSystemPrompt: `You are a friendly, professional HVAC scheduling agent for {{businessName}}. Your goal is to qualify the caller's HVAC issue (repair, maintenance, or new installation), empathize with their discomfort, and book a service appointment or free estimate. Always lead with same-day availability. Overcome price objections by emphasizing the diagnostic fee credit and written estimates. Never quote final prices over the phone — always schedule an in-home visit. Keep calls under 5 minutes. Be warm, confident, and solution-focused.`,

    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! This is {{businessName}} — we just tried to reach you about your HVAC request. We have same-day openings today. Reply CALL and we'll reach out immediately, or call us at {{phone}}. 🌡️" },
      { day: 1, channel: "email", subject: "Still having HVAC issues? We can help today", body: `Hi {{firstName}},

We noticed we haven't been able to connect yet. We don't want you to be uncomfortable at home any longer than necessary.

Our certified HVAC technicians are available today and tomorrow with flexible scheduling. Here's what sets us apart:

• Same-day service available
• Upfront pricing — no surprises
• 1-year labor warranty on all repairs
• 5-star rated on Google

Ready to get your system running perfectly? Call {{phone}} or reply to this email.

{{businessName}} Team` },
      { day: 3, channel: "sms", body: "{{firstName}}, checking in from {{businessName}}. Still need HVAC help? We're offering a FREE system inspection this week (normally $99). Limited spots — reply YES to claim yours! 🔧" },
      { day: 7, channel: "email", subject: "Free HVAC Tune-Up Offer — This Week Only", body: `Hi {{firstName}},

We haven't heard back and we want to make sure you're taken care of. This week we're offering a complimentary HVAC tune-up for new customers — a $99 value, completely free.

During the tune-up our tech will:
✅ Check refrigerant levels
✅ Clean coils and filters
✅ Test all electrical components
✅ Give you a full system health report

Call {{phone}} or reply YES to claim your free tune-up before spots fill up.

{{businessName}}` },
      { day: 14, channel: "sms", body: "Last check-in from {{businessName}}, {{firstName}}. If you ever need HVAC service, repair, or a new system — we're here. Save our number: {{phone}}. Have a great day! 😊" },
    ],

    objectionHandlers: [
      { objection: "Your price is too high", response: "I completely understand — HVAC work is a significant investment. What I can promise is that our quote includes everything upfront with no hidden fees, and our work is backed by a 1-year labor warranty. Many customers find that paying a little more now saves them from repeat repairs later. Would a payment plan help make this more comfortable?" },
      { objection: "I need to think about it", response: "Absolutely, take your time! I just want to make sure you're aware that our current pricing is locked in through this week — after that our rates adjust with the season. Can I follow up with you tomorrow morning?" },
      { objection: "I already have an HVAC company", response: "That's great — it's always smart to have a trusted contractor. If they're ever unavailable or you want a second opinion on a quote, we're here. May I send you our contact info just in case?" },
      { objection: "I'll wait until it completely breaks", response: "I hear that a lot! The challenge is that waiting usually turns a $300 repair into a $2,000 emergency replacement — especially in peak season when parts and techs are harder to get. A quick tune-up now could save you a lot of stress. Want me to get you on the schedule for a low-cost inspection?" },
      { objection: "I'm not ready right now", response: "No pressure at all! Can I ask — is it a timing thing or a budget thing? I ask because we have financing options that make it $0 out of pocket today, and we can schedule for whenever works for you." },
    ],

    proposalTitle: "HVAC Service & Installation Proposal",
    proposalIntro: "Thank you for the opportunity to provide this proposal for your HVAC needs. {{businessName}} is committed to delivering reliable, energy-efficient comfort solutions backed by certified technicians and a 1-year labor warranty. Below is a detailed breakdown of the recommended services for your property.",
    proposalLineItems: [
      { description: "HVAC System Diagnostic & Inspection", quantity: 1, unitPrice: 79 },
      { description: "Refrigerant Recharge (per lb)", quantity: 2, unitPrice: 85 },
      { description: "Air Filter Replacement (MERV-13)", quantity: 2, unitPrice: 45 },
      { description: "Coil Cleaning (Evaporator + Condenser)", quantity: 1, unitPrice: 175 },
      { description: "Thermostat Upgrade (Smart/Programmable)", quantity: 1, unitPrice: 250 },
    ],
    proposalTerms: "50% deposit required to schedule. Balance due upon completion. All parts carry manufacturer warranty. Labor warranted for 12 months. Financing available at 0% APR for 18 months with approved credit.",

    reviewRequestSMS: "Hi {{firstName}}! Thank you for choosing {{businessName}} for your HVAC service today. If {{techName}} took great care of you, we'd really appreciate a quick Google review — it helps our small business grow! 🙏 {{reviewLink}}",
    reviewRequestEmail: {
      subject: "How did your HVAC service go, {{firstName}}?",
      body: `Hi {{firstName}},

Thank you for trusting {{businessName}} with your HVAC service today. We hope everything is running perfectly!

If you had a great experience, would you mind leaving us a quick Google review? It only takes 60 seconds and means the world to our team.

👉 Leave a Review: {{reviewLink}}

If anything wasn't perfect, please reply to this email directly — we want to make it right.

Thank you again for your business!

{{techName}} & The {{businessName}} Team`
    },

    missedCallSMS: "Hi! You just called {{businessName}} and we missed you — sorry about that! We're available for HVAC repairs, tune-ups, and new installations. Reply or call us back at {{phone}} and we'll get you taken care of today. 🌡️",

    preQualQuestions: [
      { question: "Do you own the property where service is needed?", weight: 20, type: "yes_no" },
      { question: "What type of HVAC service do you need?", weight: 15, type: "multiple_choice", options: ["Emergency repair", "Routine maintenance", "New system installation", "Not sure"] },
      { question: "How old is your current HVAC system?", weight: 15, type: "multiple_choice", options: ["Less than 5 years", "5-10 years", "10-15 years", "Over 15 years"] },
      { question: "How soon do you need service?", weight: 25, type: "multiple_choice", options: ["Today / Emergency", "This week", "This month", "Just getting quotes"] },
      { question: "What is your approximate budget for this project?", weight: 25, type: "multiple_choice", options: ["Under $500", "$500-$2,000", "$2,000-$5,000", "Over $5,000", "Need financing"] },
    ],

    chatWelcomeMessage: "👋 Hi there! Welcome to {{businessName}}. I'm your virtual assistant — I can help you schedule service, get a free estimate, or answer questions about our HVAC services. What can I help you with today?",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, an HVAC company. You help website visitors schedule appointments, answer questions about services, and capture lead information. Always be friendly and empathetic — many callers are uncomfortable due to HVAC issues. Key services: AC repair, heating repair, tune-ups, new system installation, duct cleaning. Emphasize same-day availability, upfront pricing, and the 1-year warranty. Always try to capture the visitor's name and phone number to book a callback.`,
    chatFAQs: [
      { question: "How much does an HVAC repair cost?", answer: "Most repairs range from $150–$600 depending on the issue. We charge a $79 diagnostic fee (applied to the repair) and provide a written estimate before any work begins — no surprises." },
      { question: "Do you offer same-day service?", answer: "Yes! We have technicians available for same-day service most days. Call us or book online and we'll do our best to get someone out to you today." },
      { question: "How long does a new AC installation take?", answer: "Most residential installations take 4–8 hours. We'll give you a specific timeframe during your free in-home estimate." },
      { question: "Do you offer financing?", answer: "Yes — we offer 0% financing for 18 months with approved credit. Ask about our financing options when you call." },
      { question: "What brands do you service?", answer: "We service all major brands including Carrier, Trane, Lennox, Rheem, Goodman, York, and more." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ROOFING
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "roofing",
    name: "Roofing",
    icon: "🏠",
    color: "#f97316",
    description: "Residential and commercial roofing — repair, replacement, and storm damage",
    targetCustomer: "Homeowners and property managers needing roof repair, full replacement, or storm damage assessment",
    averageDealSize: 12000,

    speedToLeadSMS: "Hi {{firstName}}, {{agentName}} here from {{businessName}}! Thanks for reaching out about your roof. We do FREE storm damage inspections and work directly with insurance companies. Can I schedule your free inspection today? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Free Roof Inspection — {{businessName}} Can Help Today",
      body: `Hi {{firstName}},

Thank you for contacting {{businessName}}! Roof issues can escalate quickly, so we want to get one of our certified inspectors out to you as soon as possible.

Here's what you get with your FREE inspection:
✅ Full roof assessment with photos
✅ Insurance claim assistance if applicable
✅ Written estimate within 24 hours
✅ No obligation — completely free

Call {{phone}} or reply to schedule your inspection today.

{{agentName}}
{{businessName}}`
    },

    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You recently reached out about your roof — I'm calling to get your free inspection scheduled. Do you have 2 minutes?"

QUALIFY:
"Can you tell me a little about what's going on? Is this storm damage, a leak, or are you thinking about a full replacement?"

IF STORM DAMAGE:
"I'm sorry to hear that — storm damage can be really stressful. The good news is we work directly with all major insurance companies and can help you through the entire claims process at no out-of-pocket cost to you in most cases. When can I get an inspector out there?"

IF REPAIR/REPLACEMENT:
"Got it. We do free inspections and give you a written estimate the same day. We're fully licensed and insured, and all our work comes with a 10-year workmanship warranty. Does [DATE] or [DATE] work for your inspection?"

OBJECTION — Already have someone:
"That's great! If you'd like a second opinion or they can't get out soon, we can usually be there within 24-48 hours. Want me to put you on our schedule as a backup?"

CLOSE:
"Perfect, I've got you down for [DATE/TIME]. You'll get a text confirmation. Is there a gate code or anything I should let the inspector know?"`,

    voiceSystemPrompt: `You are a professional roofing sales agent for {{businessName}}. Your primary goal is to schedule free roof inspections. For storm damage leads, emphasize insurance claim assistance and zero out-of-pocket cost. For repair/replacement leads, focus on the free estimate, 10-year warranty, and licensed/insured credentials. Always be empathetic — roof issues cause homeowners significant stress. Never quote prices over the phone. Always close for the inspection appointment.`,

    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{businessName}} here — we missed you! We do FREE roof inspections and work with all insurance companies. Reply INSPECT to schedule yours today. 🏠" },
      { day: 1, channel: "email", subject: "Your Free Roof Inspection Is Waiting — {{businessName}}", body: `Hi {{firstName}},

We'd love to get your free roof inspection scheduled. Here's why homeowners choose {{businessName}}:

🏆 5-Star Google Rating
🔒 Licensed & Fully Insured
📋 Work Directly with Insurance Companies
✅ 10-Year Workmanship Warranty
💰 $0 Out-of-Pocket for Covered Storm Damage

Don't wait — roof damage gets worse with every rain. Call {{phone}} or reply to schedule your free inspection.

{{businessName}} Team` },
      { day: 3, channel: "sms", body: "{{firstName}}, did you know most homeowners with storm damage are ENTITLED to a new roof through insurance? {{businessName}} handles the entire claim process for you. Free inspection — call {{phone}} or reply YES. 🏠" },
      { day: 7, channel: "email", subject: "Last Chance: Free Roof Inspection + $500 Off Any Repair", body: `Hi {{firstName}},

We're offering $500 off any roofing repair or replacement for new customers this month. Combined with your free inspection, this is the best time to get your roof assessed.

Our team is booking up fast — call {{phone}} today to lock in your spot.

{{businessName}}` },
      { day: 14, channel: "sms", body: "Hey {{firstName}}, last message from {{businessName}}. If you ever need a roof inspection, repair, or replacement — we're here. Save our number: {{phone}}. Stay dry! 🌧️" },
    ],

    objectionHandlers: [
      { objection: "I'll just use my insurance company's contractor", response: "That's totally your right! Just know that insurance companies often send contractors who work quickly and cheaply to minimize their payout. You're entitled to choose your own contractor, and we specialize in maximizing your claim value. May I do a free inspection alongside theirs so you have a second opinion?" },
      { objection: "I can't afford a new roof right now", response: "I completely understand — that's exactly why we work with insurance. In many cases, storm damage means you pay only your deductible and insurance covers the rest. We also offer financing. Can I at least do a free inspection to see what you're working with?" },
      { objection: "I just need a small repair, not a full replacement", response: "Absolutely — we do repairs of all sizes. We'll do a full inspection and give you options. Sometimes a repair is the right call; sometimes the damage is more extensive than it looks from the ground. Either way, the inspection is free and there's no obligation." },
      { objection: "I've heard roofing companies are scammers", response: "I hear that concern a lot — unfortunately there are storm chasers in this industry. We're a locally owned company with [X] years in business, fully licensed and insured, and all our reviews are on Google for you to verify. We'd never pressure you into anything." },
      { objection: "I need to talk to my spouse first", response: "Of course! Would it help if I scheduled the inspection for a time when you're both home? That way you can both hear the findings and ask questions together." },
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
      { description: "Permit & Inspection Fee", quantity: 1, unitPrice: 250 },
    ],
    proposalTerms: "50% deposit required to schedule. Balance due upon completion and final inspection. All materials carry manufacturer warranty. 10-year workmanship warranty included. Insurance supplement assistance provided at no additional charge.",

    reviewRequestSMS: "Hi {{firstName}}! Thank you for choosing {{businessName}} for your roofing project. If our team did a great job, a quick Google review would mean the world to us! 🙏 {{reviewLink}}",
    reviewRequestEmail: {
      subject: "How did your roofing project go, {{firstName}}?",
      body: `Hi {{firstName}},

Your roof is complete and we hope you love it! Thank you for trusting {{businessName}} to protect your home.

If you had a great experience, would you take 60 seconds to leave us a Google review? Reviews help other homeowners find a contractor they can trust.

👉 Leave a Review: {{reviewLink}}

If anything wasn't perfect, please reply directly — we stand behind our work 100%.

Thank you,
{{businessName}} Team`
    },

    missedCallSMS: "Hi! You just called {{businessName}} and we missed you. We offer FREE roof inspections and work with all insurance companies. Call us back at {{phone}} or reply here and we'll get right back to you! 🏠",

    preQualQuestions: [
      { question: "Do you own the property?", weight: 20, type: "yes_no" },
      { question: "What type of roofing service do you need?", weight: 15, type: "multiple_choice", options: ["Storm damage / Insurance claim", "Leak repair", "Full replacement", "Inspection only"] },
      { question: "When did the damage occur or when did you notice the issue?", weight: 15, type: "multiple_choice", options: ["Within the last 30 days", "1-6 months ago", "Over 6 months ago", "No damage — routine replacement"] },
      { question: "Have you filed an insurance claim yet?", weight: 20, type: "yes_no" },
      { question: "How soon do you need this addressed?", weight: 30, type: "multiple_choice", options: ["Urgent — active leak", "Within 2 weeks", "Within 1-2 months", "Just getting quotes"] },
    ],

    chatWelcomeMessage: "👋 Welcome to {{businessName}}! I can help you schedule a FREE roof inspection, get a repair estimate, or answer questions about storm damage and insurance claims. What brings you here today?",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, a roofing company. Help visitors schedule free roof inspections, understand their insurance claim options, and get repair/replacement estimates. Emphasize: free inspections, insurance claim expertise, 10-year warranty, licensed and insured. Always capture name and phone number for a callback. Be empathetic — roof issues are stressful and often urgent.`,
    chatFAQs: [
      { question: "How much does a new roof cost?", answer: "Most residential roof replacements range from $8,000–$20,000 depending on size, pitch, and materials. We provide a free inspection and written estimate — no obligation." },
      { question: "Do you work with insurance companies?", answer: "Yes! We specialize in insurance claims and work directly with all major carriers. In many cases, homeowners pay only their deductible." },
      { question: "How long does a roof replacement take?", answer: "Most residential replacements are completed in 1-2 days. We'll give you a specific timeline during your free estimate." },
      { question: "What warranty do you offer?", answer: "All our work comes with a 10-year workmanship warranty plus the manufacturer's material warranty (typically 30 years for architectural shingles)." },
      { question: "Are you licensed and insured?", answer: "Yes — we are fully licensed, bonded, and insured. We're happy to provide proof of insurance before any work begins." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // POOL SERVICES
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "pool",
    name: "Pool Services",
    icon: "🏊",
    color: "#06b6d4",
    description: "Pool cleaning, maintenance, repair, and new pool installation",
    targetCustomer: "Homeowners with existing pools needing weekly service, repairs, or equipment upgrades, and homeowners wanting a new pool installed",
    averageDealSize: 2400,

    speedToLeadSMS: "Hi {{firstName}}! {{agentName}} from {{businessName}} here 🏊 Thanks for reaching out! We offer weekly pool service starting at $150/month with no contracts. Can I get you a free quote today? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Your Pool Service Quote — {{businessName}}",
      body: `Hi {{firstName}},

Thanks for contacting {{businessName}}! We'd love to take pool maintenance off your plate so you can just enjoy the water.

Here's what our weekly service includes:
✅ Chemical testing & balancing
✅ Skimming & vacuuming
✅ Filter cleaning
✅ Equipment inspection
✅ Detailed service report after every visit

No contracts. Cancel anytime. Starting at $150/month.

Reply to this email or call {{phone}} to get your free quote today!

{{agentName}}
{{businessName}}`
    },

    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You reached out about pool service — I'm calling to get you a quick quote. Do you have 2 minutes?"

QUALIFY:
"Great! Are you looking for weekly maintenance, a one-time clean, a repair, or are you thinking about a new pool?"

IF WEEKLY SERVICE:
"Perfect — that's our specialty. We service pools in your area every week. Can I ask — is your pool currently green or cloudy, or is it just needing regular upkeep?"

IF REPAIR:
"Got it. What's going on with it? [Listen] We can usually get a tech out within 48 hours for most repairs. We'll diagnose it for free if you sign up for monthly service."

CLOSE:
"I can get you started as early as this week. Our weekly service is $[PRICE]/month — no contracts, cancel anytime. Want me to put you on the schedule?"`,

    voiceSystemPrompt: `You are a friendly pool service scheduling agent for {{businessName}}. Your goal is to qualify the caller's pool needs (weekly service, repair, or new installation) and book a service start or free estimate. Emphasize no-contract weekly service, chemical expertise, and reliability. For green/cloudy pools, show urgency — algae gets worse fast. For repairs, offer free diagnosis with service signup. Always close for a start date or appointment.`,

    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{businessName}} here 🏊 We missed your call! Weekly pool service from $150/mo — no contracts. Reply QUOTE for a free estimate or call {{phone}}!" },
      { day: 2, channel: "email", subject: "Your Pool Deserves Better — Free Quote from {{businessName}}", body: `Hi {{firstName}},

Is your pool taking up too much of your weekend? Let us handle it.

{{businessName}} provides professional weekly pool service including:
🧪 Chemical balancing every visit
🌊 Skimming, brushing & vacuuming
🔧 Equipment checks & minor repairs
📱 Service report sent to your phone after every visit

No contracts. Satisfaction guaranteed. Starting at $150/month.

Call {{phone}} or reply to get your free quote!

{{businessName}} Team` },
      { day: 5, channel: "sms", body: "{{firstName}}, is your pool ready for the weekend? {{businessName}} can have it sparkling clean by Friday. Reply YES for a free quote — no contracts! 🏊☀️" },
      { day: 10, channel: "email", subject: "First Month FREE — {{businessName}} Pool Service Offer", body: `Hi {{firstName}},

We're offering your first month of pool service FREE for new customers this month.

That means professional weekly cleaning, chemical balancing, and equipment checks — at zero cost to start.

Call {{phone}} or reply YES to claim your free first month before spots fill up.

{{businessName}}` },
      { day: 21, channel: "sms", body: "Hey {{firstName}}, last note from {{businessName}}. If you ever need pool cleaning, repairs, or a new pool — we're here. Save our number: {{phone}}. Enjoy your pool! 🏊" },
    ],

    objectionHandlers: [
      { objection: "I can maintain my own pool", response: "That's great — a lot of our customers said the same thing before they tried us! The difference is we bring professional-grade chemicals, equipment, and expertise. Most homeowners find they actually save money because we catch small issues before they become expensive repairs. Want to try us for one month with no commitment?" },
      { objection: "Your price is too high", response: "I understand — let me ask, how much are you currently spending on chemicals each month? Most homeowners spend $80-$120 just on chemicals alone. Our service includes everything for one flat rate, and we catch equipment issues early that can save you thousands. Would a price breakdown help?" },
      { objection: "I already have a pool guy", response: "No problem! If you're ever unhappy with the service or they raise their rates, keep our number. We're {{phone}} and we'd love to earn your business." },
      { objection: "I'm not sure I need weekly service", response: "Totally fair — for most pools in this climate, weekly service is ideal to prevent algae and keep chemicals balanced. But we also offer bi-weekly service if that fits better. Would you like me to come take a look at your pool and give you a recommendation?" },
      { objection: "I want to wait until summer", response: "I get that! One thing to consider — pools that aren't maintained through the off-season often turn green and require expensive shock treatments to recover. We offer reduced winter rates to keep it maintained year-round. Want me to quote you the winter rate?" },
    ],

    proposalTitle: "Pool Service & Maintenance Proposal",
    proposalIntro: "Thank you for considering {{businessName}} for your pool care needs. We are committed to keeping your pool clean, safe, and ready to enjoy year-round. Below is a customized service plan for your property.",
    proposalLineItems: [
      { description: "Weekly Pool Service (per month)", quantity: 1, unitPrice: 180 },
      { description: "Initial Deep Clean & Chemical Reset", quantity: 1, unitPrice: 250 },
      { description: "Filter Cartridge Replacement", quantity: 1, unitPrice: 95 },
      { description: "Pool Pump Inspection & Tune-Up", quantity: 1, unitPrice: 125 },
      { description: "Algae Treatment (if needed)", quantity: 1, unitPrice: 150 },
    ],
    proposalTerms: "Month-to-month service — no long-term contracts. First month billed upon service start. Chemical costs included in monthly rate. Equipment repairs quoted separately. 30-day satisfaction guarantee.",

    reviewRequestSMS: "Hi {{firstName}}! Hope you're enjoying your pool! 🏊 If {{techName}} from {{businessName}} has been taking great care of it, a quick Google review would mean a lot to us! {{reviewLink}}",
    reviewRequestEmail: {
      subject: "How's the pool, {{firstName}}? We'd love your feedback!",
      body: `Hi {{firstName}},

We hope you're enjoying your pool! Thank you for trusting {{businessName}} with your pool care.

If our team has been keeping things sparkling clean, would you mind leaving us a quick Google review? It helps other pool owners find reliable service.

👉 Leave a Review: {{reviewLink}}

If anything could be better, please reply directly — we want every visit to be perfect.

Thanks for being a valued customer!
{{businessName}} Team`
    },

    missedCallSMS: "Hi! You just called {{businessName}} — sorry we missed you! 🏊 We offer weekly pool service, repairs, and new pool installs. Call us back at {{phone}} or reply here and we'll get right back to you!",

    preQualQuestions: [
      { question: "Do you currently have a pool?", weight: 20, type: "yes_no" },
      { question: "What service are you looking for?", weight: 20, type: "multiple_choice", options: ["Weekly maintenance", "One-time cleaning", "Repair / equipment issue", "New pool installation"] },
      { question: "What is the current condition of your pool?", weight: 20, type: "multiple_choice", options: ["Clean and maintained", "Slightly cloudy", "Green / algae problem", "Not sure"] },
      { question: "How soon do you need service?", weight: 25, type: "multiple_choice", options: ["This week", "Within 2 weeks", "This month", "Just getting quotes"] },
      { question: "What is your approximate monthly budget for pool service?", weight: 15, type: "multiple_choice", options: ["Under $100", "$100-$200", "$200-$300", "Over $300"] },
    ],

    chatWelcomeMessage: "👋 Hi there! Welcome to {{businessName}}. I can help you get a free pool service quote, schedule a repair, or answer questions about our maintenance plans. What can I help you with? 🏊",
    chatSystemPrompt: `You are a friendly virtual assistant for {{businessName}}, a pool service company. Help visitors get quotes for weekly service, schedule repairs, and learn about new pool installation. Emphasize no-contract service, professional chemical balancing, and same-week availability. Always try to capture name and phone number for a quote callback. Be upbeat and enthusiastic — pools are fun!`,
    chatFAQs: [
      { question: "How much does weekly pool service cost?", answer: "Our weekly service starts at $150/month and includes chemical balancing, skimming, vacuuming, and equipment checks. We'll give you an exact quote based on your pool size." },
      { question: "Do you require a contract?", answer: "No contracts! We earn your business month to month. Cancel anytime with 30 days notice." },
      { question: "What if my pool is green?", answer: "No problem — we can fix that! We'll do a full chemical treatment and have your pool clear within 3-7 days. Call us and we'll get started right away." },
      { question: "Do you do pool repairs?", answer: "Yes! We repair pumps, filters, heaters, lights, and more. We'll diagnose the issue and give you a written estimate before any work begins." },
      { question: "How often should I have my pool serviced?", answer: "Weekly service is ideal for most pools in warm climates to maintain proper chemical balance and prevent algae. We also offer bi-weekly plans for pools with less use." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // INSURANCE
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "insurance",
    name: "Insurance Agent/Broker",
    icon: "🛡️",
    color: "#8b5cf6",
    description: "Life, health, home, auto, and commercial insurance sales and brokerage",
    targetCustomer: "Individuals and families needing life, health, home, or auto insurance; small business owners needing commercial coverage",
    averageDealSize: 1800,

    speedToLeadSMS: "Hi {{firstName}}! {{agentName}} from {{businessName}} here 🛡️ Thanks for your interest in insurance coverage! I'd love to help you find the best rate. Can I schedule a quick 10-minute call to review your options? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Your Insurance Quote — {{businessName}} Is Ready to Help",
      body: `Hi {{firstName}},

Thank you for reaching out to {{businessName}}! Finding the right coverage at the right price is exactly what we do.

Here's what you can expect:
✅ Free, no-obligation quote comparison
✅ Access to 20+ top-rated carriers
✅ Coverage tailored to your specific needs
✅ Ongoing support — we're your agent for life

I'll reach out within 15 minutes to discuss your options. If you'd prefer to call us directly: {{phone}}.

{{agentName}}
{{businessName}}`
    },

    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You reached out about insurance coverage — I have a few quick questions to find you the best options. Do you have 10 minutes?"

QUALIFY:
"Great! What type of coverage are you looking for — life, health, home, auto, or a combination?"

IF LIFE INSURANCE:
"Perfect. Are you looking for term life or whole life? And roughly what coverage amount are you thinking — to replace income, cover a mortgage, or leave a legacy?"

IF HOME/AUTO:
"Got it. Are you currently insured and looking for better rates, or is this new coverage?"

TRANSITION:
"Based on what you've shared, I have access to several carriers that would be a great fit. I'd like to run some numbers and get back to you with 2-3 options. What's the best time to reconnect — tomorrow morning or afternoon?"

CLOSE:
"Perfect. I'll have your personalized quotes ready by [TIME]. You'll also get an email with a summary. Is {{email}} still the best address for you?"`,

    voiceSystemPrompt: `You are a professional insurance agent for {{businessName}}. Your goal is to qualify the prospect's insurance needs, build rapport, and schedule a follow-up appointment to present quotes. Never quote premiums on the first call — always gather information first. Key qualifying questions: type of coverage needed, current coverage status, coverage amount desired, health status (for life/health), property details (for home). Be consultative, not salesy. Emphasize access to multiple carriers and personalized recommendations.`,

    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{agentName}} from {{businessName}} here 🛡️ I have your insurance options ready! When's a good time for a quick 10-min call? Reply with a time or call {{phone}}." },
      { day: 1, channel: "email", subject: "Your Personalized Insurance Options Are Ready — {{businessName}}", body: `Hi {{firstName}},

I've put together some personalized insurance options based on your needs. I'd love to walk you through them on a quick call.

Why families choose {{businessName}}:
🏆 Access to 20+ top-rated carriers
💰 Average savings of $400-$800/year vs. direct carriers
🤝 Dedicated agent — one call for all your coverage needs
📋 Annual policy reviews to make sure you're always optimally covered

Call {{phone}} or reply to schedule your free consultation.

{{agentName}}, {{businessName}}` },
      { day: 3, channel: "sms", body: "{{firstName}}, just a quick follow-up from {{businessName}}. Your quotes are ready and rates are locked in for 30 days. Don't miss out — call {{phone}} or reply YES to review your options! 🛡️" },
      { day: 7, channel: "email", subject: "Important: Your Insurance Quote Expires Soon", body: `Hi {{firstName}},

I wanted to make sure you saw your insurance options before the quotes expire. Rates can change, and I'd hate for you to miss out on the best pricing.

A 10-minute call is all it takes. I'll walk you through your options and answer any questions — no pressure, no obligation.

Call {{phone}} or reply to schedule.

{{agentName}}, {{businessName}}` },
      { day: 14, channel: "sms", body: "Last follow-up from {{businessName}}, {{firstName}}. If you ever need insurance coverage or a policy review, I'm here. Save my number: {{phone}}. Have a great day! 🛡️" },
    ],

    objectionHandlers: [
      { objection: "I already have insurance", response: "That's great — you're protected! Many of my clients come to me after years with the same carrier and are surprised to find they can get the same or better coverage for significantly less. Would you be open to a free 10-minute policy review? If you're already getting the best deal, I'll tell you that too." },
      { objection: "I can't afford insurance right now", response: "I completely understand — that's actually one of the most important reasons to talk to me. Many people are paying too much because they're buying direct instead of through a broker who can shop multiple carriers. I've helped clients cut their premiums in half. Can we spend 10 minutes to see what's possible?" },
      { objection: "I'll just go online and get a quote myself", response: "You absolutely can! The difference is that online quotes give you one carrier's rate. I have access to 20+ carriers and can compare them all in minutes to find your best option. Plus I'm here if you ever have a claim — you're not on hold with an 800 number." },
      { objection: "I need to think about it", response: "Of course — this is an important decision. Can I ask what's holding you back? Is it the price, the coverage amount, or something else? I want to make sure I've given you everything you need to feel confident." },
      { objection: "I don't trust insurance companies", response: "That's a fair concern — the industry has a reputation problem. That's exactly why working with an independent broker like me is different. I work for YOU, not the insurance company. My job is to find you the best coverage at the best price and fight for you if you ever have a claim." },
    ],

    proposalTitle: "Insurance Coverage Proposal",
    proposalIntro: "Thank you for the opportunity to review your insurance needs. {{businessName}} has analyzed your situation and identified the following coverage options that provide the best protection at the most competitive rates available through our carrier network.",
    proposalLineItems: [
      { description: "Term Life Insurance — $500,000 / 20-Year Term (estimated monthly)", quantity: 12, unitPrice: 45 },
      { description: "Homeowners Insurance — $350,000 Dwelling Coverage (estimated annual)", quantity: 1, unitPrice: 1200 },
      { description: "Auto Insurance — Full Coverage, 1 Vehicle (estimated annual)", quantity: 1, unitPrice: 1400 },
      { description: "Umbrella Policy — $1M Coverage (estimated annual)", quantity: 1, unitPrice: 350 },
    ],
    proposalTerms: "All premiums are estimates based on information provided and are subject to underwriting approval. Final rates determined by carrier at time of application. Coverage effective upon first premium payment. No obligation to purchase.",

    reviewRequestSMS: "Hi {{firstName}}! Thank you for trusting {{businessName}} with your insurance needs. If I've taken good care of you, a quick Google review would mean a lot! 🙏 {{reviewLink}}",
    reviewRequestEmail: {
      subject: "Thank you for your business, {{firstName}} — quick favor?",
      body: `Hi {{firstName}},

It's been a pleasure working with you to protect what matters most. Thank you for trusting {{businessName}}.

If you've been happy with the service and coverage I've found for you, would you mind leaving a quick Google review? It helps other families find an agent they can trust.

👉 Leave a Review: {{reviewLink}}

And remember — I'm always here for policy questions, claims help, or annual reviews. Just call {{phone}}.

{{agentName}}, {{businessName}}`
    },

    missedCallSMS: "Hi! You just called {{businessName}} and we missed you 🛡️ We help families and businesses find the best insurance coverage at the lowest rates. Call {{phone}} or reply here and {{agentName}} will get right back to you!",

    preQualQuestions: [
      { question: "What type of insurance are you looking for?", weight: 15, type: "multiple_choice", options: ["Life insurance", "Health insurance", "Home insurance", "Auto insurance", "Business insurance", "Multiple types"] },
      { question: "Are you currently insured?", weight: 15, type: "yes_no" },
      { question: "What is your primary goal for this coverage?", weight: 20, type: "multiple_choice", options: ["Replace income for family", "Pay off mortgage/debts", "Lower my current premium", "New coverage needed", "Business protection"] },
      { question: "How soon do you need coverage?", weight: 25, type: "multiple_choice", options: ["Immediately", "Within 30 days", "Within 3 months", "Just researching"] },
      { question: "What is your approximate monthly budget for insurance?", weight: 25, type: "multiple_choice", options: ["Under $100", "$100-$300", "$300-$500", "Over $500", "Not sure yet"] },
    ],

    chatWelcomeMessage: "👋 Welcome to {{businessName}}! I can help you get a free insurance quote, compare coverage options, or connect you with {{agentName}}. What type of coverage are you looking for today? 🛡️",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, an independent insurance agency. Help visitors understand their coverage options, get free quotes, and schedule consultations with an agent. Emphasize access to 20+ carriers, personalized recommendations, and no-obligation quotes. For life insurance leads, ask about coverage goals. For home/auto, ask about current coverage. Always capture name and phone number for agent follow-up. Be professional and trustworthy.`,
    chatFAQs: [
      { question: "How much does life insurance cost?", answer: "Term life insurance for a healthy adult typically starts at $20-$50/month for $500,000 in coverage. The exact rate depends on age, health, and coverage amount. We'll get you an exact quote in minutes." },
      { question: "What's the difference between term and whole life insurance?", answer: "Term life covers you for a set period (10, 20, or 30 years) at a lower cost. Whole life covers you permanently and builds cash value. Most families are best served by term life — let's talk about what fits your situation." },
      { question: "Can you really find me a better rate than my current insurer?", answer: "Often yes! As an independent broker, we compare 20+ carriers to find your best rate. Many clients save $300-$800/year. A free comparison takes 10 minutes." },
      { question: "How long does it take to get covered?", answer: "Auto and home insurance can be active same-day. Life insurance typically takes 2-6 weeks for underwriting, though some policies offer instant approval." },
      { question: "Do I need to work with an agent or can I do it online?", answer: "You can do both! Many people start online and then connect with an agent for complex coverage needs. Our agents are here to make sure you get the right coverage — not just the cheapest option." },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BUSINESS LOANS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "business_loans",
    name: "Business Loan Broker",
    icon: "💼",
    color: "#10b981",
    description: "Business funding, working capital, SBA loans, merchant cash advances, and equipment financing",
    targetCustomer: "Small to mid-size business owners needing working capital, equipment financing, SBA loans, or business lines of credit",
    averageDealSize: 85000,

    speedToLeadSMS: "Hi {{firstName}}! {{agentName}} from {{businessName}} here 💼 Thanks for your interest in business funding! We work with 50+ lenders to find the best rates for your business. Can I schedule a quick 10-min call today? Reply YES or call {{phone}}!",
    speedToLeadEmail: {
      subject: "Business Funding Options — {{businessName}} Can Help",
      body: `Hi {{firstName}},

Thank you for reaching out to {{businessName}}! We specialize in helping business owners like you access the capital they need to grow.

Here's what we offer:
✅ Access to 50+ lenders — we find your best rate
✅ Funding from $10,000 to $5,000,000+
✅ Decisions in as little as 24 hours
✅ No obligation to accept any offer

I'll reach out within 15 minutes to discuss your options. Or call us directly at {{phone}}.

{{agentName}}
{{businessName}}`
    },

    voiceScript: `OPENING:
"Hi {{firstName}}, this is {{agentName}} from {{businessName}}. You reached out about business funding — I have a few quick questions to find your best options. Do you have 10 minutes?"

QUALIFY:
"Great! First — what type of business do you have and how long have you been operating?"

FUNDING NEEDS:
"And what are you looking to use the funding for — working capital, equipment, expansion, or something else?"

FINANCIAL QUALIFY:
"Roughly what's your monthly revenue? I ask because it helps me identify which lenders will give you the best terms."

CREDIT:
"And do you have a sense of your business credit score — excellent, good, fair, or are you not sure?"

TRANSITION:
"Based on what you've shared, I think we can find you some strong options. I work with 50+ lenders and I'll shop your deal to find the best rate and terms. Can I get back to you by [TIME] tomorrow with your options?"

CLOSE:
"Perfect. I'll need a few basic documents — last 3 months of bank statements and your last tax return. Can you email those to {{email}}? I'll have your options ready within 24 hours."`,

    voiceSystemPrompt: `You are a professional business loan broker for {{businessName}}. Your goal is to qualify the business owner's funding needs and collect the information needed to shop their deal to lenders. Key qualifying factors: time in business (2+ years preferred), monthly revenue ($15,000+ preferred), credit score, funding purpose, and amount needed. Be consultative and educational — many business owners don't know all their options. Emphasize speed (24-hour decisions), access to 50+ lenders, and no-obligation process. Always close for document submission.`,

    followUpSequence: [
      { day: 0, channel: "sms", body: "Hi {{firstName}}! {{agentName}} from {{businessName}} here 💼 I'm ready to shop your funding request to our 50+ lenders. Quick question — what's your monthly revenue? Reply or call {{phone}} to get started!" },
      { day: 1, channel: "email", subject: "Your Business Funding Options — {{businessName}} Is Ready", body: `Hi {{firstName}},

I wanted to follow up on your business funding inquiry. I work with 50+ lenders and can typically find options for businesses that banks have turned down.

To get your personalized options, I just need:
📄 Last 3 months of business bank statements
📊 Most recent business tax return
🪪 Copy of your driver's license

Once I have these, I can have funding options for you within 24 hours. Email them to {{agentEmail}} or call {{phone}} to discuss.

{{agentName}}, {{businessName}}` },
      { day: 3, channel: "sms", body: "{{firstName}}, checking in from {{businessName}}. We have lenders offering same-week funding for qualified businesses. Don't leave capital on the table — call {{phone}} or reply YES to get started! 💼" },
      { day: 7, channel: "email", subject: "Business Funding: Rates Are Changing — Act Now", body: `Hi {{firstName}},

I wanted to reach out because lending rates and approval criteria change frequently, and I'd hate for you to miss a favorable window.

Many of our business owner clients are securing working capital right now to:
💰 Cover payroll and operating costs
📦 Purchase inventory before price increases
🏗️ Fund expansion projects
⚙️ Upgrade equipment

A 10-minute call is all it takes to see what you qualify for. Call {{phone}} or reply to schedule.

{{agentName}}, {{businessName}}` },
      { day: 14, channel: "sms", body: "Last follow-up from {{businessName}}, {{firstName}}. If you ever need business funding — working capital, equipment loans, SBA, or lines of credit — I'm your guy. Save my number: {{phone}}. 💼" },
    ],

    objectionHandlers: [
      { objection: "My credit isn't great", response: "That's actually more common than you'd think, and it's not a dealbreaker. Many of our lenders focus more on your revenue and cash flow than your credit score. If your business is generating consistent revenue, we likely have options for you. What's your monthly revenue looking like?" },
      { objection: "I tried the bank and got turned down", response: "Banks turn down over 80% of small business loan applications — that's exactly why brokers like me exist. We work with alternative lenders who have much more flexible criteria. The bank's 'no' is often just the beginning of the conversation." },
      { objection: "The rates seem too high", response: "I completely understand — and I want to make sure you're comparing apples to apples. The key is the total cost of capital vs. the return on how you use it. If $100,000 at 18% APR generates $300,000 in revenue, that's a great deal. Let me show you a few options with different rate/term combinations so you can make an informed decision." },
      { objection: "I don't want to take on debt", response: "That's a very responsible mindset. Can I ask — is there a specific growth opportunity or cash flow challenge driving this? Sometimes there are creative structures like revenue-based financing where repayments flex with your revenue, so you're never overextended." },
      { objection: "I need to talk to my accountant first", response: "Absolutely — that's smart! Would it help if I put together a term sheet with the options so you have something concrete to review with them? That way you're not going in blind and your accountant can give you specific advice." },
    ],

    proposalTitle: "Business Funding Options Summary",
    proposalIntro: "{{businessName}} has reviewed your business profile and identified the following funding options from our network of 50+ lending partners. These options have been selected based on your revenue, time in business, and funding goals. All offers are subject to final underwriting approval.",
    proposalLineItems: [
      { description: "Working Capital Loan — 12-Month Term (estimated)", quantity: 1, unitPrice: 50000 },
      { description: "Business Line of Credit — Revolving (estimated limit)", quantity: 1, unitPrice: 25000 },
      { description: "Equipment Financing — 36-Month Term (estimated)", quantity: 1, unitPrice: 35000 },
      { description: "Broker Fee (% of funded amount — paid by lender)", quantity: 1, unitPrice: 0 },
    ],
    proposalTerms: "All offers are subject to lender underwriting and final approval. Rates and terms are estimates based on information provided. Broker fees are paid by the lender — no upfront cost to borrower. Funding timelines vary by lender (24 hours to 2 weeks). No obligation to accept any offer.",

    reviewRequestSMS: "Hi {{firstName}}! Thank you for trusting {{businessName}} to find your business funding. If I delivered for you, a quick Google review would mean a lot! 🙏 {{reviewLink}}",
    reviewRequestEmail: {
      subject: "Thank you for your business, {{firstName}} — quick favor?",
      body: `Hi {{firstName}},

Congratulations again on securing your business funding! It was a pleasure working with you and I'm excited to see what you do with the capital.

If I delivered for you, would you mind leaving a quick Google review? It helps other business owners find a broker they can trust.

👉 Leave a Review: {{reviewLink}}

And remember — I'm here whenever you need additional funding, a refinance, or just advice. Call {{phone}} anytime.

{{agentName}}, {{businessName}}`
    },

    missedCallSMS: "Hi! You just called {{businessName}} and we missed you 💼 We help business owners access working capital, equipment loans, SBA loans, and lines of credit — often within 24 hours. Call {{phone}} or reply here and {{agentName}} will get right back to you!",

    preQualQuestions: [
      { question: "How long has your business been operating?", weight: 25, type: "multiple_choice", options: ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "Over 5 years"] },
      { question: "What is your average monthly business revenue?", weight: 30, type: "multiple_choice", options: ["Under $10,000", "$10,000-$25,000", "$25,000-$50,000", "$50,000-$100,000", "Over $100,000"] },
      { question: "What is your estimated business credit score?", weight: 20, type: "multiple_choice", options: ["Excellent (720+)", "Good (680-719)", "Fair (620-679)", "Poor (below 620)", "Not sure"] },
      { question: "What do you need the funding for?", weight: 10, type: "multiple_choice", options: ["Working capital / cash flow", "Equipment purchase", "Expansion / new location", "Inventory", "Payroll", "Other"] },
      { question: "How much funding are you looking for?", weight: 15, type: "multiple_choice", options: ["Under $25,000", "$25,000-$100,000", "$100,000-$500,000", "Over $500,000"] },
    ],

    chatWelcomeMessage: "👋 Welcome to {{businessName}}! I can help you explore business funding options, check your eligibility, or connect you with {{agentName}}. What type of funding are you looking for? 💼",
    chatSystemPrompt: `You are a helpful virtual assistant for {{businessName}}, a business loan brokerage. Help business owners understand their funding options and qualify for the right products. Key products: working capital loans, business lines of credit, SBA loans, equipment financing, merchant cash advances, invoice factoring. Emphasize: access to 50+ lenders, 24-hour decisions, no upfront fees, and options for businesses banks have turned down. Always try to capture business name, monthly revenue, and contact info for agent follow-up.`,
    chatFAQs: [
      { question: "What types of business funding do you offer?", answer: "We offer working capital loans, business lines of credit, SBA loans, equipment financing, merchant cash advances, and invoice factoring — through a network of 50+ lenders." },
      { question: "How fast can I get funded?", answer: "Some of our lenders can fund within 24-48 hours for working capital products. SBA loans typically take 2-4 weeks. We'll tell you the timeline upfront for each option." },
      { question: "What are your fees?", answer: "We charge no upfront fees. Our compensation comes from the lender as a referral fee — you never pay us directly." },
      { question: "What if I've been turned down by a bank?", answer: "That's actually our specialty. We work with alternative lenders who have much more flexible criteria than banks. Many of our clients were previously turned down by traditional banks." },
      { question: "What do I need to apply?", answer: "Typically: last 3 months of business bank statements, most recent business tax return, and a copy of your driver's license. Some products require less documentation." },
    ],
  },
];

export const INDUSTRY_PACK_MAP = Object.fromEntries(
  INDUSTRY_PACKS.map((p) => [p.id, p])
) as Record<IndustryPackId, IndustryPack>;
