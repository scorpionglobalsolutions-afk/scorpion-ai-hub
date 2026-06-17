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
import { toast } from "sonner";
import { RefreshCw, Plus, Trash2, Wand2, Users, CheckCircle2, TrendingUp } from "lucide-react";

const INDUSTRIES = ["HVAC","Roofing","Pool Services","Plumbing","Electrical","Landscaping","Cleaning","Insurance","Loans","General Services"];
const TRIGGER_TYPES = [
  { value: "days_since_service", label: "Days Since Last Service" },
  { value: "days_before_renewal", label: "Days Before Renewal" },
  { value: "anniversary", label: "Service Anniversary" },
  { value: "seasonal", label: "Seasonal Reminder" },
  { value: "low_engagement", label: "Low Engagement" },
];

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

export default function ClientRetentionAgent() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: "", industry: "HVAC",
    triggerType: "days_since_service" as "days_since_service" | "days_before_renewal" | "anniversary" | "seasonal" | "low_engagement",
    triggerDays: 90, channel: "both" as "sms" | "email" | "both",
    offerIncluded: false, offerDetails: "",
    messageTemplate: "",
  });

  const [eventForm, setEventForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "", generatedMessage: "",
  });

  const utils = trpc.useUtils();
  const { data: rules } = trpc.retention.listByClient.useQuery({ clientId: clientId! }, { enabled: !!clientId });
  const { data: events } = trpc.retention.getEvents.useQuery({ ruleId: selectedRuleId! }, { enabled: !!selectedRuleId });

  const createMutation = trpc.retention.create.useMutation({
    onSuccess: () => { utils.retention.listByClient.invalidate(); setShowCreate(false); toast.success("Rule created"); },
    onError: () => toast.error("Failed to create rule"),
  });
  const deleteMutation = trpc.retention.delete.useMutation({
    onSuccess: () => { utils.retention.listByClient.invalidate(); toast.success("Deleted"); },
  });
  const updateMutation = trpc.retention.update.useMutation({
    onSuccess: () => utils.retention.listByClient.invalidate(),
  });
  const generateMutation = trpc.retention.generateMessage.useMutation();
  const logEventMutation = trpc.retention.logEvent.useMutation({
    onSuccess: () => { utils.retention.getEvents.invalidate(); setShowAddEvent(false); toast.success("Event logged"); },
  });
  const updateEventMutation = trpc.retention.updateEvent.useMutation({
    onSuccess: () => utils.retention.getEvents.invalidate(),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        businessName: clientName,
        industry: form.industry,
        triggerType: form.triggerType,
        triggerDays: form.triggerDays,
        offerDetails: form.offerDetails || undefined,
        channel: form.channel,
      });
      setForm(f => ({ ...f, messageTemplate: result.smsTemplate }));
      toast.success("Message template generated");
    } finally {
      setGenerating(false);
    }
  };

  const selectedRule = rules?.find(r => r.id === selectedRuleId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <RefreshCw className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Retention Agent</h1>
            <p className="text-muted-foreground text-sm">Re-engage past customers at the right moment</p>
          </div>
        </div>
        <ClientSelector onSelect={(id, name) => { setClientId(id); setClientName(name); setSelectedRuleId(null); }} />
      </div>

      {!clientId ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a client to manage their retention rules</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="rules">
          <TabsList className="bg-muted">
            <TabsTrigger value="rules">Retention Rules</TabsTrigger>
            <TabsTrigger value="events" disabled={!selectedRuleId}>Outreach Log</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{rules?.length ?? 0} rule(s) for {clientName}</p>
              <Button onClick={() => setShowCreate(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Rule
              </Button>
            </div>

            {rules?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No retention rules yet. Create one to start re-engaging past customers.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {rules?.map(rule => (
                <Card key={rule.id}
                  className={`bg-card border-border cursor-pointer transition-all ${selectedRuleId === rule.id ? "ring-2 ring-green-500" : ""}`}
                  onClick={() => setSelectedRuleId(rule.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <CardDescription>
                          {TRIGGER_TYPES.find(t => t.value === rule.triggerType)?.label}
                          {rule.triggerDays ? ` · ${rule.triggerDays} days` : ""}
                          {" · "}{rule.channel}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch checked={rule.isActive ?? true}
                          onCheckedChange={(v) => updateMutation.mutate({ id: rule.id, isActive: v })}
                          onClick={e => e.stopPropagation()} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: rule.id }); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {rule.messageTemplate && (
                    <CardContent className="pt-0">
                      <div className="p-3 bg-muted rounded text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Template: </span>{rule.messageTemplate}
                      </div>
                      {rule.offerIncluded && rule.offerDetails && (
                        <Badge variant="outline" className="mt-2 text-green-400 border-green-500/30">
                          Offer: {rule.offerDetails}
                        </Badge>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{events?.length ?? 0} outreach events for {selectedRule?.name}</p>
              <Button size="sm" onClick={() => setShowAddEvent(true)}>
                <Plus className="h-4 w-4 mr-1" /> Log Outreach
              </Button>
            </div>
            {events?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No outreach events logged yet.</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {events?.map(event => (
                <Card key={event.id} className="bg-card border-border">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.customerName || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.customerPhone} · {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {!event.sent && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => updateEventMutation.mutate({ id: event.id, sent: true })}>
                              Sent
                            </Button>
                          )}
                          {event.sent && !event.responded && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => updateEventMutation.mutate({ id: event.id, responded: true })}>
                              Responded
                            </Button>
                          )}
                          {event.responded && !event.converted && (
                            <Button size="sm" variant="outline" className="h-7 text-xs text-green-400"
                              onClick={() => updateEventMutation.mutate({ id: event.id, converted: true })}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Converted
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {event.sent && <Badge variant="outline" className="text-xs">Sent</Badge>}
                          {event.responded && <Badge variant="outline" className="text-xs text-blue-400">Responded</Badge>}
                          {event.converted && <Badge className="text-xs">Converted</Badge>}
                        </div>
                      </div>
                    </div>
                    {event.generatedMessage && (
                      <p className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">{event.generatedMessage}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl bg-card">
          <DialogHeader><DialogTitle>New Retention Rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Rule Name</Label>
                <Input placeholder="e.g. 90-Day Re-engagement" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Trigger Type</Label>
                <Select value={form.triggerType} onValueChange={v => setForm(f => ({ ...f, triggerType: v as typeof form.triggerType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Days</Label>
                <Input type="number" min={1} max={365} value={form.triggerDays}
                  onChange={e => setForm(f => ({ ...f, triggerDays: parseInt(e.target.value) || 90 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v as "sms" | "email" | "both" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.offerIncluded} onCheckedChange={v => setForm(f => ({ ...f, offerIncluded: v }))} />
                <Label>Include Offer</Label>
              </div>
            </div>
            {form.offerIncluded && (
              <div className="space-y-1">
                <Label>Offer Details</Label>
                <Input placeholder="e.g. 15% off next service" value={form.offerDetails}
                  onChange={e => setForm(f => ({ ...f, offerDetails: e.target.value }))} />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating || !form.name}>
              <Wand2 className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "AI Generate Message"}
            </Button>
            <div className="space-y-1">
              <Label>Message Template <span className="text-xs text-muted-foreground">(use {"{customerName}"})</span></Label>
              <Textarea rows={3} value={form.messageTemplate}
                onChange={e => setForm(f => ({ ...f, messageTemplate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ clientId: clientId!, ...form })}
              disabled={createMutation.isPending || !form.name}>
              {createMutation.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Log Retention Outreach</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Customer Name</Label>
              <Input value={eventForm.customerName} onChange={e => setEventForm(f => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={eventForm.customerPhone} onChange={e => setEventForm(f => ({ ...f, customerPhone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={eventForm.customerEmail} onChange={e => setEventForm(f => ({ ...f, customerEmail: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Message Sent</Label>
              <Textarea rows={3} placeholder="Paste the message you sent..." value={eventForm.generatedMessage}
                onChange={e => setEventForm(f => ({ ...f, generatedMessage: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
            <Button onClick={() => logEventMutation.mutate({ ruleId: selectedRuleId!, clientId: clientId!, ...eventForm })}
              disabled={logEventMutation.isPending}>
              {logEventMutation.isPending ? "Logging..." : "Log Outreach"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
