"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readSessionUser } from "@/lib/client-session";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
    role: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState({
    email: true,
    alerts: true,
    messages: true,
  });
  const [notificationMessage, setNotificationMessage] = useState("");

  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    const user = readSessionUser();
    if (user) {
      setSessionUser(user);
      setProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatar: user.avatarUrl || "",
        role: user.role || prev.role,
      }));
    }
  }, []);

  useEffect(() => {
    if (!sessionUser?.id) return;
    let isMounted = true;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await fetch(`/api/users/${sessionUser.id}`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load profile");
        if (isMounted) {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            avatar: data.avatarUrl || "",
            role: data.role || sessionUser.role || "",
          });
        }
      } catch (error) {
        console.error("Unable to load profile", error);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const isAdmin = useMemo(
    () => profile.role?.toUpperCase() === "ADMIN",
    [profile.role]
  );

  useEffect(() => {
    const savedTheme =
      typeof window !== "undefined"
        ? localStorage.getItem("dashboard-theme")
        : null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("system");
    }

    const savedNotif =
      typeof window !== "undefined"
        ? localStorage.getItem("dashboard-notifications")
        : null;
    if (savedNotif) {
      try {
        setNotifications(JSON.parse(savedNotif));
      } catch (error) {
        console.error("Failed to parse notifications settings", error);
      }
    }
  }, []);

  const applyTheme = (mode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.theme = mode === "system" ? "" : mode;
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", mode === "dark");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const handleProfileSave = async () => {
    if (!sessionUser?.id) {
      setProfileMessage("You must be signed in to update your profile.");
      return;
    }
    setProfileLoading(true);
    try {
      const response = await fetch(`/api/users/${sessionUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatar,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update profile.");
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setProfileMessage(error.message);
    } finally {
      setProfileLoading(false);
      setTimeout(() => setProfileMessage(""), 2500);
    }
  };

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setPasswordMessage("Please fill all password fields.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    setPasswordMessage("Password change request captured.");
    setTimeout(() => setPasswordMessage(""), 2000);
  };

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem("dashboard-theme", nextTheme);
    applyTheme(nextTheme);
  };

  const handleNotificationSave = () => {
    localStorage.setItem("dashboard-notifications", JSON.stringify(notifications));
    setNotificationMessage("Notification preferences updated.");
    setTimeout(() => setNotificationMessage(""), 2000);
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).finally(() => {
      window.location.href = "/logout";
    });
  };

  const handleDeleteAccount = () => {
    const approved = window.confirm(
      "Are you sure you want to delete this account permanently?"
    );
    if (approved) {
      alert("Account deletion flow would happen here.");
    }
  };

  return (
    <div className="mr-5 mx-auto flex max-w-6xl flex-col gap-6 p-4 pr-6 text-slate-900 dark:text-slate-100 md:p-6 md:pr-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Adjust your profile, security, theme, and notification preferences.
        </p>
      </section>

      <ProfileSection
        profile={profile}
        onChange={setProfile}
        onSave={handleProfileSave}
        message={profileMessage}
        loading={profileLoading}
      />

      <SecuritySection
        passwords={passwords}
        onChange={setPasswords}
        onSave={handlePasswordSave}
        message={passwordMessage}
      />

      <ThemeSection theme={theme} onChange={handleThemeChange} />

      <NotificationsSection
        notifications={notifications}
        onToggle={handleToggleNotification}
        onSave={handleNotificationSave}
        message={notificationMessage}
      />

      <AccountSection
        role={profile.role}
        onLogout={handleLogout}
        onDeleteAccount={isAdmin ? handleDeleteAccount : null}
      />
    </div>
  );
}

function ProfileSection({ profile, onChange, onSave, message, loading }) {
  const handleInput = (key, value) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={profile.name}
            onChange={(e) => handleInput("name", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) => handleInput("email", e.target.value)}
            placeholder="you@school.com"
          />
        </div>
        <div className="space-y-1">
          <Label>Profile Photo URL (optional)</Label>
          <Input
            value={profile.avatar}
            onChange={(e) => handleInput("avatar", e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        <div className="space-y-1">
          <Label>Role</Label>
          <Input value={profile.role || "N/A"} readOnly />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {message && (
          <span className="text-sm text-emerald-600">{message}</span>
        )}
        <Button onClick={onSave} className="w-full sm:w-auto" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SecuritySection({ passwords, onChange, onSave, message }) {
  const handleInput = (key, value) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Update your password regularly.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>Current Password</Label>
          <Input
            type="password"
            value={passwords.current}
            onChange={(e) => handleInput("current", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>New Password</Label>
          <Input
            type="password"
            value={passwords.next}
            onChange={(e) => handleInput("next", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={passwords.confirm}
            onChange={(e) => handleInput("confirm", e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {message && <span className="text-sm text-rose-600">{message}</span>}
        <Button onClick={onSave} className="w-full sm:w-auto">
          Update Password
        </Button>
      </CardFooter>
    </Card>
  );
}

function ThemeSection({ theme, onChange }) {
  const options = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "System" },
  ];

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how the dashboard looks.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              theme === option.id
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30"
                : "border-slate-200 hover:border-blue-400 dark:border-slate-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function NotificationsSection({ notifications, onToggle, onSave, message }) {
  const entries = [
    {
      key: "email",
      label: "Email notifications",
      description: "Receive updates in your inbox.",
    },
    {
      key: "alerts",
      label: "System alerts",
      description: "Get notified about important system changes.",
    },
    {
      key: "messages",
      label: "Message notifications",
      description: "Alert me when a teacher or student sends a message.",
    },
  ];

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Control how we keep you informed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.key}
            className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{entry.label}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {entry.description}
              </p>
            </div>
            <Button
              variant={notifications[entry.key] ? "default" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => onToggle(entry.key)}
            >
              {notifications[entry.key] ? "Enabled" : "Disabled"}
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {message && (
          <span className="text-sm text-emerald-600">{message}</span>
        )}
        <Button onClick={onSave} className="w-full sm:w-auto">
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

function AccountSection({ role, onLogout, onDeleteAccount }) {
  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
        <CardDescription>
          Manage session and account lifecycle options.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onLogout}>
          Logout
        </Button>
        {onDeleteAccount && (
          <Button variant="destructive" onClick={onDeleteAccount}>
            Delete account ({role || "unknown"})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
