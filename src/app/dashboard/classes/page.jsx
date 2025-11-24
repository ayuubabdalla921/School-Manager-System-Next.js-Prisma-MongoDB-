"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import ClassTable from "./components/ClassTable";
import AddClassForm from "./components/AddClassForm";
import EditClassForm from "./components/EditClassForm";
import DeleteClassDialog from "./components/DeleteClassDialog";

const PAGE_SIZE = 10;

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      search: search.trim(),
    });
    return params.toString();
  }, [page, search]);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/classes?${queryString}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load classes");
      setClasses(data.data ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setClasses([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (cls) => {
    setSelectedClass(cls);
    setEditOpen(true);
  };

  const handleDelete = (cls) => {
    setSelectedClass(cls);
    setDeleteOpen(true);
  };

  const refresh = useCallback(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCreateSuccess = (createdClass) => {
    refresh();
  };

  const handleEditSuccess = (updatedClass) => {
    refresh();
  };

  const handleDeleteSuccess = (deletedId) => {
    refresh();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 py-4 text-slate-900 transition-colors dark:text-slate-100 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Class Management
          </p>
          <h1 className="text-2xl font-semibold">
            Add, edit or remove classes directly from this page.
          </h1>
        </div>
        <Button onClick={() => setAddOpen(true)}>New Class</Button>
      </div>

      <ClassTable
        data={classes}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearch={handleSearch}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddClassForm
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditClassForm
        open={editOpen}
        onOpenChange={setEditOpen}
        classData={selectedClass}
        onSuccess={handleEditSuccess}
      />

      <DeleteClassDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        classData={selectedClass}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
