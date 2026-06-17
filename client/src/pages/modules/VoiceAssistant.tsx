import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Mic,
  Plus,
  Trash2,
  Play,
  Pause,
  Wand2,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Assistant = {
  id: number;
  name: string;
  type: "inbound" | "outbound";
  status: "draft" | "active" | "paused";
  systemPrompt: string | null;
  callScript: string | null;
  createdAt: Date;
};

// ─── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Assistant["status"] }) {
  const map = {
    draft: "bg-zinc-700 text-zinc-200",
    active: "bg-green-900/60 text-green-300 border border-green-700",
    paused: "bg-yellow-900/60 text-yellow-300 border border-yellow-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>
      {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Objection Handler Panel ───────────────────────────────────────────────────
function ObjectionPanel({ businessContext }: { businessContext: string }) {
  const [objection, setObjection] = useState("");
  const [response, setResponse] = useState("");
  const [industry, setIndustry] = useState("");

  const generateMutation = trpc.voiceAssistant.generateObjectionHandler.useMutation({
    onSuccess: (data) => setResponse(data.response),
    onError: () => toast.error("Failed to generate response"),
  });

  const COMMON_OBJECTIONS = [
    "I'm not interested right now",
    "I don't have the budget for this",
    "I need to think about it",
    "I already have someone doing this",
    "How much does it cost?",
    "Can you send me more information?",
    "I'm too busy right now",
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Common Objections</Label>
          <p className="text-xs text-muted-foreground mb-2">Click to use as input</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_OBJECTIONS.map((obj) => (
              <button
                key={obj}
                onClick={() => setObjection(obj)}
                className="text-xs px-2 py-1 rounded border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
              >
                {obj}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="objection-input">Objection *</Label>
            <Input
              id="objection-input"
              value={objection}
              onChange={(e) => setObjection(e.target.value)}
              placeholder="e.g. I'm not interested right now"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="industry-input">Industry (optional)</Label>
            <Input
              id="industry-input"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Pool Services, HVAC, Roofing"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          if (!objection.trim()) { toast.error("Enter an objection first"); return; }
          generateMutation.mutate({
            objection,
            productContext: businessContext || "A digital marketing and AI automation agency",
            industry: industry || undefined,
          });
        }}
        disabled={generateMutation.isPending}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {generateMutation.isPending ? <><Spinner className="w-4 h-4 mr-2" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Response</>}
      </Button>

      {response && (
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Generated Response</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{response}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-muted-foreground"
            onClick={() => { navigator.clipboard.writeText(response); toast.success("Copied!"); }}
          >
            Copy to clipboard
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Script Generator Dialog ───────────────────────────────────────────────────
function ScriptGeneratorDialog({
  onGenerated,
}: {
  onGenerated: (systemPrompt: string, callScript: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [callType, setCallType] = useState<"inbound" | "outbound">("outbound");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<"professional" | "friendly" | "urgent" | "consultative">("friendly");

  const generateMutation = trpc.voiceAssistant.generateScript.useMutation({
    onSuccess: (data) => {
      onGenerated(data.systemPrompt, data.callScript);
      toast.success("Script generated! Review and save it below.");
      setOpen(false);
    },
    onError: () => toast.error("Failed to generate script"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="w-4 h-4" />
          AI Script Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Generate Call Script with AI</DialogTitle>
          <DialogDescription>
            Describe your business and goal — the AI will write a complete script and system prompt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Business Name *</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Pool Buddies LLC" className="mt-1" />
            </div>
            <div>
              <Label>Industry *</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Pool Services" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Call Goal *</Label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Book a free pool inspection, qualify leads, follow up on quote"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Call Type</Label>
              <Select value={callType} onValueChange={(v) => setCallType(v as "inbound" | "outbound")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound (AI calls leads)</SelectItem>
                  <SelectItem value="inbound">Inbound (AI answers calls)</SelectItem>
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
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={generateMutation.isPending || !businessName || !industry || !goal}
            onClick={() => generateMutation.mutate({ businessName, industry, callType, goal, tone })}
          >
            {generateMutation.isPending ? <><Spinner className="w-4 h-4 mr-2" />Generating Script...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Script</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assistant Card ────────────────────────────────────────────────────────────
function AssistantCard({
  assistant,
  onStatusChange,
  onDelete,
  onSelect,
  isSelected,
}: {
  assistant: Assistant;
  onStatusChange: (id: number, status: Assistant["status"]) => void;
  onDelete: (id: number) => void;
  onSelect: (a: Assistant) => void;
  isSelected: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border transition-colors cursor-pointer ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
      }`}
      onClick={() => onSelect(assistant)}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg ${assistant.type === "inbound" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
            {assistant.type === "inbound" ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{assistant.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{assistant.type} calls</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={assistant.status} />
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
          {assistant.systemPrompt && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt</p>
              <p className="text-xs text-foreground bg-background p-2 rounded border border-border">{assistant.systemPrompt}</p>
            </div>
          )}
          {assistant.callScript && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Call Script (preview)</p>
              <p className="text-xs text-foreground bg-background p-2 rounded border border-border line-clamp-4">{assistant.callScript}</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            {assistant.status !== "active" && (
              <Button size="sm" variant="outline" className="text-green-400 border-green-700 hover:bg-green-900/30 gap-1 text-xs"
                onClick={() => onStatusChange(assistant.id, "active")}>
                <Play className="w-3 h-3" />Activate
              </Button>
            )}
            {assistant.status === "active" && (
              <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-700 hover:bg-yellow-900/30 gap-1 text-xs"
                onClick={() => onStatusChange(assistant.id, "paused")}>
                <Pause className="w-3 h-3" />Pause
              </Button>
            )}
            {assistant.status !== "draft" && (
              <Button size="sm" variant="outline" className="text-muted-foreground gap-1 text-xs"
                onClick={() => onStatusChange(assistant.id, "draft")}>
                Set Draft
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-red-400 border-red-900 hover:bg-red-900/30 gap-1 text-xs ml-auto"
              onClick={() => onDelete(assistant.id)}>
              <Trash2 className="w-3 h-3" />Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function VoiceAssistant() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [activeTab, setActiveTab] = useState("assistants");

  // Create form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"inbound" | "outbound">("outbound");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");
  const [newCallScript, setNewCallScript] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Log call form state
  const [logOutcome, setLogOutcome] = useState("connected");
  const [logDuration, setLogDuration] = useState("");
  const [logNotes, setLogNotes] = useState("");

  // Queries
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();

  const { data: assistants = [], isLoading: loadingAssistants } = trpc.voiceAssistant.listByClient.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const { data: callLogs = [] } = trpc.voiceAssistant.getCallLogs.useQuery(
    { voiceAssistantId: selectedAssistant?.id! },
    { enabled: !!selectedAssistant }
  );

  // Mutations
  const createMutation = trpc.voiceAssistant.create.useMutation({
    onSuccess: () => {
      utils.voiceAssistant.listByClient.invalidate({ clientId: selectedClientId! });
      toast.success("Voice assistant created!");
      setNewName(""); setNewSystemPrompt(""); setNewCallScript("");
      setShowCreateForm(false);
    },
    onError: () => toast.error("Failed to create assistant"),
  });

  const statusMutation = trpc.voiceAssistant.updateStatus.useMutation({
    onSuccess: () => {
      utils.voiceAssistant.listByClient.invalidate({ clientId: selectedClientId! });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = trpc.voiceAssistant.delete.useMutation({
    onSuccess: () => {
      utils.voiceAssistant.listByClient.invalidate({ clientId: selectedClientId! });
      if (selectedAssistant) setSelectedAssistant(null);
      toast.success("Assistant deleted");
    },
    onError: () => toast.error("Failed to delete assistant"),
  });

  const logCallMutation = trpc.voiceAssistant.addCallLog.useMutation({
    onSuccess: () => {
      utils.voiceAssistant.getCallLogs.invalidate({ voiceAssistantId: selectedAssistant?.id });
      toast.success("Call logged");
      setLogNotes(""); setLogDuration("");
    },
    onError: () => toast.error("Failed to log call"),
  });

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Enter assistant name"); return; }
    if (!selectedClientId) { toast.error("Select a client first"); return; }
    createMutation.mutate({ clientId: selectedClientId, name: newName, type: newType, systemPrompt: newSystemPrompt, callScript: newCallScript });
  };

  const selectedClient = clients.find((c: any) => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">AI Voice Assistant</h1>
              <p className="text-muted-foreground text-sm">Configure inbound and outbound AI voice agents for your clients</p>
            </div>
          </div>
        </div>

        {/* Client Selector */}
        <Card className="border-border bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">Select Client</Label>
                <Select
                  value={selectedClientId?.toString() ?? ""}
                  onValueChange={(v) => { setSelectedClientId(Number(v)); setSelectedAssistant(null); }}
                >
                  <SelectTrigger className="w-72">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedClient && (
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{selectedClient.name}</span>
                  {selectedClient.industry && <span className="ml-2 text-xs">· {selectedClient.industry}</span>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedClientId ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PhoneCall className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a client above to manage their voice assistants</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="assistants" className="gap-2">
                <Mic className="w-4 h-4" />Assistants
                {assistants.length > 0 && (
                  <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{assistants.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="objections" className="gap-2">
                <MessageSquare className="w-4 h-4" />Objection Handler
              </TabsTrigger>
              <TabsTrigger value="calllog" className="gap-2" disabled={!selectedAssistant}>
                <PhoneCall className="w-4 h-4" />Call Log
                {selectedAssistant && <span className="ml-1 text-xs text-muted-foreground">({selectedAssistant.name})</span>}
              </TabsTrigger>
            </TabsList>

            {/* ── Assistants Tab ── */}
            <TabsContent value="assistants" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Left: Assistants list */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">
                      Voice Agents
                      {assistants.length > 0 && <span className="ml-2 text-muted-foreground font-normal">({assistants.length})</span>}
                    </h3>
                    <Button size="sm" className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                      onClick={() => setShowCreateForm(!showCreateForm)}>
                      <Plus className="w-3 h-3" />New Agent
                    </Button>
                  </div>

                  {loadingAssistants ? (
                    <div className="flex justify-center py-8"><Spinner className="w-6 h-6" /></div>
                  ) : assistants.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-lg">
                      <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No voice agents yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "New Agent" to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(assistants as Assistant[]).map((a) => (
                        <AssistantCard
                          key={a.id}
                          assistant={a}
                          isSelected={selectedAssistant?.id === a.id}
                          onSelect={setSelectedAssistant}
                          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                          onDelete={(id) => deleteMutation.mutate({ id })}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Create form or selected assistant detail */}
                <div className="lg:col-span-3">
                  {showCreateForm ? (
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Create New Voice Agent</CardTitle>
                          <ScriptGeneratorDialog
                            onGenerated={(sp, cs) => { setNewSystemPrompt(sp); setNewCallScript(cs); }}
                          />
                        </div>
                        <CardDescription>Configure the agent's behavior and call script</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Agent Name *</Label>
                            <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                              placeholder="e.g. Lead Qualifier" className="mt-1" />
                          </div>
                          <div>
                            <Label>Call Type</Label>
                            <Select value={newType} onValueChange={(v) => setNewType(v as "inbound" | "outbound")}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="outbound">
                                  <div className="flex items-center gap-2"><PhoneOutgoing className="w-4 h-4" />Outbound (AI calls leads)</div>
                                </SelectItem>
                                <SelectItem value="inbound">
                                  <div className="flex items-center gap-2"><PhoneIncoming className="w-4 h-4" />Inbound (AI answers calls)</div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>System Prompt</Label>
                          <p className="text-xs text-muted-foreground mb-1">Defines the AI's personality and behavior</p>
                          <Textarea value={newSystemPrompt} onChange={(e) => setNewSystemPrompt(e.target.value)}
                            placeholder="e.g. You are a friendly appointment setter for Pool Buddies LLC. Your goal is to book free pool inspections. Be warm, professional, and concise."
                            className="mt-1 h-24 text-sm" />
                        </div>

                        <div>
                          <Label>Call Script</Label>
                          <p className="text-xs text-muted-foreground mb-1">The opening script and conversation flow</p>
                          <Textarea value={newCallScript} onChange={(e) => setNewCallScript(e.target.value)}
                            placeholder="Opening: 'Hi, this is Alex calling from Pool Buddies LLC. I'm reaching out because...' &#10;&#10;Qualifying questions:&#10;1. Do you currently have a pool service provider?&#10;2. When was your last pool inspection?&#10;..."
                            className="mt-1 h-40 text-sm" />
                        </div>

                        <div className="flex gap-3">
                          <Button onClick={handleCreate} disabled={createMutation.isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {createMutation.isPending ? <><Spinner className="w-4 h-4 mr-2" />Creating...</> : <><Mic className="w-4 h-4 mr-2" />Create Agent</>}
                          </Button>
                          <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : selectedAssistant ? (
                    <Card className="border-primary/30 bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedAssistant.type === "inbound" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                              {selectedAssistant.type === "inbound" ? <PhoneIncoming className="w-5 h-5" /> : <PhoneOutgoing className="w-5 h-5" />}
                            </div>
                            <div>
                              <CardTitle className="text-base">{selectedAssistant.name}</CardTitle>
                              <CardDescription className="capitalize">{selectedAssistant.type} calls</CardDescription>
                            </div>
                          </div>
                          <StatusBadge status={selectedAssistant.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedAssistant.systemPrompt && (
                          <div>
                            <Label className="text-xs text-muted-foreground">System Prompt</Label>
                            <div className="mt-1 p-3 bg-background rounded-lg border border-border text-sm text-foreground">
                              {selectedAssistant.systemPrompt}
                            </div>
                          </div>
                        )}
                        {selectedAssistant.callScript && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Call Script</Label>
                            <div className="mt-1 p-3 bg-background rounded-lg border border-border text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {selectedAssistant.callScript}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="gap-1 text-xs"
                            onClick={() => { setActiveTab("calllog"); }}>
                            <PhoneCall className="w-3 h-3" />View Call Log
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs"
                            onClick={() => { setShowCreateForm(true); setSelectedAssistant(null); }}>
                            <Plus className="w-3 h-3" />New Agent
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-48 border border-dashed border-border rounded-lg text-center p-8">
                      <FileText className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground text-sm">Select an agent from the list to view details</p>
                      <p className="text-muted-foreground text-xs mt-1">or click "New Agent" to create one</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── Objection Handler Tab ── */}
            <TabsContent value="objections" className="mt-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    AI Objection Handler
                  </CardTitle>
                  <CardDescription>
                    Generate professional, empathetic responses to common sales objections. Use these to train your agents or prepare your team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ObjectionPanel
                    businessContext={selectedClient ? `${selectedClient.name}${selectedClient.industry ? `, ${selectedClient.industry}` : ""}` : ""}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Call Log Tab ── */}
            <TabsContent value="calllog" className="mt-4">
              {!selectedAssistant ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PhoneCall className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Select a voice agent first to view its call log</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Log a call */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Log a Call</CardTitle>
                      <CardDescription>Record a call outcome for <strong>{selectedAssistant.name}</strong></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Outcome</Label>
                        <Select value={logOutcome} onValueChange={setLogOutcome}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="connected">Connected</SelectItem>
                            <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                            <SelectItem value="voicemail">Voicemail</SelectItem>
                            <SelectItem value="not_interested">Not Interested</SelectItem>
                            <SelectItem value="callback_requested">Callback Requested</SelectItem>
                            <SelectItem value="no_answer">No Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duration (seconds)</Label>
                        <Input type="number" value={logDuration} onChange={(e) => setLogDuration(e.target.value)}
                          placeholder="e.g. 120" className="mt-1" />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)}
                          placeholder="Key points from the call..." className="mt-1 h-24 text-sm" />
                      </div>
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={logCallMutation.isPending}
                        onClick={() => {
                          logCallMutation.mutate({
                            voiceAssistantId: selectedAssistant.id,
                            outcome: logOutcome,
                            duration: logDuration ? Number(logDuration) : undefined,
                            notes: logNotes || undefined,
                          });
                        }}
                      >
                        {logCallMutation.isPending ? <><Spinner className="w-4 h-4 mr-2" />Logging...</> : <><PhoneCall className="w-4 h-4 mr-2" />Log Call</>}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Call history */}
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-foreground mb-3 text-sm">
                      Call History — {selectedAssistant.name}
                      <span className="ml-2 text-muted-foreground font-normal">({callLogs.length} calls)</span>
                    </h3>
                    {callLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg text-center">
                        <Clock className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No calls logged yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(callLogs as any[]).map((log) => (
                          <div key={log.id} className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-full ${
                              log.outcome === "appointment_booked" ? "bg-green-900/40 text-green-400" :
                              log.outcome === "not_interested" ? "bg-red-900/40 text-red-400" :
                              "bg-zinc-800 text-zinc-400"
                            }`}>
                              {log.outcome === "appointment_booked" ? <CheckCircle className="w-3.5 h-3.5" /> :
                               log.outcome === "not_interested" ? <AlertCircle className="w-3.5 h-3.5" /> :
                               <PhoneCall className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-foreground capitalize">{log.outcome?.replace(/_/g, " ") ?? "Unknown"}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {new Date(log.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {log.duration && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {Math.floor(log.duration / 60)}m {log.duration % 60}s
                                </p>
                              )}
                              {log.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
