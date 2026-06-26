import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Download,
  Globe,
  Star,
  MapPin,
  Share2,
  Monitor,
  Megaphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  TrendingDown,
  Bot,
  DollarSign,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "wouter";

// ── Grade helpers ─────────────────────────────────────────────────────────────
const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  B: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  C: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  D: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  F: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
};

const categoryIcons: Record<string, any> = {
  SEO: Search,
  Listings: MapPin,
  Reviews: Star,
  Social: Share2,
  Website: Monitor,
  Advertising: Megaphone,
  GEO: Bot,
};

const categoryColors: Record<string, string> = {
  SEO: "#2563eb",
  Listings: "#7c3aed",
  Reviews: "#f59e0b",
  Social: "#ec4899",
  Website: "#06b6d4",
  Advertising: "#10b981",
  GEO: "#8b5cf6",
};

function GradeBadge({ grade, size = "md" }: { grade: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const colors = gradeColors[grade] || gradeColors.C;
  const sizeClasses = { sm: "w-8 h-8 text-sm", md: "w-12 h-12 text-xl", lg: "w-16 h-16 text-2xl", xl: "w-24 h-24 text-5xl" };
  return (
    <div className={`${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border} border-2 rounded-full flex items-center justify-center font-bold`}>
      {grade}
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "found" || status === "good") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "inaccurate" || status === "warning") return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
}

