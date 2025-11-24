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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, UploadCloud } from "lucide-react";
import {
  persistSessionUser,
  readSessionUser,
} from "@/lib/client-session";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentUser = readSessionUser();
    if (!currentUser?.id) {
      router.replace("/login");
      return;
    }
    setSessionUser(currentUser);
  }, [router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!sessionUser?.id) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/users/${sessionUser.id}`, {
          credentials: "include",
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load your profile.");
        }
        setProfile(payload);
        setAvatarUrl(payload?.avatarUrl || "");
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [sessionUser]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || "";
      setAvatarUrl(result);
      setError("");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!sessionUser?.id) return;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const response = await fetch(`/api/users/${sessionUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ avatarUrl }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update profile.");
      }
      setProfile(payload);
      setStatus("Profile image updated successfully.");
      persistSessionUser({ ...sessionUser, avatarUrl: payload?.avatarUrl || "" });
      setSessionUser((prev) => ({
        ...prev,
        avatarUrl: payload?.avatarUrl || "",
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (!sessionUser) {
    return null;
  }

  return (
    <div className="mr-5 mx-auto max-w-3xl space-y-6 p-4 pr-6 text-slate-900 dark:text-slate-100 md:p-6 md:pr-10">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Profile
        </p>
        <h1 className="text-2xl font-semibold">Manage your account</h1>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {status && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {status}
        </p>
      )}

      <Card className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
          <CardDescription>
            Upload a new image or paste an existing image URL. We support PNG,
            JPG, and GIF formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="flex items-center gap-4">
                <Avatar className="size-20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile preview" />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {sessionUser?.name
                      ?.split(" ")
                      .map((chunk) => chunk.charAt(0))
                      .join("")
                      .toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-slate-500">
                  <p>{profile?.name}</p>
                  <p>{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-url">Image URL</Label>
                <Input
                  id="avatar-url"
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-upload">Upload image</Label>
                <div className="flex flex-wrap gap-3">
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-slate-500">
                    Select a local file (max 2MB recommended).
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/60">
        <CardHeader>
          <CardTitle>Tips</CardTitle>
          <CardDescription>
            Recommended image size is 256x256px. Use JPG or PNG for best
            quality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-3">
            <UploadCloud className="mt-1 h-4 w-4 flex-shrink-0" />
            <p>Uploading replaces the current profile photo immediately.</p>
          </div>
          <div className="flex items-start gap-3">
            <Save className="mt-1 h-4 w-4 flex-shrink-0" />
            <p>Changes sync across the dashboard and navigation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
