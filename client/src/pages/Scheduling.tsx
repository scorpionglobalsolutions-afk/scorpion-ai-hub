import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Timer,
  Plus,
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  RotateCcw,
  Zap,
  Mail,
  MessageSquare,
  Trash2,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Scheduling() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly">("weekly");
  const [nextRunAt, setNextRunAt] = useState("");

  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: !!user });
  const { data: schedulesList, isLoading, refetch } = trpc.scheduling.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.scheduling.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign scheduled successfully!");
      setShowCreate(false);
      setCampaignName("");
      setSelectedClientId("");
      setNextRunAt("");
      refetch();
    },
    onError: () => {
      toast.error("Failed to schedule campaign");
    },
  });

  const updateMutation = trpc.scheduling.update.useMutation({
    onSuccess: () => {
      toast.success("Schedule updated!");
      refetch();
    },
  });

  const deleteMutation = trpc.scheduling.delete.useMutation({
    onSuccess: () => {
      toast.success("Schedule deleted!");
      refetch();
    },
  });

  const runNowMutation = trpc.scheduling.runNow.useMutation({
    onSuccess: () => {
      toast.success("Campaign executed successfully!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to execute campaign");
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reactivation": return <RotateCcw className="w-4 h-4" />;
      case "speed_to_lead": return <Zap className="w-4 h-4" />;
      case "follow_up": return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case "daily": return "from-orange-500 to-red-500";
      case "weekly": return "from-blue-500 to-cyan-500";
      case "monthly": return "from-purple-500 to-pink-500";
      default: return "from-slate-500 to-slate-600";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const schedules = schedulesList || [];
  const activeSchedules = schedules.filter((s: any) => s.isActive);

  const handleCreate = () => {
    if (!selectedClientId || !nextRunAt) {
      toast.error("Please select a client and set a run time");
      return;
    }
    createMutation.mutate({
      campaignId: 0, // Will be associated when campaign is created
      clientId: parseInt(selectedClientId),
      frequency,
      nextRunAt,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Timer className="w-6 h-6" />
                  </div>
                  Campaign Scheduling
                </h1>
                <p className="text-muted-foreground mt-1">
                  Automate campaigns to run on a daily, weekly, or monthly schedule
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus className="w-4 h-4" />
              Schedule Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Play className="w-5 h-5 text-green-600" />
                <p className="text-sm text-muted-foreground">Active Schedules</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{activeSchedules.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-muted-foreground">Total Schedules</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{schedules.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-muted-foreground">Next Execution</p>
              </div>
              <p className="text-lg font-bold text-foreground">
                {activeSchedules.length > 0 && activeSchedules[0].nextRunAt
                  ? new Date(activeSchedules[0].nextRunAt).toLocaleString()
                  : "No upcoming runs"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Schedule Form */}
        {showCreate && (
          <Card className="border-border mb-8 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle>Schedule New Campaign</CardTitle>
              <CardDescription>Set up a campaign to run automatically on a recurring schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Client *</Label>
                  <select
                    className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">Select client...</option>
                    {clients?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Frequency *</Label>
                  <select
                    className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                  >
                    <option value="once">One-Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <Label>Next Run At *</Label>
                  <Input
                    type="datetime-local"
                    className="mt-1"
                    value={nextRunAt}
                    onChange={(e) => setNextRunAt(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Scheduling..." : "Schedule"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Campaigns */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Scheduled Campaigns {schedules.length > 0 && <span className="text-sm font-normal text-muted-foreground">({schedules.length})</span>}
          </h2>

          {schedules.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <Timer className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Scheduled Campaigns</h3>
                <p className="text-muted-foreground mb-4">Schedule your first campaign to automate lead generation and outreach.</p>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule: any) => (
                <Card key={schedule.id} className={`border-border ${!schedule.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getFrequencyColor(schedule.frequency)} text-white`}>
                          {getTypeIcon(schedule.frequency)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {schedule.clientName || `Campaign #${schedule.campaignId}`}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {schedule.frequency}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Next: {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : "Not set"}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              schedule.isActive ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"
                            }`}>
                              {schedule.isActive ? "Active" : "Paused"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          {schedule.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => updateMutation.mutate({ id: schedule.id, status: "paused" })}
                            >
                              <Pause className="w-3 h-3" />
                              Pause
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-green-600"
                              onClick={() => updateMutation.mutate({ id: schedule.id, status: "active" })}
                            >
                              <Play className="w-3 h-3" />
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => runNowMutation.mutate({ scheduledCampaignId: schedule.id })}
                            disabled={runNowMutation.isPending}
                          >
                            <Play className="w-3 h-3" />
                            Run Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Delete this scheduled campaign?")) {
                                deleteMutation.mutate({ id: schedule.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* How Scheduling Works */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              How Campaign Scheduling Works
            </CardTitle>
            <CardDescription>Automate your AI agent workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Set a Schedule</h4>
                <p className="text-sm text-muted-foreground">Choose daily, weekly, or monthly frequency for your campaigns</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Auto-Execute</h4>
                <p className="text-sm text-muted-foreground">Campaigns run automatically at the scheduled time with AI-powered content</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Track Results</h4>
                <p className="text-sm text-muted-foreground">Monitor execution logs, leads generated, and conversion metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
