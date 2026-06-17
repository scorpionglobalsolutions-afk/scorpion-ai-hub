import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Edit3,
  Trash2,
  Zap,
  RotateCcw,
  Calendar,
  Mic,
  MessageSquare,
  Search,
  Star,
  Pen,
  BarChart3,
  Megaphone,
  Bot,
  PhoneMissed,
  ClipboardList,
  Filter,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Clock,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const MODULE_SHORTCUTS = [
  { id: "speed-to-lead", label: "Speed to Lead", icon: Zap, color: "from-orange-500 to-red-500" },
  { id: "reactivation", label: "DB Reactivation", icon: RotateCcw, color: "from-blue-500 to-cyan-500" },
  { id: "appointments", label: "Appointments", icon: Calendar, color: "from-purple-500 to-pink-500" },
  { id: "voice", label: "Voice Assistant", icon: Mic, color: "from-green-500 to-emerald-500" },
  { id: "sequences", label: "Follow-Up", icon: MessageSquare, color: "from-indigo-500 to-blue-500" },
  { id: "seo-audit", label: "SEO Audit", icon: Search, color: "from-yellow-500 to-orange-500" },
  { id: "reputation", label: "Reputation", icon: Star, color: "from-rose-500 to-pink-500" },
  { id: "content", label: "Content", icon: Pen, color: "from-teal-500 to-cyan-500" },
  { id: "reporting", label: "Reporting", icon: BarChart3, color: "from-violet-500 to-purple-500" },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, color: "from-amber-500 to-orange-500" },
  { id: "lead-gen-agent", label: "Lead Gen", icon: Bot, color: "from-sky-500 to-blue-500" },
  { id: "missed-call", label: "Missed Call", icon: PhoneMissed, color: "from-red-500 to-rose-500" },
  { id: "proposals", label: "Proposals", icon: ClipboardList, color: "from-blue-500 to-indigo-500" },
  { id: "pre-qual", label: "Pre-Qual", icon: Filter, color: "from-purple-500 to-violet-500" },
  { id: "chat-agent", label: "Chat Agent", icon: MessageCircle, color: "from-cyan-500 to-teal-500" },
  { id: "industry-packs", label: "Industry Packs", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
];

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const clientId = parseInt(params.id ?? "0", 10);
  const [, navigate] = useLocation();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
    website: "",
    description: "",
    status: "active" as "active" | "inactive" | "paused",
  });

  const { data: client, isLoading, refetch } = trpc.clients.get.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  // Populate edit form when client data loads
  useEffect(() => {
    if (client) {
      setEditForm({
        name: (client as any).name ?? "",
        email: (client as any).email ?? "",
        phone: (client as any).phone ?? "",
        industry: (client as any).industry ?? "",
        website: (client as any).website ?? "",
        description: (client as any).description ?? "",
        status: (client as any).status ?? "active",
      });
    }
  }, [client]);

  const { data: activity, isLoading: activityLoading } = trpc.activity.list.useQuery(
    { limit: 10 },
    { enabled: !!clientId }
  );

  const utils = trpc.useUtils();

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully");
      setEditOpen(false);
      refetch();
      utils.clients.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to update client"),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted");
      navigate("/clients");
    },
    onError: (err: any) => toast.error(err.message ?? "Failed to delete client"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Client not found.</p>
        <Button variant="outline" onClick={() => navigate("/clients")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ clientId, ...editForm });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/clients")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Clients
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">{client.name}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEditOpen(true)}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Client Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[oklch(0.72_0.12_75)] to-[oklch(0.55_0.18_250)] flex items-center justify-center text-black font-bold text-xl">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">{client.name}</CardTitle>
                    {client.industry && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Briefcase className="w-3 h-3" />
                        {client.industry}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Badge className={`capitalize border ${STATUS_COLORS[client.status] ?? STATUS_COLORS.active}`}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.description && (
                <p className="text-sm text-muted-foreground">{client.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={`mailto:${client.email}`} className="text-foreground hover:text-[oklch(0.72_0.12_75)] transition-colors truncate">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={`tel:${client.phone}`} className="text-foreground hover:text-[oklch(0.72_0.12_75)] transition-colors">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a
                      href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-[oklch(0.72_0.12_75)] transition-colors flex items-center gap-1 truncate"
                    >
                      {client.website}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Client ID</span>
                <span className="text-sm font-mono text-foreground">#{client.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={`capitalize border text-xs ${STATUS_COLORS[client.status] ?? STATUS_COLORS.active}`}>
                  {client.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Industry</span>
                <span className="text-sm text-foreground">{client.industry ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(client.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Shortcuts */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Launch a Module for This Client</CardTitle>
            <CardDescription>Click any module to open it — the client will be pre-selected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {MODULE_SHORTCUTS.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => navigate(`/modules/${mod.id}`)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-[oklch(0.72_0.12_75)]/50 hover:bg-card transition-all group cursor-pointer"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${mod.color} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                      {mod.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription>Last 10 actions for this client</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : !activity || activity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No activity yet for this client.
              </div>
            ) : (
              <div className="space-y-3">
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
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {log.entityType}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Client</DialogTitle>
            <DialogDescription>Update the client's information below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-foreground">Business Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-foreground">Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-foreground">Industry</Label>
                <Input
                  value={editForm.industry}
                  onChange={(e) => setEditForm((f) => ({ ...f, industry: e.target.value }))}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-foreground">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as any }))}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Website</Label>
              <Input
                value={editForm.website}
                onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://example.com"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">Description / Notes</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="bg-background border-border resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || !editForm.name.trim()}
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.12 75) 0%, oklch(0.62 0.10 75) 100%)", color: "oklch(0.12 0.005 285)" }}
            >
              {updateMutation.isPending ? <Spinner className="w-4 h-4" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ clientId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Spinner className="w-4 h-4" /> : "Delete Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
