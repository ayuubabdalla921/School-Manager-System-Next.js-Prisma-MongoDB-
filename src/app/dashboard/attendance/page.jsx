"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import AttendanceForm from "./components/AttendanceForm";
import StudentAttendanceTable from "./components/StudentAttendanceTable";

export default function AttendancePage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceLocked, setAttendanceLocked] = useState(false);
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [exportingFormat, setExportingFormat] = useState("");

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/classes?page=1&pageSize=1000", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          const classList = data.data ?? [];
          setClasses(classList);
          if (classList.length && !selectedClassId) {
            setSelectedClassId(classList[0].id);
          }
        }
      } catch (error) {
        console.error("Unable to load classes", error);
      }
    }
    loadClasses();
  }, []);

  const loadStudents = useCallback(async () => {
    if (!selectedClassId) {
      setStudents([]);
      setStatuses({});
      return;
    }
    setLoadingStudents(true);
    setFeedback("");
    setAttendanceLocked(false);
    try {
      const res = await fetch(`/api/students?classId=${selectedClassId}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      const list = data.data ?? data ?? [];
      setStudents(list);
      const initialStatuses = {};
      list.forEach((student) => {
        initialStatuses[student.id] = "PRESENT";
      });
      setStatuses(initialStatuses);
    } catch (error) {
      console.error(error);
      setStudents([]);
      setStatuses({});
      setFeedback(error.message);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const checkAttendance = useCallback(async () => {
    if (!selectedClassId || !date) {
      setAttendanceLocked(false);
      return;
    }
    setCheckingAttendance(true);
    try {
      const res = await fetch(
        `/api/attendance/check?classId=${selectedClassId}&date=${date}`,
        { cache: "no-store", credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        const recorded =
          Boolean(data?.recorded) ||
          Boolean(data?.alreadyExists) ||
          Boolean(data?.isRecorded) ||
          Boolean(data?.records?.length);
        setAttendanceLocked(recorded);
        setFeedback(
          recorded ? "Attendance already recorded for this date." : ""
        );
      } else {
        setAttendanceLocked(false);
      }
    } catch (error) {
      console.error(error);
      setAttendanceLocked(false);
      setFeedback("Unable to verify attendance status.");
    } finally {
      setCheckingAttendance(false);
    }
  }, [selectedClassId, date]);

  useEffect(() => {
    checkAttendance();
  }, [checkAttendance]);

  const handleStatusChange = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClassId || !students.length) {
      setFeedback("No students to record.");
      return;
    }
    setSubmitting(true);
    setFeedback("");
    try {
      const payload = {
        date,
        classId: selectedClassId,
        records: Object.entries(statuses).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      };
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit attendance");
      setAttendanceLocked(true);
      setFeedback("Attendance recorded successfully.");
    } catch (error) {
      console.error(error);
      setFeedback(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId),
    [classes, selectedClassId]
  );

  const { statusText, statusVariant } = useMemo(() => {
    if (checkingAttendance) {
      return { statusText: "Checking...", statusVariant: "outline" };
    }
    if (attendanceLocked) {
      return { statusText: "Recorded", statusVariant: "secondary" };
    }
    if (selectedClassId) {
      return { statusText: "Ready", statusVariant: "default" };
    }
    return { statusText: "Select class", statusVariant: "outline" };
  }, [attendanceLocked, checkingAttendance, selectedClassId]);

  useEffect(() => {
    if (!attendanceLocked && feedback === "Attendance recorded successfully.") {
      setFeedback("");
    }
  }, [attendanceLocked, feedback]);

  const inputsDisabled = checkingAttendance || submitting;
  const submitDisabled =
    submitting ||
    checkingAttendance ||
    !students.length ||
    loadingStudents;

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    if (!students.length) {
      setFeedback("No students to export.");
      return;
    }
    try {
      setExportingFormat(format);
      const rows = students.map((student, index) => ({
        number: index + 1,
        name: student.name || "N/A",
        email: student.email || "N/A",
        status: (statuses[student.id] || "PRESENT").toUpperCase(),
      }));
      const baseName = `${selectedClass?.name || "class"}-${date}-attendance`;
      if (format === "csv") {
        const header = "No,Name,Email,Status";
        const csv = [
          header,
          ...rows.map(
            (row) =>
              `${row.number},"${row.name.replace(/"/g, '""')}","${
                row.email
              }","${row.status}"`
          ),
        ].join("\n");
        const blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });
        downloadBlob(blob, `${baseName}.csv`);
      } else {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Attendance Report", 14, 18);
        doc.setFontSize(11);
        doc.text(`Class: ${selectedClass?.name || "-"}`, 14, 28);
        doc.text(`Date: ${date}`, 14, 34);
        let posY = 46;
        rows.forEach((row) => {
          if (posY > 280) {
            doc.addPage();
            posY = 20;
          }
          doc.text(
            `${row.number}. ${row.name}  |  ${row.email}  |  ${row.status}`,
            14,
            posY
          );
          posY += 8;
        });
        doc.save(`${baseName}.pdf`);
      }
    } catch (error) {
      console.error(error);
      setFeedback("Failed to export data. Please try again.");
    } finally {
      setExportingFormat("");
    }
  };

  return (
    <div className="mr-5 mx-auto max-w-6xl space-y-6 p-4 pr-6 text-slate-900 transition-colors dark:text-slate-100 md:p-6 md:pr-10">
      <AttendanceForm
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={setSelectedClassId}
        date={date}
        onDateChange={setDate}
        statusText={statusText}
        statusVariant={statusVariant}
        onSubmit={handleSubmit}
        submitting={submitting}
        inputsDisabled={inputsDisabled}
        submitDisabled={submitDisabled}
        helperText={feedback}
      />

      <StudentAttendanceTable
        students={students}
        statuses={statuses}
        onStatusChange={handleStatusChange}
        disabled={attendanceLocked || submitting || checkingAttendance}
        loading={loadingStudents}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("csv")}
          disabled={exportingFormat === "pdf" || !students.length}
        >
          {exportingFormat === "csv" ? "Generating..." : "Export CSV"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("pdf")}
          disabled={exportingFormat === "csv" || !students.length}
        >
          {exportingFormat === "pdf" ? "Generating..." : "Export PDF"}
        </Button>
      </div>
    </div>
  );
}
