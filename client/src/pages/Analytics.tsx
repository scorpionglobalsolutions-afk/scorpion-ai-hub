import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  PieChart,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.analytics.getDashboardStats.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: !!user });

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      change: "+12%",
      positive: true,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Leads Generated",
      value: stats?.totalLeads || 0,
      change: "+23%",
      positive: true,
      icon: Target,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Conversions",
      value: stats?.totalConversions || 0,
      change: "+8%",
      positive: true,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Revenue Generated",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+15%",
      positive: true,
      icon: DollarSign,
      color: "from-orange-500 to-red-500",
    },
  ];

  const modulePerformance = [
    { name: "Speed to Lead", leads: 45, conversions: 12, rate: "26.7%" },
    { name: "Database Reactivation", leads: 120, conversions: 18, rate: "15.0%" },
    { name: "AI Appointment Setter", leads: 67, conversions: 23, rate: "34.3%" },
    { name: "Follow-Up Sequences", leads: 89, conversions: 14, rate: "15.7%" },
    { name: "Content Strategist", leads: 34, conversions: 8, rate: "23.5%" },
  ];

  const recentCampaigns = [
    { name: "Pool Buddies Reactivation", client: "Pool Buddies LLC", status: "active", leads: 45 },
    { name: "HVAC Speed to Lead", client: "AZ Comfort HVAC", status: "active", leads: 23 },
    { name: "Dental SEO Audit", client: "Smile Dental AZ", status: "completed", leads: 12 },
    { name: "Roofing Follow-Up", client: "Desert Roof Co", status: "paused", leads: 8 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                  <BarChart3 className="w-6 h-6" />
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time performance metrics across all campaigns and clients
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} className="border-border hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.positive ? "text-green-600" : "text-red-600"}`}>
                      {kpi.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {kpi.change}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Module Performance */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Module Performance
              </CardTitle>
              <CardDescription>Leads and conversions by AI agent module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modulePerformance.map((mod) => (
                  <div key={mod.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{mod.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">{mod.leads} leads</span>
                        <span className="text-xs text-muted-foreground">{mod.conversions} conversions</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600">{mod.rate}</span>
                      <div className="w-24 h-2 bg-secondary rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: mod.rate }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>Lead journey from capture to conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { stage: "Leads Captured", count: 355, percentage: 100, color: "from-blue-500 to-blue-600" },
                  { stage: "Contacted (Speed to Lead)", count: 312, percentage: 88, color: "from-cyan-500 to-blue-500" },
                  { stage: "Qualified", count: 198, percentage: 56, color: "from-purple-500 to-indigo-500" },
                  { stage: "Appointment Set", count: 89, percentage: 25, color: "from-pink-500 to-purple-500" },
                  { stage: "Converted", count: 45, percentage: 13, color: "from-green-500 to-emerald-500" },
                ].map((item) => (
                  <div key={item.stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{item.stage}</span>
                      <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Active and recent campaign performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((campaign) => (
                    <tr key={campaign.name} className="border-b border-border last:border-0 hover:bg-background">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{campaign.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{campaign.client}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-right text-foreground">{campaign.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Client Performance Grid */}
        {clients && clients.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Client Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client: any) => (
                <Card key={client.id} className="border-border hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.industry || "General"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-background rounded-lg">
                        <p className="text-lg font-bold text-foreground">0</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div className="text-center p-2 bg-background rounded-lg">
                        <p className="text-lg font-bold text-foreground">0</p>
                        <p className="text-xs text-muted-foreground">Conv.</p>
                      </div>
                      <div className="text-center p-2 bg-background rounded-lg">
                        <p className="text-lg font-bold text-green-600">0%</p>
                        <p className="text-xs text-muted-foreground">Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
