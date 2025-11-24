"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  GraduationCap,
  CalendarDays,
  Settings,
  X,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { readSessionUser } from "@/lib/client-session";
import { cn } from "@/lib/utils";

const COMMON_LINKS = [
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

const FALLBACK_LINKS = [
  { href: "/dashboard/admin", label: "Admin Panel", icon: Users },
  { href: "/dashboard/teacher", label: "Teacher Panel", icon: GraduationCap },
  { href: "/dashboard/student", label: "Student Panel", icon: BookOpen },
];

const ROLE_LINKS = {
  ADMIN: [
    { href: "/dashboard/admin", label: "Admin Panel", icon: Users },
    {
      href: "/dashboard/admin/users",
      label: "User Management",
      icon: UserPlus,
    },
    {
      href: "/dashboard/teacher",
      label: "Teacher Oversight",
      icon: GraduationCap,
    },
    {
      href: "/dashboard/student",
      label: "Student Overview",
      icon: LayoutDashboard,
    },
  ],
  TEACHER: [
    { href: "/dashboard/teacher", label: "Teacher Panel", icon: GraduationCap },
  ],
  STUDENT: [
    { href: "/dashboard/student", label: "Student Panel", icon: BookOpen },
  ],
  PARENT: [
    { href: "/dashboard/parent", label: "Parent Portal", icon: Users },
    { href: "/dashboard/student", label: "Children Records", icon: BookOpen },
  ],
};

export default function Sidebar({
  mobile = false,
  open = false,
  onClose = () => {},
}) {
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState(() => readSessionUser());

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleUpdate = () => setSessionUser(readSessionUser());
    window.addEventListener("session-user:updated", handleUpdate);
    return () => {
      window.removeEventListener("session-user:updated", handleUpdate);
    };
  }, []);

  const navItems = useMemo(() => {
    const role = sessionUser?.role?.toUpperCase();
    const roleSpecific = ROLE_LINKS[role] ?? FALLBACK_LINKS;
    return [...roleSpecific, ...COMMON_LINKS];
  }, [sessionUser]);

  const activeRoleLabel = sessionUser?.role
    ? sessionUser.role.toString().toUpperCase()
    : "GUEST";

  const content = (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto px-6 py-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">
            <GraduationCap className="mr-2 inline-block h-6 w-6 text-white" />
            Deero School
          </h1>
          <p className="text-xs text-gray-400">
            Signed in as {sessionUser?.name || "Guest"} ({activeRoleLabel})
          </p>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={mobile ? onClose : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto">
          <Link
            href="/dashboard/settings"
            onClick={mobile ? onClose : undefined}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </nav>
    </div>
  );

  if (mobile) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
        <div
          className={cn(
            "absolute right-0 h-full w-72 bg-gray-900 ring-1 ring-white/10 shadow-xl transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col bg-gray-900 ring-1 ring-white/10">
      {content}
    </div>
  );
}
