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
import { Star, Plus, Trash2, Wand2, Send, CheckCircle2, Users } from "lucide-react";

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

export default function ReviewRequestAgent() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: "", businessName: "", industry: "HVAC",
    googleReviewLink: "", channel: "both" as "sms" | "email" | "both",
    sendDelayHours: 24, smsTemplate: "", emailSubjectTemplate: "", emailBodyTemplate: "",
  });

  const [customerForm, setCustomerForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "", serviceType: "",
  });

  const utils = trpc.useUtils();
  const { data: campaigns } = trpc.reviewRequest.listByClient.useQuery(
    { clientId: clientId! }, { enabled: !!clientId }
  );
  const { data: logs } = trpc.reviewRequest.getLogs.useQuery(
    { campaignId: selectedCampaignId! }, { enabled: !!selectedCampaignId }
  );

  const createMutation = trpc.reviewRequest.create.useMutation({
    onSuccess: () => { utils.reviewRequest.listByClient.invalidate(); setShowCreate(false); toast.success("Campaign created"); },
    onError: () => toast.error("Failed to create campaign"),
  });
  const deleteMutation = trpc.reviewRequest.delete.useMutation({
    onSuccess: () => { utils.reviewRequest.listByClient.invalidate(); toast.success("Deleted"); },
  });
  const updateMutation = trpc.reviewRequest.update.useMutation({
    onSuccess: () => utils.reviewRequest.listByClient.invalidate(),
  });
  const generateMutation = trpc.reviewRequest.generateTemplates.useMutation();
  const addCustomerMutation = trpc.reviewRequest.logCustomer.useMutation({
    onSuccess: () => { utils.reviewRequest.getLogs.invalidate(); setShowAddCustomer(false); toast.success("Customer added"); },
  });
  const updateLogMutation = trpc.reviewRequest.updateLog.useMutation({
    onSuccess: () => utils.reviewRequest.getLogs.invalidate(),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        businessName: form.businessName || form.name,
        industry: form.industry,
        googleReviewLink: form.googleReviewLink,
        tone: "friendly",
      });
      setForm(f => ({ ...f, ...result }));
      toast.success("Templates generated");
    } finally {
      setGenerating(false);
    }
  };

  const selectedCampaign = campaigns?.find(c => c.id === selectedCampaignId);
  const reviewRate = selectedCampaign
    ? selectedCampaign.totalSent! > 0
      ? Math.round((selectedCampaign.totalReviews! / selectedCampaign.totalSent!) * 100)
      : 0
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Review Request Agent</h1>
            <p className="text-muted-foreground text-sm">Automatically request Google reviews after every job</p>
          </div>
        </div>
        <ClientSelector onSelect={(id, name) => { setClientId(id); setClientName(name); setSelectedCampaignId(null); }} />
      </div>

      {!clientId ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a client to manage their review request campaigns</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="campaigns">
          <TabsList className="bg-muted">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="customers" disabled={!selectedCampaignId}>Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{campaigns?.length ?? 0} campaign(s) for {clientName}</p>
              <Button onClick={() => setShowCreate(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Campaign
              </Button>
            </div>

            {campaigns?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Star className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No campaigns yet. Create one to start collecting reviews.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {campaigns?.map(campaign => (
                <Card key={campaign.id}
                  className={`bg-card border-border cursor-pointer transition-all ${selectedCampaignId === campaign.id ? "ring-2 ring-yellow-500" : ""}`}
                  onClick={() => setSelectedCampaignId(campaign.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                        <CardDescription>{campaign.businessName} · {campaign.industry} · {campaign.channel}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.isActive ? "default" : "secondary"}>
                          {campaign.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch checked={campaign.isActive ?? true}
                          onCheckedChange={(v) => updateMutation.mutate({ id: campaign.id, isActive: v })}
                          onClick={e => e.stopPropagation()} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: campaign.id }); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{campaign.totalSent ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Requests Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">{campaign.totalReviews ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Reviews Received</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {campaign.totalSent! > 0 ? Math.round((campaign.totalReviews! / campaign.totalSent!) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Conversion Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{logs?.length ?? 0} customers for {selectedCampaign?.name}</p>
              <Button size="sm" onClick={() => setShowAddCustomer(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Customer
              </Button>
            </div>
            {logs?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No customers added yet. Add a customer after completing a job.</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {logs?.map(log => (
                <Card key={log.id} className="bg-card border-border">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{log.customerName || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.customerPhone} · {log.serviceType} · {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === "reviewed" ? "default" : log.status === "sent" ? "outline" : "secondary"}>
                          {log.status}
                        </Badge>
                        {log.reviewLeft && (
                          <div className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400" />
                            <span>{log.reviewRating}</span>
                          </div>
                        )}
                        <div className="flex gap-1">
                          {!log.smsSent && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => updateLogMutation.mutate({ id: log.id, smsSent: true, status: "sent" })}>
                              <Send className="h-3 w-3 mr-1" /> SMS Sent
                            </Button>
                          )}
                          {!log.reviewLeft && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => updateLogMutation.mutate({ id: log.id, reviewLeft: true, reviewRating: 5, status: "reviewed" })}>
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Got Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader><DialogTitle>New Review Request Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Campaign Name</Label>
                <Input placeholder="e.g. Post-Service Review Ask" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Business Name</Label>
                <Input placeholder="e.g. ABC Roofing" value={form.businessName}
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
              <div className="space-y-1">
                <Label>Send Delay (hours)</Label>
                <Input type="number" min={1} max={168} value={form.sendDelayHours}
                  onChange={e => setForm(f => ({ ...f, sendDelayHours: parseInt(e.target.value) || 24 }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Google Review Link</Label>
              <Input placeholder="https://g.page/r/..." value={form.googleReviewLink}
                onChange={e => setForm(f => ({ ...f, googleReviewLink: e.target.value }))} />
            </div>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating || !form.businessName}>
              <Wand2 className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "AI Generate Templates"}
            </Button>
            <div className="space-y-1">
              <Label>SMS Template <span className="text-xs text-muted-foreground">(use {"{customerName}"})</span></Label>
              <Textarea rows={2} value={form.smsTemplate} onChange={e => setForm(f => ({ ...f, smsTemplate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email Subject</Label>
              <Input value={form.emailSubjectTemplate} onChange={e => setForm(f => ({ ...f, emailSubjectTemplate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email Body</Label>
              <Textarea rows={4} value={form.emailBodyTemplate} onChange={e => setForm(f => ({ ...f, emailBodyTemplate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ clientId: clientId!, ...form })}
              disabled={createMutation.isPending || !form.name || !form.businessName}>
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>Add Customer for Review Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Customer Name</Label>
              <Input value={customerForm.customerName} onChange={e => setCustomerForm(f => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={customerForm.customerPhone} onChange={e => setCustomerForm(f => ({ ...f, customerPhone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={customerForm.customerEmail} onChange={e => setCustomerForm(f => ({ ...f, customerEmail: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Service Type</Label>
              <Input placeholder="e.g. AC Tune-Up, Roof Inspection" value={customerForm.serviceType}
                onChange={e => setCustomerForm(f => ({ ...f, serviceType: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
            <Button onClick={() => addCustomerMutation.mutate({ campaignId: selectedCampaignId!, clientId: clientId!, ...customerForm })}
              disabled={addCustomerMutation.isPending}>
              {addCustomerMutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
