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
  Calendar,
  RotateCcw,
  Zap,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Scheduling() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: !!user });

  const scheduledCampaigns = [
    {
      id: 1,
      name: "Weekly Reactivation - Pool Buddies",
      client: "Pool Buddies LLC",
      type: "reactivation",
      frequency: "weekly",
      nextRun: "2026-06-16T09:00:00",
      lastRun: "2026-06-09T09:00:00",
      status: "active",
      totalRuns: 12,
      leadsGenerated: 45,
    },
    {
      id: 2,
      name: "Daily Speed to Lead - HVAC",
      client: "AZ Comfort HVAC",
      type: "speed_to_lead",
      frequency: "daily",
      nextRun: "2026-06-16T08:00:00",
      lastRun: "2026-06-15T08:00:00",
      status: "active",
      totalRuns: 30,
      leadsGenerated: 89,
    },
    {
      id: 3,
      name: "Monthly SEO Report - Dental",
      client: "Smile Dental AZ",
      type: "seo_audit",
      frequency: "monthly",
      nextRun: "2026-07-01T10:00:00",
      lastRun: "2026-06-01T10:00:00",
      status: "active",
      totalRuns: 6,
      leadsGenerated: 0,
    },
    {
      id: 4,
      name: "Bi-Weekly Follow-Up - Roofing",
      client: "Desert Roof Co",
      type: "follow_up",
      frequency: "biweekly",
      nextRun: "2026-06-22T11:00:00",
      lastRun: "2026-06-08T11:00:00",
      status: "paused",
      totalRuns: 8,
      leadsGenerated: 23,
    },
  ];

  const executionLog = [
    { id: 1, campaign: "Weekly Reactivation - Pool Buddies", time: "2026-06-09T09:00:00", status: "success", leadsProcessed: 120, conversions: 4 },
    { id: 2, campaign: "Daily Speed to Lead - HVAC", time: "2026-06-15T08:00:00", status: "success", leadsProcessed: 15, conversions: 3 },
    { id: 3, campaign: "Monthly SEO Report - Dental", time: "2026-06-01T10:00:00", status: "success", leadsProcessed: 0, conversions: 0 },
    { id: 4, campaign: "Bi-Weekly Follow-Up - Roofing", time: "2026-06-08T11:00:00", status: "failed", leadsProcessed: 45, conversions: 0 },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reactivation": return <RotateCcw className="w-4 h-4" />;
      case "speed_to_lead": return <Zap className="w-4 h-4" />;
      case "seo_audit": return <Calendar className="w-4 h-4" />;
      case "follow_up": return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reactivation": return "from-blue-500 to-cyan-500";
      case "speed_to_lead": return "from-orange-500 to-red-500";
      case "seo_audit": return "from-yellow-500 to-orange-500";
      case "follow_up": return "from-indigo-500 to-blue-500";
      default: return "from-slate-500 to-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Timer className="w-6 h-6" />
                  </div>
                  Campaign Scheduling
                </h1>
                <p className="text-slate-600 mt-1">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Play className="w-5 h-5 text-green-600" />
                <p className="text-sm text-slate-600">Active Schedules</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {scheduledCampaigns.filter(c => c.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-slate-600">Total Executions</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {scheduledCampaigns.reduce((sum, c) => sum + c.totalRuns, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-slate-600">Leads Generated</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {scheduledCampaigns.reduce((sum, c) => sum + c.leadsGenerated, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-slate-600">Next Execution</p>
              </div>
              <p className="text-lg font-bold text-slate-900">Tomorrow 8:00 AM</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Schedule Form */}
        {showCreate && (
          <Card className="border-slate-200 mb-8 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle>Schedule New Campaign</CardTitle>
              <CardDescription>Set up a campaign to run automatically on a recurring schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input placeholder="e.g., Weekly Reactivation" className="mt-1" />
                </div>
                <div>
                  <Label>Client</Label>
                  <select className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm">
                    <option value="">Select client...</option>
                    {clients?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Campaign Type</Label>
                  <select className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm">
                    <option value="reactivation">Database Reactivation</option>
                    <option value="speed_to_lead">Speed to Lead</option>
                    <option value="follow_up">Follow-Up Sequence</option>
                    <option value="seo_audit">SEO Audit Report</option>
                    <option value="content">Content Generation</option>
                  </select>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <select className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <Label>Preferred Time</Label>
                  <Input type="time" defaultValue="09:00" className="mt-1" />
                </div>
              </div>
              <Button
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={() => {
                  toast.success("Campaign scheduled successfully!");
                  setShowCreate(false);
                }}
              >
                Schedule Campaign
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Campaigns */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Scheduled Campaigns</h2>
          <div className="space-y-4">
            {scheduledCampaigns.map((campaign) => (
              <Card key={campaign.id} className={`border-slate-200 ${campaign.status === "paused" ? "opacity-60" : ""}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(campaign.type)} text-white`}>
                        {getTypeIcon(campaign.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{campaign.name}</p>
                        <p className="text-sm text-slate-500">{campaign.client}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {campaign.frequency}
                          </span>
                          <span className="text-xs text-slate-500">
                            Next: {new Date(campaign.nextRun).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">{campaign.totalRuns}</p>
                        <p className="text-xs text-slate-500">Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{campaign.leadsGenerated}</p>
                        <p className="text-xs text-slate-500">Leads</p>
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === "active" ? (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Pause className="w-3 h-3" />
                            Pause
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-1 text-green-600">
                            <Play className="w-3 h-3" />
                            Resume
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          Run Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Execution Log */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Execution Log</CardTitle>
            <CardDescription>Recent campaign execution history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Executed At</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Leads Processed</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {executionLog.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{log.campaign}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(log.time).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {log.status === "success" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-right text-slate-900">{log.leadsProcessed}</td>
                      <td className="py-3 px-4 text-sm font-bold text-right text-green-600">{log.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
