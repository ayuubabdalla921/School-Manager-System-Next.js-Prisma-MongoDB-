import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Users, GraduationCap, BookOpen, LibraryBig, Bell, Settings } from "lucide-react";
import StatsCard from "./components/StatsCard";
import AttendanceChart from "./components/AttendanceChart";
import StudentsPerClassChart from "./components/StudentsPerClassChart";

export const dynamic = "force-dynamic";

async function getAdminData() {
  const [totalStudents, totalTeachers, totalClasses, totalSubjects, classCounts] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { students: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

  return {
    stats: [
      { key: "students", title: "Total Students", value: totalStudents },
      { key: "teachers", title: "Total Teachers", value: totalTeachers },
      { key: "classes", title: "Total Classes", value: totalClasses },
      { key: "subjects", title: "Total Subjects", value: totalSubjects },
    ],
    classChartData: classCounts.map((cls) => ({
      name: cls.name,
      students: cls._count.students,
    })),
  };
}

const iconMap = {
  students: Users,
  teachers: GraduationCap,
  classes: BookOpen,
  subjects: LibraryBig,
};

const attendanceTrend = [
  { month: "Jan", present: 42, absent: 6 },
  { month: "Feb", present: 40, absent: 7 },
  { month: "Mar", present: 44, absent: 4 },
  { month: "Apr", present: 41, absent: 5 },
  { month: "May", present: 43, absent: 4 },
  { month: "Jun", present: 39, absent: 8 },
];

export default async function AdminOverviewPage() {
  const { stats, classChartData } = await getAdminData();

  return (
    <div className="mr-5 mx-auto max-w-6xl  space-y-8 p-4 pr-6 text-slate-900 transition-colors dark:text-slate-100 md:p-6 md:pr-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Admin Overview
          </p>
          <h1 className="text-2xl font-semibold">System summary and insights</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.key}
            title={stat.title}
            value={new Intl.NumberFormat().format(stat.value)}
            change="+0 this month"
            icon={iconMap[stat.key]}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <AttendanceChart data={attendanceTrend} />
        <StudentsPerClassChart data={classChartData} />
      </section>
    </div>
  );
}
