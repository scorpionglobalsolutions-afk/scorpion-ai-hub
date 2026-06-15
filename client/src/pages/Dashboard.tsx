import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import {
  Zap,
  RotateCcw,
  Calendar,
  Phone,
  MessageSquare,
  Search,
  Star,
  Pen,
  BarChart3,
  Plus,
  Users,
  Webhook,
  CreditCard,
  Timer,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "wouter";

const MODULE_CARDS = [
  {
    id: "speed-to-lead",
    title: "Speed to Lead",
    description: "Instant lead capture with AI-powered SMS & email responses",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "reactivation",
    title: "Database Reactivation",
    description: "Revive dormant leads with personalized multi-step sequences",
    icon: RotateCcw,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "appointments",
    title: "AI Appointment Setter",
    description: "Automate lead qualification and calendar booking",
    icon: Calendar,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "voice",
    title: "AI Voice Assistant",
    description: "Configure inbound/outbound voice agents with objection handling",
    icon: Phone,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "sequences",
    title: "Multi-Channel Follow-Up",
    description: "Build email & SMS sequences with AI-generated copy",
    icon: MessageSquare,
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "seo-audit",
    title: "Local SEO & GBP Auditor",
    description: "Generate comprehensive SEO audit reports in minutes",
    icon: Search,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "reputation",
    title: "Reputation Management",
    description: "AI-drafted responses to positive and negative reviews",
    icon: Star,
    color: "from-rose-500 to-pink-500",
  },
  {
    id: "content",
    title: "Content Strategist",
    description: "Generate blog posts, social captions, and newsletters",
    icon: Pen,
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "reporting",
    title: "Automated Reporting",
    description: "LLM-powered narrative reports for client performance",
    icon: BarChart3,
    color: "from-violet-500 to-purple-500",
  },
];

const ENTERPRISE_LINKS = [
  {
    title: "Analytics",
    description: "Real-time performance metrics",
    icon: TrendingUp,
    path: "/analytics",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Webhooks",
    description: "External integrations",
    icon: Webhook,
    path: "/webhooks",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Billing",
    description: "Invoices & revenue",
    icon: CreditCard,
    path: "/billing",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Scheduling",
    description: "Automated campaigns",
    icon: Timer,
    path: "/scheduling",
    color: "from-purple-500 to-pink-500",
  },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: activity, isLoading: activityLoading } = trpc.activity.list.useQuery(
    { limit: 5 },
    { enabled: !!user }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Scorpion AI Operations Hub
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Welcome back, {user?.name || "Agent"}. Manage all your AI-powered marketing campaigns from one elegant dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/clients")}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Clients
              </Button>
              <Button
                onClick={() => navigate("/clients")}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                New Client
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {clientsLoading ? <Spinner /> : clients?.length || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Managed accounts
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                AI Agents Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                10
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Modules available
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {activityLoading ? <Spinner /> : activity?.length || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Last 5 actions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {ENTERPRISE_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.path}
                className="border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => navigate(link.path)}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${link.color} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {link.title}
                      </p>
                      <p className="text-xs text-slate-500">{link.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Agent Modules Grid */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              AI Agent Modules
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Launch any module to manage campaigns, generate content, and automate client workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULE_CARDS.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => navigate(`/modules/${module.id}`)}
                >
                  <div className={`h-1 bg-gradient-to-r ${module.color}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        Ready
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/modules/${module.id}`);
                      }}
                    >
                      Launch Module
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {activity && activity.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded capitalize">
                      {log.entityType}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
