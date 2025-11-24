"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import TeacherTable from "./components/TeacherTable";
import AddTeacherForm from "./components/AddTeacherForm";
import EditTeacherForm from "./components/EditTeacherForm";
import DeleteTeacherDialog from "./components/DeleteTeacherDialog";

const PAGE_SIZE = 10;

export default function TeacherPanelPage() {
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search,
      });
      const res = await fetch(`/api/teachers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load teachers");
      setTeachers(data.data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      setTeachers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setEditOpen(true);
  };

  const handleDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setDeleteOpen(true);
  };

  const refresh = () => {
    loadTeachers();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 py-4 text-slate-900 transition-colors dark:text-slate-100 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Teacher Panel
          </p>
          <h1 className="text-2xl font-semibold">Manage teacher roster</h1>
        </div>
        <Button onClick={() => setAddOpen(true)}>Add Teacher</Button>
      </div>

      <TeacherTable
        data={teachers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearch={handleSearch}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddTeacherForm
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={refresh}
      />

      <EditTeacherForm
        open={editOpen}
        onOpenChange={setEditOpen}
        teacher={selectedTeacher}
        onSuccess={refresh}
      />

      <DeleteTeacherDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        teacher={selectedTeacher}
        onSuccess={refresh}
      />
    </div>
  );
}
