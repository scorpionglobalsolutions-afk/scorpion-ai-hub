import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Webhook,
  Plus,
  Copy,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Globe,
  Shield,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Webhooks() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("custom");
  const [events, setEvents] = useState("lead.created");

  const webhookBaseUrl = window.location.origin + "/api/webhooks/";

  const { data: webhooksList, isLoading, refetch } = trpc.webhooks.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.webhooks.create.useMutation({
    onSuccess: () => {
      toast.success("Webhook created successfully!");
      setShowCreate(false);
      setName("");
      setPlatform("custom");
      setEvents("lead.created");
      refetch();
    },
    onError: () => {
      toast.error("Failed to create webhook");
    },
  });

  const testMutation = trpc.webhooks.test.useMutation({
    onSuccess: () => {
      toast.success("Test event sent successfully!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to send test event");
    },
  });

  const toggleMutation = trpc.webhooks.toggle.useMutation({
    onSuccess: () => {
      toast.success("Webhook updated!");
      refetch();
    },
  });

  const deleteMutation = trpc.webhooks.delete.useMutation({
    onSuccess: () => {
      toast.success("Webhook deleted!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete webhook");
    },
  });

  const eventTemplates = [
    { name: "Lead Created", event: "lead.created", description: "Triggered when a new lead is captured" },
    { name: "Form Submitted", event: "form.submitted", description: "Triggered when a form is submitted" },
    { name: "Appointment Booked", event: "appointment.booked", description: "Triggered when an appointment is scheduled" },
    { name: "Campaign Completed", event: "campaign.completed", description: "Triggered when a campaign finishes" },
    { name: "Review Received", event: "review.received", description: "Triggered when a new review is posted" },
    { name: "Lead Converted", event: "lead.converted", description: "Triggered when a lead converts" },
  ];

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Webhook name is required");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      platform,
      url: webhookBaseUrl + name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36),
      events,
    });
  };

  const webhooks = webhooksList || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <Webhook className="w-6 h-6" />
                  </div>
                  Webhook Integrations
                </h1>
                <p className="text-muted-foreground mt-1">
                  Receive leads and events from external platforms automatically
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus className="w-4 h-4" />
              New Webhook
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Webhook Form */}
        {showCreate && (
          <Card className="border-border mb-8 border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle>Create New Webhook</CardTitle>
              <CardDescription>Set up a new webhook endpoint to receive events from external platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Webhook Name</Label>
                    <Input
                      placeholder="e.g., Typeform Lead Capture"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <select
                      className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    >
                      <option value="custom">Custom</option>
                      <option value="typeform">Typeform</option>
                      <option value="hubspot">HubSpot</option>
                      <option value="zapier">Zapier</option>
                      <option value="make">Make (Integromat)</option>
                      <option value="gravity_forms">Gravity Forms</option>
                    </select>
                  </div>
                  <div>
                    <Label>Events to Listen For</Label>
                    <Input
                      placeholder="e.g., lead.created, form.submitted"
                      value={events}
                      onChange={(e) => setEvents(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated event types</p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Webhook"}
                  </Button>
                </div>
                <div className="space-y-4 bg-card/60 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-foreground text-sm">How It Works</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-bold text-green-600">1.</span>
                      Create a webhook and copy the generated URL
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-green-600">2.</span>
                      Paste the URL into your external platform (Typeform, HubSpot, etc.)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-green-600">3.</span>
                      When events occur, data is sent here and triggers automations
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-green-600">4.</span>
                      Speed-to-Lead responds instantly to new leads
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Webhooks */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Your Webhooks {webhooks.length > 0 && <span className="text-sm font-normal text-muted-foreground">({webhooks.length})</span>}
          </h2>

          {webhooks.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Webhooks Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first webhook to start receiving leads from external platforms.</p>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook: any) => (
                <Card key={webhook.id} className={`border-border ${!webhook.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${webhook.isActive ? "bg-green-100" : "bg-secondary"}`}>
                          {webhook.isActive ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{webhook.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs text-muted-foreground font-mono truncate max-w-[400px]">{webhook.url}</code>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(webhook.url)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {webhook.lastTriggeredAt ? (
                            <>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(webhook.lastTriggeredAt).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Last triggered</p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">Never triggered</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testMutation.mutate({ webhookId: webhook.id })}
                            disabled={testMutation.isPending}
                          >
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleMutation.mutate({ webhookId: webhook.id, isActive: !webhook.isActive })}
                          >
                            {webhook.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this webhook?")) {
                                deleteMutation.mutate({ webhookId: webhook.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {webhook.events && (
                      <div className="flex gap-2 mt-3 ml-14">
                        {(typeof webhook.events === "string" ? webhook.events.split(",") : Array.isArray(webhook.events) ? webhook.events : []).map((event: string) => (
                          <span key={event} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {event.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Event Templates */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Available Event Types
            </CardTitle>
            <CardDescription>Events your webhooks can listen for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventTemplates.map((template) => (
                <div key={template.event} className="p-4 border border-border rounded-lg hover:border-green-300 hover:bg-green-50/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-foreground text-sm">{template.name}</p>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono">{template.event}</code>
                  <p className="text-xs text-muted-foreground mt-2">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
