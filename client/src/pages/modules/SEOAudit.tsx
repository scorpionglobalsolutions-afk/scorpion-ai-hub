import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Copy,
  FileText,
} from "lucide-react";
import { Link } from "wouter";

// Grade color mapping
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
};

const categoryColors: Record<string, string> = {
  SEO: "#2563eb",
  Listings: "#7c3aed",
  Reviews: "#f59e0b",
  Social: "#ec4899",
  Website: "#06b6d4",
  Advertising: "#10b981",
};

function GradeBadge({ grade, size = "md" }: { grade: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const colors = gradeColors[grade] || gradeColors.C;
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-5xl",
  };
  return (
    <div className={`${sizeClasses[size]} ${colors.bg} ${colors.text} ${colors.border} border-2 rounded-full flex items-center justify-center font-bold`}>
      {grade}
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "found" || status === "good") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === "inaccurate" || status === "warning") return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
}

function generateBrandedHTML(report: any, businessName: string, website: string, brandColors: any): string {
  const primary = brandColors?.primary || "#1e293b";
  const logo = brandColors?.logo || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Digital Presence Snapshot - ${businessName}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
.cover { background: linear-gradient(135deg, ${primary}, ${primary}dd); color: white; padding: 60px 40px; text-align: center; }
.cover h1 { font-size: 2.5rem; margin-bottom: 10px; }
.cover p { font-size: 1.2rem; opacity: 0.9; }
.cover .logo { width: 80px; height: 80px; border-radius: 12px; margin-bottom: 20px; background: white; padding: 8px; }
.grade-circle { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 4px solid white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; margin: 30px auto; }
.container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
.summary { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.summary h2 { font-size: 1.5rem; margin-bottom: 15px; color: ${primary}; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 30px; }
.category-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid; text-align: center; }
.category-card h3 { font-size: 0.9rem; margin-bottom: 8px; color: #64748b; }
.category-card .grade { font-size: 2.5rem; font-weight: bold; }
.score-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
.score-bar-fill { height: 100%; border-radius: 4px; }
.section { background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); page-break-inside: avoid; }
.section-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #f1f5f9; }
.section-header h2 { font-size: 1.4rem; }
.section-grade { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; }
.metric-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.metric-row:last-child { border-bottom: none; }
.directory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
.directory-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 0.9rem; }
.directory-item.found { background: #ecfdf5; color: #065f46; }
.directory-item.not_found { background: #fef2f2; color: #991b1b; }
.directory-item.inaccurate { background: #fffbeb; color: #92400e; }
.platform-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-radius: 8px; margin-bottom: 8px; background: #f8fafc; }
.checklist-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; }
.perf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
.perf-box { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
.perf-box .score { font-size: 2.5rem; font-weight: bold; }
.priorities { background: ${primary}11; border: 1px solid ${primary}33; border-radius: 12px; padding: 25px; margin-top: 30px; }
.priorities h2 { color: ${primary}; margin-bottom: 15px; }
.priorities ol { padding-left: 20px; }
.priorities li { padding: 8px 0; font-size: 1rem; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-good { background: #ecfdf5; color: #065f46; }
.badge-warning { background: #fffbeb; color: #92400e; }
.badge-critical { background: #fef2f2; color: #991b1b; }
.footer { text-align: center; padding: 40px; color: #64748b; font-size: 0.9rem; }
@media print { body { background: white; } .section, .summary { box-shadow: none; border: 1px solid #e2e8f0; } .cover { padding: 40px 20px; } }
</style>
</head>
<body>
<div class="cover">
  ${logo ? `<img src="${logo}" class="logo" alt="Logo" onerror="this.style.display='none'" />` : ""}
  <h1>${businessName}</h1>
  <p>Digital Presence Snapshot Report</p>
  <div class="grade-circle">${report.overallGrade || "C"}</div>
  <p style="font-size:1.1rem;">Overall Score: ${report.overallScore || 55}/100</p>
  <p style="margin-top:15px;opacity:0.7;">Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
</div>

<div class="container">
  <div class="summary">
    <h2>Executive Summary</h2>
    <p style="font-size:1.05rem;line-height:1.7;">${report.executiveSummary || ""}</p>
  </div>

  <div class="category-grid">
    ${(report.categories || []).map((cat: any) => {
      const color = ({"SEO":"#2563eb","Listings":"#7c3aed","Reviews":"#f59e0b","Social":"#ec4899","Website":"#06b6d4","Advertising":"#10b981"} as any)[cat.name] || "#64748b";
      return `
    <div class="category-card" style="border-top-color: ${color}">
      <h3>${cat.name}</h3>
      <div class="grade" style="color: ${color}">${cat.grade}</div>
      <div class="score-bar"><div class="score-bar-fill" style="width:${cat.score}%;background:${color}"></div></div>
      <p style="margin-top:8px;font-size:0.8rem;color:#64748b;">${cat.score}/100</p>
    </div>`;
    }).join("")}
  </div>

  ${(report.categories || []).map((cat: any) => {
    const color = ({"SEO":"#2563eb","Listings":"#7c3aed","Reviews":"#f59e0b","Social":"#ec4899","Website":"#06b6d4","Advertising":"#10b981"} as any)[cat.name] || "#64748b";
    return `
  <div class="section">
    <div class="section-header">
      <div class="section-grade" style="border:3px solid ${color};color:${color};">${cat.grade}</div>
      <h2>${cat.name}</h2>
    </div>
    
    ${cat.metrics ? `<div style="margin-bottom:20px;">${cat.metrics.map((m: any) => `
      <div class="metric-row">
        <span>${m.label}</span>
        <div style="display:flex;gap:15px;align-items:center;">
          <strong>${m.value}</strong>
          ${m.benchmark ? `<span style="color:#64748b;font-size:0.85rem;">Avg: ${m.benchmark}</span>` : ""}
          ${m.industryLeader ? `<span style="color:#059669;font-size:0.85rem;">Leader: ${m.industryLeader}</span>` : ""}
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
    <p style="margin-top:15px;color:#64748b;font-size:0.9rem;">Found on ${cat.presenceCount || 0} of ${cat.totalDirectories || 50} directories (${cat.accuracyPercent || 0}% accuracy)</p>` : ""}

    ${cat.platforms ? cat.platforms.map((p: any) => `
    <div class="platform-row">
      <div><strong>${p.name}</strong> ${p.followers !== "N/A" ? `<span style="margin-left:10px;color:#64748b;font-size:0.85rem;">${p.followers} followers</span>` : ""}</div>
      <div style="display:flex;gap:8px;">
        <span class="badge ${p.found ? "badge-good" : "badge-critical"}">${p.found ? "Found" : "Not Found"}</span>
        ${p.activity && p.activity !== "not_found" ? `<span class="badge badge-${p.activity === "active" ? "good" : "warning"}">${p.activity}</span>` : ""}
      </div>
    </div>`).join("") : ""}

    ${cat.checklist ? cat.checklist.map((c: any) => `
    <div class="checklist-item">
      <span style="font-size:1.3rem;color:${c.found ? "#059669" : "#dc2626"}">${c.found ? "✓" : "✗"}</span>
      <span>${c.item}</span>
    </div>`).join("") : ""}

    ${cat.performance ? `
    <div class="perf-grid">
      <div class="perf-box"><div class="score" style="color:${(cat.performance.mobileScore||0) >= 70 ? "#10b981" : "#f59e0b"}">${cat.performance.mobileScore}</div><div style="color:#64748b;margin-top:5px;">Mobile Score</div></div>
      <div class="perf-box"><div class="score" style="color:${(cat.performance.desktopScore||0) >= 70 ? "#10b981" : "#f59e0b"}">${cat.performance.desktopScore}</div><div style="color:#64748b;margin-top:5px;">Desktop Score</div></div>
    </div>
    <div class="metric-row"><span>Page Speed</span><strong>${cat.performance.pageSpeed}</strong></div>
    <div class="metric-row"><span>Largest Contentful Paint</span><strong>${cat.performance.lcp}</strong></div>
    <div class="metric-row"><span>Cumulative Layout Shift</span><strong>${cat.performance.cls}</strong></div>
    <div class="metric-row"><span>First Input Delay</span><strong>${cat.performance.fid}</strong></div>` : ""}

    ${cat.keywords ? `
    <p style="margin-bottom:12px;"><strong>Monthly Opportunity:</strong> ${(cat.totalImpressions||0).toLocaleString()} impressions / ${(cat.totalClicks||0).toLocaleString()} clicks</p>
    ${cat.keywords.map((k: any) => `
    <div class="metric-row"><span>"${k.keyword}"</span><div style="display:flex;gap:20px;"><span style="color:#64748b;">${(k.impressions||0).toLocaleString()} imp.</span><strong>${(k.clicks||0).toLocaleString()} clicks</strong></div></div>`).join("")}` : ""}

    ${cat.findings?.length ? `<div style="margin-top:15px;"><h4 style="font-size:0.85rem;font-weight:600;color:#64748b;text-transform:uppercase;margin-bottom:8px;">Key Findings</h4><ul style="padding-left:20px;color:#475569;font-size:0.9rem;line-height:1.8;">${cat.findings.map((f: string) => `<li>${f}</li>`).join("")}</ul></div>` : ""}

    ${cat.recommendations?.length ? `<div style="margin-top:15px;"><h4 style="font-size:0.85rem;font-weight:600;color:${primary};text-transform:uppercase;margin-bottom:8px;">Recommendations</h4><ul style="padding-left:20px;color:#1e40af;font-size:0.9rem;line-height:1.8;">${cat.recommendations.map((r: string) => `<li>${r}</li>`).join("")}</ul></div>` : ""}
  </div>`;
  }).join("")}

  ${report.topPriorities?.length ? `
  <div class="priorities">
    <h2>Top Priorities</h2>
    <ol>${report.topPriorities.map((p: string) => `<li>${p}</li>`).join("")}</ol>
  </div>` : ""}
</div>

<div class="footer">
  <p>Report generated by <strong>Scorpion Global Solutions LLC</strong></p>
  <p style="margin-top:5px;">Arizona | Digital Marketing & AI Solutions</p>
  <p style="margin-top:5px;font-size:0.8rem;">© ${new Date().getFullYear()} All rights reserved.</p>
</div>
</body>
</html>`;
}

export default function SEOAudit() {
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [report, setReport] = useState<any>(null);
  const [brandColors, setBrandColors] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const generateAudit = trpc.seoAudit.generateAudit.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        setReport(data.report);
        setBrandColors(data.brandColors);
        toast.success("Snapshot report generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    },
    onError: (err) => {
      toast.error("Failed to generate audit: " + err.message);
    },
  });

  const handleGenerate = () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }
    generateAudit.mutate({ clientId: 0, businessName, website: website || undefined, industry: industry || undefined });
  };

  const handleDownload = () => {
    if (!report) return;
    const html = generateBrandedHTML(report, businessName, website, brandColors);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Snapshot_Report_${businessName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Digital Presence Snapshot</h1>
            <p className="text-slate-500 mt-1">Generate comprehensive Vendasta-style audit reports for your clients</p>
          </div>
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">Business Name *</Label>
                <Input
                  placeholder="e.g. Pool Buddies LLC"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">Website URL</Label>
                <Input
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1 block">Industry</Label>
                <Input
                  placeholder="e.g. Pool Services"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerate}
                  disabled={generateAudit.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {generateAudit.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Search className="w-4 h-4 mr-2" /> Generate Snapshot</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            {/* Overall Grade Header */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div
                className="p-8 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${brandColors?.primary || "#1e293b"}, ${brandColors?.secondary || "#334155"})` }}
              >
                {brandColors?.logo && (
                  <img
                    src={brandColors.logo}
                    alt="Logo"
                    className="w-16 h-16 mx-auto mb-4 rounded-lg bg-white p-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">{businessName}</h2>
                <p className="opacity-80 mb-6">Digital Presence Snapshot Report</p>
                <div className="w-28 h-28 mx-auto rounded-full border-4 border-white/50 bg-white/20 flex items-center justify-center">
                  <span className="text-5xl font-bold">{report.overallGrade || "C"}</span>
                </div>
                <p className="mt-4 text-lg">Overall Score: {report.overallScore || 55}/100</p>
                <p className="mt-2 opacity-70 text-sm">
                  Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </Card>

            {/* Executive Summary */}
            {report.executiveSummary && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Executive Summary</h3>
                  <p className="text-slate-600 leading-relaxed">{report.executiveSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Category Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(report.categories || []).map((cat: any) => {
                const Icon = categoryIcons[cat.name] || Globe;
                const color = categoryColors[cat.name] || "#64748b";
                return (
                  <Card
                    key={cat.name}
                    className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveSection(activeSection === cat.name ? null : cat.name)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <GradeBadge grade={cat.grade} size="md" />
                      <p className="mt-2 text-sm font-medium text-slate-700">{cat.name}</p>
                      <ScoreBar score={cat.score} color={color} />
                      <p className="mt-1 text-xs text-slate-500">{cat.score}/100</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{cat.name}</CardTitle>
                          <p className="text-sm text-slate-500">Score: {cat.score}/100</p>
                        </div>
                      </div>
                      <GradeBadge grade={cat.grade} size="lg" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Metrics Table */}
                    {cat.metrics && cat.metrics.length > 0 && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Performance Metrics</h4>
                        <div className="space-y-3">
                          {cat.metrics.map((m: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                              <span className="text-sm text-slate-600">{m.label}</span>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold text-slate-900">{m.value}</span>
                                {m.benchmark && <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Avg: {m.benchmark}</span>}
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

                    {/* Directories Grid */}
                    {cat.directories && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                          Directory Presence ({cat.presenceCount || 0}/{cat.totalDirectories || 50} found)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {cat.directories.map((d: any, i: number) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                                d.status === "found" ? "bg-emerald-50 text-emerald-700" :
                                d.status === "inaccurate" ? "bg-amber-50 text-amber-700" :
                                "bg-red-50 text-red-700"
                              }`}
                            >
                              <StatusIcon status={d.status} />
                              <span className="truncate">{d.name}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-slate-500">
                          Accuracy: {cat.accuracyPercent || 0}% of listings have correct information
                        </p>
                      </div>
                    )}

                    {/* Social Platforms */}
                    {cat.platforms && (
                      <div className="space-y-2">
                        {cat.platforms.map((p: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-4 h-4 text-slate-500" />
                              <span className="font-medium text-sm">{p.name}</span>
                              {p.followers !== "N/A" && <span className="text-xs text-slate-500">{p.followers} followers</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={p.found ? "default" : "destructive"} className="text-xs">
                                {p.found ? "Found" : "Not Found"}
                              </Badge>
                              {p.activity && p.activity !== "not_found" && (
                                <Badge variant={p.activity === "active" ? "default" : "secondary"} className="text-xs">
                                  {p.activity}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Website Checklist */}
                    {cat.checklist && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cat.checklist.map((c: any, i: number) => (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${c.found ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {c.found ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{c.item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Website Performance */}
                    {cat.performance && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <div className={`text-3xl font-bold ${(cat.performance.mobileScore || 0) >= 70 ? "text-emerald-600" : (cat.performance.mobileScore || 0) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {cat.performance.mobileScore}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">Mobile Score</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <div className={`text-3xl font-bold ${(cat.performance.desktopScore || 0) >= 70 ? "text-emerald-600" : (cat.performance.desktopScore || 0) >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {cat.performance.desktopScore}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">Desktop Score</p>
                        </div>
                        <div className="col-span-2 space-y-2 text-sm">
                          <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">Page Speed</span><span className="font-medium">{cat.performance.pageSpeed}</span></div>
                          <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">LCP</span><span className="font-medium">{cat.performance.lcp}</span></div>
                          <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">CLS</span><span className="font-medium">{cat.performance.cls}</span></div>
                          <div className="flex justify-between py-1"><span className="text-slate-500">FID</span><span className="font-medium">{cat.performance.fid}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Advertising Keywords */}
                    {cat.keywords && (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-semibold text-slate-700">Keyword Opportunities</h4>
                          <span className="text-xs text-slate-500">
                            {(cat.totalImpressions || 0).toLocaleString()} impressions / {(cat.totalClicks || 0).toLocaleString()} clicks monthly
                          </span>
                        </div>
                        <div className="space-y-2">
                          {cat.keywords.map((k: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                              <span className="font-medium">"{k.keyword}"</span>
                              <div className="flex gap-4 text-xs text-slate-500">
                                <span>{(k.impressions || 0).toLocaleString()} imp.</span>
                                <span className="font-semibold text-slate-700">{(k.clicks || 0).toLocaleString()} clicks</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Findings & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.findings?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Findings</h4>
                          <ul className="space-y-1">
                            {cat.findings.map((f: string, i: number) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 mt-1 text-amber-500 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cat.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {cat.recommendations.map((r: string, i: number) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 mt-1 text-blue-500 shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Top Priorities */}
            {report.topPriorities?.length > 0 && (
              <Card className="border-0 shadow-md" style={{ borderLeft: `4px solid ${brandColors?.primary || "#2563eb"}` }}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Priorities</h3>
                  <ol className="space-y-3">
                    {report.topPriorities.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-slate-700">{p}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4 pb-8">
              <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <Download className="w-4 h-4 mr-2" /> Download Branded Report
              </Button>
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                toast.success("Report data copied!");
              }}>
                <Copy className="w-4 h-4 mr-2" /> Copy Data
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!report && !generateAudit.isPending && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Globe className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Generate a Snapshot Report</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Enter a business name and website URL above to generate a comprehensive digital presence
                audit covering SEO, listings, reviews, social media, website performance, and advertising opportunities.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {generateAudit.isPending && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Analyzing Digital Presence...</h3>
              <p className="text-slate-500">
                Scanning SEO, listings, reviews, social media, website performance, and advertising opportunities.
                This may take 15-30 seconds.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
