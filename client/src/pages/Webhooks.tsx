import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Download,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Platform definitions with setup instructions
const PLATFORMS = [
  {
    value: "apollo",
    label: "Apollo.io",
    color: "bg-orange-100 text-orange-700",
    description: "Contact enrichment & outreach",
    instructions: "In Apollo → Settings → Integrations → Webhooks → Add Webhook. Paste your URL and select events: contact_enriched, contact_stage_change, mobile_phone_enriched.",
    defaultEvents: "contact_enriched,contact_stage_change,mobile_phone_enriched",
  },
  {
    value: "hyperagent",
    label: "HyperAgent",
    color: "bg-purple-100 text-purple-700",
    description: "AI agent automation platform",
    instructions: "In HyperAgent → Agent Settings → Output → Webhook. Paste your URL. HyperAgent will POST enriched contact data after each agent run.",
    defaultEvents: "lead.created,contact.enriched",
  },
  {
    value: "n8n",
    label: "n8n",
    color: "bg-red-100 text-red-700",
    description: "Workflow automation",
    instructions: "In n8n, add a 'HTTP Request' node or 'Webhook' trigger. Set Method to POST, URL to your webhook URL. Map fields: name, email, phone, business.",
    defaultEvents: "lead.created,workflow.completed",
  },
  {
    value: "zapier",
    label: "Zapier",
    color: "bg-yellow-100 text-yellow-700",
    description: "App automation",
    instructions: "In Zapier, create a Zap with 'Webhooks by Zapier' as the action. Select 'POST' and paste your webhook URL. Map your contact fields.",
    defaultEvents: "lead.created",
  },
  {
    value: "make",
    label: "Make (Integromat)",
    color: "bg-blue-100 text-blue-700",
    description: "Visual automation platform",
    instructions: "In Make, add an HTTP module → Make a request. Set Method: POST, URL: your webhook URL, Body type: Raw, Content type: JSON. Map your fields.",
    defaultEvents: "lead.created",
  },
  {
    value: "typeform",
    label: "Typeform",
    color: "bg-pink-100 text-pink-700",
    description: "Form & survey platform",
    instructions: "In Typeform → Connect → Webhooks → Add a webhook. Paste your URL. Typeform sends form_response.answers automatically on submission.",
    defaultEvents: "form.submitted",
  },
  {
    value: "hubspot",
    label: "HubSpot",
    color: "bg-orange-100 text-orange-800",
    description: "CRM & marketing platform",
    instructions: "In HubSpot → Settings → Integrations → Private Apps → Webhooks. Add subscription for contact.creation or contact.propertyChange. Paste your URL.",
    defaultEvents: "contact.creation,contact.propertyChange",
  },
  {
    value: "twilio",
    label: "Twilio",
    color: "bg-red-100 text-red-800",
    description: "SMS & voice platform",
    instructions: "In Twilio Console → Phone Numbers → Your Number → Messaging → Webhook. Set 'A message comes in' to HTTP POST and paste your URL.",
    defaultEvents: "message.received,call.completed",
  },
  {
    value: "gohighlevel",
    label: "GoHighLevel",
    color: "bg-green-100 text-green-700",
    description: "Marketing & CRM platform",
    instructions: "In GHL → Settings → Integrations → Webhooks. Click Add Webhook, paste your URL, and select triggers: Contact Created, Form Submitted.",
    defaultEvents: "contact.created,form.submitted",
  },
  {
    value: "calendly",
    label: "Calendly",
    color: "bg-blue-100 text-blue-800",
    description: "Scheduling platform",
    instructions: "In Calendly → Integrations → Webhooks → New Webhook Subscription. Paste your URL and subscribe to invitee.created and invitee.canceled events.",
    defaultEvents: "invitee.created,appointment.booked",
  },
  {
    value: "gravity_forms",
    label: "Gravity Forms",
    color: "bg-slate-100 text-slate-700",
    description: "WordPress form plugin",
    instructions: "In WordPress → Forms → Settings → Webhooks → Add New. Set Request URL to your webhook URL, Method: POST, Format: JSON. Map your fields.",
    defaultEvents: "form.submitted",
  },
  {
    value: "custom",
    label: "Custom / REST API",
    color: "bg-slate-100 text-slate-600",
    description: "Any platform with HTTP POST",
    instructions: "POST JSON to your webhook URL with any of these fields: name, email, phone, business, industry, source, notes. The system auto-detects the format.",
    defaultEvents: "lead.created",
  },
];

