import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Billing() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: !!user });
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = trpc.billing.getInvoices.useQuery(
    {},
    { enabled: !!user }
  );
  const { data: revenueSummary, isLoading: revenueLoading } = trpc.billing.getRevenueSummary.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.billing.createInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice created successfully!");
      setShowCreate(false);
      setClientId("");
      setAmount("");
      setDueDate("");
      setDescription("");
      refetchInvoices();
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });

  const updateMutation = trpc.billing.updateInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated!");
      refetchInvoices();
    },
  });

  if (loading || invoicesLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const handleCreate = () => {
    if (!clientId || !amount || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      clientId: parseInt(clientId),
      amount,
      dueDate,
      description: description || "AI Services",
    });
  };

  const totalRevenue = revenueSummary?.totalRevenue || 0;
  const totalPending = revenueSummary?.totalPending || 0;
  const totalPaid = revenueSummary?.totalPaid || 0;
  const invoiceList = invoices || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="w-3 h-3" />;
      case "sent": return <Send className="w-3 h-3" />;
      case "overdue": return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "sent": return "bg-blue-100 text-blue-700";
      case "overdue": return "bg-red-100 text-red-700";
      case "cancelled": return "bg-slate-100 text-slate-500";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

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
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  Billing & Invoices
                </h1>
                <p className="text-slate-600 mt-1">
                  Track client billing, generate invoices, and monitor revenue
                </p>
              </div>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              onClick={() => setShowCreate(!showCreate)}
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Revenue KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="text-sm text-slate-600">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-slate-600">Paid</p>
              </div>
              <p className="text-3xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-slate-600">Pending</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">${totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-slate-600">Total Invoices</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{invoiceList.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Client Revenue Breakdown */}
        {revenueSummary?.clientRevenue && revenueSummary.clientRevenue.length > 0 && (
          <Card className="border-slate-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Revenue by Client
              </CardTitle>
              <CardDescription>Breakdown of revenue across your client base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueSummary.clientRevenue.map((client: any) => {
                  const maxTotal = Math.max(...revenueSummary.clientRevenue.map((c: any) => c.total), 1);
                  const width = (client.total / maxTotal) * 100;
                  return (
                    <div key={client.clientId} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-700 w-40 truncate">{client.clientName}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-400 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-24 text-right">
                        ${client.total.toLocaleString()}
                      </span>
                      {client.pending > 0 && (
                        <span className="text-xs text-yellow-600 w-20 text-right">
                          ${client.pending} pending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Invoice Form */}
        {showCreate && (
          <Card className="border-slate-200 mb-8 border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
              <CardDescription>Generate an invoice for a client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Client *</Label>
                  <select
                    className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    <option value="">Select client...</option>
                    {clients?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Amount ($) *</Label>
                  <Input
                    type="number"
                    placeholder="2500"
                    className="mt-1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>Description / Services Included</Label>
                <Input
                  placeholder="e.g., Database Reactivation, SEO Audit, Speed-to-Lead"
                  className="mt-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button
                className="mt-4 bg-gradient-to-r from-orange-600 to-red-600"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Generate Invoice"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Invoices Table */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>All invoices and their payment status</CardDescription>
          </CardHeader>
          <CardContent>
            {invoiceList.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Invoices Yet</h3>
                <p className="text-slate-500 mb-4">Create your first invoice to start tracking revenue.</p>
                <Button
                  className="bg-gradient-to-r from-orange-600 to-red-600"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Period</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Due Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceList.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-mono font-medium text-slate-900">
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-700">
                          {invoice.clientName || `Client #${invoice.clientId}`}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{invoice.period || "—"}</td>
                        <td className="py-3 px-4 text-sm font-bold text-right text-slate-900">
                          ${parseFloat(String(invoice.total || invoice.subtotal || "0")).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-1 justify-end">
                            {invoice.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 text-xs"
                                onClick={() => updateMutation.mutate({ id: invoice.id, status: "sent" })}
                              >
                                Send
                              </Button>
                            )}
                            {(invoice.status === "sent" || invoice.status === "overdue") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 text-xs"
                                onClick={() => updateMutation.mutate({ id: invoice.id, status: "paid" })}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
