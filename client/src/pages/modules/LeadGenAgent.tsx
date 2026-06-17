import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Bot,
  Plus,
  Play,
  Trash2,
  Users,
  MapPin,
  Target,
  Zap,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserPlus,
  Send,
  Eye,
  Filter,
  Sparkles,
  BarChart3,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Agent = {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  radius: number | null;
  outreachChannel: "sms" | "email" | "both";
  outreachTone: "professional" | "friendly" | "urgent" | "consultative";
  valueProposition: string | null;
  status: "draft" | "active" | "paused";
  lastRunAt: Date | null;
  totalProspectsFound: number | null;
  totalLeadsSaved: number | null;
  filters: any;
};

type ProspectResult = {
  id: number;
  businessName: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: string | null;
  reviewCount: number | null;
  isUnclaimed: boolean | null;
  hasWebsite: boolean | null;
  opportunityScore: number | null;
  smsMessage: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  status: "new" | "outreach_sent" | "responded" | "saved_as_lead" | "dismissed";
};

// ─── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-900/50 text-green-300 border-green-700"
      : score >= 40
      ? "bg-yellow-900/50 text-yellow-300 border-yellow-700"
      : "bg-zinc-800 text-zinc-400 border-zinc-700";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
      <TrendingUp className="w-3 h-3" />
      {score}
    </span>
  );
}

// ─── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: ProspectResult["status"] }) {
  const map: Record<string, string> = {
    new: "bg-blue-900/40 text-blue-300",
    outreach_sent: "bg-purple-900/40 text-purple-300",
    responded: "bg-green-900/40 text-green-300",
    saved_as_lead: "bg-emerald-900/40 text-emerald-300",
    dismissed: "bg-zinc-800 text-zinc-500",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? ""}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Prospect Card ─────────────────────────────────────────────────────────────
