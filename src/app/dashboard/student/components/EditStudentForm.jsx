"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditStudentForm({
  open,
  onOpenChange,
  student,
  classes,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    classId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [classOptions, setClassOptions] = useState(classes ?? []);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name ?? "",
        email: student.email ?? "",
        phone: student.phone ?? "",
        gender: student.gender ?? "",
        classId: student.class?.id ?? "",
      });
    }
  }, [student]);

  useEffect(() => {
    setClassOptions(classes ?? []);
  }, [classes]);

  useEffect(() => {
    if ((classes ?? []).length > 0) {
      return;
    }
    let active = true;
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await fetch("/api/classes?page=1&pageSize=1000", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setClassOptions(data.data ?? []);
      } catch (err) {
        console.error("Unable to load classes", err);
      } finally {
        if (active) {
          setLoadingClasses(false);
        }
      }
    };
    loadClasses();
    return () => {
      active = false;
    };
  }, [classes]);

  const disableSubmit = useMemo(() => {
    return submitting || loadingClasses || classOptions.length === 0 || !student;
  }, [submitting, loadingClasses, classOptions.length, student]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;
    if (!form.name || !form.email || !form.classId) {
      setError("Name, email and class are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update student");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update this student information.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <select
            className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {classOptions.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
              {loadingClasses
                ? "Loading classes..."
                : "No classes available yet. Create a class first."}
            </p>
          ) : (
            <select
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={form.classId}
              onChange={(e) => handleChange("classId", e.target.value)}
              required
            >
              <option value="">Select class</option>
              {classOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={disableSubmit}
          >
            {submitting
              ? "Saving..."
              : loadingClasses
              ? "Loading classes..."
              : "Update"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
