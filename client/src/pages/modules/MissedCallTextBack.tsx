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
import { PhoneCall, Plus, Trash2, Wand2, MessageSquare, Clock, CheckCircle2, Phone } from "lucide-react";

const INDUSTRIES = ["HVAC","Roofing","Pool Services","Plumbing","Electrical","Landscaping","Cleaning","Insurance","Loans","General Services"];

function ClientSelector({ onSelect }: { onSelect: (id: number, name: string) => void }) {
  const { data: clients } = trpc.clients.list.useQuery();
  return (
    <Select onValueChange={(v) => {
      const c = clients?.find(c => c.id === parseInt(v));
      if (c) onSelect(c.id, c.name);
    }}>
      <SelectTrigger className="w-64"><SelectValue placeholder="Select client..." /></SelectTrigger>
      <SelectContent>
        {clients?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export default function MissedCallTextBack() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showLogEvent, setShowLogEvent] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: "", businessName: "", industry: "HVAC",
    responseDelaySeconds: 30, followUpDelayMinutes: 60,
    smsTemplate: "", followUpTemplate: "",
  });

  const [eventForm, setEventForm] = useState({
    callerPhone: "", callerName: "", smsSent: false, smsContent: "",
  });

  const utils = trpc.useUtils();
  const { data: configs } = trpc.missedCall.listByClient.useQuery(
    { clientId: clientId! }, { enabled: !!clientId }
  );
  const { data: events } = trpc.missedCall.getEvents.useQuery(
    { configId: selectedConfigId! }, { enabled: !!selectedConfigId }
  );

  const createMutation = trpc.missedCall.create.useMutation({
    onSuccess: () => { utils.missedCall.listByClient.invalidate(); setShowCreate(false); toast.success("Config created"); },
    onError: () => toast.error("Failed to create config"),
  });
  const deleteMutation = trpc.missedCall.delete.useMutation({
    onSuccess: () => { utils.missedCall.listByClient.invalidate(); toast.success("Deleted"); },
  });
  const updateMutation = trpc.missedCall.update.useMutation({
    onSuccess: () => { utils.missedCall.listByClient.invalidate(); toast.success("Updated"); },
  });
  const generateMutation = trpc.missedCall.generateTemplate.useMutation();
  const logEventMutation = trpc.missedCall.logEvent.useMutation({
    onSuccess: () => { utils.missedCall.getEvents.invalidate(); setShowLogEvent(false); toast.success("Event logged"); },
  });
  const updateEventMutation = trpc.missedCall.updateEvent.useMutation({
    onSuccess: () => utils.missedCall.getEvents.invalidate(),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        businessName: form.businessName || form.name,
        industry: form.industry,
        tone: "friendly",
      });
      setForm(f => ({ ...f, smsTemplate: result.smsTemplate, followUpTemplate: result.followUpTemplate }));
      toast.success("Templates generated");
    } finally {
      setGenerating(false);
    }
  };

  const selectedConfig = configs?.find(c => c.id === selectedConfigId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <PhoneCall className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Missed Call Text-Back</h1>
            <p className="text-muted-foreground text-sm">Auto-respond to missed calls within 60 seconds</p>
          </div>
        </div>
        <ClientSelector onSelect={(id, name) => { setClientId(id); setClientName(name); setSelectedConfigId(null); }} />
      </div>

      {!clientId ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <PhoneCall className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a client to manage their missed call text-back configs</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="configs">
          <TabsList className="bg-muted">
            <TabsTrigger value="configs">Configurations</TabsTrigger>
            <TabsTrigger value="events" disabled={!selectedConfigId}>Call Log</TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{configs?.length ?? 0} config(s) for {clientName}</p>
              <Button onClick={() => setShowCreate(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Config
              </Button>
            </div>

            {configs?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No configs yet. Create one to start capturing missed calls.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {configs?.map(config => (
                <Card key={config.id} className={`bg-card border-border cursor-pointer transition-all ${selectedConfigId === config.id ? "ring-2 ring-orange-500" : ""}`}
                  onClick={() => setSelectedConfigId(config.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{config.name}</CardTitle>
                        <CardDescription>{config.businessName} · {config.industry}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={config.isActive ?? true}
                          onCheckedChange={(v) => updateMutation.mutate({ id: config.id, isActive: v })}
                          onClick={e => e.stopPropagation()}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: config.id }); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Response: {config.responseDelaySeconds}s</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Missed: {config.totalMissedCalls ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Responded: {config.totalResponded ?? 0}</span>
                      </div>
                    </div>
                    {config.smsTemplate && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">SMS: </span>{config.smsTemplate}
                      </div>
                    )}
                    {selectedConfigId === config.id && (
                      <Button size="sm" variant="outline" className="mt-3"
                        onClick={e => { e.stopPropagation(); setShowLogEvent(true); }}>
                        <Plus className="h-3 w-3 mr-1" /> Log Missed Call
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{events?.length ?? 0} events for {selectedConfig?.name}</p>
              <Button size="sm" onClick={() => setShowLogEvent(true)}>
                <Plus className="h-4 w-4 mr-1" /> Log Missed Call
              </Button>
            </div>
            {events?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No missed call events logged yet.</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {events?.map(event => (
                <Card key={event.id} className="bg-card border-border">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{event.callerName || event.callerPhone || "Unknown caller"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          event.outcome === "booked" ? "default" :
                          event.outcome === "not_interested" ? "destructive" :
                          event.outcome === "no_response" ? "secondary" : "outline"
                        }>{event.outcome ?? "pending"}</Badge>
                        <Select value={event.outcome ?? "pending"}
                          onValueChange={(v) => updateEventMutation.mutate({
                            id: event.id,
                            outcome: v as "booked" | "not_interested" | "no_response" | "wrong_number" | "pending"
                          })}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending","booked","not_interested","no_response","wrong_number"].map(o => (
                              <SelectItem key={o} value={o}>{o.replace(/_/g, " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {event.smsContent && (
                      <p className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">{event.smsContent}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-xl bg-card">
          <DialogHeader>
            <DialogTitle>New Missed Call Config</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Config Name</Label>
                <Input placeholder="e.g. Main Line" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Business Name</Label>
                <Input placeholder="e.g. ABC HVAC" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
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
                <Label>Response Delay (sec)</Label>
                <Input type="number" min={0} max={300} value={form.responseDelaySeconds}
                  onChange={e => setForm(f => ({ ...f, responseDelaySeconds: parseInt(e.target.value) || 30 }))} />
              </div>
              <div className="space-y-1">
                <Label>Follow-up Delay (min)</Label>
                <Input type="number" min={0} max={1440} value={form.followUpDelayMinutes}
                  onChange={e => setForm(f => ({ ...f, followUpDelayMinutes: parseInt(e.target.value) || 60 }))} />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating || !form.businessName}>
              <Wand2 className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "AI Generate Templates"}
            </Button>
            <div className="space-y-1">
              <Label>SMS Template <span className="text-xs text-muted-foreground">(use {"{callerName}"})</span></Label>
              <Textarea rows={3} placeholder="Hey {callerName}, sorry we missed your call..." value={form.smsTemplate}
                onChange={e => setForm(f => ({ ...f, smsTemplate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Follow-up Template</Label>
              <Textarea rows={3} placeholder="Just following up..." value={form.followUpTemplate}
                onChange={e => setForm(f => ({ ...f, followUpTemplate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ clientId: clientId!, ...form })}
              disabled={createMutation.isPending || !form.name || !form.businessName}>
              {createMutation.isPending ? "Creating..." : "Create Config"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Event Dialog */}
      <Dialog open={showLogEvent} onOpenChange={setShowLogEvent}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Log Missed Call</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Caller Phone</Label>
              <Input placeholder="+1 (555) 000-0000" value={eventForm.callerPhone}
                onChange={e => setEventForm(f => ({ ...f, callerPhone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Caller Name (if known)</Label>
              <Input placeholder="John Smith" value={eventForm.callerName}
                onChange={e => setEventForm(f => ({ ...f, callerName: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={eventForm.smsSent} onCheckedChange={v => setEventForm(f => ({ ...f, smsSent: v }))} />
              <Label>SMS was sent</Label>
            </div>
            {eventForm.smsSent && (
              <div className="space-y-1">
                <Label>SMS Content Sent</Label>
                <Textarea rows={2} value={eventForm.smsContent}
                  onChange={e => setEventForm(f => ({ ...f, smsContent: e.target.value }))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogEvent(false)}>Cancel</Button>
            <Button onClick={() => logEventMutation.mutate({
              configId: selectedConfigId!, clientId: clientId!, ...eventForm,
            })} disabled={logEventMutation.isPending}>
              {logEventMutation.isPending ? "Logging..." : "Log Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
