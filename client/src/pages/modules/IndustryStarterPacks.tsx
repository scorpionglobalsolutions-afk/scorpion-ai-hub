import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Zap,
  Phone,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building2,
  DollarSign,
  Eye,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PackMeta {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  targetCustomer: string;
  averageDealSize: number;
  contentSummary: {
    hasVoiceScript: boolean;
    followUpSteps: number;
    objectionHandlers: number;
    proposalLineItems: number;
    preQualQuestions: number;
    chatFAQs: number;
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function IndustryStarterPacks() {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [businessName, setBusinessName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [phone, setPhone] = useState("");
  const [applyVoice, setApplyVoice] = useState(true);
  const [applyFollowUp, setApplyFollowUp] = useState(true);
  const [applyMissedCall, setApplyMissedCall] = useState(true);
  const [applyProposal, setApplyProposal] = useState(true);
  const [previewTab, setPreviewTab] = useState("sms");
  const [applyResult, setApplyResult] = useState<{
    itemsCreated: string[];
    nextSteps: string[];
    industryPack: string;
    clientName: string;
  } | null>(null);

  // Data
  const { data: packs, isLoading: packsLoading } = trpc.industryTemplates.listPacks.useQuery();
  const { data: clientsData } = trpc.clients.list.useQuery();

  const selectedPack = packs?.find((p) => p.id === selectedPackId);

  // Preview query
  const { data: previewData, isLoading: previewLoading } =
    trpc.industryTemplates.previewApply.useQuery(
      {
        clientId: parseInt(selectedClientId),
        industryId: selectedPackId ?? "",
      },
      {
        enabled: previewDialogOpen && !!selectedClientId && !!selectedPackId,
      }
    );

  // Full pack content query
  const { data: fullPack } = trpc.industryTemplates.getPack.useQuery(
    { industryId: selectedPackId ?? "" },
    { enabled: !!selectedPackId }
  );

  // Apply mutation
  const applyMutation = trpc.industryTemplates.applyToClient.useMutation({
    onSuccess: (data) => {
      setApplyResult(data);
      toast.success(`${data.industryPack} pack applied to ${data.clientName}!`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleApply = () => {
    if (!selectedClientId || !selectedPackId) {
      toast.error("Please select a client first");
      return;
    }
    applyMutation.mutate({
      clientId: parseInt(selectedClientId),
      industryId: selectedPackId,
      businessName: businessName || undefined,
      agentName: agentName || undefined,
      phone: phone || undefined,
      applyVoiceScript: applyVoice,
      applyFollowUp: applyFollowUp,
      applyMissedCall: applyMissedCall,
      applyProposal: applyProposal,
    });
  };

  const openApplyDialog = (packId: string) => {
    setSelectedPackId(packId);
    setApplyResult(null);
    setApplyDialogOpen(true);
  };

  const openPreviewDialog = (packId: string) => {
    setSelectedPackId(packId);
    setPreviewDialogOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (packsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Industry Starter Packs
          </h1>
          <p className="text-muted-foreground mt-1">
            Pre-built scripts, sequences, proposals, and AI content for your clients — one click to
            apply everything.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {packs?.length ?? 0} Industries Available
        </Badge>
      </div>

      {/* How it works */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Building2, step: "1", label: "Select an Industry" },
              { icon: Eye, step: "2", label: "Preview the Content" },
              { icon: Users, step: "3", label: "Choose a Client" },
              { icon: Zap, step: "4", label: "Apply Everything" },
            ].map(({ icon: Icon, step, label }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Step {step}</div>
                  <div className="text-sm font-medium text-foreground">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Pack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packs?.map((pack: PackMeta) => (
          <Card
            key={pack.id}
            className={`bg-card border-border hover:border-primary/50 transition-all cursor-pointer ${
              selectedPackId === pack.id ? "border-primary ring-1 ring-primary/30" : ""
            }`}
            onClick={() => setSelectedPackId(pack.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: pack.color + "20" }}
                  >
                    {pack.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base text-foreground">{pack.name}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Avg deal: ${pack.averageDealSize.toLocaleString()}
                    </div>
                  </div>
                </div>
                {selectedPackId === pack.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{pack.description}</p>

              {/* Content summary */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Phone, label: "Voice Script", check: pack.contentSummary.hasVoiceScript },
                  {
                    icon: MessageSquare,
                    label: `${pack.contentSummary.followUpSteps} Follow-Ups`,
                    check: true,
                  },
                  {
                    icon: FileText,
                    label: `${pack.contentSummary.proposalLineItems} Line Items`,
                    check: true,
                  },
                ].map(({ icon: Icon, label, check }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 text-center"
                  >
                    <Icon className={`w-4 h-4 ${check ? "text-green-500" : "text-muted-foreground"}`} />
                    <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Content badges */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {pack.contentSummary.objectionHandlers} Objections
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {pack.contentSummary.preQualQuestions} Pre-Qual Q's
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {pack.contentSummary.chatFAQs} Chat FAQs
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreviewDialog(pack.id);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  style={{ backgroundColor: pack.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openApplyDialog(pack.id);
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Pack Detail (when selected) */}
      {selectedPack && fullPack && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="text-2xl">{selectedPack.icon}</span>
              {selectedPack.name} — Full Content Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="voice">
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="voice">Voice Script</TabsTrigger>
                <TabsTrigger value="followup">Follow-Up Sequence</TabsTrigger>
                <TabsTrigger value="objections">Objection Handlers</TabsTrigger>
                <TabsTrigger value="proposal">Proposal Template</TabsTrigger>
                <TabsTrigger value="prequal">Pre-Qual Questions</TabsTrigger>
                <TabsTrigger value="chat">Chat FAQs</TabsTrigger>
              </TabsList>

              <TabsContent value="voice">
                <div className="bg-background rounded-lg p-4">
                  <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {fullPack.voiceScript}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="followup">
                <div className="space-y-3">
                  {fullPack.followUpSequence.map(
                    (step: { day: number; channel: string; subject?: string; body: string }, i: number) => (
                      <div key={i} className="bg-background rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">Day {step.day}</Badge>
                          <Badge
                            variant="outline"
                            className={
                              step.channel === "sms" ? "text-green-500" : "text-blue-500"
                            }
                          >
                            {step.channel.toUpperCase()}
                          </Badge>
                          {step.subject && (
                            <span className="text-xs text-muted-foreground">
                              Subject: {step.subject}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{step.body}</p>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="objections">
                <div className="space-y-3">
                  {fullPack.objectionHandlers.map(
                    (obj: { objection: string; response: string }, i: number) => (
                      <div key={i} className="bg-background rounded-lg p-4">
                        <div className="text-xs font-semibold text-red-400 mb-1">
                          ❌ "{obj.objection}"
                        </div>
                        <div className="text-xs text-foreground leading-relaxed">
                          ✅ {obj.response}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="proposal">
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      {fullPack.proposalTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {fullPack.proposalIntro}
                    </p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1 text-muted-foreground">Description</th>
                          <th className="text-right py-1 text-muted-foreground">Qty</th>
                          <th className="text-right py-1 text-muted-foreground">Unit Price</th>
                          <th className="text-right py-1 text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fullPack.proposalLineItems.map(
                          (
                            item: { description: string; quantity: number; unitPrice: number },
                            i: number
                          ) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-1.5 text-foreground">{item.description}</td>
                              <td className="py-1.5 text-right text-muted-foreground">
                                {item.quantity}
                              </td>
                              <td className="py-1.5 text-right text-muted-foreground">
                                ${item.unitPrice.toLocaleString()}
                              </td>
                              <td className="py-1.5 text-right text-foreground font-medium">
                                ${(item.quantity * item.unitPrice).toLocaleString()}
                              </td>
                            </tr>
                          )
                        )}
                        <tr>
                          <td colSpan={3} className="pt-2 text-right font-semibold text-foreground">
                            Estimated Total
                          </td>
                          <td className="pt-2 text-right font-bold text-primary">
                            $
                            {fullPack.proposalLineItems
                              .reduce(
                                (s: number, i: { quantity: number; unitPrice: number }) =>
                                  s + i.quantity * i.unitPrice,
                                0
                              )
                              .toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-[10px] text-muted-foreground mt-3 border-t border-border pt-3">
                      Terms: {fullPack.proposalTerms}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prequal">
                <div className="space-y-3">
                  {fullPack.preQualQuestions.map(
                    (
                      q: {
                        question: string;
                        weight: number;
                        type: string;
                        options?: string[];
                      },
                      i: number
                    ) => (
                      <div key={i} className="bg-background rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">
                              {i + 1}. {q.question}
                            </p>
                            {q.options && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {q.options.map((opt: string) => (
                                  <Badge key={opt} variant="outline" className="text-[10px]">
                                    {opt}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                            {q.weight} pts
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <div className="space-y-3">
                  <div className="bg-background rounded-lg p-4 mb-3">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      Welcome Message
                    </div>
                    <p className="text-xs text-foreground">{fullPack.chatWelcomeMessage}</p>
                  </div>
                  {fullPack.chatFAQs.map(
                    (faq: { question: string; answer: string }, i: number) => (
                      <div key={i} className="bg-background rounded-lg p-4">
                        <p className="text-xs font-semibold text-primary mb-1">Q: {faq.question}</p>
                        <p className="text-xs text-foreground leading-relaxed">A: {faq.answer}</p>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* ── Apply Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <span className="text-xl">{selectedPack?.icon}</span>
              Apply {selectedPack?.name} Starter Pack
            </DialogTitle>
          </DialogHeader>

          {applyResult ? (
            // Success state
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">
                  {applyResult.industryPack} pack applied to {applyResult.clientName}!
                </span>
              </div>
              <div className="space-y-1">
                {applyResult.itemsCreated.map((item, i) => (
                  <div key={i} className="text-sm text-foreground">
                    {item}
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Next Steps:</div>
                {applyResult.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground mb-1">
                    <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                    {step}
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setApplyDialogOpen(false);
                  setApplyResult(null);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            // Config state
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-foreground">Select Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData?.map((c: { id: number; name: string }) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Business Name (optional)</Label>
                  <Input
                    placeholder="Override client name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground text-xs">Agent Name (optional)</Label>
                  <Input
                    placeholder="e.g. Sarah"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-foreground text-xs">Phone Number (optional)</Label>
                  <Input
                    placeholder="e.g. (813) 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground text-xs">What to Apply</Label>
                {[
                  { id: "voice", label: "Voice Assistant Script + Objection Handlers", state: applyVoice, setter: setApplyVoice },
                  { id: "followup", label: "Follow-Up Sequence (5 steps)", state: applyFollowUp, setter: setApplyFollowUp },
                  { id: "missed", label: "Missed Call Text-Back Config", state: applyMissedCall, setter: setApplyMissedCall },
                  { id: "proposal", label: "Proposal Template with Line Items", state: applyProposal, setter: setApplyProposal },
                ].map(({ id, label, state, setter }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={state}
                      onCheckedChange={(v) => setter(!!v)}
                    />
                    <label htmlFor={id} className="text-xs text-foreground cursor-pointer">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!applyResult && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApplyDialogOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!selectedClientId || applyMutation.isPending}
              >
                {applyMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Apply Pack
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Preview Dialog ───────────────────────────────────────────────── */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview — {selectedPack?.name} Pack
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <Label className="text-foreground text-xs whitespace-nowrap">Preview for client:</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="bg-background border-border text-foreground text-xs h-8">
                  <SelectValue placeholder="Select client to personalize..." />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {previewLoading && (
              <div className="flex justify-center py-8">
                <Spinner className="w-6 h-6" />
              </div>
            )}

            {previewData && (
              <Tabs value={previewTab} onValueChange={setPreviewTab}>
                <TabsList className="flex-wrap h-auto gap-1">
                  <TabsTrigger value="sms" className="text-xs">Speed-to-Lead SMS</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">Speed-to-Lead Email</TabsTrigger>
                  <TabsTrigger value="voice" className="text-xs">Voice Script</TabsTrigger>
                  <TabsTrigger value="missed" className="text-xs">Missed Call SMS</TabsTrigger>
                  <TabsTrigger value="review" className="text-xs">Review Request</TabsTrigger>
                </TabsList>

                <TabsContent value="sms">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-foreground leading-relaxed">
                      {previewData.preview.speedToLeadSMS}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="email">
                  <div className="bg-background rounded-lg p-4 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Subject: {previewData.preview.speedToLeadEmail.subject}
                    </div>
                    <pre className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {previewData.preview.speedToLeadEmail.body}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="voice">
                  <div className="bg-background rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {previewData.preview.voiceScript}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="missed">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-foreground leading-relaxed">
                      {previewData.preview.missedCallSMS}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="review">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-foreground leading-relaxed">
                      {previewData.preview.reviewRequestSMS}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!selectedClientId && !previewLoading && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Select a client above to see personalized content previews
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)} className="border-border">
              Close
            </Button>
            <Button
              onClick={() => {
                setPreviewDialogOpen(false);
                openApplyDialog(selectedPackId ?? "");
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply This Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
