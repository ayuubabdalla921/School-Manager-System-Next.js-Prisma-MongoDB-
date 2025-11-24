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
import { readSessionUser } from "@/lib/client-session";
import Link from "next/link";

export default function ParentDashboardPage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = readSessionUser();
    if (!current || current.role?.toUpperCase() !== "PARENT") {
      window.location.href = "/login";
      return;
    }
    setSessionUser(current);
  }, []);

  useEffect(() => {
    if (!sessionUser?.id) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [overviewRes, paymentsRes] = await Promise.all([
          fetch(`/api/parents/${sessionUser.id}/overview`, {
            credentials: "include",
          }),
          fetch(`/api/payments?parentId=${sessionUser.id}`, {
            credentials: "include",
          }),
        ]);

        const overviewData = await overviewRes.json();
        if (!overviewRes.ok) {
          throw new Error(overviewData.error || "Unable to load parent data");
        }

        const paymentsPayload = await paymentsRes.json();
        if (!paymentsRes.ok) {
          throw new Error(paymentsPayload.error || "Unable to load payments");
        }

        setOverview(overviewData);
        setPayments(paymentsPayload.data ?? []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionUser]);

  const children = overview?.children ?? [];
  const messages = overview?.messages ?? [];

  const downloadReceipt = (payment) => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, "_blank", "noopener");
      return;
    }

    const content = `Receipt for ${payment.student?.name || "student"}\nAmount: ${
      payment.amount
    }\nStatus: ${payment.status}\nDescription: ${payment.description || "N/A"}`;
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
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Parent Portal
        </p>
        <h1 className="text-2xl font-semibold">
          Welcome back, {sessionUser.name}
        </h1>
        <p className="text-sm text-slate-500">
          Monitor attendance, payments, and messages for your children.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      ) : (
        <>
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Children overview</CardTitle>
              <CardDescription>
                {children.length
                  ? `Tracking ${children.length} child${children.length > 1 ? "ren" : ""}.`
                  : "No children linked yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {children.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Contact the administrator to link your children’s accounts.
                </p>
              ) : (
                children.map((child) => {
                  const attendance = child.attendance || { present: 0, total: 0 };
                  const rate =
                    attendance.total > 0
                      ? Math.round((attendance.present / attendance.total) * 100)
                      : 0;

                  return (
                    <div
                      key={child.id}
                      className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-slate-500">
                          {child.class?.name || "No class assigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline">
                          Attendance {rate}% ({attendance.present}/{attendance.total})
                        </Badge>
                        <Link
                          href={`/dashboard/student?child=${child.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Payments & fees</CardTitle>
              <CardDescription>
                Outstanding balances and recent receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-slate-500">No payments found.</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.student?.name || "Student"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Due {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "N/A"}
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
                      <p className="text-lg font-semibold">${payment.amount.toFixed(2)}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(payment)}
                      >
                        Download receipt
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Recent messages</CardTitle>
              <CardDescription>Stay in touch with teachers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No recent messages. Visit the{" "}
                  <Link href="/dashboard/messages" className="text-blue-600 hover:underline">
                    Messages
                  </Link>{" "}
                  page to start a conversation.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">{msg.sender?.name || "Unknown"}</span>
                      <Badge variant="outline">{msg.sender?.role || "USER"}</Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
