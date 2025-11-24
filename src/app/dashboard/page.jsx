import DashboardCard from "@/components/DashboardCard/DashboardCard";
import prisma from "@/lib/prisma";
import {
  Users,
  GraduationCap,
  BookOpen,
  LibraryBig,
} from "lucide-react";
import RoleDashboard from "./components/RoleDashboard";

export default async function DashboardHome() {
  const [students, teachers, classes, subjects] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.class.count(),
    prisma.subject.count(),
  ]);

  const cards = [
    {
      title: "Total Students",
      value: students,
      icon: Users,
      description: "Active enrolments across all classes",
    },
    {
      title: "Total Teachers",
      value: teachers,
      icon: GraduationCap,
      description: "Core & adjunct faculty members",
    },
    {
      title: "Classes",
      value: classes,
      icon: BookOpen,
      description: "Scheduled homerooms this term",
    },
    {
      title: "Subjects",
      value: subjects,
      icon: LibraryBig,
      description: "Unique subjects offered",
    },
  ];

  return (
    <div className="space-y-6 px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Overview
        </p>
        <h1 className="text-2xl font-semibold">School snapshot</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      <RoleDashboard />
    </div>
  );
}
