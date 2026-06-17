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
  Target,
  Megaphone,
  Bot,
  PhoneMissed,
  ClipboardList,
  Filter,
  MessageCircle,
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
  {
    id: "campaigns",
    title: "Campaigns",
    description: "Build and track multi-channel marketing campaigns",
    icon: Megaphone,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "lead-gen-agent",
    title: "Lead Gen Agent",
    description: "AI-powered Google Maps prospect finder with outreach generation",
    icon: Bot,
    color: "from-sky-500 to-blue-500",
  },
  {
    id: "missed-call",
    title: "Missed Call Text-Back",
    description: "Auto-text prospects the moment a call is missed",
    icon: PhoneMissed,
    color: "from-red-500 to-rose-500",
  },
  {
    id: "proposals",
    title: "Proposals & Estimates",
    description: "AI-generated professional proposals with line items",
    icon: ClipboardList,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "pre-qual",
    title: "Pre-Qual Funnel",
    description: "Score and qualify prospects before your team calls",
    icon: Filter,
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "chat-agent",
    title: "Chat Agent Builder",
    description: "Build 24/7 AI chat agents that capture leads on any website",
    icon: MessageCircle,
    color: "from-cyan-500 to-teal-500",
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
  {
    title: "Prospect Finder",
    description: "Find unclaimed businesses",
    icon: Target,
    path: "/prospect-finder",
    color: "from-cyan-500 to-blue-500",
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/manus-storage/scorpion_logo_d2ffa99c.png"
                alt="Scorpion Global Solutions"
                className="h-12 w-auto"
              />
              <div>
                <h1
                  className="text-3xl font-extrabold"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.82 0.10 75) 60%, oklch(0.55 0.18 250) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  OmniScorp
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Welcome back, {user?.name || "Agent"}. Your AI-powered marketing command center.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/clients")}
                className="gap-2 border-border"
              >
                <Users className="w-4 h-4" />
                Clients
              </Button>
              <Button
                onClick={() => navigate("/clients")}
                className="gap-2"
                style={{
                  background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.62 0.10 75) 100%)",
                  color: "oklch(0.12 0.005 285)",
                  border: "none"
                }}
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
          <Card className="border-border hover:shadow-lg hover:border-[oklch(0.72_0.12_75)]/40 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {clientsLoading ? <Spinner /> : clients?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Managed accounts
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg hover:border-[oklch(0.72_0.12_75)]/40 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Agents Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold"
                style={{
                  background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.55 0.18 250) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                10
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Modules available
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg hover:border-[oklch(0.72_0.12_75)]/40 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {activityLoading ? <Spinner /> : activity?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 5 actions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {ENTERPRISE_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.path}
                className="border-border hover:shadow-lg hover:border-[oklch(0.72_0.12_75)]/50 transition-all cursor-pointer group"
                onClick={() => navigate(link.path)}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${link.color} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground group-hover:text-[oklch(0.72_0.12_75)] transition-colors">
                        {link.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[oklch(0.72_0.12_75)] transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Agent Modules Grid */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              AI Agent Modules
            </h2>
            <p className="text-muted-foreground">
              Launch any module to manage campaigns, generate content, and automate client workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULE_CARDS.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.id}
                  className="border-border hover:shadow-xl hover:border-[oklch(0.72_0.12_75)]/50 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => navigate(`/modules/${module.id}`)}
                >
                  <div className={`h-1 bg-gradient-to-r ${module.color}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded">
                        Ready
                      </span>
                    </div>
                    <CardTitle className="text-lg text-foreground group-hover:text-[oklch(0.72_0.12_75)] transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:text-[oklch(0.72_0.12_75)]"
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
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Latest actions across your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded capitalize">
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
