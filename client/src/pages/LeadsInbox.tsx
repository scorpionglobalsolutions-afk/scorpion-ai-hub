import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Inbox, Phone, Mail, Building2, RefreshCw, Zap, Search,
  Trash2, Pencil, Eye, X, Check, StickyNote, Globe, Tag
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "lost"] as const;
type LeadStatus = typeof STATUS_OPTIONS[number];

type Lead = {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  notes?: string | null;
  status: LeadStatus;
  createdAt: Date | string;
};

export default function LeadsInbox() {
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Auto-refresh every 30s to pick up new webhook leads
  const { data: leads, isLoading, refetch } = trpc.leads.listAll.useQuery(
    { limit: 500 },
    { refetchInterval: 30_000 }
  );

  const updateStatus = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      utils.leads.listAll.invalidate();
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.listAll.invalidate();
      setEditMode(false);
      setSelectedLead(null);
      toast.success("Lead updated");
    },
    onError: () => toast.error("Failed to update lead"),
  });

  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => {
      utils.leads.listAll.invalidate();
      setDeleteConfirmId(null);
      setSelectedLead(null);
      toast.success("Lead deleted");
    },
    onError: () => toast.error("Failed to delete lead"),
  });

  // Filter leads
  const filtered = (leads ?? []).filter((l) => {
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.source && l.source.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const newLeads = filtered.filter((l) => l.status === "new");
  const otherLeads = filtered.filter((l) => l.status !== "new");

  function openEdit(lead: Lead) {
    setEditData({
      name: lead.name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: lead.company ?? "",
      notes: lead.notes ?? "",
      status: lead.status,
    });
    setEditMode(true);
    setSelectedLead(lead);
  }

  function saveEdit() {
    if (!selectedLead) return;
    updateLead.mutate({
      id: selectedLead.id,
      name: editData.name ?? undefined,
      email: editData.email ?? undefined,
      phone: editData.phone ?? undefined,
      company: editData.company ?? undefined,
      notes: editData.notes ?? undefined,
      status: editData.status ?? undefined,
    });
  }

  // Source badge color
  function sourceColor(source?: string | null) {
    if (!source) return "text-zinc-500";
    if (source.startsWith("apollo")) return "text-orange-400";
    if (source.startsWith("webhook")) return "text-purple-400";
    if (source.includes("n8n")) return "text-cyan-400";
    if (source.includes("twilio") || source.includes("call")) return "text-green-400";
    return "text-zinc-400";
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Inbox className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leads Inbox</h1>
            <p className="text-sm text-zinc-400">All incoming leads — webhooks, Apollo, Twilio &amp; n8n</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { refetch(); toast.info("Refreshed"); }}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      {!isLoading && leads && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`bg-zinc-900 border rounded-lg p-3 text-center transition-colors cursor-pointer ${
                statusFilter === s ? "border-blue-500/60 bg-blue-500/10" : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="text-xl font-bold text-white">{leads.filter((l) => l.status === s).length}</div>
              <div className="text-xs text-zinc-400 capitalize mt-0.5">{s}</div>
            </button>
          ))}
        </div>
      )}

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email, phone, company, source…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-zinc-900 border-zinc-700 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && leads && (
        <p className="text-xs text-zinc-500">
          Showing {filtered.length} of {leads.length} leads
          {searchQuery && ` matching "${searchQuery}"`}
          {statusFilter !== "all" && ` · status: ${statusFilter}`}
        </p>
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
              <LeadCard
                key={lead.id}
                lead={lead as Lead}
                onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
                onEdit={() => openEdit(lead as Lead)}
                onView={() => { setSelectedLead(lead as Lead); setEditMode(false); }}
                onDelete={() => setDeleteConfirmId(lead.id)}
                sourceColor={sourceColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other leads */}
      {otherLeads.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            All Leads ({otherLeads.length})
          </h2>
          <div className="space-y-3">
            {otherLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead as Lead}
                onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
                onEdit={() => openEdit(lead as Lead)}
                onView={() => { setSelectedLead(lead as Lead); setEditMode(false); }}
                onDelete={() => setDeleteConfirmId(lead.id)}
                sourceColor={sourceColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <Inbox className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery || statusFilter !== "all" ? "No leads match your filters" : "No leads yet"}
            </h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "When Apollo, Twilio, n8n, or another platform sends data to your webhooks, leads will appear here automatically."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-zinc-700 text-zinc-300"
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              >
                Clear filters
              </Button>
            )}
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

      {/* View / Edit Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => { if (!open) { setSelectedLead(null); setEditMode(false); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editMode ? <Pencil className="h-4 w-4 text-yellow-400" /> : <Eye className="h-4 w-4 text-blue-400" />}
              {editMode ? "Edit Lead" : "Lead Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedLead && !editMode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Name</p>
                  <p className="text-white font-medium">{selectedLead.name || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Company</p>
                  <p className="text-white">{selectedLead.company || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Email</p>
                  {selectedLead.email
                    ? <a href={`mailto:${selectedLead.email}`} className="text-blue-400 hover:underline">{selectedLead.email}</a>
                    : <p className="text-zinc-500">—</p>}
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Phone</p>
                  {selectedLead.phone
                    ? <a href={`tel:${selectedLead.phone}`} className="text-green-400 hover:underline">{selectedLead.phone}</a>
                    : <p className="text-zinc-500">—</p>}
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[selectedLead.status]}`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Source</p>
                  <p className="text-zinc-300 text-xs font-mono">{selectedLead.source || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-zinc-500 text-xs mb-1">Received</p>
                  <p className="text-zinc-300">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
                {selectedLead.notes && (
                  <div className="col-span-2">
                    <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1"><StickyNote className="h-3 w-3" /> Notes</p>
                    <p className="text-zinc-300 text-sm bg-zinc-800 rounded p-2 whitespace-pre-wrap">{selectedLead.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => openEdit(selectedLead)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-800 text-red-400 hover:bg-red-900/20" onClick={() => setDeleteConfirmId(selectedLead.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}

          {selectedLead && editMode && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Name</label>
                  <Input value={editData.name ?? ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Company</label>
                  <Input value={editData.company ?? ""} onChange={(e) => setEditData({ ...editData, company: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                  <Input value={editData.email ?? ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Phone</label>
                  <Input value={editData.phone ?? ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v as LeadStatus })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
                  <Textarea
                    value={editData.notes ?? ""}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white resize-none"
                    rows={3}
                    placeholder="Add notes about this lead…"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={updateLead.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Check className="h-3 w-3 mr-1" />
                  {updateLead.isPending ? "Saving…" : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-4 w-4" /> Delete Lead
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-300 text-sm">Are you sure you want to permanently delete this lead? This cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white"
              disabled={deleteLead.isPending}
              onClick={() => deleteConfirmId !== null && deleteLead.mutate({ id: deleteConfirmId })}
            >
              {deleteLead.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadCard({
  lead,
  onStatusChange,
  onEdit,
  onView,
  onDelete,
  sourceColor,
}: {
  lead: Lead;
  onStatusChange: (id: number, status: LeadStatus) => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  sourceColor: (source?: string | null) => string;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Name + company + status */}
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
              {lead.notes && (
                <span title={lead.notes} className="text-zinc-500">
                  <StickyNote className="h-3 w-3" />
                </span>
              )}
            </div>

            {/* Contact info */}
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
            </div>

            {/* Source + time */}
            <div className="flex items-center gap-3 flex-wrap">
              {lead.source && (
                <span className={`flex items-center gap-1 text-xs font-mono ${sourceColor(lead.source)}`}>
                  <Tag className="h-3 w-3" />
                  {lead.source}
                </span>
              )}
              <span className="text-xs text-zinc-600">
                {new Date(lead.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right side: status selector + actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Select
              value={lead.status}
              onValueChange={(val) => onStatusChange(lead.id, val as LeadStatus)}
            >
              <SelectTrigger className="w-32 h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <button onClick={onView} title="View details" className="p-1.5 rounded text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 transition-colors">
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button onClick={onEdit} title="Edit lead" className="p-1.5 rounded text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800 transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} title="Delete lead" className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
