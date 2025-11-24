"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function DeleteTeacherDialog({ open, setOpen, teacher, refresh }) {
  const remove = async () => {
    const res = await fetch(`/api/teachers/${teacher.id}`, { method: "DELETE" });

    if (res.ok) {
      toast({ title: "Teacher deleted" });
      refresh();
      setOpen(false);
    } else {
      toast({ title: "Error deleting", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
        </DialogHeader>

        <p>Are you sure you want to delete {teacher?.name}?</p>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={remove}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
