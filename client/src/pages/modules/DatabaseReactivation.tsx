import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { RotateCcw, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function DatabaseReactivation() {
  const [csvData, setCsvData] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [generatedSequence, setGeneratedSequence] = useState("");
  const [cleanedLeads, setCleanedLeads] = useState<string[]>([]);

  const generateMutation = trpc.reactivation.generateSequence.useMutation({
    onSuccess: (data: any) => {
      const content = data.sequence || [];
      setGeneratedSequence(typeof content === "string" ? content : JSON.stringify(content));
      toast.success("Reactivation sequence generated!");
    },
    onError: () => {
      toast.error("Failed to generate sequence");
    },
  });

  const handleCleanData = () => {
    if (!csvData) {
      toast.error("Please paste CSV data");
      return;
    }

    const lines = csvData.split("\n").filter((line) => line.trim());
    const cleaned = lines.filter((line) => {
      const isPhoneOnly = /^\d{10,}$/.test(line.trim());
      const isDuplicate = lines.indexOf(line) !== lines.lastIndexOf(line);
      return !isPhoneOnly && !isDuplicate;
    });

    setCleanedLeads(cleaned);
    toast.success(`Cleaned ${cleaned.length} leads (removed ${lines.length - cleaned.length} invalid entries)`);
  };

  const handleGenerateSequence = () => {
    if (!campaignName || cleanedLeads.length === 0) {
      toast.error("Please clean data and enter campaign name");
      return;
    }

    const firstLead = cleanedLeads[0] || "Lead";
    generateMutation.mutate({
      leadName: firstLead.split(",")[0]?.trim() || "Lead",
      leadEmail: firstLead.split(",")[1]?.trim() || "lead@example.com",
      businessContext: campaignName,
      numMessages: 3,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Database Reactivation</h1>
            <p className="text-slate-600 dark:text-slate-400">Revive dormant leads with personalized sequences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Upload & Clean Lead List</CardTitle>
                <CardDescription>Paste CSV data and automatically remove duplicates and invalid entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv">Paste CSV Data (Email, Name, Phone)</Label>
                  <Textarea
                    id="csv"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="john@example.com, John Smith, 5551234567&#10;jane@example.com, Jane Doe, 5559876543"
                    className="mt-2 h-32"
                  />
                </div>

                <Button
                  onClick={handleCleanData}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Clean & Validate Data
                </Button>

                {cleanedLeads.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {cleanedLeads.length} valid leads ready
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                          Duplicates and invalid entries removed
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Generate Reactivation Sequence</CardTitle>
                <CardDescription>Create personalized multi-step outreach sequences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaign">Campaign Name *</Label>
                  <Input
                    id="campaign"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Q2 2026 Reactivation"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerateSequence}
                  disabled={generateMutation.isPending || cleanedLeads.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Generate Sequence
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Campaign Tracking</CardTitle>
                <CardDescription>Monitor reactivation campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <span className="text-sm font-medium">Sent</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <span className="text-sm font-medium">Opened</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">0%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <span className="text-sm font-medium">Responded</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200 dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Sequence Preview</CardTitle>
                <CardDescription>AI-generated outreach</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedSequence ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {generatedSequence}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSequence);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      Copy Sequence
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Sequences will appear here
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
