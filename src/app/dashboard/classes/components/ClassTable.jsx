"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const columnHelper = createColumnHelper();

export default function ClassTable({
  data,
  loading,
  error,
  page,
  totalPages,
  search,
  onSearch,
  onPageChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Class Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("level", {
        header: "Level",
        cell: (info) => info.getValue() || "--",
      }),
      columnHelper.accessor((row) => row.teacher?.name ?? "Unassigned", {
        id: "teacher",
        header: "Assigned Teacher",
      }),
      columnHelper.accessor("studentCount", {
        header: "Students",
        cell: (info) => info.getValue() ?? 0,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(info.row.original)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(info.row.original)}
            >
              Delete
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/60">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Classes</h2>
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name, level or teacher..."
            className="w-full sm:max-w-md"
          />
        </div>
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-6 text-center">
                    Loading classes...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-6 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-6 text-center">
                    No classes found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-slate-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {loading ? (
            <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
              Loading classes...
            </p>
          ) : error ? (
            <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-red-600">
              {error}
            </p>
          ) : data.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
              No classes found.
            </p>
          ) : (
            data.map((cls) => (
              <div
                key={cls.id}
                className="rounded-lg border border-slate-200 p-4 shadow-sm dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cls.name}</p>
                    <p className="text-xs text-slate-500">
                      Level: {cls.level || "N/A"}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {cls.studentCount ?? 0} students
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Teacher: {cls.teacher?.name || "Unassigned"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(cls)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => onDelete(cls)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {Math.max(totalPages, 1)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