function ProspectCard({
  prospect,
  agentId,
  clientId,
  industry,
  onStatusChange,
  onSaved,
}: {
  prospect: ProspectResult;
  agentId: number;
  clientId: number;
  industry: string;
  onStatusChange: () => void;
  onSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeOutreach, setActiveOutreach] = useState<"sms" | "email" | null>(null);

  const updateStatus = trpc.leadGenAgent.updateResultStatus.useMutation({
    onSuccess: onStatusChange,
  });

  const saveAsLead = trpc.leadGenAgent.saveProspectAsLead.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${prospect.businessName} saved to CRM!`);
        onSaved();
      } else {
        toast.error(data.error || "Failed to save");
      }
    },
    onError: () => toast.error("Failed to save prospect"),
  });

  const isSaved = prospect.status === "saved_as_lead";
  const isDismissed = prospect.status === "dismissed";

  return (
    <div
      className={`rounded-lg border transition-all ${
        isSaved
          ? "border-emerald-700/50 bg-emerald-900/10"
          : isDismissed
          ? "border-zinc-800 bg-zinc-900/30 opacity-60"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm">{prospect.businessName}</span>
              <ScoreBadge score={prospect.opportunityScore ?? 0} />
              <StatusChip status={prospect.status} />
              {!prospect.hasWebsite && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-300 border border-orange-800">No Website</span>
              )}
              {prospect.isUnclaimed && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800">Unclaimed</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {prospect.address && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{prospect.address.split(",").slice(0, 2).join(",")}
                </span>
              )}
              {prospect.phone && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />{prospect.phone}
                </span>
              )}
              {prospect.rating && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {prospect.rating} ({prospect.reviewCount ?? 0} reviews)
                </span>
              )}
              {prospect.website && (
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-3 h-3" />Website
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isSaved && !isDismissed && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1 text-emerald-400 border-emerald-800 hover:bg-emerald-900/30 h-7 px-2"
                  disabled={saveAsLead.isPending}
                  onClick={() =>
                    saveAsLead.mutate({
                      resultId: prospect.id,
                      agentId,
                      clientId,
                      businessName: prospect.businessName,
                      phone: prospect.phone || undefined,
                      website: prospect.website || undefined,
                      address: prospect.address || undefined,
                      industry,
                    })
                  }
                >
                  {saveAsLead.isPending ? <Spinner className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-zinc-500 hover:text-zinc-300 h-7 px-2"
                  onClick={() => updateStatus.mutate({ id: prospect.id, status: "dismissed" })}
                >
                  <XCircle className="w-3 h-3" />
                </Button>
              </>
            )}
            {isSaved && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            <button
              className="text-muted-foreground hover:text-foreground ml-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {/* Outreach messages */}
          {(prospect.smsMessage || prospect.emailSubject) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />AI-Generated Outreach
              </p>
              <div className="flex gap-2 mb-2">
                {prospect.smsMessage && (
                  <button
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      activeOutreach === "sms"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    onClick={() => setActiveOutreach(activeOutreach === "sms" ? null : "sms")}
                  >
                    <MessageSquare className="w-3 h-3 inline mr-1" />SMS
                  </button>
                )}
                {prospect.emailSubject && (
                  <button
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      activeOutreach === "email"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    onClick={() => setActiveOutreach(activeOutreach === "email" ? null : "email")}
                  >
                    <Mail className="w-3 h-3 inline mr-1" />Email
                  </button>
                )}
              </div>

              {activeOutreach === "sms" && prospect.smsMessage && (
                <div className="bg-background rounded-lg border border-border p-3">
                  <p className="text-xs text-foreground">{prospect.smsMessage}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 text-xs text-muted-foreground h-6 px-1"
                    onClick={() => { navigator.clipboard.writeText(prospect.smsMessage!); toast.success("Copied!"); }}
                  >
                    Copy
                  </Button>
                </div>
              )}

              {activeOutreach === "email" && prospect.emailSubject && (
                <div className="bg-background rounded-lg border border-border p-3 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Subject:</p>
                    <p className="text-xs font-medium text-foreground">{prospect.emailSubject}</p>
                  </div>
                  {prospect.emailBody && (
                    <div>
                      <p className="text-xs text-muted-foreground">Body:</p>
                      <p className="text-xs text-foreground whitespace-pre-wrap">{prospect.emailBody}</p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground h-6 px-1"
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${prospect.emailSubject}\n\n${prospect.emailBody}`);
                      toast.success("Copied!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Mark outreach sent */}
          {!isSaved && !isDismissed && prospect.status !== "outreach_sent" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1 h-7"
              onClick={() => {
                updateStatus.mutate({ id: prospect.id, status: "outreach_sent" });
                toast.success("Marked as outreach sent");
              }}
            >
              <Send className="w-3 h-3" />Mark Outreach Sent
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create Agent Dialog ───────────────────────────────────────────────────────
function CreateAgentDialog({
  clientId,
  onCreated,
}: {
  clientId: number;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("10");
  const [channel, setChannel] = useState<"sms" | "email" | "both">("both");
  const [tone, setTone] = useState<"professional" | "friendly" | "urgent" | "consultative">("friendly");
  const [vp, setVp] = useState("");

  const createMutation = trpc.leadGenAgent.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created!");
      setOpen(false);
      setName(""); setIndustry(""); setLocation(""); setVp("");
      onCreated();
    },
    onError: () => toast.error("Failed to create agent"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" />New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Lead Generation Agent</DialogTitle>
          <DialogDescription>
            Configure your AI agent's targeting and outreach settings. You can run it immediately after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Agent Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pool Service Leads — Tampa" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target Industry *</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Pool Services, HVAC, Roofing" className="mt-1" />
            </div>
            <div>
              <Label>Target Location *</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tampa, FL" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Radius (miles)</Label>
              <Input type="number" value={radius} onChange={(e) => setRadius(e.target.value)}
                min="1" max="50" className="mt-1" />
            </div>
            <div>
              <Label>Outreach Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both (SMS + Email)</SelectItem>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="consultative">Consultative</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Value Proposition</Label>
            <Textarea
              value={vp}
              onChange={(e) => setVp(e.target.value)}
              placeholder="What service are you offering? e.g. AI-powered reputation management and lead generation for local service businesses"
              className="mt-1 h-20 text-sm"
            />
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createMutation.isPending || !name || !industry || !location}
            onClick={() =>
              createMutation.mutate({
                clientId,
                name,
                industry,
                location,
                radius: Math.round(Number(radius) * 1609.34), // miles to meters
                outreachChannel: channel,
                outreachTone: tone,
                valueProposition: vp || undefined,
              })
            }
          >
            {createMutation.isPending ? (
              <><Spinner className="w-4 h-4 mr-2" />Creating...</>
            ) : (
              <><Bot className="w-4 h-4 mr-2" />Create Agent</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Run Agent Panel ───────────────────────────────────────────────────────────
function RunAgentPanel({
  agent,
  clientId,
  onComplete,
}: {
  agent: Agent;
  clientId: number;
  onComplete: () => void;
}) {
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [filterUnclaimed, setFilterUnclaimed] = useState(false);
  const [filterLowReviews, setFilterLowReviews] = useState(false);
  const [minScore, setMinScore] = useState("0");

  const runMutation = trpc.leadGenAgent.run.useMutation({
    onSuccess: (data) => {
      if (data.error) {
        toast.error(`Agent error: ${data.error}`);
      } else {
        toast.success(`Found ${data.totalFound} businesses, generated outreach for ${data.prospects.length} top prospects!`);
        onComplete();
      }
    },
    onError: () => toast.error("Agent run failed"),
  });

  const radiusMeters = Math.round((agent.radius ?? 10) * (agent.radius && agent.radius > 100 ? 1 : 1609.34));

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />Run Agent
        </CardTitle>
        <CardDescription>
          The agent will search Google Maps for <strong>{agent.industry}</strong> businesses near{" "}
          <strong>{agent.location}</strong>, score each prospect, and generate personalized outreach messages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />Prospect Filters
          </p>
          <div className="space-y-2">
            {[
              { label: "Only businesses without a website", value: filterNoWebsite, set: setFilterNoWebsite },
              { label: "Only unclaimed / unmanaged listings", value: filterUnclaimed, set: setFilterUnclaimed },
              { label: "Only businesses with fewer than 10 reviews", value: filterLowReviews, set: setFilterLowReviews },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Minimum opportunity score</Label>
              <Input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="w-16 h-7 text-xs text-center"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white hover:opacity-90 gap-2"
          disabled={runMutation.isPending}
          onClick={() =>
            runMutation.mutate({
              agentId: agent.id,
              clientId,
              industry: agent.industry || "",
              location: agent.location || "",
              radius: radiusMeters,
              filters: {
                noWebsite: filterNoWebsite,
                unclaimed: filterUnclaimed,
                lowReviews: filterLowReviews,
                minScore: Number(minScore),
              },
              outreachChannel: agent.outreachChannel,
              outreachTone: agent.outreachTone,
              valueProposition: agent.valueProposition || undefined,
            })
          }
        >
          {runMutation.isPending ? (
            <><Spinner className="w-4 h-4" />Agent Running — Searching & Generating Outreach...</>
          ) : (
            <><Zap className="w-4 h-4" />Run Agent Now</>
          )}
        </Button>
        {runMutation.isPending && (
          <p className="text-xs text-muted-foreground text-center animate-pulse">
            Searching Google Maps → Scoring prospects → Generating AI outreach messages...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LeadGenAgent() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("agents");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: clients = [] } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();

  const { data: agents = [], isLoading: loadingAgents } = trpc.leadGenAgent.listByClient.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const { data: results = [], isLoading: loadingResults } = trpc.leadGenAgent.getResults.useQuery(
    { agentId: selectedAgent?.id! },
    { enabled: !!selectedAgent }
  );

  const deleteMutation = trpc.leadGenAgent.delete.useMutation({
    onSuccess: () => {
      utils.leadGenAgent.listByClient.invalidate({ clientId: selectedClientId! });
      setSelectedAgent(null);
      toast.success("Agent deleted");
    },
    onError: () => toast.error("Failed to delete agent"),
  });

  const refreshResults = () => {
    utils.leadGenAgent.getResults.invalidate({ agentId: selectedAgent?.id });
    utils.leadGenAgent.listByClient.invalidate({ clientId: selectedClientId! });
  };

  const selectedClient = (clients as any[]).find((c) => c.id === selectedClientId);

  const filteredResults = (results as ProspectResult[]).filter((r) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return r.status === "new" || r.status === "outreach_sent";
    return r.status === statusFilter;
  });

  const stats = {
    total: (results as ProspectResult[]).length,
    new: (results as ProspectResult[]).filter((r) => r.status === "new").length,
    outreachSent: (results as ProspectResult[]).filter((r) => r.status === "outreach_sent").length,
    saved: (results as ProspectResult[]).filter((r) => r.status === "saved_as_lead").length,
    highScore: (results as ProspectResult[]).filter((r) => (r.opportunityScore ?? 0) >= 70).length,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">Lead Generation Agent</h1>
              <p className="text-muted-foreground text-sm">
                AI-powered prospect discovery, scoring, and personalized outreach generation
              </p>
            </div>
          </div>
        </div>

        {/* Client selector */}
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Users className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Select Client</Label>
                <Select
                  value={selectedClientId?.toString() ?? ""}
                  onValueChange={(v) => {
                    setSelectedClientId(Number(v));
                    setSelectedAgent(null);
                  }}
                >
                  <SelectTrigger className="w-72">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(clients as any[]).map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedClient && (
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{selectedClient.name}</span>
                  {selectedClient.industry && (
                    <span className="ml-2 text-xs">· {selectedClient.industry}</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedClientId ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="w-14 h-14 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a client above to manage their lead generation agents</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="agents" className="gap-2">
                <Bot className="w-4 h-4" />Agents
                {(agents as Agent[]).length > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {(agents as Agent[]).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="prospects" className="gap-2" disabled={!selectedAgent}>
                <Target className="w-4 h-4" />Prospects
                {selectedAgent && results.length > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                    {results.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Agents Tab ── */}
            <TabsContent value="agents" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Left: Agent list */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">
                      Configured Agents
                      {(agents as Agent[]).length > 0 && (
                        <span className="ml-2 text-muted-foreground font-normal">
                          ({(agents as Agent[]).length})
                        </span>
                      )}
                    </h3>
                    <CreateAgentDialog
                      clientId={selectedClientId}
                      onCreated={() =>
                        utils.leadGenAgent.listByClient.invalidate({ clientId: selectedClientId })
                      }
                    />
                  </div>

                  {loadingAgents ? (
                    <div className="flex justify-center py-8"><Spinner className="w-6 h-6" /></div>
                  ) : (agents as Agent[]).length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-lg">
                      <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No agents yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "New Agent" to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(agents as Agent[]).map((agent) => (
                        <div
                          key={agent.id}
                          className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                            selectedAgent?.id === agent.id
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                          onClick={() => {
                            setSelectedAgent(agent);
                            setActiveTab("agents");
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{agent.name}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {agent.industry && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Target className="w-3 h-3" />{agent.industry}
                                  </span>
                                )}
                                {agent.location && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />{agent.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span
                                className={`text-xs px-2 py-0.5 rounded font-medium ${
                                  agent.status === "active"
                                    ? "bg-green-900/50 text-green-300"
                                    : agent.status === "paused"
                                    ? "bg-yellow-900/50 text-yellow-300"
                                    : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {agent.status}
                              </span>
                            </div>
                          </div>
                          {(agent.totalProspectsFound ?? 0) > 0 && (
                            <div className="flex gap-3 mt-2 pt-2 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                <span className="text-foreground font-medium">{agent.totalProspectsFound}</span> found
                              </span>
                              <span className="text-xs text-muted-foreground">
                                <span className="text-emerald-400 font-medium">{agent.totalLeadsSaved}</span> saved
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Selected agent detail + run panel */}
                <div className="lg:col-span-3 space-y-4">
                  {selectedAgent ? (
                    <>
                      {/* Agent config summary */}
                      <Card className="border-border bg-card">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{selectedAgent.name}</CardTitle>
                              <CardDescription>
                                {selectedAgent.industry} · {selectedAgent.location}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-xs"
                                onClick={() => {
                                  setActiveTab("prospects");
                                }}
                              >
                                <Eye className="w-3 h-3" />View Prospects
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-900 hover:bg-red-900/30 gap-1 text-xs"
                                onClick={() => deleteMutation.mutate({ id: selectedAgent.id })}
                              >
                                <Trash2 className="w-3 h-3" />Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: "Channel", value: selectedAgent.outreachChannel },
                              { label: "Tone", value: selectedAgent.outreachTone },
                              { label: "Radius", value: selectedAgent.radius ? `${Math.round(selectedAgent.radius / 1609.34)} mi` : "10 mi" },
                              { label: "Last Run", value: selectedAgent.lastRunAt ? new Date(selectedAgent.lastRunAt).toLocaleDateString() : "Never" },
                            ].map(({ label, value }) => (
                              <div key={label} className="text-center p-2 rounded bg-background border border-border">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                <p className="text-sm font-medium text-foreground capitalize">{value}</p>
                              </div>
                            ))}
                          </div>
                          {selectedAgent.valueProposition && (
                            <div className="mt-3 p-3 rounded bg-background border border-border">
                              <p className="text-xs text-muted-foreground mb-1">Value Proposition</p>
                              <p className="text-sm text-foreground">{selectedAgent.valueProposition}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Run panel */}
                      <RunAgentPanel
                        agent={selectedAgent}
                        clientId={selectedClientId}
                        onComplete={() => {
                          refreshResults();
                          setActiveTab("prospects");
                        }}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-48 border border-dashed border-border rounded-lg text-center p-8">
                      <Bot className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm">Select an agent to configure and run it</p>
                      <p className="text-muted-foreground text-xs mt-1">or click "New Agent" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── Prospects Tab ── */}
            <TabsContent value="prospects" className="mt-4">
              {!selectedAgent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Target className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Select an agent first, then run it to see prospects here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Total", value: stats.total, icon: BarChart3, color: "text-foreground" },
                      { label: "New", value: stats.new, icon: Sparkles, color: "text-blue-400" },
                      { label: "Outreach Sent", value: stats.outreachSent, icon: Send, color: "text-purple-400" },
                      { label: "Saved to CRM", value: stats.saved, icon: CheckCircle, color: "text-emerald-400" },
                      { label: "High Score (70+)", value: stats.highScore, icon: TrendingUp, color: "text-yellow-400" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="p-3 rounded-lg border border-border bg-card text-center">
                        <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                        <p className="text-lg font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Filter + refresh */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Filter:</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Prospects</SelectItem>
                          <SelectItem value="active">Active (New + Sent)</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="outreach_sent">Outreach Sent</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                          <SelectItem value="saved_as_lead">Saved to CRM</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs h-8"
                      onClick={refreshResults}
                    >
                      <RefreshCw className="w-3 h-3" />Refresh
                    </Button>
                  </div>

                  {/* Results list */}
                  {loadingResults ? (
                    <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
                  ) : filteredResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg text-center">
                      <Target className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm">
                        {results.length === 0
                          ? "No prospects yet — run the agent to discover businesses"
                          : "No prospects match the current filter"}
                      </p>
                      {results.length === 0 && (
                        <Button
                          size="sm"
                          className="mt-3 gap-1 bg-primary text-primary-foreground"
                          onClick={() => setActiveTab("agents")}
                        >
                          <Play className="w-3 h-3" />Go Run Agent
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredResults.map((prospect) => (
                        <ProspectCard
                          key={prospect.id}
                          prospect={prospect}
                          agentId={selectedAgent.id}
                          clientId={selectedClientId}
                          industry={selectedAgent.industry || ""}
                          onStatusChange={refreshResults}
                          onSaved={refreshResults}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
