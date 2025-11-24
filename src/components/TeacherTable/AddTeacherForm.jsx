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

const DEFAULT_FORM = { name: "", email: "", password: "" };

export default function AddTeacherForm({ open, setOpen, refresh }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Error creating teacher");
      }

      toast({ title: "Teacher created successfully!" });
      refresh();
      setOpen(false);
      setForm(DEFAULT_FORM);
    } catch (error) {
      toast({
        title: error?.message || "Error creating teacher",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Teacher name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <Button
            className="w-full"
            onClick={submit}
            disabled={loading || !form.name || !form.email || !form.password}
          >
            {loading ? "Creating..." : "Create Teacher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
