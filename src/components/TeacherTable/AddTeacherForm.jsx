"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function AddTeacherForm({ open, setOpen, refresh }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/teachers", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast({ title: "Teacher created successfully!" });
      refresh();
      setOpen(false);
      setForm({ name: "", email: "", password: "" });
    } else {
      toast({ title: "Error creating teacher", variant: "destructive" });
    }

    setLoading(false);
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
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create Teacher"}
