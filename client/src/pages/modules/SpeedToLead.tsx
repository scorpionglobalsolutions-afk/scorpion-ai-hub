import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Zap, Mail, MessageSquare } from "lucide-react";

export default function SpeedToLead() {
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("email");
  const [generatedResponse, setGeneratedResponse] = useState("");

  const generateMutation = trpc.speedToLead.generateResponse.useMutation({
    onSuccess: (data) => {
      const content = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      setGeneratedResponse(content);
      toast.success("Response generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate response");
    },
  });

  const handleGenerate = async () => {
    if (!leadName || !leadEmail) {
      toast.error("Please fill in lead name and email");
      return;
    }

    generateMutation.mutate({
      leadName,
      leadEmail,
      leadCompany: leadCompany || undefined,
      channel,
      businessContext: businessContext || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-white">
                Speed to Lead
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Instant lead capture with AI-powered responses
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-border dark:border-slate-800">
              <CardHeader>
                <CardTitle>Generate Lead Response</CardTitle>
                <CardDescription>
                  Create personalized SMS or email responses for new leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lead Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground dark:text-white">Lead Information</h3>

                  <div>
                    <Label htmlFor="leadName">Lead Name *</Label>
                    <Input
                      id="leadName"
                      placeholder="John Smith"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="leadEmail">Email Address *</Label>
                    <Input
                      id="leadEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="leadCompany">Company (Optional)</Label>
                    <Input
                      id="leadCompany"
                      placeholder="Acme Corp"
                      value={leadCompany}
                      onChange={(e) => setLeadCompany(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Channel Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground dark:text-white">Response Channel</h3>
                  <Tabs value={channel} onValueChange={(v) => setChannel(v as "sms" | "email")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email" className="gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="sms" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Business Context */}
                <div>
                  <Label htmlFor="context">Business Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Describe your business, services, or campaign context..."
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value)}
                    className="mt-2 h-24"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Response
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div>
            <Card className="border-border dark:border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>
                  {channel === "email" ? "Email Response" : "SMS Response"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedResponse ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-background dark:bg-slate-900 rounded-lg border border-border dark:border-slate-700">
                      <p className="text-sm text-foreground dark:text-slate-300 whitespace-pre-wrap">
                        {generatedResponse}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedResponse);
                        toast.success("Copied to clipboard!");
                      }}
                    >
                      Copy Response
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Generated responses will appear here
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
