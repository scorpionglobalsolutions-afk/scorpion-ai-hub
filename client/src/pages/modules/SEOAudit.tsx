import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";

export default function SEOAudit() {
  const [businessName, setBusinessName] = useState("");
  const [businessUrl, setBusinessUrl] = useState("");
  const [auditReport, setAuditReport] = useState("");

  const generateMutation = trpc.seoAudit.generateAudit.useMutation({
    onSuccess: (data: any) => {
      const content = data.report || (data.success ? "Audit generated successfully" : "Failed to generate");
      setAuditReport(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Audit report generated!");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Local SEO & GBP Auditor</h1>
            <p className="text-slate-600 dark:text-slate-400">Comprehensive SEO analysis and optimization recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Run SEO Audit</CardTitle>
                <CardDescription>Analyze on-page SEO, NAP consistency, and GBP optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business">Business Name *</Label>
                  <Input
                    id="business"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Corp"
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

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Audit Checklist</CardTitle>
                <CardDescription>Key SEO factors analyzed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    "On-Page SEO (Title, Meta, Headers)",
                    "Mobile Responsiveness",
                    "Page Speed & Performance",
                    "Schema Markup Implementation",
                    "NAP Consistency (Name, Address, Phone)",
                    "Google Business Profile Optimization",
                    "Local Citations & Backlinks",
                    "Content Quality & Relevance",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200 dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Audit Report</CardTitle>
                <CardDescription>AI-generated analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {auditReport ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {auditReport}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(auditReport);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      Copy Report
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Audit reports will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
