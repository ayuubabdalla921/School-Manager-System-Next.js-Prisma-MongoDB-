"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { persistSessionUser, readSessionUser } from "@/lib/client-session";

const ROLE_REDIRECTS = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

export default function LoginPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto redirect if logged in
  useEffect(() => {
    const existingUser = readSessionUser();
    if (existingUser?.role) {
      const redirectPath =
        ROLE_REDIRECTS[existingUser.role.toUpperCase()] ?? "/dashboard";
      router.replace(redirectPath);
    }
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to sign in.");
      }

      persistSessionUser(data?.user);
      setStatus("Welcome back! Redirecting...");

      const role = data?.user?.role?.toUpperCase();
      const target = ROLE_REDIRECTS[role] ?? "/dashboard";

      setTimeout(() => {
        router.replace(target);
      }, 600);
    } catch (err) {
      setError(err.message || "Unexpected error, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Logo + Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto dark:hidden"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      {/* Login Card */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 dark:bg-gray-800/50">

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formState.email}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-2 text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-2 text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* STATUS */}
            {status && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {status}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* BOTTOM LINK */}
          <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            
            Don't have an account?
            {/* <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1"
            >
              Create one
            </Link> */}
          </p>
        </div>
      </div>
    </div>
  );
}