export default function Webhooks() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("custom");
  const [events, setEvents] = useState("lead.created");
  const [expandedWebhook, setExpandedWebhook] = useState<number | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<number | null>(null);

  const { data: webhooksList, isLoading, refetch } = trpc.webhooks.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.webhooks.create.useMutation({
    onSuccess: () => {
      toast.success("Webhook created! Copy the URL and paste it into your platform.");
      setShowCreate(false);
      setName("");
      setPlatform("custom");
      setEvents("lead.created");
      refetch();
    },
    onError: () => toast.error("Failed to create webhook"),
  });

  const testMutation = trpc.webhooks.test.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Test lead created in Leads Inbox!");
      refetch();
    },
    onError: () => toast.error("Failed to send test event"),
  });

  const toggleMutation = trpc.webhooks.toggle.useMutation({
    onSuccess: () => { toast.success("Webhook updated!"); refetch(); },
  });

  const deleteMutation = trpc.webhooks.delete.useMutation({
    onSuccess: () => { toast.success("Webhook deleted!"); refetch(); },
    onError: () => toast.error("Failed to delete webhook"),
  });

  const { data: eventsData, isLoading: eventsLoading } = trpc.webhooks.getEvents.useQuery(
    { webhookId: expandedEvents! },
    { enabled: expandedEvents !== null }
  );

  const selectedPlatform = PLATFORMS.find((p) => p.value === platform) || PLATFORMS[PLATFORMS.length - 1];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getFullUrl = (url: string) => {
    if (url.startsWith("/api/")) return window.location.origin + url;
    return url;
  };

  const handleCreate = () => {
    if (!name.trim()) { toast.error("Webhook name is required"); return; }
    createMutation.mutate({ name: name.trim(), platform, events });
  };

  const handlePlatformChange = (val: string) => {
    setPlatform(val);
    const p = PLATFORMS.find((x) => x.value === val);
    if (p) setEvents(p.defaultEvents);
  };

  if (loading || isLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  }

  const webhooks = webhooksList || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <Webhook className="w-6 h-6" />
                  </div>
                  Webhook Integrations
                </h1>
                <p className="text-muted-foreground mt-1">
                  Receive leads from Apollo, HyperAgent, n8n, Zapier, Typeform, and any platform
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus className="w-4 h-4" />New Webhook
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Webhook Form */}
        {showCreate && (
          <Card className="border-green-200 bg-green-50/30 mb-8">
            <CardHeader>
              <CardTitle>Create New Webhook</CardTitle>
              <CardDescription>Set up a new endpoint — your URL is generated automatically and works immediately</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Webhook Name</Label>
                    <Input
                      placeholder="e.g., Apollo Lead Enrichment"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <select
                      className="w-full mt-1 border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                      value={platform}
                      onChange={(e) => handlePlatformChange(e.target.value)}
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label} — {p.description}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Events (comma-separated)</Label>
                    <Input
                      placeholder="e.g., lead.created, form.submitted"
                      value={events}
                      onChange={(e) => setEvents(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 w-full"
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Webhook"}
                  </Button>
                </div>
                {/* Platform setup instructions */}
                <div className="bg-card/60 p-4 rounded-lg border border-green-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedPlatform.color}`}>
                      {selectedPlatform.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">Setup Instructions</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedPlatform.instructions}</p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">How it works:</p>
                    <ol className="space-y-1 text-xs text-muted-foreground">
                      <li><span className="font-bold text-green-600">1.</span> Create webhook → copy the URL</li>
                      <li><span className="font-bold text-green-600">2.</span> Paste URL into {selectedPlatform.label}</li>
                      <li><span className="font-bold text-green-600">3.</span> Leads appear in your Leads Inbox instantly</li>
                      <li><span className="font-bold text-green-600">4.</span> Click Test to verify end-to-end</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Webhooks List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Your Webhooks {webhooks.length > 0 && <span className="text-sm font-normal text-muted-foreground">({webhooks.length})</span>}
          </h2>

          {webhooks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Webhooks Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first webhook to start receiving leads from Apollo, n8n, Zapier, or any platform.</p>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4 mr-2" />Create First Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook: any) => {
                const platformInfo = PLATFORMS.find((p) => p.value === webhook.platform) || PLATFORMS[PLATFORMS.length - 1];
                const fullUrl = getFullUrl(webhook.url);
                const isExpanded = expandedWebhook === webhook.id;
                const showEvents = expandedEvents === webhook.id;

                return (
                  <Card key={webhook.id} className={`border-border transition-opacity ${!webhook.isActive ? "opacity-60" : ""}`}>
                    <CardContent className="pt-4 pb-4">
                      {/* Main row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${webhook.isActive ? "bg-green-100" : "bg-secondary"}`}>
                            {webhook.isActive
                              ? <CheckCircle className="w-4 h-4 text-green-600" />
                              : <XCircle className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground">{webhook.name}</p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${platformInfo.color}`}>
                                {platformInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <code className="text-xs text-muted-foreground font-mono truncate max-w-[350px]">{fullUrl}</code>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0" onClick={() => copyToClipboard(fullUrl)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                              <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 flex-shrink-0">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Right side controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {webhook.lastTriggeredAt && (
                            <div className="text-right hidden md:block">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(webhook.lastTriggeredAt).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Last triggered</p>
                            </div>
                          )}
                          <Button
                            variant="outline" size="sm"
                            onClick={() => testMutation.mutate({ webhookId: webhook.id })}
                            disabled={testMutation.isPending}
                            title="Send test lead to Leads Inbox"
                          >
                            <FlaskConical className="w-3 h-3 mr-1" />Test
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => setExpandedEvents(showEvents ? null : webhook.id)}
                            title="View received events"
                          >
                            <Eye className="w-3 h-3 mr-1" />Events
                          </Button>
                          <a
                            href={`${fullUrl}/events/export`}
                            download
                            title="Download all events as JSON"
                          >
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3" />
                            </Button>
                          </a>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => toggleMutation.mutate({ webhookId: webhook.id, isActive: !webhook.isActive })}
                            title={webhook.isActive ? "Disable webhook" : "Enable webhook"}
                          >
                            {webhook.isActive
                              ? <ToggleRight className="w-4 h-4 text-green-600" />
                              : <ToggleLeft className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            onClick={() => setExpandedWebhook(isExpanded ? null : webhook.id)}
                            title="Setup instructions"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { if (confirm("Delete this webhook?")) deleteMutation.mutate({ webhookId: webhook.id }); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Event tags */}
                      {webhook.events && (
                        <div className="flex gap-1.5 mt-2 ml-11 flex-wrap">
                          {(typeof webhook.events === "string" ? webhook.events.split(",") : Array.isArray(webhook.events) ? webhook.events : []).map((event: string) => (
                            <span key={event} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {event.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Setup instructions panel */}
                      {isExpanded && (
                        <div className="mt-4 ml-11 p-3 bg-muted/40 rounded-lg border border-border text-sm">
                          <p className="font-semibold text-foreground mb-1">{platformInfo.label} Setup</p>
                          <p className="text-muted-foreground">{platformInfo.instructions}</p>
                          <div className="mt-2 p-2 bg-background rounded border border-border">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Your webhook URL:</p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-foreground flex-1 truncate">{fullUrl}</code>
                              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(fullUrl)}>
                                <Copy className="w-3 h-3 mr-1" />Copy
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Events viewer panel */}
                      {showEvents && (
                        <div className="mt-4 ml-11">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-foreground">Received Events</p>
                            <a href={`${fullUrl}/events/export`} download>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                <Download className="w-3 h-3 mr-1" />Export JSON
                              </Button>
                            </a>
                          </div>
                          {eventsLoading ? (
                            <div className="flex justify-center py-4"><Spinner /></div>
                          ) : !eventsData || eventsData.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                              No events received yet. Click <strong>Test</strong> to send a test lead.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {[...eventsData].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20).map((event: any) => (
                                <div key={event.id} className="flex items-start gap-3 p-2 bg-muted/30 rounded text-xs border border-border">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-mono font-semibold text-foreground">{event.eventType}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-xs ${event.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {event.status}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                                    {event.payload?.body && (
                                      <details className="mt-1">
                                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View payload</summary>
                                        <pre className="mt-1 p-2 bg-background rounded border text-xs overflow-x-auto max-h-32">
                                          {JSON.stringify(event.payload.body, null, 2)}
                                        </pre>
                                      </details>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Supported Platforms Grid */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Supported Platforms
            </CardTitle>
            <CardDescription>Your webhook system auto-detects and parses payloads from all these platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {PLATFORMS.filter((p) => p.value !== "custom").map((p) => (
                <div key={p.value} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/10">
                <span className="text-xs text-muted-foreground">+ Any REST API</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              <strong>Universal parser:</strong> Any platform that POSTs JSON with name, email, phone, or business fields will automatically create a lead — no configuration needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
