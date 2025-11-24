"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export default function EditTeacherForm({ open, setOpen, teacher, refresh }) {
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (teacher) setForm({ name: teacher.name, email: teacher.email });
  }, [teacher]);

  const update = async () => {
    const res = await fetch(`/api/teachers/${teacher.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast({ title: "Teacher updated!" });
      refresh();
      setOpen(false);
    } else {
      toast({ title: "Error updating!", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
          />

          <Input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
          />

          <Button className="w-full" onClick={update}>
            Update Teacher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
