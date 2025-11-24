"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function DeleteClassDialog({
  open,
  onOpenChange,
  classData,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingClass, setPendingClass] = useState(null);

  useEffect(() => {
    if (open && classData) {
      setPendingClass(classData);
    }
    if (!open) {
      setPendingClass(null);
      setError("");
      setSubmitting(false);
    }
  }, [open, classData]);

  const handleDelete = async () => {
    const classId = pendingClass?.id || pendingClass?._id;
    if (!classId) {
      setError("Class id is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(classId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete class");
      onOpenChange(false);
      onSuccess?.(classId);
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
          <DialogTitle>Delete Class</DialogTitle>
          <DialogDescription>
            This will permanently remove {pendingClass?.name ?? "this class"}.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={!pendingClass || submitting}
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
