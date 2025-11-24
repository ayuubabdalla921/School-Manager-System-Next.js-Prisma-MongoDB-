"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  Shield,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "TEACHER", label: "Teacher" },
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent" },
];

const ROLE_BADGES = {
  ADMIN: "bg-orange-50 text-orange-700 border-orange-200",
  TEACHER: "bg-blue-50 text-blue-700 border-blue-200",
  STUDENT: "bg-slate-100 text-slate-700 border-slate-200",
  PARENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const defaultFormState = {
  name: "",
  email: "",
  password: "",
  role: "STUDENT",
};

export default function UserManagement({ initialUsers = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [roleMutations, setRoleMutations] = useState({});
  const [globalError, setGlobalError] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  }, [users, roleFilter, searchTerm]);

  const stats = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0 }
    );
  }, [users]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (value) => {
    setFormState((prev) => ({ ...prev, role: value }));
  };

  const generatePassword = () => {
    const charset =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
    const length = 10;
    let password = "";
    for (let i = 0; i < length; i += 1) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormState((prev) => ({ ...prev, password }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormMessage("");
    setGlobalError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to create user");
      }

      setUsers((prev) => [data.user, ...prev]);
      setFormMessage("User account created successfully.");
      setFormState(defaultFormState);
    } catch (error) {
      setFormError(error?.message || "Unexpected error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoleChange = async (userId, value) => {
    if (!userId || !value) {
      return;
    }
    setGlobalError("");
    setRoleMutations((prev) => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: value }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to update user role");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...data, role: value } : user
        )
      );
    } catch (error) {
      setGlobalError(error?.message || "Unable to update user role.");
    } finally {
      setRoleMutations((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {globalError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-5 w-5" />
              Create user account
            </CardTitle>
            <CardDescription>
              Provision a new Admin, Teacher, Student, or Parent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Amina Hussein"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder="name@school.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Temporary password</Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={generatePassword}
                  >
                    Generate one
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  minLength={8}
                  value={formState.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>User role</Label>
                <Select value={formState.role} onValueChange={handleRoleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              {formMessage && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {formMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isCreating ||
                  !formState.name ||
                  !formState.email ||
                  !formState.password
                }
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User registry
              </CardTitle>
              <CardDescription>
                Search and filter the school directory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="Search name or email"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All roles</SelectItem>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {stats.total ?? 0} users •
                </span>
                {ROLE_OPTIONS.map((option) => (
                  <span key={option.value}>
                    {option.label}: {stats[option.value] || 0}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-32 text-center">Role</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-44 text-right">
                      Update role
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No users match your filters.
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "border px-2 py-0.5 text-[11px]",
                            ROLE_BADGES[user.role] ?? ""
                          )}
                          variant="outline"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-slate-500 sm:table-cell">
                        {user.createdAt
                          ? dateFormatter.format(new Date(user.createdAt))
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={Boolean(roleMutations[user.id])}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <RefreshCcw className="h-3.5 w-3.5" />
          Tip
        </div>
        <p className="mt-1">
          Share temporary passwords securely and ask users to change them on
          first login from the settings page.
        </p>
      </div>
    </div>
  );
}