// ── Branded HTML report generator ────────────────────────────────────────────
function generateBrandedHTML(report: any, businessName: string, website: string): string {
  const rl = report.revenueLeak || {};
  const totalLeak = rl.totalAnnual || 0;
  const monthlyLeak = rl.monthlyLeak || 0;
  const categories = report.categories || [];
  const failures = report.architecturalFailures || [];
  const roadmap = report.recoveryRoadmap || [];
  const comp = report.competitorComparison || {};

  const catHTML = categories.map((cat: any) => {
    const color = categoryColors[cat.name] || "#64748b";
    return `
  <div class="section">
    <div class="section-header">
      <div class="section-grade" style="border:3px solid ${color};color:${color};">${cat.grade}</div>
      <div>
        <h2>${cat.name}${cat.name === "GEO" ? " — Generative Engine Optimization" : ""}</h2>
        <p style="color:#64748b;font-size:0.85rem;">Score: ${cat.score}/100</p>
      </div>
    </div>
    ${cat.metrics ? `<div style="margin-bottom:16px;">${cat.metrics.map((m: any) => `
      <div class="metric-row">
        <span>${m.label}</span>
        <div style="display:flex;gap:12px;align-items:center;">
          <strong>${m.value}</strong>
          ${m.benchmark ? `<span style="color:#64748b;font-size:0.8rem;">Avg: ${m.benchmark}</span>` : ""}
          ${m.industryLeader ? `<span style="color:#059669;font-size:0.8rem;">Leader: ${m.industryLeader}</span>` : ""}
          ${m.status ? `<span class="badge badge-${m.status}">${m.status}</span>` : ""}
        </div>
      </div>`).join("")}</div>` : ""}
    ${cat.directories ? `
    <div class="directory-grid">${cat.directories.map((d: any) => `
      <div class="directory-item ${d.status}">
        <span>${d.status === "found" ? "✓" : d.status === "inaccurate" ? "⚠" : "✗"}</span>
        <span>${d.name}</span>
      </div>`).join("")}
    </div>
    <p style="margin-top:12px;color:#64748b;font-size:0.85rem;">Found on ${cat.presenceCount || 0} of ${cat.totalDirectories || 0} directories</p>` : ""}
    ${cat.platforms ? cat.platforms.map((p: any) => `
    <div class="platform-row">
      <strong>${p.name}</strong>
      <div style="display:flex;gap:8px;">
        <span class="badge ${p.found ? "badge-good" : "badge-critical"}">${p.found ? "Found" : "Not Found"}</span>
        ${p.activity && p.activity !== "not_found" ? `<span class="badge badge-${p.activity === "active" ? "good" : "warning"}">${p.activity}</span>` : ""}
      </div>
    </div>`).join("") : ""}
    ${cat.checklist ? cat.checklist.map((c: any) => `
    <div class="checklist-item">
      <span style="font-size:1.2rem;color:${c.found ? "#059669" : "#dc2626"}">${c.found ? "✓" : "✗"}</span>
      <span>${c.item}</span>
    </div>`).join("") : ""}
    ${cat.keywords ? `
    <p style="margin-bottom:10px;"><strong>Monthly Opportunity:</strong> ${(cat.totalImpressions||0).toLocaleString()} impressions</p>
    ${cat.keywords.map((k: any) => `
    <div class="metric-row"><span>"${k.keyword}"</span><div style="display:flex;gap:16px;"><span style="color:#64748b;">${(k.impressions||0).toLocaleString()} imp.</span><strong>${(k.clicks||0).toLocaleString()} clicks</strong></div></div>`).join("")}` : ""}
    ${cat.findings?.length ? `<div style="margin-top:14px;"><h4 style="font-size:0.8rem;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Key Findings</h4><ul style="padding-left:18px;color:#475569;font-size:0.9rem;line-height:1.8;">${cat.findings.map((f: string) => `<li>${f}</li>`).join("")}</ul></div>` : ""}
    ${cat.recommendations?.length ? `<div style="margin-top:12px;"><h4 style="font-size:0.8rem;font-weight:700;color:#1B2945;text-transform:uppercase;margin-bottom:6px;">Recommendations</h4><ul style="padding-left:18px;color:#1B2945;font-size:0.9rem;line-height:1.8;">${cat.recommendations.map((r: string) => `<li>${r}</li>`).join("")}</ul></div>` : ""}
  </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Digital Audit & Profit Leakage Report — ${businessName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; color: #1e293b; }

/* Cover */
.cover { background: linear-gradient(135deg, #1B2945 0%, #0f1c35 100%); color: white; padding: 60px 40px; text-align: center; position: relative; overflow: hidden; }
.cover::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 60%); }
.cover-badge { display: inline-block; background: rgba(197,160,89,0.15); border: 1px solid rgba(197,160,89,0.4); color: #C5A059; padding: 6px 18px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
.cover h1 { font-size: 2.4rem; font-weight: 800; margin-bottom: 8px; }
.cover .subtitle { font-size: 1rem; opacity: 0.7; margin-bottom: 30px; }
.grade-circle { width: 130px; height: 130px; border-radius: 50%; background: rgba(185,28,28,0.2); border: 4px solid #B91C1C; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; font-weight: 900; margin: 0 auto 20px; color: #fca5a5; }
.cover-score { font-size: 1.1rem; opacity: 0.8; }
.cover-date { margin-top: 12px; opacity: 0.5; font-size: 0.85rem; }
.authority { margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; opacity: 0.6; }
.authority strong { color: #C5A059; }

/* Revenue Leak */
.revenue-leak { background: linear-gradient(135deg, #1B2945, #2d3f6b); color: white; padding: 40px; margin-bottom: 0; }
.revenue-leak h2 { font-size: 1.1rem; font-weight: 600; color: #C5A059; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 20px; }
.leak-headline { font-size: 1.6rem; font-weight: 800; color: #fca5a5; margin-bottom: 8px; }
.leak-sub { font-size: 0.95rem; opacity: 0.7; margin-bottom: 30px; }
.leak-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
.leak-box { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 20px; text-align: center; }
.leak-box .amount { font-size: 2rem; font-weight: 900; color: #B91C1C; }
.leak-box .label { font-size: 0.8rem; opacity: 0.6; margin-top: 4px; }
.total-box { background: rgba(185,28,28,0.2); border-color: rgba(185,28,28,0.4); }
.total-box .amount { color: #fca5a5; font-size: 2.5rem; }

/* Container */
.container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }

/* Summary */
.summary { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-left: 5px solid #1B2945; }
.summary h2 { font-size: 1.1rem; font-weight: 700; color: #1B2945; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.summary p { font-size: 1rem; line-height: 1.75; color: #475569; }

/* Category grid */
.category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 24px; }
.category-card { background: white; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-top: 4px solid; text-align: center; }
.category-card h3 { font-size: 0.8rem; margin-bottom: 6px; color: #64748b; font-weight: 600; }
.category-card .grade { font-size: 2.2rem; font-weight: 900; }
.score-bar { width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-top: 6px; }
.score-bar-fill { height: 100%; border-radius: 3px; }

/* Failures */
.failures { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.failures h2 { font-size: 1.1rem; font-weight: 700; color: #B91C1C; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
.failure-item { border: 1px solid #fee2e2; border-radius: 10px; padding: 18px; margin-bottom: 12px; background: #fff5f5; }
.failure-item h3 { font-size: 1rem; font-weight: 700; color: #991b1b; margin-bottom: 6px; }
.failure-item .impact { font-size: 0.9rem; color: #7f1d1d; margin-bottom: 8px; }
.failure-item .fix { font-size: 0.9rem; color: #1B2945; background: #eff6ff; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #1B2945; }

/* Competitor */
.competitor { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.competitor h2 { font-size: 1.1rem; font-weight: 700; color: #1B2945; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.comp-box { text-align: center; padding: 16px; border-radius: 8px; }
.comp-box.yours { background: #fef2f2; border: 1px solid #fecaca; }
.comp-box.theirs { background: #f0fdf4; border: 1px solid #bbf7d0; }
.comp-box .num { font-size: 2.5rem; font-weight: 900; }
.comp-box.yours .num { color: #dc2626; }
.comp-box.theirs .num { color: #16a34a; }
.comp-box .lbl { font-size: 0.8rem; color: #64748b; margin-top: 4px; }

/* Sections */
.section { background: white; border-radius: 12px; padding: 28px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); page-break-inside: avoid; }
.section-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 2px solid #f1f5f9; }
.section-grade { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; }
.metric-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.metric-row:last-child { border-bottom: none; }
.directory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; }
.directory-item { display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 7px; font-size: 0.85rem; }
.directory-item.found { background: #ecfdf5; color: #065f46; }
.directory-item.not_found { background: #fef2f2; color: #991b1b; }
.directory-item.inaccurate { background: #fffbeb; color: #92400e; }
.platform-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 7px; margin-bottom: 6px; background: #f8fafc; }
.checklist-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
.badge-good { background: #ecfdf5; color: #065f46; }
.badge-warning { background: #fffbeb; color: #92400e; }
.badge-critical { background: #fef2f2; color: #991b1b; }

/* Roadmap */
.roadmap { background: linear-gradient(135deg, #1B2945, #0f1c35); color: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; }
.roadmap h2 { font-size: 1.1rem; font-weight: 700; color: #C5A059; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
.roadmap-item { display: flex; gap: 16px; margin-bottom: 14px; align-items: flex-start; }
.roadmap-num { width: 32px; height: 32px; border-radius: 50%; background: rgba(197,160,89,0.2); border: 2px solid #C5A059; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #C5A059; font-size: 0.9rem; flex-shrink: 0; }
.roadmap-content h4 { font-size: 0.95rem; font-weight: 700; color: white; margin-bottom: 2px; }
.roadmap-content p { font-size: 0.8rem; opacity: 0.6; }
.impact-high { color: #fca5a5; font-weight: 700; font-size: 0.75rem; }
.impact-medium { color: #fcd34d; font-weight: 700; font-size: 0.75rem; }

/* Footer */
.footer { text-align: center; padding: 40px 20px; color: #64748b; font-size: 0.85rem; border-top: 1px solid #e2e8f0; }
.footer .brand { font-size: 1.1rem; font-weight: 800; color: #1B2945; }
.footer .gold { color: #C5A059; }

@media print { body { background: white; } .section, .summary, .failures, .competitor, .roadmap { box-shadow: none; border: 1px solid #e2e8f0; } }
</style>
</head>
<body>

<!-- Cover -->
<div class="cover">
  <div class="cover-badge">Digital Audit & Profit Leakage Report</div>
  <h1>${businessName}</h1>
  <p class="subtitle">${website || "Digital Presence Analysis"}</p>
  <div class="grade-circle">${report.overallGrade || "F"}</div>
  <p class="cover-score">Overall Score: ${report.overallScore || 0}/100</p>
  <p class="cover-date">Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  <div class="authority">Audit Authority: <strong>Scorpion Global Solutions LLC</strong> | Arizona | Digital Marketing & AI Solutions</div>
</div>

<!-- Revenue Leak -->
${totalLeak > 0 ? `
<div class="revenue-leak">
  <h2>💸 Financial Opportunity Gap</h2>
  <div class="leak-headline">${rl.headline || `Estimated $${totalLeak.toLocaleString()}+ Annual Revenue Leakage`}</div>
  <p class="leak-sub">${rl.subheadline || ""}</p>
  <div class="leak-grid">
    ${rl.lostOrigination > 0 ? `<div class="leak-box"><div class="amount">$${rl.lostOrigination.toLocaleString()}</div><div class="label">Lost Origination/Revenue (Annual)</div></div>` : ""}
    ${rl.lostInterest > 0 ? `<div class="leak-box"><div class="amount">$${rl.lostInterest.toLocaleString()}</div><div class="label">Lost Interest Spread (Annual)</div></div>` : ""}
    <div class="leak-box total-box"><div class="amount">$${totalLeak.toLocaleString()}+</div><div class="label">Total Annual Revenue Leakage</div></div>
    <div class="leak-box"><div class="amount">$${monthlyLeak.toLocaleString()}</div><div class="label">Monthly Opportunity Cost</div></div>
  </div>
</div>` : ""}

<div class="container">

<!-- Executive Summary -->
<div class="summary">
  <h2>Executive Summary</h2>
  <p>${report.executiveSummary || ""}</p>
</div>

<!-- Category Overview -->
<div class="category-grid">
  ${categories.map((cat: any) => {
    const color = categoryColors[cat.name] || "#64748b";
    return `
  <div class="category-card" style="border-top-color:${color}">
    <h3>${cat.name}</h3>
    <div class="grade" style="color:${color}">${cat.grade}</div>
    <div class="score-bar"><div class="score-bar-fill" style="width:${cat.score}%;background:${color}"></div></div>
    <p style="margin-top:6px;font-size:0.75rem;color:#64748b;">${cat.score}/100</p>
  </div>`;
  }).join("")}
</div>

<!-- Architectural Failures -->
${failures.length > 0 ? `
<div class="failures">
  <h2>🛠 Critical Architectural Failures</h2>
  ${failures.map((f: any) => `
  <div class="failure-item">
    <h3>${f.title}</h3>
    <p class="impact">Impact: ${f.impact}</p>
    <div class="fix">Fix: ${f.fix}</div>
  </div>`).join("")}
</div>` : ""}

<!-- Competitor Comparison -->
${comp.reviewsCompetitorAvg ? `
<div class="competitor">
  <h2>📊 Competitive Velocity — Why They Win</h2>
  <div class="comp-grid">
    <div class="comp-box yours">
      <div class="num">${comp.reviewsYours || 0}</div>
      <div class="lbl">Your Google Reviews</div>
    </div>
    <div class="comp-box theirs">
      <div class="num">${comp.reviewsCompetitorAvg || 40}</div>
      <div class="lbl">Competitor Average</div>
    </div>
    <div class="comp-box yours">
      <div class="num">${comp.listingsYours || 0}</div>
      <div class="lbl">Your Directory Listings</div>
    </div>
    <div class="comp-box theirs">
      <div class="num">${comp.listingsCompetitorAvg || 35}</div>
      <div class="lbl">Competitor Average</div>
    </div>
  </div>
  <p style="color:#475569;font-size:0.95rem;line-height:1.7;">${comp.insight || ""}</p>
</div>` : ""}

<!-- Category Detail Sections -->
${catHTML}

<!-- Recovery Roadmap -->
${roadmap.length > 0 ? `
<div class="roadmap">
  <h2>🚀 90-Day Recovery Roadmap</h2>
  ${roadmap.map((r: any) => `
  <div class="roadmap-item">
    <div class="roadmap-num">${r.priority}</div>
    <div class="roadmap-content">
      <h4>${r.action}</h4>
      <p>${r.timeline} &nbsp;·&nbsp; <span class="${r.impact === 'High' ? 'impact-high' : 'impact-medium'}">${r.impact} Impact</span></p>
    </div>
  </div>`).join("")}
</div>` : ""}

</div><!-- /container -->

<!-- Footer -->
<div class="footer">
  <p class="brand">Scorpion <span class="gold">Global Solutions</span> LLC</p>
  <p style="margin-top:4px;">Arizona · Digital Marketing & AI Solutions</p>
  <p style="margin-top:8px;font-size:0.75rem;">© ${new Date().getFullYear()} All rights reserved · Report generated using real-time website analysis, Google Business Profile data, and directory verification</p>
</div>

</body>
</html>`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SEOAudit() {
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [report, setReport] = useState<any>(null);
  const [brandColors, setBrandColors] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrideReviewCount, setOverrideReviewCount] = useState("");
  const [overrideRating, setOverrideRating] = useState("");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateAudit = trpc.seoAudit.generateAudit.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        setReport(data.report);
        setBrandColors(data.brandColors);
        toast.success("Profit Leakage Report generated!");
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    },
    onError: (err) => toast.error("Failed to generate audit: " + err.message),
  });

  // Clear all state so every audit starts completely fresh — no bleed from previous runs
  const handleReset = () => {
    setBusinessName("");
    setWebsite("");
    setIndustry("");
    setLocation("");
    setGoogleMapsUrl("");
    setReport(null);
    setBrandColors(null);
    setOverrideReviewCount("");
    setOverrideRating("");
    setActiveSection(null);
    setShowOverrides(false);
    toast.info("Form cleared — ready for a new audit");
  };

  const handleGenerate = () => {
    if (!businessName.trim()) { toast.error("Please enter a business name"); return; }
    // Always wipe the previous report before starting a new run
    setReport(null);
    setBrandColors(null);
    const overrides: any = {};
    if (overrideReviewCount) overrides.reviewCount = parseInt(overrideReviewCount);
    if (overrideRating) overrides.rating = parseFloat(overrideRating);
    generateAudit.mutate({
      clientId: 0, businessName, website: website || undefined,
      industry: industry || undefined, location: location || undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    });
  };

  const handleExportPDF = async () => {
    if (!report || !reportRef.current) return;
    setIsPdfGenerating(true);
    toast.info("Generating PDF — this takes about 10 seconds...");
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f8fafc",
        logging: false,
        windowWidth: 1200,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      let yOffset = 0;
      let pageCount = 0;
      while (yOffset < scaledHeight) {
        if (pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -yOffset, pdfWidth, scaledHeight);
        yOffset += pdfHeight;
        pageCount++;
      }
      const filename = `Profit_Leakage_Report_${businessName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("PDF export failed. Try the HTML download instead.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const html = generateBrandedHTML(report, businessName, website);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Profit_Leakage_Report_${businessName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const rl = report?.revenueLeak;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#1B2945] to-[#2d3f6b] text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Digital Audit & Profit Leakage Report</h1>
            <p className="text-muted-foreground mt-1">Scorpion Global Solutions LLC · Loss-Led Audit System</p>
          </div>
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Business Name *</Label>
                <Input placeholder="e.g. The Loans Ranger" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Website URL</Label>
                <Input placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Industry</Label>
                <Input placeholder="e.g. Private Lending" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Location</Label>
                <Input placeholder="e.g. Phoenix, AZ" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium mb-1 flex items-center gap-2">
                  Google Maps URL
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal">Recommended for accurate review data</span>
                </Label>
                <Input
                  placeholder="https://www.google.com/maps/place/Business+Name/..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the business's Google Maps URL to get the exact review count. Without it, we search by name which may match the wrong listing.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={generateAudit.isPending}
                  className="flex-1 bg-gradient-to-r from-[#1B2945] to-[#2d3f6b] hover:from-[#0f1c35] hover:to-[#1B2945] text-white">
                  {generateAudit.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Search className="w-4 h-4 mr-2" /> Generate Report</>}
                </Button>
                {(report || businessName) && (
                  <Button onClick={handleReset} variant="outline" disabled={generateAudit.isPending}
                    className="px-3 text-muted-foreground hover:text-destructive hover:border-destructive" title="Clear form for a new audit">
                    ✕ New Audit
                  </Button>
                )}
              </div>
            </div>

            {/* Manual Overrides */}
            <div className="mt-4 pt-4 border-t border-border">
              <button onClick={() => setShowOverrides(!showOverrides)} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                {showOverrides ? "▼" : "▶"} Manual Data Overrides (optional)
              </button>
              {showOverrides && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Override Review Count</Label>
                    <Input type="number" placeholder="e.g. 38" value={overrideReviewCount} onChange={(e) => setOverrideReviewCount(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">If you know the real review count from Google</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1 block">Override Rating</Label>
                    <Input type="number" step="0.1" min="1" max="5" placeholder="e.g. 4.8" value={overrideRating} onChange={(e) => setOverrideRating(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">If you know the real Google rating</p>
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                      <strong>Tip:</strong> Use overrides when you know the real data differs from what our scraper finds.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Display */}
        {report && (
          <div className="space-y-6" ref={reportRef}>

            {/* Overall Grade Header */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="p-8 text-white text-center" style={{ background: "linear-gradient(135deg, #1B2945 0%, #0f1c35 100%)" }}>
                {brandColors?.logo && (
                  <img src={brandColors.logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg bg-white p-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="inline-block bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                  Digital Audit & Profit Leakage Report
                </div>
                <h2 className="text-2xl font-bold mb-1">{businessName}</h2>
                <p className="opacity-60 mb-6 text-sm">{website}</p>
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-red-500/60 bg-red-900/20 flex items-center justify-center mb-4">
                  <span className="text-5xl font-black text-red-300">{report.overallGrade || "F"}</span>
                </div>
                <p className="text-lg font-semibold">Overall Score: {report.overallScore || 0}/100</p>
                <p className="mt-1 opacity-50 text-xs">
                  Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                {/* Data confidence badge */}
                <div className="mt-3 flex justify-center gap-2 flex-wrap">
                  {report.dataConfidence === 'verified' ? (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 border border-green-400/40 text-green-300 px-3 py-1 rounded-full text-xs">
                      ✓ Google Business Profile: Verified via Maps URL
                    </span>
                  ) : report.dataConfidence === 'name_match' ? (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 px-3 py-1 rounded-full text-xs">
                      ⚠ Google Business Profile: Matched by name — paste Maps URL for higher accuracy
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-500/20 border border-red-400/40 text-red-300 px-3 py-1 rounded-full text-xs">
                      ✗ Google Business Profile: Not verified — review data may be inaccurate
                    </span>
                  )}
                </div>
                <p className="mt-2 opacity-40 text-xs">Audit Authority: Scorpion Global Solutions LLC · Arizona · Digital Marketing & AI Solutions</p>
              </div>
            </Card>

            {/* Revenue Leak Banner */}
            {rl && rl.totalAnnual > 0 && (
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="p-6" style={{ background: "linear-gradient(135deg, #1B2945, #2d3f6b)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-[#C5A059]" />
                    <h3 className="text-[#C5A059] font-bold uppercase text-sm tracking-widest">Financial Opportunity Gap</h3>
                  </div>
                  <p className="text-red-300 text-xl font-black mb-1">{rl.headline}</p>
                  <p className="text-white/60 text-sm mb-5">{rl.subheadline}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {rl.lostOrigination > 0 && (
                      <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-red-300">${rl.lostOrigination.toLocaleString()}</div>
                        <div className="text-white/50 text-xs mt-1">Lost Origination (Annual)</div>
                      </div>
                    )}
                    {rl.lostInterest > 0 && (
                      <div className="bg-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-red-300">${rl.lostInterest.toLocaleString()}</div>
                        <div className="text-white/50 text-xs mt-1">Lost Interest Spread (Annual)</div>
                      </div>
                    )}
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-red-200">${rl.totalAnnual.toLocaleString()}+</div>
                      <div className="text-white/50 text-xs mt-1">Total Annual Leakage</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-amber-300">${rl.monthlyLeak.toLocaleString()}</div>
                      <div className="text-white/50 text-xs mt-1">Monthly Opportunity Cost</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Executive Summary */}
            {report.executiveSummary && (
              <Card className="border-0 shadow-md border-l-4 border-l-[#1B2945]">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold text-[#1B2945] uppercase tracking-widest mb-3">Executive Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">{report.executiveSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Category Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {(report.categories || []).map((cat: any) => {
                const Icon = categoryIcons[cat.name] || Globe;
                const color = categoryColors[cat.name] || "#64748b";
                return (
                  <Card key={cat.name} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveSection(activeSection === cat.name ? null : cat.name)}>
                    <CardContent className="p-4 text-center">
                      <div className="w-9 h-9 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${color}18` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <GradeBadge grade={cat.grade} size="md" />
                      <p className="mt-2 text-xs font-semibold text-foreground">{cat.name}</p>
                      <ScoreBar score={cat.score} color={color} />
                      <p className="mt-1 text-xs text-muted-foreground">{cat.score}/100</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Architectural Failures */}
            {report.architecturalFailures?.length > 0 && (
              <Card className="border-0 shadow-md border-l-4 border-l-red-600">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-red-700 uppercase tracking-widest">Critical Architectural Failures</h3>
                  </div>
                  <div className="space-y-3">
                    {report.architecturalFailures.map((f: any, i: number) => (
                      <div key={i} className="border border-red-200 rounded-xl p-4 bg-red-50">
                        <h4 className="font-bold text-red-800 mb-1">{f.title}</h4>
                        <p className="text-red-700 text-sm mb-2"><strong>Impact:</strong> {f.impact}</p>
                        <div className="bg-blue-50 border-l-4 border-[#1B2945] p-3 rounded-r-lg">
                          <p className="text-[#1B2945] text-sm"><strong>Fix:</strong> {f.fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitor Comparison */}
            {report.competitorComparison?.reviewsCompetitorAvg && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-[#1B2945]" />
                    <h3 className="text-sm font-bold text-[#1B2945] uppercase tracking-widest">Competitive Velocity — Why They Win</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-3xl font-black text-red-600">{report.competitorComparison.reviewsYours}</div>
                      <div className="text-xs text-muted-foreground mt-1">Your Reviews</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-3xl font-black text-emerald-600">{report.competitorComparison.reviewsCompetitorAvg}</div>
                      <div className="text-xs text-muted-foreground mt-1">Competitor Avg Reviews</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="text-3xl font-black text-red-600">{report.competitorComparison.listingsYours}</div>
                      <div className="text-xs text-muted-foreground mt-1">Your Listings</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-3xl font-black text-emerald-600">{report.competitorComparison.listingsCompetitorAvg}</div>
                      <div className="text-xs text-muted-foreground mt-1">Competitor Avg Listings</div>
                    </div>
                  </div>
                  {report.competitorComparison.insight && (
                    <p className="text-muted-foreground text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">{report.competitorComparison.insight}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Detailed Category Sections */}
            {(report.categories || []).map((cat: any) => {
              const Icon = categoryIcons[cat.name] || Globe;
              const color = categoryColors[cat.name] || "#64748b";
              const isExpanded = activeSection === null || activeSection === cat.name;
              if (!isExpanded && activeSection !== null) return null;

              return (
                <Card key={cat.name} className="border-0 shadow-md overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: color }} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {cat.name}{cat.name === "GEO" ? " — Generative Engine Optimization" : ""}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Score: {cat.score}/100</p>
                        </div>
                      </div>
                      <GradeBadge grade={cat.grade} size="lg" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* GEO explanation banner */}
                    {cat.name === "GEO" && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                        <strong>GEO = Generative Engine Optimization</strong> — How visible this business is when people ask ChatGPT, Google AI Overviews, Perplexity, or Bing Copilot for recommendations.
                      </div>
                    )}

                    {/* Metrics */}
                    {cat.metrics && cat.metrics.length > 0 && (
                      <div className="bg-background rounded-lg p-4">
                        <h4 className="text-sm font-semibold mb-3">Performance Metrics</h4>
                        <div className="space-y-3">
                          {cat.metrics.map((m: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                              <span className="text-sm text-muted-foreground">{m.label}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-foreground">{m.value}</span>
                                {m.benchmark && <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">Avg: {m.benchmark}</span>}
                                {m.industryLeader && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Leader: {m.industryLeader}</span>}
                                {m.status && (
                                  <Badge variant={m.status === "good" ? "default" : m.status === "warning" ? "secondary" : "destructive"} className="text-xs">
                                    {m.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Directories */}
                    {cat.directories && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Directory Presence ({cat.presenceCount || 0}/{cat.totalDirectories || 0} found)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {cat.directories.map((d: any, i: number) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                              d.status === "found" ? "bg-emerald-50 text-emerald-700" :
                              d.status === "inaccurate" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                              <StatusIcon status={d.status} />
                              <span className="truncate">{d.name}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">Accuracy: {cat.accuracyPercent || 0}%</p>
                      </div>
                    )}

                    {/* Social Platforms */}
                    {cat.platforms && (
                      <div className="space-y-2">
                        {cat.platforms.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{p.name}</span>
                              {p.followers !== "N/A" && <span className="text-xs text-muted-foreground">{p.followers} followers</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={p.found ? "default" : "destructive"} className="text-xs">{p.found ? "Found" : "Not Found"}</Badge>
                              {p.activity && p.activity !== "not_found" && (
                                <Badge variant={p.activity === "active" ? "default" : "secondary"} className="text-xs">{p.activity}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Website Checklist */}
                    {cat.checklist && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {cat.checklist.map((c: any, i: number) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${c.found ? "bg-emerald-50" : "bg-red-50"}`}>
                            {c.found ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                            <span className={`text-sm font-medium ${c.found ? "text-emerald-700" : "text-red-700"}`}>{c.item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Performance */}
                    {cat.performance && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Mobile Score", value: cat.performance.mobileScore },
                          { label: "Desktop Score", value: cat.performance.desktopScore },
                          { label: "Page Speed", value: cat.performance.pageSpeed },
                          { label: "LCP", value: cat.performance.lcp },
                        ].map((m, i) => (
                          <div key={i} className="text-center p-3 bg-background rounded-lg">
                            <div className="text-2xl font-bold text-foreground">{m.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Keywords — Advertising section with real data */}
                    {cat.keywords && cat.name === 'Advertising' && (
                      <div>
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold">Keyword Opportunity</p>
                            <p className="text-xs text-muted-foreground">
                              {(cat.totalMonthlySearchOpportunity || 0).toLocaleString()} total monthly searches in your market
                            </p>
                          </div>
                          {cat.keywordDataSource && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              cat.keywordDataSource.includes('DataForSEO live')
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                              {cat.keywordDataSource.includes('DataForSEO live') ? '✓ Live data' : '⚠ Estimates'}
                            </span>
                          )}
                        </div>
                        {/* Column headers */}
                        <div className="grid grid-cols-4 gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide pb-1 border-b border-border mb-1">
                          <span className="col-span-2">Keyword</span>
                          <span className="text-right">Monthly Searches</span>
                          <span className="text-right">Avg CPC</span>
                        </div>
                        <div className="space-y-1">
                          {cat.keywords.map((k: any, i: number) => (
                            <div key={i} className="grid grid-cols-4 gap-2 items-center py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded px-1">
                              <div className="col-span-2">
                                <span className="text-sm">"{k.keyword}"</span>
                                {k.competition && (
                                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                    k.competition === 'HIGH' ? 'bg-red-100 text-red-600' :
                                    k.competition === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-green-100 text-green-600'
                                  }`}>{k.competition}</span>
                                )}
                              </div>
                              <div className="text-right">
                                {k.monthlySearches != null ? (
                                  <span className="font-semibold text-sm">{k.monthlySearches.toLocaleString()}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">{(k.impressions || 0).toLocaleString()} imp.</span>
                                )}
                              </div>
                              <div className="text-right">
                                {k.avgCpc != null ? (
                                  <span className="text-sm text-emerald-600 font-medium">${k.avgCpc.toFixed(2)}</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">{(k.clicks || 0).toLocaleString()} clicks</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {cat.keywordDataSource && !cat.keywordDataSource.includes('DataForSEO live') && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            ⚠ These are industry estimates. Add DataForSEO credentials in Settings for live search volume data.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Keywords — non-Advertising sections (legacy) */}
                    {cat.keywords && cat.name !== 'Advertising' && (
                      <div className="space-y-2">
                        {cat.keywords.map((k: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <span className="text-sm text-muted-foreground">"{k.keyword}"</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-muted-foreground">{(k.impressions || 0).toLocaleString()} imp.</span>
                              <span className="font-semibold">{(k.clicks || 0).toLocaleString()} clicks</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Findings */}
                    {cat.findings?.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Key Findings</h4>
                        <ul className="space-y-1">
                          {cat.findings.map((f: string, i: number) => (
                            <li key={i} className="text-sm text-amber-900 flex gap-2"><span>•</span><span>{f}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {cat.recommendations?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-[#1B2945] uppercase tracking-wide mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {cat.recommendations.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-blue-900 flex gap-2"><span>→</span><span>{r}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Recovery Roadmap */}
            {report.recoveryRoadmap?.length > 0 && (
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="p-6" style={{ background: "linear-gradient(135deg, #1B2945, #0f1c35)" }}>
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="w-5 h-5 text-[#C5A059]" />
                    <h3 className="text-[#C5A059] font-bold uppercase text-sm tracking-widest">90-Day Recovery Roadmap</h3>
                  </div>
                  <div className="space-y-3">
                    {report.recoveryRoadmap.map((r: any, i: number) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border-2 border-[#C5A059] flex items-center justify-center text-[#C5A059] font-black text-sm flex-shrink-0">
                          {r.priority}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{r.action}</p>
                          <p className="text-white/50 text-xs mt-0.5">
                            {r.timeline} · <span className={r.impact === "High" ? "text-red-300 font-bold" : "text-amber-300 font-bold"}>{r.impact} Impact</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Export Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 pb-6">
              <Button onClick={handleExportPDF} size="lg" disabled={isPdfGenerating}
                className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white px-8 shadow-lg">
                {isPdfGenerating
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating PDF...</>
                  : <><Download className="w-5 h-5 mr-2" /> Export as PDF</>}
              </Button>
              <Button onClick={handleDownload} size="lg" variant="outline"
                className="border-[#1B2945] text-[#1B2945] hover:bg-[#1B2945] hover:text-white px-8 bg-white">
                <Download className="w-4 h-4 mr-2" /> Download HTML Version
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
