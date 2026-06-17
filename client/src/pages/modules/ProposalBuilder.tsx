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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText, Plus, Trash2, Wand2, Eye, Copy, DollarSign,
  ChevronDown, ChevronUp, X
} from "lucide-react";

const INDUSTRIES = ["HVAC","Roofing","Pool Services","Plumbing","Electrical","Landscaping","Cleaning","Insurance","Loans","General Services"];
const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary", sent: "outline", accepted: "default", declined: "destructive", expired: "secondary",
};

interface LineItem { description: string; qty: number; unitPrice: string; total: string; }

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

function LineItemRow({ item, index, onChange, onRemove }: {
  item: LineItem; index: number;
  onChange: (i: number, field: keyof LineItem, value: string | number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-5">
        <Input placeholder="Description" value={item.description}
          onChange={e => onChange(index, "description", e.target.value)} />
      </div>
      <div className="col-span-2">
        <Input type="number" min={1} placeholder="Qty" value={item.qty}
          onChange={e => onChange(index, "qty", parseInt(e.target.value) || 1)} />
      </div>
      <div className="col-span-2">
        <Input placeholder="Unit $" value={item.unitPrice}
          onChange={e => onChange(index, "unitPrice", e.target.value)} />
      </div>
      <div className="col-span-2">
        <Input placeholder="Total" value={item.total} readOnly className="bg-muted" />
      </div>
      <div className="col-span-1 flex justify-center">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(index)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ProposalBuilder() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const emptyForm = {
    title: "", prospectName: "", prospectEmail: "", prospectPhone: "",
    industry: "HVAC", serviceType: "", scopeOfWork: "",
    lineItems: [] as LineItem[], subtotal: "", tax: "", total: "", terms: "",
    generatedContent: "",
  };
  const [form, setForm] = useState(emptyForm);

  const utils = trpc.useUtils();
  const { data: proposals } = trpc.proposals.listByClient.useQuery(
    { clientId: clientId! }, { enabled: !!clientId }
  );
  const { data: selectedProposal } = trpc.proposals.getById.useQuery(
    { id: selectedId! }, { enabled: !!selectedId }
  );

  const createMutation = trpc.proposals.create.useMutation({
    onSuccess: () => { utils.proposals.listByClient.invalidate(); setShowCreate(false); setForm(emptyForm); toast.success("Proposal created"); },
    onError: () => toast.error("Failed to create proposal"),
  });
  const updateMutation = trpc.proposals.update.useMutation({
    onSuccess: () => { utils.proposals.listByClient.invalidate(); utils.proposals.getById.invalidate(); toast.success("Updated"); },
  });
  const deleteMutation = trpc.proposals.delete.useMutation({
    onSuccess: () => { utils.proposals.listByClient.invalidate(); toast.success("Deleted"); },
  });
  const generateMutation = trpc.proposals.generate.useMutation();

  const recalcTotal = (items: LineItem[]) => {
    const sub = items.reduce((acc, li) => {
      const qty = li.qty || 1;
      const price = parseFloat(li.unitPrice.replace(/[^0-9.]/g, "")) || 0;
      return acc + qty * price;
    }, 0);
    return sub.toFixed(2);
  };

  const handleLineItemChange = (i: number, field: keyof LineItem, value: string | number) => {
    setForm(f => {
      const items = [...f.lineItems];
      items[i] = { ...items[i], [field]: value };
      // Recalc total for this row
      if (field === "qty" || field === "unitPrice") {
        const qty = field === "qty" ? (value as number) : items[i].qty;
        const price = parseFloat((field === "unitPrice" ? value as string : items[i].unitPrice).replace(/[^0-9.]/g, "")) || 0;
        items[i].total = (qty * price).toFixed(2);
      }
      const subtotal = recalcTotal(items);
      const tax = (parseFloat(subtotal) * 0.0).toFixed(2); // 0% tax default
      return { ...f, lineItems: items, subtotal, total: subtotal };
    });
  };

  const addLineItem = () => {
    setForm(f => ({ ...f, lineItems: [...f.lineItems, { description: "", qty: 1, unitPrice: "", total: "0.00" }] }));
  };

  const removeLineItem = (i: number) => {
    setForm(f => {
      const items = f.lineItems.filter((_, idx) => idx !== i);
      const subtotal = recalcTotal(items);
      return { ...f, lineItems: items, subtotal, total: subtotal };
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        prospectName: form.prospectName,
        businessName: clientName,
        industry: form.industry,
        serviceType: form.serviceType,
        scopeOfWork: form.scopeOfWork,
        lineItems: form.lineItems.length > 0 ? form.lineItems : undefined,
        total: form.total || undefined,
      });
      setForm(f => ({ ...f, generatedContent: result.generatedContent }));
      toast.success("Proposal content generated");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Proposal & Estimate Builder</h1>
            <p className="text-muted-foreground text-sm">Generate professional proposals and estimates in seconds</p>
          </div>
        </div>
        <ClientSelector onSelect={(id, name) => { setClientId(id); setClientName(name); setSelectedId(null); }} />
      </div>

      {!clientId ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a client to manage their proposals</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{proposals?.length ?? 0} proposal(s) for {clientName}</p>
            <Button onClick={() => { setForm(emptyForm); setShowCreate(true); }} size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Proposal
            </Button>
          </div>

          {proposals?.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No proposals yet. Create one to start closing deals faster.</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {proposals?.map(p => (
              <Card key={p.id} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <CardDescription>{p.prospectName} · {p.serviceType} · {new Date(p.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.total && (
                        <span className="text-lg font-bold text-green-400">${p.total}</span>
                      )}
                      <Badge variant={STATUS_COLORS[p.status ?? "draft"]}>{p.status ?? "draft"}</Badge>
                      <Select value={p.status ?? "draft"}
                        onValueChange={(v) => updateMutation.mutate({ id: p.id, status: v as "draft" | "sent" | "accepted" | "declined" | "expired" })}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["draft","sent","accepted","declined","expired"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                        {expandedId === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate({ id: p.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedId === p.id && (
                  <CardContent className="pt-0 space-y-3">
                    <Separator />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Email: </span>{p.prospectEmail || "—"}</div>
                      <div><span className="text-muted-foreground">Phone: </span>{p.prospectPhone || "—"}</div>
                      <div><span className="text-muted-foreground">Industry: </span>{p.industry}</div>
                      <div><span className="text-muted-foreground">Subtotal: </span>${p.subtotal || "0.00"}</div>
                    </div>
                    {p.scopeOfWork && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Scope of Work</p>
                        <p className="text-sm">{p.scopeOfWork}</p>
                      </div>
                    )}
                    {p.generatedContent && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-muted-foreground">Generated Proposal</p>
                          <Button variant="ghost" size="sm" className="h-6 text-xs"
                            onClick={() => { navigator.clipboard.writeText(p.generatedContent ?? ""); toast.success("Copied"); }}>
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded text-sm whitespace-pre-wrap text-muted-foreground max-h-48 overflow-y-auto">
                          {p.generatedContent}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-3xl bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Proposal / Estimate</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Proposal Title</Label>
                <Input placeholder="e.g. HVAC System Replacement Estimate" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Prospect Info */}
            <div>
              <p className="text-sm font-medium mb-2">Prospect Information</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Prospect Name</Label>
                  <Input placeholder="John Smith" value={form.prospectName}
                    onChange={e => setForm(f => ({ ...f, prospectName: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input placeholder="john@example.com" value={form.prospectEmail}
                    onChange={e => setForm(f => ({ ...f, prospectEmail: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input placeholder="+1 (555) 000-0000" value={form.prospectPhone}
                    onChange={e => setForm(f => ({ ...f, prospectPhone: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Service Type</Label>
                <Input placeholder="e.g. Full AC Replacement" value={form.serviceType}
                  onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Scope of Work</Label>
              <Textarea rows={3} placeholder="Describe what will be done, materials included, timeline, etc."
                value={form.scopeOfWork} onChange={e => setForm(f => ({ ...f, scopeOfWork: e.target.value }))} />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Line Items</p>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>
              {form.lineItems.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {form.lineItems.map((item, i) => (
                    <LineItemRow key={i} item={item} index={i}
                      onChange={handleLineItemChange} onRemove={removeLineItem} />
                  ))}
                  <div className="flex justify-end gap-4 text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold text-foreground">${form.subtotal || "0.00"}</span>
                  </div>
                  <div className="flex justify-end gap-4 text-base font-bold">
                    <span>Total:</span>
                    <span className="text-green-400">${form.total || "0.00"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <Label>Terms & Notes (optional)</Label>
              <Textarea rows={2} placeholder="Payment due upon completion. Quote valid for 30 days."
                value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} />
            </div>

            {/* AI Generate */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={handleGenerate}
                disabled={generating || !form.prospectName || !form.serviceType}>
                <Wand2 className="h-4 w-4 mr-1" />
                {generating ? "Generating..." : "AI Generate Proposal Body"}
              </Button>
              {form.generatedContent && (
                <div className="space-y-1">
                  <Label>Generated Proposal Content</Label>
                  <Textarea rows={8} value={form.generatedContent}
                    onChange={e => setForm(f => ({ ...f, generatedContent: e.target.value }))} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({
                clientId: clientId!,
                title: form.title,
                prospectName: form.prospectName,
                prospectEmail: form.prospectEmail || undefined,
                prospectPhone: form.prospectPhone || undefined,
                industry: form.industry,
                serviceType: form.serviceType || undefined,
                scopeOfWork: form.scopeOfWork || undefined,
                lineItems: form.lineItems.length > 0 ? form.lineItems : undefined,
                subtotal: form.subtotal || undefined,
                total: form.total || undefined,
                terms: form.terms || undefined,
                generatedContent: form.generatedContent || undefined,
              })}
              disabled={createMutation.isPending || !form.title || !form.prospectName}>
              {createMutation.isPending ? "Creating..." : "Save Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
