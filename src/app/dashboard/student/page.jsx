// === FULL FILE START ===
// NOTE: Logic lama beddelin — kaliya UI classes ayaa la qurxiyey.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readSessionUser } from "@/lib/client-session";
import { Loader2, RefreshCcw } from "lucide-react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import StudentTable from "./components/StudentTable";
import AddStudentForm from "./components/AddStudentForm";
import EditStudentForm from "./components/EditStudentForm";
import DeleteStudentDialog from "./components/DeleteStudentDialog";

const STATUS_COLORS = {
  PRESENT: "bg-emerald-100 text-emerald-800",
  ABSENT: "bg-rose-100 text-rose-800",
  LATE: "bg-amber-100 text-amber-800",
  EXCUSED: "bg-blue-100 text-blue-800",
};

const extractPayloadArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.messages)) return payload.messages;
  return [];
};

const PAGE_SIZE = 10;

export default function StudentPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState(() => readSessionUser());

  useEffect(() => {
    if (!sessionUser) {
      router.replace("/login");
    }
  }, [router, sessionUser]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleUpdate = () => {
      setSessionUser(readSessionUser());
    };
    window.addEventListener("session-user:updated", handleUpdate);
    return () => {
      window.removeEventListener("session-user:updated", handleUpdate);
    };
  }, []);

  if (!sessionUser) {
    return null;
  }

  const role = sessionUser.role?.toUpperCase();
  if (role === "STUDENT") {
    return <StudentSelfDashboard sessionUser={sessionUser} />;
  }

  return <StudentManagementPanel />;
}

// ==============================
// === MANAGEMENT PANEL UI ====
// ==============================

function StudentManagementPanel() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        search,
      });
      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      setStudents(data.data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      setStudents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/classes?page=1&pageSize=1000");
        if (!res.ok) return;
        const data = await res.json();
        setClasses(data.data ?? []);
      } catch (err) {
        console.error(err);
      }
    }
    loadClasses();
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setEditOpen(true);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  const refresh = () => {
    loadStudents();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Student Panel
          </p>
          <h1 className="text-2xl font-semibold">Manage student records</h1>
        </div>
        <Button className="rounded-lg" onClick={() => setAddOpen(true)}>
          Add Student
        </Button>
      </div>

      <StudentTable
        data={students}
        loading={loading}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearch={handleSearch}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddStudentForm
        open={addOpen}
        onOpenChange={setAddOpen}
        classes={classes}
        onSuccess={refresh}
      />

      <EditStudentForm
        open={editOpen}
        onOpenChange={setEditOpen}
        student={selectedStudent}
        classes={classes}
        onSuccess={refresh}
      />

      <DeleteStudentDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        student={selectedStudent}
        onSuccess={refresh}
      />
    </div>
  );
}

// ============================
// === STUDENT SELF DASH =====
// ============================

