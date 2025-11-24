"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { readSessionUser } from "@/lib/client-session";
import {
  CalendarDays,
  GraduationCap,
  Users,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react";

const quickActions = {
  ADMIN: [
    { label: "Add student", href: "/dashboard/student" },
    { label: "Manage classes", href: "/dashboard/classes" },
    { label: "Attendance reports", href: "/dashboard/attendance" },
  ],
  TEACHER: [
    { label: "Take attendance", href: "/dashboard/attendance" },
    { label: "Message students", href: "/dashboard/messages" },
  ],
  PARENT: [
    { label: "View children", href: "/dashboard/parent" },
    { label: "Payments", href: "/dashboard/payments" },
    { label: "Messages", href: "/dashboard/messages" },
  ],
  STUDENT: [
    { label: "View classes", href: "/dashboard/student" },
    { label: "Send message", href: "/dashboard/messages" },
  ],
};

export default function RoleDashboard() {
  const [sessionUser, setSessionUser] = useState(() => readSessionUser());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleUpdate = () => {
      setSessionUser(readSessionUser());
    };
    window.addEventListener("session-user:updated", handleUpdate);
    return () => {
      window.removeEventListener("session-user:updated", handleUpdate);
    };
  }, []);

  const role = sessionUser?.role?.toUpperCase() || "STUDENT";

  if (!sessionUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <RoleSummary role={role} user={sessionUser} />
      <QuickActions role={role} />
    </div>
  );
}

function RoleSummary({ role, user }) {
  const summary = useMemo(() => {
    switch (role) {
      case "ADMIN":
        return {
          title: "Administrator View",
          description: "Monitor overall performance and assign resources.",
          highlights: [
            {
              icon: Users,
              label: "Teacher staffing",
              value: "Stable",
            },
            {
              icon: ClipboardCheck,
              label: "Attendance",
              value: "92%",
            },
            {
              icon: MessageSquare,
              label: "Inbox",
              value: "3 unread",
            },
          ],
        };
      case "TEACHER":
        return {
          title: "Teacher Overview",
          description: "Your upcoming classes and quick teaching tools.",
          highlights: [
            {
              icon: CalendarDays,
              label: "Next class",
              value: "Grade 8 • 10:00 AM",
            },
            {
              icon: GraduationCap,
              label: "Students",
              value: "28 today",
            },
            {
              icon: MessageSquare,
              label: "Messages",
              value: "2 new",
            },
          ],
        };
      case "PARENT":
        return {
          title: "Parent Portal",
          description: "Monitor your children’s progress and stay informed.",
          highlights: [
            {
              icon: Users,
              label: "Children linked",
              value: "2",
            },
            {
              icon: ClipboardCheck,
              label: "Attendance health",
              value: "96%",
            },
            {
              icon: MessageSquare,
              label: "Inbox",
              value: "1 unread",
            },
          ],
        };
      default:
        return {
          title: "Student Dashboard",
          description: "Keep track of your classes and messages.",
          highlights: [
            {
              icon: CalendarDays,
              label: "Next class",
              value: "Science • 09:30 AM",
            },
            {
              icon: ClipboardCheck,
              label: "Attendance",
              value: "98%",
            },
            {
              icon: MessageSquare,
              label: "Inbox",
              value: "1 new",
            },
          ],
        };
    }
  }, [role]);

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-xl">{summary.title}</CardTitle>
          <Badge variant="secondary">{role}</Badge>
        </div>
        <CardDescription>{summary.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {summary.highlights.map((highlight) => {
          const Icon = highlight.icon;
          return (
            <div
              key={highlight.label}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Icon className="h-4 w-4" />
                <p className="text-sm">{highlight.label}</p>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {highlight.value}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function QuickActions({ role }) {
  const actions = quickActions[role] ?? quickActions.STUDENT;

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>
          Reach the most common tools with a single tap.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
