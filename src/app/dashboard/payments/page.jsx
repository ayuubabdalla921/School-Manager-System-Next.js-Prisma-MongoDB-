"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { readSessionUser } from "@/lib/client-session";

export default function PaymentsPage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = readSessionUser();
    if (!current) {
      window.location.href = "/login";
      return;
    }
    setSessionUser(current);
  }, []);

  useEffect(() => {
    if (!sessionUser) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params =
          sessionUser.role?.toUpperCase() === "PARENT"
            ? `?parentId=${sessionUser.id}`
            : "";
        const res = await fetch(`/api/payments${params}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payments");
        setPayments(data.data ?? []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionUser]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus =
        statusFilter === "all" ? true : payment.status === statusFilter;
      const matchesSearch =
        payment.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        payment.description?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, search]);

  const totalOutstanding = useMemo(() => {
    return payments
      .filter((p) => p.status !== "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const downloadReceipt = (payment) => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, "_blank", "noopener");
      return;
    }
    const content = `Receipt\nStudent: ${
      payment.student?.name || "N/A"
    }\nAmount: ${payment.amount}\nStatus: ${
      payment.status
    }\nDescription: ${payment.description || "N/A"}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-${payment.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!sessionUser) {
    return null;
  }

  return (
    <div className="space-y-6 px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-6">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">Finance</p>
        <h1 className="text-2xl font-semibold">Payments & Fees</h1>
        <p className="text-sm text-slate-500">
          View outstanding balances and download receipts.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Summary of pending payments.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm text-slate-500">Outstanding balance</p>
            <p className="text-2xl font-semibold">${totalOutstanding.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total invoices</p>
            <p className="text-2xl font-semibold">{payments.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>Filter by status or search by student.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search student or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-sm"
            />
            <div className="flex gap-2">
              {["all", "PENDING", "PAID", "OVERDUE"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All" : status}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading payments...</p>
          ) : filteredPayments.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
              No payments match your filters.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {payment.student?.name || "Student"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Due{" "}
                      {payment.dueDate
                        ? new Date(payment.dueDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {payment.description || "Tuition fee"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-right sm:text-left">
                    <Badge
                      variant={
                        payment.status === "PAID"
                          ? "secondary"
                          : payment.status === "OVERDUE"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {payment.status}
                    </Badge>
                    <p className="text-lg font-semibold">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReceipt(payment)}
                    >
                      Download receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
