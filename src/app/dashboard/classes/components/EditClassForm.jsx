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

export default function EditClassForm({
  open,
  onOpenChange,
  classData,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    level: "",
    teacherId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (classData) {
      setForm({
        name: classData.name ?? "",
        level: classData.level ?? "",
        teacherId: classData.teacher?.id ?? "",
      });
    }
  }, [classData]);

  useEffect(() => {
    let active = true;
    if (!open) {
      setTeacherOptions([]);
      setLoadError("");
      return;
    }
    setLoadError("");
    const loadTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const res = await fetch("/api/teachers?page=1&pageSize=1000", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) throw new Error(data.error || "Failed to load teachers");
        setTeacherOptions(data.data ?? data ?? []);
      } catch (err) {
        if (!active) return;
        console.error(err);
        setTeacherOptions([]);
        setLoadError(err.message || "Unable to load teachers.");
      } finally {
        if (active) {
          setLoadingTeachers(false);
        }
      }
    };
    loadTeachers();
    return () => {
      active = false;
    };
  }, [open]);

  const disableSubmit = useMemo(() => {
    return (
      submitting ||
      loadingTeachers ||
      teacherOptions.length === 0 ||
      !classData
    );
  }, [submitting, loadingTeachers, teacherOptions.length, classData]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classData) return;
    if (!form.name || !form.teacherId) {
      setError("Class name and teacher are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/classes/${classData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update class");
      const normalized = {
        id: data.id,
        name: data.name,
        level: data.level,
        teacher: data.teacher,
        studentCount: data.studentCount ?? classData?.studentCount ?? 0,
      };
      onOpenChange(false);
      onSuccess?.(normalized);
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
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>Modify class details.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Class name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <Input
            placeholder="Level (optional)"
            value={form.level}
            onChange={(e) => handleChange("level", e.target.value)}
          />
          {teacherOptions.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
              {loadingTeachers
                ? "Loading teachers..."
                : loadError || "No teachers available yet. Create a teacher first."}
            </p>
          ) : (
            <select
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={form.teacherId}
              onChange={(e) => handleChange("teacherId", e.target.value)}
              required
            >
              <option value="">Select teacher</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={disableSubmit}>
            {submitting
              ? "Saving..."
              : loadingTeachers
              ? "Loading teachers..."
              : "Update"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
