import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Megaphone, Plus, Users, Target, BarChart2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Campaigns() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: !!user });
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState<{ name: string; type: "speed_to_lead" | "reactivation" | "appointment_setting" | "follow_up" | "content" | "reputation"; }>({ name: "", type: "speed_to_lead" });

  const { data: campaigns, isLoading, refetch } = trpc.campaigns.listByClient.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      setIsCreateOpen(false);
      setNewCampaign({ name: "", type: "speed_to_lead" });
      refetch();
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const handleCreate = () => {
    if (!selectedClientId) { toast.error("Select a client first"); return; }
    if (!newCampaign.name.trim()) { toast.error("Campaign name is required"); return; }
    createMutation.mutate({ clientId: selectedClientId, name: newCampaign.name, type: newCampaign.type });
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    default: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campaign Manager</h1>
              <p className="text-sm text-muted-foreground">Create and manage client campaigns</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-muted-foreground">Campaign Name</Label>
                  <Input
                    className="mt-1 bg-background border-border text-foreground"
                    placeholder="e.g. Summer Outreach 2026"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Campaign Type</Label>
                  <Select                     value={newCampaign.type} onValueChange={(v) => setNewCampaign({ ...newCampaign, type: v as any })}>
                    <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="speed_to_lead">Speed to Lead</SelectItem>
                      <SelectItem value="reactivation">DB Reactivation</SelectItem>
                      <SelectItem value="appointment_setting">Appointment Setting</SelectItem>
                      <SelectItem value="follow_up">Follow-Up Sequences</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="reputation">Reputation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Select                     value="active" onValueChange={() => {}}>
                    <SelectTrigger className="mt-1 bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Clients", value: clients?.length ?? 0, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Campaigns", value: campaigns?.length ?? 0, icon: Megaphone, color: "from-orange-500 to-red-500" },
            { label: "Active", value: campaigns?.filter((c: any) => c.status === "active").length ?? 0, icon: Target, color: "from-green-500 to-emerald-600" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Client Selector */}
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">Select Client</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedClientId?.toString() ?? ""}
              onValueChange={(v) => setSelectedClientId(Number(v))}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Choose a client to view their campaigns..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {clients?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        {selectedClientId && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8"><Spinner className="w-6 h-6" /></div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No campaigns yet</p>
                  <p className="text-sm mt-1">Create your first campaign for this client</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                      <div>
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{campaign.type} campaign</p>
                      </div>
                      <Badge className={`text-xs border ${statusColor[campaign.status] ?? statusColor.draft}`}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedClientId && (
          <div className="text-center py-16 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a client above to view their campaigns</p>
          </div>
        )}
      </div>
    </div>
  );
}
