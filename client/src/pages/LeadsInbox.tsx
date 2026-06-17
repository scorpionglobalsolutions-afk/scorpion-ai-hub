import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Inbox, Phone, Mail, Building2, RefreshCw, Zap } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function LeadsInbox() {
  const utils = trpc.useUtils();
  const { data: leads, isLoading, refetch } = trpc.leads.listAll.useQuery({ limit: 200 });

  const updateStatus = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      utils.leads.listAll.invalidate();
      toast.success("Lead status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const newLeads = leads?.filter((l) => l.status === "new") ?? [];
  const otherLeads = leads?.filter((l) => l.status !== "new") ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Inbox className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leads Inbox</h1>
            <p className="text-sm text-zinc-400">Incoming leads from webhooks & n8n workflows</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      {!isLoading && leads && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["new", "contacted", "qualified", "converted", "lost"] as const).map((s) => (
            <div key={s} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{leads.filter((l) => l.status === s).length}</div>
              <div className="text-xs text-zinc-400 capitalize mt-0.5">{s}</div>
            </div>
          ))}
        </div>
      )}

      {/* New leads */}
      {newLeads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
              New Leads ({newLeads.length})
            </h2>
          </div>
          <div className="space-y-3">
            {newLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
            ))}
          </div>
        </div>
      )}

      {/* All other leads */}
      {otherLeads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            All Leads ({otherLeads.length})
          </h2>
          <div className="space-y-3">
            {otherLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!leads || leads.length === 0) && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Inbox className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No leads yet</h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              When n8n or another platform sends data to your webhook, leads will appear here automatically.
            </p>
            <div className="mt-4 p-3 bg-zinc-800 rounded-lg text-left max-w-md mx-auto">
              <p className="text-xs text-zinc-400 font-mono break-all">
                POST https://omniscorp.manus.space/api/webhooks/n8n-seo-scout-mqih9gdv
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-zinc-800" />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  onStatusChange,
}: {
  lead: any;
  onStatusChange: (id: number, status: any) => void;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{lead.name || "Unknown"}</span>
              {lead.company && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Building2 className="h-3 w-3" />
                  {lead.company}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.new}`}>
                {lead.status}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-green-400 hover:underline">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </a>
              )}
              {lead.source && (
                <span className="text-xs text-zinc-500">via {lead.source}</span>
              )}
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(lead.createdAt).toLocaleString()}
            </div>
          </div>
          <Select
            value={lead.status}
            onValueChange={(val) => onStatusChange(lead.id, val)}
          >
            <SelectTrigger className="w-32 h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
