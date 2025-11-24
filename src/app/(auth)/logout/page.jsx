"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, LogOut } from "lucide-react";
import { clearSessionUser } from "@/lib/client-session";

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing you out...");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const performLogout = async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("We could not fully sign you out.");
        }

        clearSessionUser();
        if (isActive) {
          setStatus("Signed out successfully. Redirecting...");
        }
      } catch (err) {
        clearSessionUser();
        if (isActive) {
          setError(err.message || "Unexpected error. You can close this tab.");
        }
      } finally {
        setTimeout(() => {
          router.replace("/login");
        }, 900);
      }
    };

    performLogout();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-10">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <LogOut className="h-5 w-5 text-slate-500" />
            Logging out
          </CardTitle>
          <CardDescription>
            Please wait while we clear your session and prepare a fresh login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            <span>{status}</span>
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
