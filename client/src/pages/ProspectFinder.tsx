import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Search,
  Globe,
  MapPin,
  Phone,
  Star,
  MessageSquare,
  ExternalLink,
  UserPlus,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Info,
  Building2,
  Filter,
} from "lucide-react";

type Prospect = {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string | null;
  rating: number;
  reviewCount: number;
  hasWebsite: boolean;
  isClaimed: boolean;
  mapsUrl: string;
  types: string[];
  lat: number;
  lng: number;
};

type TrafficData = {
  domain: string;
  hasData: boolean;
  avgMonthlyVisits: number;
  monthlyVisits: Array<{ date: string; visits: number }>;
  trafficSources: Record<string, number>;
  globalRank: number | null;
  dataRange: { startDate: string; endDate: string };
  error: string | null;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ProspectRow({
  prospect,
  industry,
  onSaved,
}: {
  prospect: Prospect;
  industry: string;
  onSaved: (placeId: string) => void;
}) {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [saved, setSaved] = useState(false);

  const getTraffic = trpc.prospectFinder.getTraffic.useMutation({
    onSuccess: (data) => {
      setTrafficData(data);
      setShowTraffic(true);
    },
    onError: (err) => {
      toast.error(`Traffic lookup failed: ${err.message}`);
    },
  });

  const saveAsLead = trpc.prospectFinder.saveAsLead.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSaved(true);
        onSaved(prospect.placeId);
        toast.success(`${prospect.name} added to your CRM!`);
      } else {
        toast.error(data.error || "Failed to save");
      }
    },
    onError: (err) => {
      toast.error(`Save failed: ${err.message}`);
    },
  });

  const handleCheckTraffic = () => {
    if (showTraffic) {
      setShowTraffic(false);
      return;
    }
    if (trafficData) {
      setShowTraffic(true);
      return;
    }
    if (!prospect.website) {
      toast.info("No website to check traffic for");
      return;
    }
    getTraffic.mutate({ domain: prospect.website });
  };

  const handleSave = () => {
    saveAsLead.mutate({
      name: prospect.name,
      address: prospect.address,
      phone: prospect.phone,
      website: prospect.website || undefined,
      industry,
      placeId: prospect.placeId,
      mapsUrl: prospect.mapsUrl,
      notes: `Rating: ${prospect.rating}/5 (${prospect.reviewCount} reviews). No website: ${!prospect.hasWebsite}. Unclaimed: ${!prospect.isClaimed}.`,
    });
  };

  const opportunityScore = (() => {
    let score = 0;
    if (!prospect.hasWebsite) score += 40;
    if (!prospect.isClaimed) score += 30;
    if (prospect.reviewCount < 10) score += 20;
    if (prospect.rating < 4.0 && prospect.reviewCount > 0) score += 10;
    return Math.min(score, 100);
  })();

  const opportunityColor =
    opportunityScore >= 70 ? "text-emerald-600" : opportunityScore >= 40 ? "text-amber-600" : "text-slate-500";
  const opportunityLabel =
    opportunityScore >= 70 ? "High" : opportunityScore >= 40 ? "Medium" : "Low";

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all hover:shadow-md">
      {/* Main Row */}
      <div className="p-4 flex flex-col md:flex-row md:items-start gap-4">
        {/* Business Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 text-base">{prospect.name}</h3>
            {!prospect.hasWebsite && (
              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">No Website</Badge>
            )}
            {!prospect.isClaimed && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Likely Unclaimed</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
            {prospect.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[280px]">{prospect.address}</span>
              </span>
            )}
            {prospect.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {prospect.phone}
              </span>
            )}
            {prospect.website && (
              <a
                href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[200px]">{prospect.website.replace(/^https?:\/\//i, "")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            {prospect.rating > 0 ? (
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <strong>{prospect.rating.toFixed(1)}</strong>
              </span>
            ) : (
              <span className="text-slate-400 text-xs">No rating</span>
            )}
            <span className="flex items-center gap-1 text-slate-500">
              <MessageSquare className="w-3.5 h-3.5" />
              {prospect.reviewCount} reviews
            </span>
            <a
              href={prospect.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:underline text-xs"
            >
              View on Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Opportunity Score + Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <span className="text-xs text-slate-500">Opportunity:</span>
                  <span className={`font-bold text-sm ${opportunityColor}`}>{opportunityLabel}</span>
                  <span className={`text-xs ${opportunityColor}`}>({opportunityScore}%)</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Score based on: no website (+40), unclaimed profile (+30), few reviews (+20), low rating (+10)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            {prospect.website && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckTraffic}
                disabled={getTraffic.isPending}
                className="text-xs h-8"
              >
                {getTraffic.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <BarChart2 className="w-3.5 h-3.5 mr-1" />
                )}
                {showTraffic ? "Hide Traffic" : "Check Traffic"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saved || saveAsLead.isPending}
              className={`text-xs h-8 ${saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {saveAsLead.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : saved ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              ) : (
                <UserPlus className="w-3.5 h-3.5 mr-1" />
              )}
              {saved ? "Saved" : "Save as Lead"}
            </Button>
          </div>
        </div>
      </div>

      {/* Traffic Panel */}
      {showTraffic && trafficData && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          {trafficData.hasData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(trafficData.avgMonthlyVisits)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Avg Monthly Visits</div>
              </div>
              {trafficData.globalRank && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    #{formatNumber(trafficData.globalRank)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Global Rank</div>
                </div>
              )}
              {Object.entries(trafficData.trafficSources)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([source, visits]) => (
                  <div key={source} className="text-center">
                    <div className="text-2xl font-bold text-slate-700">{formatNumber(visits)}</div>
                    <div className="text-xs text-slate-500 mt-0.5 capitalize">{source.replace(/_/g, " ")}</div>
                  </div>
                ))}
              <div className="col-span-2 md:col-span-4 text-xs text-slate-400 text-right">
                Data from Similarweb · {trafficData.dataRange.startDate} to {trafficData.dataRange.endDate}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                {trafficData.error ||
                  "No traffic data available — this site likely has very low traffic, making it a strong prospect for digital marketing services."}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProspectFinder() {
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("10000");
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [filterUnclaimed, setFilterUnclaimed] = useState(false);
  const [results, setResults] = useState<Prospect[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const search = trpc.prospectFinder.search.useMutation({
    onSuccess: (data) => {
      setHasSearched(true);
      if (data.error) {
        toast.error(`Search error: ${data.error}`);
        setResults([]);
      } else {
        setResults(data.prospects);
        if (data.prospects.length === 0) {
          toast.info("No prospects found. Try adjusting your filters or search area.");
        } else {
          toast.success(`Found ${data.prospects.length} prospects`);
        }
      }
    },
    onError: (err) => {
      toast.error(`Search failed: ${err.message}`);
      setHasSearched(true);
    },
  });

  const handleSearch = () => {
    if (!industry.trim()) {
      toast.error("Please enter an industry or business type");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter a city or location");
      return;
    }
    setResults([]);
    search.mutate({
      industry: industry.trim(),
      location: location.trim(),
      radius: parseInt(radius),
      filterNoWebsite,
      filterUnclaimed,
    });
  };

  const noWebsiteCount = results.filter((p) => !p.hasWebsite).length;
  const unclaimedCount = results.filter((p) => !p.isClaimed).length;
  const highOpportunityCount = results.filter((p) => {
    let score = 0;
    if (!p.hasWebsite) score += 40;
    if (!p.isClaimed) score += 30;
    if (p.reviewCount < 10) score += 20;
    return score >= 70;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Prospect Finder</h1>
            <p className="text-sm text-slate-500">
              Find local businesses with no website or unclaimed Google profiles — your best sales opportunities
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Search Form */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Industry / Business Type *
                </Label>
                <Input
                  placeholder="e.g. pool service, plumber, HVAC, dentist"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  City / Location *
                </Label>
                <Input
                  placeholder="e.g. Queen Creek, AZ or Phoenix, AZ"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-slate-600">Search Radius:</Label>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000">0.5 miles (~2km)</SelectItem>
                    <SelectItem value="5000">3 miles (~5km)</SelectItem>
                    <SelectItem value="10000">6 miles (~10km)</SelectItem>
                    <SelectItem value="20000">12 miles (~20km)</SelectItem>
                    <SelectItem value="50000">30 miles (~50km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="filterNoWebsite"
                    checked={filterNoWebsite}
                    onCheckedChange={(v) => setFilterNoWebsite(!!v)}
                  />
                  <Label htmlFor="filterNoWebsite" className="text-sm text-slate-600 cursor-pointer">
                    No website only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="filterUnclaimed"
                    checked={filterUnclaimed}
                    onCheckedChange={(v) => setFilterUnclaimed(!!v)}
                  />
                  <Label htmlFor="filterUnclaimed" className="text-sm text-slate-600 cursor-pointer">
                    Unclaimed only
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={search.isPending}
              className="bg-blue-600 hover:bg-blue-700 h-10 px-6"
            >
              {search.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Searching Google Maps...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Prospects
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* How It Works */}
        {!hasSearched && !search.isPending && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Search className="w-5 h-5 text-blue-500" />,
                title: "Search Google Maps",
                desc: "We search Google Maps for businesses in your target industry and location using real-time data.",
              },
              {
                icon: <Filter className="w-5 h-5 text-amber-500" />,
                title: "Identify Opportunities",
                desc: "Businesses flagged with no website or unclaimed profiles are your highest-value prospects.",
              },
              {
                icon: <BarChart2 className="w-5 h-5 text-purple-500" />,
                title: "Check Traffic & Save",
                desc: "Check their current website traffic via Similarweb, then save them directly to your CRM.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-0 shadow-sm">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 text-sm mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State */}
        {search.isPending && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 text-center">
              <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-3" />
              <p className="font-medium text-slate-700">Searching Google Maps...</p>
              <p className="text-sm text-slate-500 mt-1">
                Fetching business details, websites, and profile status. This may take 10–20 seconds.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!search.isPending && results.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Found", value: results.length, icon: <Building2 className="w-4 h-4" />, color: "text-blue-600" },
                { label: "No Website", value: noWebsiteCount, icon: <XCircle className="w-4 h-4" />, color: "text-red-600" },
                { label: "Likely Unclaimed", value: unclaimedCount, icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-600" },
                { label: "High Opportunity", value: highOpportunityCount, icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-600" },
              ].map((stat) => (
                <Card key={stat.label} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`${stat.color}`}>{stat.icon}</div>
                    <div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Results List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-700">
                  {results.length} Prospects — {industry} near {location}
                </h2>
                <span className="text-xs text-slate-400">
                  {savedIds.size} saved to CRM
                </span>
              </div>
              <div className="space-y-3">
                {results.map((prospect) => (
                  <ProspectRow
                    key={prospect.placeId}
                    prospect={prospect}
                    industry={industry}
                    onSaved={(id) =>     setSavedIds((prev) => { const next = new Set(prev); next.add(id); return next; })}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {hasSearched && !search.isPending && results.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 text-center">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">No prospects found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try a broader location, different industry keyword, or larger search radius.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
