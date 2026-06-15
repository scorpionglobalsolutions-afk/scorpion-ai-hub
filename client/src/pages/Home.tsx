import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, BarChart3, Rocket, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scorpion AI Hub
            </span>
          </div>
          <a href={getLoginUrl()} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            Sign In
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            AI-Powered Marketing Automation
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            10 intelligent agents working together to generate leads, manage campaigns, and automate your entire marketing workflow.
          </p>
          <a href={getLoginUrl()}>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 w-fit mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <CardTitle>Speed to Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant lead capture with AI-powered SMS and email responses. Engage prospects within seconds.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 w-fit mb-3">
                <BarChart3 className="w-6 h-6" />
              </div>
              <CardTitle>Automated Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                LLM-powered narrative reports that tell the story of your client's performance with actionable insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 w-fit mb-3">
                <Rocket className="w-6 h-6" />
              </div>
              <CardTitle>10 AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                From voice assistants to content generation, all your marketing needs covered by intelligent automation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your agency?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join Scorpion Global Solutions and start automating your entire marketing workflow today.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
