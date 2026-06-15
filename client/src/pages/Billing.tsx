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
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Billing() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: !!user });

  const sampleInvoices = [
    {
      id: "INV-001",
      client: "Pool Buddies LLC",
      amount: 2500,
      status: "paid",
      dueDate: "2026-06-01",
      paidAt: "2026-05-28",
      services: ["Database Reactivation", "Speed to Lead", "SEO Audit"],
    },
    {
      id: "INV-002",
      client: "AZ Comfort HVAC",
      amount: 1800,
      status: "pending",
      dueDate: "2026-06-15",
      paidAt: null,
      services: ["Follow-Up Sequences", "Reputation Management"],
    },
    {
      id: "INV-003",
      client: "Smile Dental AZ",
      amount: 3200,
      status: "overdue",
      dueDate: "2026-06-01",
      paidAt: null,
      services: ["Full Suite - All Modules"],
    },
    {
      id: "INV-004",
      client: "Desert Roof Co",
      amount: 1500,
      status: "paid",
      dueDate: "2026-05-15",
      paidAt: "2026-05-14",
      services: ["Content Strategist", "Social Scheduler"],
    },
  ];

  const monthlyRevenue = [
    { month: "Jan", revenue: 8500 },
    { month: "Feb", revenue: 9200 },
    { month: "Mar", revenue: 11000 },
    { month: "Apr", revenue: 10500 },
    { month: "May", revenue: 12800 },
    { month: "Jun", revenue: 14200 },
  ];

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const avgMonthly = Math.round(totalRevenue / monthlyRevenue.length);
  const pendingAmount = sampleInvoices.filter(i => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

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
                <p className="text-sm text-slate-600">Total Revenue (YTD)</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-slate-600">Avg Monthly</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">${avgMonthly.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-slate-600">Pending</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-slate-600">Total Invoices</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{sampleInvoices.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="border-slate-200 mb-8">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-48">
              {monthlyRevenue.map((item) => {
                const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">${(item.revenue / 1000).toFixed(1)}k</span>
                    <div className="w-full relative" style={{ height: `${height}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-500 to-red-400 rounded-t-lg" />
                    </div>
                    <span className="text-xs text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                  <Label>Client</Label>
                  <select className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm">
                    <option value="">Select client...</option>
                    {clients?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Amount ($)</Label>
                  <Input type="number" placeholder="2500" className="mt-1" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" className="mt-1" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Services Included</Label>
                <Input placeholder="e.g., Database Reactivation, SEO Audit" className="mt-1" />
              </div>
              <Button
                className="mt-4 bg-gradient-to-r from-orange-600 to-red-600"
                onClick={() => {
                  toast.success("Invoice created successfully!");
                  setShowCreate(false);
                }}
              >
                Generate Invoice
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Services</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Due Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-mono font-medium text-slate-900">{invoice.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">{invoice.client}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {invoice.services.map((s) => (
                            <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-right text-slate-900">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {invoice.status === "paid" && <CheckCircle className="w-3 h-3" />}
                          {invoice.status === "pending" && <Clock className="w-3 h-3" />}
                          {invoice.status === "overdue" && <AlertCircle className="w-3 h-3" />}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{invoice.dueDate}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
