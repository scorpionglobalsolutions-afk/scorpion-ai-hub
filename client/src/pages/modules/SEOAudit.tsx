import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Search, Download, CheckCircle2, AlertTriangle, XCircle, TrendingUp, Globe, FileText } from "lucide-react";

type AuditSection = {
  title: string;
  score: number;
  status: "good" | "warning" | "critical";
  findings: string[];
  recommendations: string[];
};

type AuditReport = {
  overallScore: number;
  sections: AuditSection[];
  topPriorities: string[];
};

function ScoreCircle({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const radius = size === "lg" ? 54 : 28;
  const stroke = size === "lg" ? 8 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const dim = size === "lg" ? 130 : 70;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={dim / 2} cy={dim / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className={`absolute font-bold ${size === "lg" ? "text-2xl" : "text-sm"}`} style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    good: { icon: CheckCircle2, label: "Good", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    warning: { icon: AlertTriangle, label: "Needs Work", bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    critical: { icon: XCircle, label: "Critical", bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const c = config[status as keyof typeof config] || config.warning;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

function generateBrandedHTML(report: AuditReport, businessName: string, website: string): string {
  const scoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

  const sectionsHTML = report.sections.map(section => `
    <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid ${scoreColor(section.score)};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0;">${section.title}</h3>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: ${section.status === 'good' ? '#d1fae5' : section.status === 'warning' ? '#fef3c7' : '#fee2e2'}; color: ${section.status === 'good' ? '#065f46' : section.status === 'warning' ? '#92400e' : '#991b1b'}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${section.status === 'good' ? 'Good' : section.status === 'warning' ? 'Needs Work' : 'Critical'}</span>
          <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: white; background: ${scoreColor(section.score)};">${section.score}</div>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <h4 style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Findings</h4>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
          ${section.findings.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4 style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Recommendations</h4>
        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
          ${section.recommendations.map(r => `<li style="color: #1e40af;">${r}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Audit Report - ${businessName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    @media print { body { background: white; } .container { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 48px; margin-bottom: 32px; color: white; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.03); border-radius: 50%;"></div>
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
        <img src="https://www.google.com/s2/favicons?domain=${website}&sz=64" alt="Logo" style="width: 48px; height: 48px; border-radius: 8px; background: white; padding: 4px;" onerror="this.style.display='none'" />
        <div>
          <h1 style="font-size: 28px; font-weight: 800; margin: 0;">${businessName}</h1>
          <p style="font-size: 14px; opacity: 0.7; margin: 4px 0 0 0;">${website || 'Website not provided'}</p>
        </div>
      </div>
      <p style="font-size: 16px; opacity: 0.9; margin-top: 16px;">Local SEO & Google Business Profile Audit Report</p>
      <p style="font-size: 13px; opacity: 0.6; margin-top: 8px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} by Scorpion Global Solutions LLC</p>
    </div>

    <!-- Overall Score -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      <h2 style="font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Overall SEO Health Score</h2>
      <div style="width: 140px; height: 140px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 42px; font-weight: 800; color: white; background: ${scoreColor(report.overallScore)}; box-shadow: 0 8px 24px ${scoreColor(report.overallScore)}40;">
        ${report.overallScore}
      </div>
      <p style="font-size: 14px; color: #64748b;">out of 100</p>
    </div>

    <!-- Top Priorities -->
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #bfdbfe;">
      <h2 style="font-size: 16px; font-weight: 700; color: #1e40af; margin-bottom: 12px;">🎯 Top Priorities</h2>
      <ol style="padding-left: 20px; color: #1e3a5f; font-size: 14px; line-height: 2;">
        ${report.topPriorities.map(p => `<li style="font-weight: 500;">${p}</li>`).join('')}
      </ol>
    </div>

    <!-- Sections -->
    <h2 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px;">Detailed Analysis</h2>
    ${sectionsHTML}

    <!-- Footer -->
    <div style="text-align: center; padding: 32px 0; border-top: 1px solid #e2e8f0; margin-top: 32px;">
      <p style="font-size: 13px; color: #94a3b8;">Prepared by <strong>Scorpion Global Solutions LLC</strong></p>
      <p style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">Arizona | Digital Marketing & AI Solutions</p>
    </div>
  </div>
</body>
</html>`;
}

export default function SEOAudit() {
  const [businessName, setBusinessName] = useState("");
  const [businessUrl, setBusinessUrl] = useState("");
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  const generateMutation = trpc.seoAudit.generateAudit.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.report) {
        setAuditReport(data.report);
        toast.success("Audit report generated!");
      } else {
        toast.error(data.error || "Failed to generate audit report");
      }
    },
    onError: () => {
      toast.error("Failed to generate audit report");
    },
  });

  const handleGenerateAudit = () => {
    if (!businessName || !businessUrl) {
      toast.error("Please fill in all fields");
      return;
    }
    generateMutation.mutate({
      clientId: 1,
      businessName,
      website: businessUrl,
    });
  };

  const handleDownloadReport = () => {
    if (!auditReport) return;
    try {
      const html = generateBrandedHTML(auditReport, businessName, businessUrl);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SEO_Audit_${businessName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Branded report downloaded!");
    } catch {
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Local SEO & GBP Auditor</h1>
            <p className="text-slate-600 dark:text-slate-400">Generate branded, presentation-style audit reports for your clients</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Run SEO Audit</CardTitle>
                <CardDescription>Enter client details to generate a branded report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business">Business Name *</Label>
                  <Input
                    id="business"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Pool Buddies LLC"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="url">Website URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={businessUrl}
                    onChange={(e) => setBusinessUrl(e.target.value)}
                    placeholder="https://www.example.com"
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleGenerateAudit}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Generate Audit Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Download Actions */}
            {auditReport && (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base">Export Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleDownloadReport} className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Branded HTML Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(auditReport, null, 2));
                      toast.success("Report data copied!");
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Copy Raw Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-2">
            {auditReport ? (
              <div className="space-y-6">
                {/* Overall Score Card */}
                <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${businessUrl}&sz=64`}
                        alt=""
                        className="w-12 h-12 rounded-lg bg-white p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <h2 className="text-xl font-bold">{businessName}</h2>
                        <p className="text-sm text-slate-300 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {businessUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Overall SEO Health</p>
                        <p className="text-sm text-slate-400 mt-1">Based on 10 ranking factors</p>
                      </div>
                      <ScoreCircle score={auditReport.overallScore} size="lg" />
                    </div>
                  </CardContent>
                </Card>

                {/* Top Priorities */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Top Priorities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {auditReport.topPriorities.map((priority, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{priority}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditReport.sections.map((section, idx) => (
                    <Card key={idx} className="border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{section.title}</h3>
                          <ScoreCircle score={section.score} size="sm" />
                        </div>
                        <StatusBadge status={section.status} />
                        <div className="mt-3 space-y-1">
                          {section.findings.slice(0, 2).map((finding, fIdx) => (
                            <p key={fIdx} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              • {finding.length > 100 ? finding.slice(0, 100) + "..." : finding}
                            </p>
                          ))}
                        </div>
                        {section.recommendations.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              → {section.recommendations[0]}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-slate-200 dark:border-slate-800 h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Report Generated</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Enter a business name and website URL, then click "Generate Audit Report" to create a branded presentation-style SEO analysis.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
