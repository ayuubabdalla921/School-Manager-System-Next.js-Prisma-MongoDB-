import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [studentsCount, teachersCount, classesCount, subjectsCount] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.class.count(),
        prisma.subject.count(),
      ]);

    const latestStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        studentClasses: {
          take: 1,
          select: {
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const latestMessages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    const stats = [
      {
        title: "Total Students",
        value: studentsCount,
        change: "+32 this month",
        key: "students",
      },
      {
        title: "Total Teachers",
        value: teachersCount,
        change: "+3 this month",
        key: "teachers",
      },
      {
        title: "Total Classes",
        value: classesCount,
        change: "+1 this month",
        key: "classes",
      },
      {
        title: "Total Subjects",
        value: subjectsCount,
        change: "+6 this month",
        key: "subjects",
      },
    ];

    return NextResponse.json({
      stats,
      latestStudents: latestStudents.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        class: student.studentClasses[0]?.class?.name ?? "Unassigned",
        registered: student.createdAt,
        status: "Active",
      })),
      latestMessages: latestMessages.map((message) => ({
        id: message.id,
        sender: message.sender?.name ?? "Unknown",
        preview: message.content.slice(0, 60),
        time: message.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
