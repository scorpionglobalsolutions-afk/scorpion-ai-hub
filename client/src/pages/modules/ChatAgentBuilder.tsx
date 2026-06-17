import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MessageCircle, Plus, Trash2, Wand2, Copy, ChevronDown, ChevronUp,
  Code2, MessageSquare, Users, CheckCircle2
} from "lucide-react";

const INDUSTRIES = ["HVAC","Roofing","Pool Services","Plumbing","Electrical","Landscaping","Cleaning","Insurance","Loans","General Services"];

function ClientSelector({ onSelect }: { onSelect: (id: number, name: string) => void }) {
  const { data: clients } = trpc.clients.list.useQuery();
  return (
    <Select onValueChange={(v) => {
      const c = clients?.find(c => c.id === parseInt(v));
      if (c) onSelect(c.id, c.name);
    }}>
      <SelectTrigger className="w-64"><SelectValue placeholder="Select client..." /></SelectTrigger>
      <SelectContent>{clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
    </Select>
  );
}

interface FAQ { question: string; answer: string; }

export default function ChatAgentBuilder() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const [form, setForm] = useState({
    name: "", businessName: "", industry: "HVAC", services: "",
    tone: "friendly" as "friendly" | "professional" | "casual" | "formal",
    leadCaptureEnabled: true, bookingEnabled: false,
    systemPrompt: "", welcomeMessage: "", faqs: [] as FAQ[],
  });

  const utils = trpc.useUtils();
  const { data: agents } = trpc.chatAgent.listByClient.useQuery({ clientId: clientId! }, { enabled: !!clientId });
  const { data: conversations } = trpc.chatAgent.getConversations.useQuery(
    { agentId: selectedAgentId! }, { enabled: !!selectedAgentId }
  );

  const createMutation = trpc.chatAgent.create.useMutation({
    onSuccess: (agent) => {
      if (agent && (form.systemPrompt || form.welcomeMessage || form.faqs.length > 0)) {
        updateMutation.mutate({
          id: agent.id,
          systemPrompt: form.systemPrompt || undefined,
          welcomeMessage: form.welcomeMessage || undefined,
          faqs: form.faqs.length > 0 ? form.faqs : undefined,
          status: "active",
        });
      }
      utils.chatAgent.listByClient.invalidate();
      setShowCreate(false);
      toast.success("Chat agent created");
    },
    onError: () => toast.error("Failed to create agent"),
  });
  const updateMutation = trpc.chatAgent.update.useMutation({
    onSuccess: () => utils.chatAgent.listByClient.invalidate(),
  });
  const deleteMutation = trpc.chatAgent.delete.useMutation({
    onSuccess: () => { utils.chatAgent.listByClient.invalidate(); toast.success("Deleted"); },
  });
  const generateMutation = trpc.chatAgent.generateScript.useMutation();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        businessName: form.businessName || clientName,
        industry: form.industry,
        tone: form.tone,
        services: form.services || undefined,
        leadCaptureEnabled: form.leadCaptureEnabled,
        bookingEnabled: form.bookingEnabled,
      });
      setForm(f => ({
        ...f,
        systemPrompt: result.systemPrompt,
        welcomeMessage: result.welcomeMessage,
        faqs: result.faqs,
      }));
      toast.success("Chat agent script generated");
    } finally {
      setGenerating(false);
    }
  };

  const selectedAgent = agents?.find(a => a.id === selectedAgentId);
  const agentFaqs: FAQ[] = selectedAgent?.faqs ? (selectedAgent.faqs as FAQ[]) : [];

  const embedCode = selectedAgent
    ? `<!-- OmniScorp Chat Agent: ${selectedAgent.name} -->
<script>
  window.OmniChatConfig = {
    agentId: "${selectedAgent.id}",
    businessName: "${selectedAgent.businessName}",
    welcomeMessage: "${selectedAgent.welcomeMessage?.replace(/"/g, '\\"') ?? "Hi! How can I help you today?"}",
    primaryColor: "#f59e0b",
    position: "bottom-right"
  };
</script>
<script src="https://cdn.omniscorp.ai/chat-widget.js" async></script>`
    : "";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <MessageCircle className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Website Chat Agent Builder</h1>
            <p className="text-muted-foreground text-sm">Build 24/7 AI chat agents that capture leads while you sleep</p>
          </div>
        </div>
        <ClientSelector onSelect={(id, name) => { setClientId(id); setClientName(name); setSelectedAgentId(null); }} />
      </div>

      {!clientId ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a client to manage their chat agents</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="agents">
          <TabsList className="bg-muted">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="conversations" disabled={!selectedAgentId}>Conversations</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{agents?.length ?? 0} agent(s) for {clientName}</p>
              <Button onClick={() => {
                setForm({ name: "", businessName: clientName, industry: "HVAC", services: "",
                  tone: "friendly", leadCaptureEnabled: true, bookingEnabled: false,
                  systemPrompt: "", welcomeMessage: "", faqs: [] });
                setShowCreate(true);
              }} size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Agent
              </Button>
            </div>

            {agents?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No chat agents yet. Build one to capture leads 24/7.</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {agents?.map(agent => {
                const faqs: FAQ[] = agent.faqs ? (agent.faqs as FAQ[]) : [];
                return (
                  <Card key={agent.id}
                    className={`bg-card border-border cursor-pointer transition-all ${selectedAgentId === agent.id ? "ring-2 ring-cyan-500" : ""}`}
                    onClick={() => setSelectedAgentId(agent.id)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <CardDescription>
                            {agent.businessName} · {agent.industry} · {agent.tone}
                            {agent.leadCaptureEnabled ? " · Lead Capture" : ""}
                            {agent.bookingEnabled ? " · Booking" : ""}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.status === "active" ? "default" : agent.status === "paused" ? "secondary" : "outline"}>
                            {agent.status ?? "draft"}
                          </Badge>
                          <div onClick={e => e.stopPropagation()}>
                          <Select value={agent.status ?? "draft"}
                            onValueChange={(v) => updateMutation.mutate({ id: agent.id, status: v as "draft" | "active" | "paused" })}>
                            <SelectTrigger className="h-7 w-24 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={e => { e.stopPropagation(); setExpandedId(expandedId === agent.id ? null : agent.id); }}>
                            {expandedId === agent.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                            onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: agent.id }); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedId === agent.id && (
                      <CardContent className="pt-0 space-y-3">
                        <Separator />
                        {agent.welcomeMessage && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Welcome Message</p>
                            <p className="text-sm bg-muted p-2 rounded">{agent.welcomeMessage}</p>
                          </div>
                        )}
                        {agent.systemPrompt && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt</p>
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded max-h-24 overflow-y-auto">{agent.systemPrompt}</p>
                          </div>
                        )}
                        {faqs.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">{faqs.length} FAQs configured</p>
                            <div className="space-y-1">
                              {faqs.slice(0, 3).map((faq, i) => (
                                <div key={i} className="text-xs bg-muted p-2 rounded">
                                  <span className="font-medium">Q: </span>{faq.question}
                                </div>
                              ))}
                              {faqs.length > 3 && (
                                <p className="text-xs text-muted-foreground">+{faqs.length - 3} more FAQs</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="text-xs"
                            onClick={e => { e.stopPropagation(); setSelectedAgentId(agent.id); setShowEmbedCode(true); }}>
                            <Code2 className="h-3 w-3 mr-1" /> Get Embed Code
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{conversations?.length ?? 0} conversations for {selectedAgent?.name}</p>
            {conversations?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No conversations logged yet. Conversations are recorded when the widget is live.</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {conversations?.map(conv => (
                <Card key={conv.id} className="bg-card border-border">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{conv.visitorName || "Anonymous visitor"}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.visitorEmail} · {new Date(conv.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {conv.leadCaptured && (
                          <Badge className="text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Lead Captured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{conv.outcome ?? "ongoing"}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Agent Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Website Chat Agent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Agent Name</Label>
                <Input placeholder="e.g. Pool Buddies Chat Bot" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Business Name</Label>
                <Input placeholder="e.g. Pool Buddies LLC" value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={v => setForm(f => ({ ...f, tone: v as typeof form.tone }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Services Offered</Label>
                <Input placeholder="e.g. Pool cleaning, repair" value={form.services}
                  onChange={e => setForm(f => ({ ...f, services: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.leadCaptureEnabled}
                  onCheckedChange={v => setForm(f => ({ ...f, leadCaptureEnabled: v }))} />
                <Label>Capture Leads (name, phone, email)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.bookingEnabled}
                  onCheckedChange={v => setForm(f => ({ ...f, bookingEnabled: v }))} />
                <Label>Offer Booking</Label>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleGenerate}
              disabled={generating || !form.businessName || !form.industry}>
              <Wand2 className="h-4 w-4 mr-1" />
              {generating ? "Generating..." : "AI Generate Script & FAQs"}
            </Button>

            {form.welcomeMessage && (
              <div className="space-y-1">
                <Label>Welcome Message</Label>
                <Input value={form.welcomeMessage}
                  onChange={e => setForm(f => ({ ...f, welcomeMessage: e.target.value }))} />
              </div>
            )}
            {form.systemPrompt && (
              <div className="space-y-1">
                <Label>System Prompt</Label>
                <Textarea rows={5} value={form.systemPrompt}
                  onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))} />
              </div>
            )}
            {form.faqs.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">{form.faqs.length} FAQs Generated</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {form.faqs.map((faq, i) => (
                    <div key={i} className="p-2 bg-muted rounded text-sm">
                      <p className="font-medium">Q: {faq.question}</p>
                      <p className="text-muted-foreground">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({
                clientId: clientId!,
                name: form.name,
                businessName: form.businessName,
                industry: form.industry,
                tone: form.tone,
                leadCaptureEnabled: form.leadCaptureEnabled,
                bookingEnabled: form.bookingEnabled,
              })}
              disabled={createMutation.isPending || !form.name || !form.businessName}>
              {createMutation.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={showEmbedCode} onOpenChange={setShowEmbedCode}>
        <DialogContent className="max-w-xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" /> Embed Code
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copy this code and paste it before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag on your client's website.
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto text-foreground whitespace-pre-wrap">
                {embedCode}
              </pre>
              <Button size="sm" variant="outline" className="absolute top-2 right-2"
                onClick={() => { navigator.clipboard.writeText(embedCode); toast.success("Copied to clipboard"); }}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: The chat widget script URL is a placeholder. Connect your telephony/chat provider to activate the live widget.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEmbedCode(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
