import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Filter, Plus, Trash2, Wand2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertCircle, Flame, Users
} from "lucide-react";

const INDUSTRIES = ["HVAC","Roofing","Pool Services","Plumbing","Electrical","Landscaping","Cleaning","Insurance","Loans","General Services"];

const QUAL_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  hot:         { label: "Hot Lead",    color: "text-red-400",    icon: <Flame className="h-3 w-3" />,         variant: "default" },
  warm:        { label: "Warm Lead",   color: "text-orange-400", icon: <AlertCircle className="h-3 w-3" />,   variant: "outline" },
  cold:        { label: "Cold Lead",   color: "text-blue-400",   icon: <AlertCircle className="h-3 w-3" />,   variant: "secondary" },
  unqualified: { label: "Not Qualified", color: "text-muted-foreground", icon: <XCircle className="h-3 w-3" />, variant: "destructive" },
};

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

interface Question {
  id: string; question: string; type: "multiple_choice" | "yes_no" | "text";
  options?: string[]; weight: number; scoringKey: Record<string, number>;
}

export default function PreQualFunnel() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({ name: "", industry: "HVAC", serviceType: "" });
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [pendingFunnelId, setPendingFunnelId] = useState<number | null>(null);

  const [submitForm, setSubmitForm] = useState({
    prospectName: "", prospectEmail: "", prospectPhone: "",
    answers: {} as Record<string, string>,
  });

  const utils = trpc.useUtils();
  const { data: funnels } = trpc.preQual.listByClient.useQuery({ clientId: clientId! }, { enabled: !!clientId });
  const { data: submissions } = trpc.preQual.getSubmissions.useQuery({ funnelId: selectedFunnelId! }, { enabled: !!selectedFunnelId });

  const createMutation = trpc.preQual.create.useMutation({
    onSuccess: (funnel) => {
      utils.preQual.listByClient.invalidate();
      if (funnel && generatedQuestions.length > 0) {
        // Save questions to funnel
        updateFunnelMutation.mutate({ id: funnel.id, questions: generatedQuestions, isActive: true });
      }
      setShowCreate(false);
      setGeneratedQuestions([]);
      toast.success("Funnel created");
    },
    onError: () => toast.error("Failed to create funnel"),
  });
  const updateFunnelMutation = trpc.preQual.updateFunnel.useMutation({
    onSuccess: () => utils.preQual.listByClient.invalidate(),
  });
  const deleteMutation = trpc.preQual.delete.useMutation({
    onSuccess: () => { utils.preQual.listByClient.invalidate(); toast.success("Deleted"); },
  });
  const generateMutation = trpc.preQual.generateQuestions.useMutation();
  const submitMutation = trpc.preQual.submit.useMutation({
    onSuccess: () => { utils.preQual.getSubmissions.invalidate(); setShowSubmit(false); toast.success("Submission scored"); },
  });
  const updateSubMutation = trpc.preQual.updateSubmission.useMutation({
    onSuccess: () => utils.preQual.getSubmissions.invalidate(),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({ industry: form.industry, serviceType: form.serviceType || undefined });
      setGeneratedQuestions(result.questions as Question[]);
      toast.success(`${result.questions.length} questions generated`);
    } finally {
      setGenerating(false);
    }
  };

  const selectedFunnel = funnels?.find(f => f.id === selectedFunnelId);
  const funnelQuestions: Question[] = selectedFunnel?.questions
    ? (selectedFunnel.questions as Question[])
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Filter className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pre-Qualification Funnel</h1>
            <p className="text-muted-foreground text-sm">Score prospects before your team picks up the phone</p>
          </div>
        </div>
        <ClientSelector onSelect={(id, name) => { setClientId(id); setClientName(name); setSelectedFunnelId(null); }} />
      </div>

      {!clientId ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Select a client to manage their pre-qualification funnels</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="funnels">
          <TabsList className="bg-muted">
            <TabsTrigger value="funnels">Funnels</TabsTrigger>
            <TabsTrigger value="submissions" disabled={!selectedFunnelId}>Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="funnels" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{funnels?.length ?? 0} funnel(s) for {clientName}</p>
              <Button onClick={() => { setForm({ name: "", industry: "HVAC", serviceType: "" }); setGeneratedQuestions([]); setShowCreate(true); }} size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Funnel
              </Button>
            </div>

            {funnels?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Filter className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No funnels yet. Create one to start scoring your prospects.</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {funnels?.map(funnel => {
                const qs: Question[] = funnel.questions ? (funnel.questions as Question[]) : [];
                return (
                  <Card key={funnel.id}
                    className={`bg-card border-border cursor-pointer transition-all ${selectedFunnelId === funnel.id ? "ring-2 ring-purple-500" : ""}`}
                    onClick={() => setSelectedFunnelId(funnel.id)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{funnel.name}</CardTitle>
                          <CardDescription>{funnel.industry} · {funnel.serviceType || "All services"} · {qs.length} questions</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={funnel.isActive ? "default" : "secondary"}>
                            {funnel.isActive ? "Active" : "Draft"}
                          </Badge>
                          <Switch checked={funnel.isActive ?? false}
                            onCheckedChange={(v) => updateFunnelMutation.mutate({ id: funnel.id, isActive: v })}
                            onClick={e => e.stopPropagation()} />
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={e => { e.stopPropagation(); setExpandedId(expandedId === funnel.id ? null : funnel.id); }}>
                            {expandedId === funnel.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                            onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: funnel.id }); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {expandedId === funnel.id && qs.length > 0 && (
                      <CardContent className="pt-0 space-y-2">
                        <Separator />
                        <p className="text-xs font-medium text-muted-foreground">Questions</p>
                        {qs.map((q, i) => (
                          <div key={q.id} className="p-2 bg-muted rounded text-sm">
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>
                            <span>{q.question}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({q.type.replace(/_/g, " ")}) · weight {q.weight}</span>
                          </div>
                        ))}
                        {selectedFunnelId === funnel.id && (
                          <Button size="sm" variant="outline" className="mt-2"
                            onClick={e => { e.stopPropagation(); setShowSubmit(true); }}>
                            <Plus className="h-3 w-3 mr-1" /> Score a Prospect
                          </Button>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{submissions?.length ?? 0} submissions for {selectedFunnel?.name}</p>
              <Button size="sm" onClick={() => setShowSubmit(true)}>
                <Plus className="h-4 w-4 mr-1" /> Score Prospect
              </Button>
            </div>
            {submissions?.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No submissions yet. Score your first prospect.</p>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {submissions?.map(sub => {
                const cfg = QUAL_CONFIG[sub.qualification ?? "cold"];
                return (
                  <Card key={sub.id} className="bg-card border-border">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{sub.prospectName || "Unknown"}</p>
                            <Badge variant={cfg.variant} className={`text-xs flex items-center gap-1 ${cfg.color}`}>
                              {cfg.icon}{cfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {sub.prospectPhone} · {sub.prospectEmail} · {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                          {sub.aiSummary && (
                            <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">{sub.aiSummary}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">{sub.score}</p>
                            <p className="text-xs text-muted-foreground">/ 100</p>
                          </div>
                          <Progress value={sub.score ?? 0} className="w-24 h-2" />
                          <Select value={sub.status ?? "new"}
                            onValueChange={(v) => updateSubMutation.mutate({ id: sub.id, status: v as "new" | "contacted" | "converted" | "rejected" })}>
                            <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["new","contacted","converted","rejected"].map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Funnel Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Pre-Qualification Funnel</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <Label>Funnel Name</Label>
                <Input placeholder="e.g. Loan Qualifier" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Service Type (optional)</Label>
                <Input placeholder="e.g. Business Loans" value={form.serviceType}
                  onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} />
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleGenerate}
              disabled={generating || !form.industry}>
              <Wand2 className="h-4 w-4 mr-1" />
              {generating ? "Generating questions..." : "AI Generate Questions"}
            </Button>

            {generatedQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{generatedQuestions.length} Questions Generated</p>
                {generatedQuestions.map((q, i) => (
                  <div key={q.id} className="p-3 bg-muted rounded space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                      <Badge variant="outline" className="text-xs shrink-0">{q.type.replace(/_/g, " ")} · w{q.weight}</Badge>
                    </div>
                    {q.options && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {q.options.map(opt => (
                          <span key={opt} className="text-xs bg-background px-2 py-0.5 rounded border border-border">
                            {opt} <span className="text-muted-foreground">({q.scoringKey?.[opt] ?? 0}pts)</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ clientId: clientId!, ...form })}
              disabled={createMutation.isPending || !form.name}>
              {createMutation.isPending ? "Creating..." : "Create Funnel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Score Prospect Dialog */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent className="max-w-xl bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Score a Prospect</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={submitForm.prospectName}
                  onChange={e => setSubmitForm(f => ({ ...f, prospectName: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={submitForm.prospectPhone}
                  onChange={e => setSubmitForm(f => ({ ...f, prospectPhone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={submitForm.prospectEmail}
                  onChange={e => setSubmitForm(f => ({ ...f, prospectEmail: e.target.value }))} />
              </div>
            </div>
            <Separator />
            {funnelQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">This funnel has no questions yet. Generate questions first.</p>
            ) : (
              <div className="space-y-4">
                {funnelQuestions.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-sm">{i + 1}. {q.question}</Label>
                    {q.type === "text" ? (
                      <Input placeholder="Enter answer..."
                        value={submitForm.answers[q.id] ?? ""}
                        onChange={e => setSubmitForm(f => ({ ...f, answers: { ...f.answers, [q.id]: e.target.value } }))} />
                    ) : (
                      <Select value={submitForm.answers[q.id] ?? ""}
                        onValueChange={v => setSubmitForm(f => ({ ...f, answers: { ...f.answers, [q.id]: v } }))}>
                        <SelectTrigger><SelectValue placeholder="Select answer..." /></SelectTrigger>
                        <SelectContent>
                          {(q.options ?? ["Yes", "No"]).map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmit(false)}>Cancel</Button>
            <Button
              onClick={() => submitMutation.mutate({
                funnelId: selectedFunnelId!,
                clientId: clientId!,
                prospectName: submitForm.prospectName || undefined,
                prospectEmail: submitForm.prospectEmail || undefined,
                prospectPhone: submitForm.prospectPhone || undefined,
                answers: submitForm.answers,
                questions: funnelQuestions.map(q => ({
                  id: q.id, question: q.question,
                  weight: q.weight, scoringKey: q.scoringKey,
                })),
              })}
              disabled={submitMutation.isPending || funnelQuestions.length === 0}>
              {submitMutation.isPending ? "Scoring..." : "Score Prospect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
