import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, BarChart3, Rocket, ArrowRight, Search, Users, Star } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/manus-storage/scorpion_logo_d2ffa99c.png"
              alt="Scorpion Global Solutions"
              className="h-10 w-auto"
            />
            <div className="h-6 w-px bg-border" />
            <span
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: "'Montserrat', sans-serif", color: "oklch(0.72 0.12 75)" }}
            >
              OmniScorp
            </span>
          </div>
          <a
            href={getLoginUrl()}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          {/* Gold divider line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[oklch(0.72_0.12_75)]" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[oklch(0.72_0.12_75)]">
              Scorpion Global Solutions
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[oklch(0.72_0.12_75)]" />
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="text-foreground">AI-Powered</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.82 0.10 75) 60%, oklch(0.55 0.18 250) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Marketing Automation
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            10 intelligent agents working together to generate leads, manage campaigns,
            and automate your entire marketing workflow — all under your brand.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button
                className="gap-2 text-lg px-10 py-6 font-semibold"
                style={{
                  background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.62 0.10 75) 100%)",
                  color: "oklch(0.12 0.005 285)",
                  border: "none"
                }}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a href={getLoginUrl()}>
              <Button
                variant="outline"
                className="gap-2 text-lg px-10 py-6 font-semibold border-[oklch(0.72_0.12_75)] text-[oklch(0.72_0.12_75)] hover:bg-[oklch(0.72_0.12_75)]/10"
              >
                Sign In
              </Button>
            </a>
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[oklch(0.72_0.12_75)] text-[oklch(0.72_0.12_75)]" />
              ))}
            </div>
            <span>Rated 5 Stars by Clients</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:shadow-[0_0_30px_oklch(0.72_0.12_75)/10] transition-all duration-300 bg-card">
            <CardHeader>
              <div
                className="p-3 rounded-lg w-fit mb-3"
                style={{ background: "oklch(0.72 0.12 75 / 15%)" }}
              >
                <Zap className="w-6 h-6" style={{ color: "oklch(0.72 0.12 75)" }} />
              </div>
              <CardTitle className="text-foreground">Speed to Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant lead capture with AI-powered SMS and email responses. Engage prospects within seconds of inquiry.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:shadow-[0_0_30px_oklch(0.72_0.12_75)/10] transition-all duration-300 bg-card">
            <CardHeader>
              <div
                className="p-3 rounded-lg w-fit mb-3"
                style={{ background: "oklch(0.55 0.18 250 / 15%)" }}
              >
                <BarChart3 className="w-6 h-6" style={{ color: "oklch(0.65 0.18 250)" }} />
              </div>
              <CardTitle className="text-foreground">Automated Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                LLM-powered narrative reports that tell the story of your client's performance with actionable insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:shadow-[0_0_30px_oklch(0.72_0.12_75)/10] transition-all duration-300 bg-card">
            <CardHeader>
              <div
                className="p-3 rounded-lg w-fit mb-3"
                style={{ background: "oklch(0.72 0.12 75 / 15%)" }}
              >
                <Rocket className="w-6 h-6" style={{ color: "oklch(0.72 0.12 75)" }} />
              </div>
              <CardTitle className="text-foreground">10 AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                From voice assistants to content generation, all your marketing needs covered by intelligent automation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:shadow-[0_0_30px_oklch(0.72_0.12_75)/10] transition-all duration-300 bg-card">
            <CardHeader>
              <div
                className="p-3 rounded-lg w-fit mb-3"
                style={{ background: "oklch(0.55 0.18 250 / 15%)" }}
              >
                <Search className="w-6 h-6" style={{ color: "oklch(0.65 0.18 250)" }} />
              </div>
              <CardTitle className="text-foreground">SEO Auditor</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate Vendasta-style SEO reports with real data from Google Maps, website scraping, and directory checks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:shadow-[0_0_30px_oklch(0.72_0.12_75)/10] transition-all duration-300 bg-card">
            <CardHeader>
              <div
                className="p-3 rounded-lg w-fit mb-3"
                style={{ background: "oklch(0.72 0.12 75 / 15%)" }}
              >
                <Users className="w-6 h-6" style={{ color: "oklch(0.72 0.12 75)" }} />
              </div>
              <CardTitle className="text-foreground">Prospect Finder</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find businesses on Google Maps with no website or unclaimed profiles — your next clients, ready to convert.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:shadow-[0_0_30px_oklch(0.72_0.12_75)/10] transition-all duration-300 bg-card">
            <CardHeader>
              <div
                className="p-3 rounded-lg w-fit mb-3"
                style={{ background: "oklch(0.55 0.18 250 / 15%)" }}
              >
                <Star className="w-6 h-6" style={{ color: "oklch(0.65 0.18 250)" }} />
              </div>
              <CardTitle className="text-foreground">Reputation Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor and respond to reviews with AI-generated replies that protect and grow your clients' online reputation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Banner */}
        <div
          className="rounded-2xl p-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.17 0.006 285) 0%, oklch(0.20 0.006 285) 100%)",
            border: "1px solid oklch(0.72 0.12 75 / 30%)"
          }}
        >
          {/* Gold corner accent */}
          <div
            className="absolute top-0 left-0 w-32 h-32 opacity-20"
            style={{
              background: "radial-gradient(circle at top left, oklch(0.72 0.12 75), transparent 70%)"
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
            style={{
              background: "radial-gradient(circle at bottom right, oklch(0.55 0.18 250), transparent 70%)"
            }}
          />

          <h2
            className="text-3xl font-bold mb-4 text-foreground relative z-10"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Ready to dominate your market?
          </h2>
          <p className="text-lg mb-8 text-muted-foreground relative z-10">
            Join Scorpion Global Solutions and start automating your entire marketing workflow today.
          </p>
          <a href={getLoginUrl()} className="relative z-10">
            <Button
              className="text-lg px-10 py-6 font-semibold"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.62 0.10 75) 100%)",
                color: "oklch(0.12 0.005 285)",
                border: "none"
              }}
            >
              Access OmniScorp
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-muted-foreground text-sm">
          <p>© 2024 Scorpion Global Solutions LLC · support@scorpionglobalsolutions.com · (877) 515-0993</p>
        </div>
      </div>
    </div>
  );
}
