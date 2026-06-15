import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { BarChart3, Download, AlertCircle } from "lucide-react";

export default function Reporting() {
  const [clientName, setClientName] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generatedReport, setGeneratedReport] = useState("");

  const generateMutation = trpc.reporting.generateReport.useMutation({
    onSuccess: (data: any) => {
      const content = data.report || (data.success ? "Report generated successfully" : "Failed to generate");
      setGeneratedReport(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Report generated!");
    },
    onError: () => {
      toast.error("Failed to generate report");
    },
  });

  const handleGenerate = () => {
    if (!clientName || !month) {
      toast.error("Please fill in all fields");
      return;
    }

    generateMutation.mutate({
      clientId: 1,
      period: month,
      metrics: {
        leads: 150,
        conversions: 45,
        roi: 320,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Automated Reporting</h1>
            <p className="text-slate-600 dark:text-slate-400">Generate AI-powered client performance reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Generate Client Report</CardTitle>
                <CardDescription>Create narrative performance reports with AI insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client">Client Name *</Label>
                  <Input
                    id="client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Acme Corp"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="month">Report Month *</Label>
                  <Input
                    id="month"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Report Sections</CardTitle>
                <CardDescription>What's included in each report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "Executive Summary", desc: "High-level overview of performance" },
                    { title: "Key Metrics", desc: "Traffic, conversions, ROI analysis" },
                    { title: "Campaign Performance", desc: "Breakdown by channel and campaign" },
                    { title: "Insights & Trends", desc: "AI-generated observations" },
                    { title: "Recommendations", desc: "Actionable next steps" },
                  ].map((section, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="font-medium text-slate-900 dark:text-white">{section.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{section.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Sample Metrics</CardTitle>
                <CardDescription>Typical data points tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Website Traffic", value: "12,450" },
                    { label: "Leads Generated", value: "342" },
                    { label: "Conversion Rate", value: "3.2%" },
                    { label: "Cost Per Lead", value: "$18.50" },
                    { label: "ROI", value: "245%" },
                    { label: "Engagement Rate", value: "4.8%" },
                  ].map((metric, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">{metric.label}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200 dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Report Preview</CardTitle>
                <CardDescription>AI-generated narrative</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedReport ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {generatedReport}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReport);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      Copy Report
                    </Button>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Reports will appear here
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
