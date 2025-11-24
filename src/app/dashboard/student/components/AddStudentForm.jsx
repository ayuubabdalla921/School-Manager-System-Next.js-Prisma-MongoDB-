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

export default function AddStudentForm({
  open,
  onOpenChange,
  classes,
  onSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    classId: "",
    dateOfBirth: "",
    parentContact: "",
    address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [classOptions, setClassOptions] = useState(classes ?? []);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    setClassOptions(classes ?? []);
  }, [classes]);

  useEffect(() => {
    if (!open || (classes ?? []).length > 0) {
      setLoadingClasses(false);
      return;
    }
    let isActive = true;
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await fetch("/api/classes?page=1&pageSize=1000", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isActive) return;
        setClassOptions(data.data ?? []);
      } catch (err) {
        if (isActive) {
          console.error("Unable to load classes", err);
        }
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
    return () => {
      isActive = false;
    };
  }, [classes, open]);

  const disableSubmit = useMemo(() => {
    if (submitting) return true;
    if (classOptions.length === 0) return true;
    return false;
  }, [submitting, classOptions.length]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.classId) {
      setError("Name, email and class are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add student");

      setForm({
        name: "",
        email: "",
        phone: "",
        gender: "",
        classId: "",
        dateOfBirth: "",
        parentContact: "",
        address: "",
      });

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
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>Create a new student profile.</DialogDescription>
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

          {/* 🔵 DATE OF BIRTH */}
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            className="w-full"
          />

          {/* 🔵 PARENT CONTACT */}
          <Input
            placeholder="Parent contact number"
            value={form.parentContact}
            onChange={(e) => handleChange("parentContact", e.target.value)}
          />

          {/* 🔵 ADDRESS */}
          <Input
            placeholder="Home address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          {/* GENDER */}
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

          {/* CLASS SELECT */}
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

          <Button type="submit" className="w-full" disabled={disableSubmit}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