function StudentSelfDashboard({ sessionUser }) {
  const [profile, setProfile] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const hydrateDashboard = useCallback(async (studentId) => {
    if (!studentId) return;
    setError("");
    setIsRefreshing(true);
    try {
      const [profileRes, attendanceRes, messageRes] = await Promise.all([
        fetch(`/api/students/${studentId}`, { credentials: "include" }),
        fetch(`/api/attendance/student/${studentId}`, {
          credentials: "include",
        }),
        fetch(`/api/messages/student/${studentId}`, {
          credentials: "include",
        }),
      ]);

      const profilePayload = await profileRes.json().catch(() => ({}));
      if (!profileRes.ok) {
        throw new Error(profilePayload?.error || "Failed to load profile.");
      }
      const profileData =
        profilePayload?.data ??
        profilePayload?.student ??
        profilePayload ??
        null;
      setProfile(profileData);

      const attendancePayload = await attendanceRes.json().catch(() => ({}));
      if (!attendanceRes.ok) {
        throw new Error(
          attendancePayload?.error || "Failed to load attendance."
        );
      }
      setAttendanceSummary(
        attendancePayload?.data ?? attendancePayload ?? null
      );

      const messagePayload = await messageRes.json().catch(() => ({}));
      if (!messageRes.ok) {
        throw new Error(messagePayload?.error || "Failed to load messages.");
      }
      setMessages(extractPayloadArray(messagePayload));

      if (profileData?.classId) {
        const subjectsRes = await fetch(
          `/api/classes/${profileData.classId}/subjects`,
          { credentials: "include" }
        );
        const subjectsPayload = await subjectsRes.json().catch(() => ({}));
        if (!subjectsRes.ok) {
          throw new Error(
            subjectsPayload?.error || "Failed to load subjects."
          );
        }
        setSubjects(extractPayloadArray(subjectsPayload));
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionUser?.id) return;
    hydrateDashboard(sessionUser.id);
  }, [sessionUser, hydrateDashboard]);

  const todayStatus =
    (attendanceSummary?.todayStatus || profile?.todayStatus || "PENDING")
      ?.toString()
      .toUpperCase();

  const statusClasses =
    STATUS_COLORS[todayStatus] || "bg-slate-100 text-slate-700";

  const attendanceChartData = useMemo(() => {
    const present = Number(attendanceSummary?.presentPercentage ?? 0);
    const absent = Number(attendanceSummary?.absentPercentage ?? 0);
    return [
      { name: "Present", value: present, fill: "#16a34a" },
      { name: "Absent", value: absent, fill: "#dc2626" },
    ];
  }, [attendanceSummary]);

  const upcomingMessages = useMemo(() => messages.slice(0, 4), [messages]);

  const handleRefresh = () => {
    if (sessionUser?.id) {
      hydrateDashboard(sessionUser.id);
    }
  };

  const renderLoader = () => (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Student Dashboard
          </p>
          <h1 className="text-2xl font-semibold">
            Welcome back, {sessionUser?.name || "Student"}
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={handleRefresh}
          disabled={isRefreshing || !sessionUser?.id}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh data
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        renderLoader()
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-all rounded-xl dark:border-slate-800 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-xl">{profile?.name}</CardTitle>
                <CardDescription>Your learning overview</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">Class</p>
                  <p className="text-lg font-semibold">
                    {profile?.className || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    Roll number
                  </p>
                  <p className="text-lg font-semibold">
                    {profile?.rollNumber || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Today</p>
                  <Badge className={`rounded-md px-3 py-1 ${statusClasses}`}>
                    {todayStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-all rounded-xl dark:border-slate-800 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle>Attendance summary</CardTitle>
                <CardDescription>
                  Updated daily from homeroom submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-500">Overall rate</p>
                  <p className="text-3xl font-semibold">
                    {Number(
                      attendanceSummary?.presentPercentage ?? 0
                    ).toFixed(1)}
                    %
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Present</span>
                      <span className="font-medium text-emerald-600">
                        {Number(
                          attendanceSummary?.presentPercentage ?? 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Absent</span>
                      <span className="font-medium text-rose-600">
                        {Number(
                          attendanceSummary?.absentPercentage ?? 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-40 w-full rounded-lg bg-white/50 dark:bg-slate-900/30 shadow-inner p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={attendanceChartData}
                      innerRadius="40%"
                      outerRadius="90%"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        tick={false}
                      />
                      <RadialBar dataKey="value" cornerRadius={6} background />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-all rounded-xl dark:border-slate-800 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>
                  Lessons assigned to your class and instructors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    Subject list is not available yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead className="text-right">Schedule</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow
                          key={subject.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {subject.name}
                          </TableCell>
                          <TableCell>
                            {subject.teacherName ||
                              subject.teacher?.name ||
                              "--"}
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-500">
                            {subject.schedule || subject.day || "TBD"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-all rounded-xl dark:border-slate-800 dark:bg-slate-900/60">
              <CardHeader>
                <CardTitle>Recent messages</CardTitle>
                <CardDescription>
                  Direct notes from your teachers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMessages.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    No new messages.
                  </p>
                ) : (
                  upcomingMessages.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-lg border border-slate-200 bg-white dark:bg-slate-900/80 p-3 text-sm shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {message.subject || "Message"}
                          </p>
                          <p className="text-xs text-slate-500">
                            from{" "}
                            {message.senderName ||
                              message.teacher?.name ||
                              "Faculty"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDateLabel(
                            message.createdAt || message.sentAt
                          )}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-3 text-slate-600 dark:text-slate-300">
                        {message.preview ||
                          message.body ||
                          "Open the inbox to read this message."}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

const formatDateLabel = (value) => {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// === FULL FILE END ===
