"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function EditTeacherForm({ open, setOpen, teacher, refresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!teacher?.id) {
      setError("Select a teacher to update.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
    };

    if (!payload.name || !payload.email) {
      setError("Name and email are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Error updating teacher");
      }

      toast({ title: "Teacher updated!" });
      refresh();
      setOpen(false);
    } catch (err) {
      setError(err?.message || "Unable to update teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>

        <form
          key={teacher?.id || "edit-teacher"}
          className="space-y-3"
          onSubmit={handleSubmit}
        >
          <Input
            name="name"
            placeholder="Teacher name"
            defaultValue={teacher?.name ?? ""}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={teacher?.email ?? ""}
          />

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Teacher"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
