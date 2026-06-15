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
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Webhooks() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [events, setEvents] = useState("lead.created");

  // Generate a unique webhook URL
  const webhookBaseUrl = window.location.origin + "/api/webhooks/";
  const webhookSecret = "whsec_" + Math.random().toString(36).substring(2, 18);

  const sampleWebhooks = [
    {
      id: 1,
      name: "Typeform Lead Capture",
      url: webhookBaseUrl + "typeform-abc123",
      events: ["lead.created", "form.submitted"],
      isActive: true,
      lastTriggeredAt: new Date(Date.now() - 3600000).toISOString(),
      totalEvents: 145,
    },
    {
      id: 2,
      name: "HubSpot Contact Sync",
      url: webhookBaseUrl + "hubspot-def456",
      events: ["contact.created", "contact.updated"],
      isActive: true,
      lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(),
      totalEvents: 89,
    },
    {
      id: 3,
      name: "Zapier Integration",
      url: webhookBaseUrl + "zapier-ghi789",
      events: ["lead.created", "appointment.booked"],
      isActive: false,
      lastTriggeredAt: null,
      totalEvents: 0,
    },
  ];

  const eventTemplates = [
    { name: "Lead Created", event: "lead.created", description: "Triggered when a new lead is captured" },
    { name: "Form Submitted", event: "form.submitted", description: "Triggered when a form is submitted" },
    { name: "Appointment Booked", event: "appointment.booked", description: "Triggered when an appointment is scheduled" },
    { name: "Campaign Completed", event: "campaign.completed", description: "Triggered when a campaign finishes" },
    { name: "Review Received", event: "review.received", description: "Triggered when a new review is posted" },
    { name: "Lead Converted", event: "lead.converted", description: "Triggered when a lead converts" },
  ];

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <Webhook className="w-6 h-6" />
                  </div>
                  Webhook Integrations
                </h1>
                <p className="text-slate-600 mt-1">
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
          <Card className="border-slate-200 mb-8 border-green-200 bg-green-50/30">
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
                    <Label>Events to Listen For</Label>
                    <Input
                      placeholder="e.g., lead.created, form.submitted"
                      value={events}
                      onChange={(e) => setEvents(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Comma-separated event types</p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                    onClick={() => {
                      toast.success("Webhook created successfully!");
                      setShowCreate(false);
                      setName("");
                    }}
                  >
                    Create Webhook
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Your Webhook URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={webhookBaseUrl + "new-" + Date.now()} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookBaseUrl + "new")}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Signing Secret</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={webhookSecret} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookSecret)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Use this to verify webhook signatures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Webhooks */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Active Webhooks</h2>
          <div className="space-y-4">
            {sampleWebhooks.map((webhook) => (
              <Card key={webhook.id} className={`border-slate-200 ${!webhook.isActive ? "opacity-60" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${webhook.isActive ? "bg-green-100" : "bg-slate-100"}`}>
                        {webhook.isActive ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{webhook.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <code className="text-xs text-slate-500 font-mono">{webhook.url}</code>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(webhook.url)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{webhook.totalEvents}</p>
                        <p className="text-xs text-slate-500">Events</p>
                      </div>
                      <div className="text-right">
                        {webhook.lastTriggeredAt ? (
                          <>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(webhook.lastTriggeredAt).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-slate-500">Last triggered</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Never triggered</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Test</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 ml-14">
                    {webhook.events.map((event) => (
                      <span key={event} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {event}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Event Templates */}
        <Card className="border-slate-200">
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
                <div key={template.event} className="p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                  </div>
                  <code className="text-xs text-slate-500 font-mono">{template.event}</code>
                  <p className="text-xs text-slate-500 mt-2">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
