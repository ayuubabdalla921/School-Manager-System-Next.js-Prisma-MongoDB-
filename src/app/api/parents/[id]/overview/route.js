import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const parentId = params?.id;
    if (!parentId) {
      return NextResponse.json(
        { error: "Parent id is required" },
        { status: 400 }
      );
    }

    const parent = await prisma.user.findUnique({
      where: { id: parentId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    if (parent.role !== "PARENT") {
      return NextResponse.json(
        { error: "User is not registered as a parent" },
        { status: 400 }
      );
    }

    const links = await prisma.parentLink.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentClasses: {
              take: 1,
              include: {
                class: { select: { id: true, name: true, level: true } },
              },
            },
          },
        },
      },
    });

    const children = links.map((link) => {
      const { student } = link;
      const classInfo = student.studentClasses[0]?.class || null;
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        class: classInfo,
      };
    });

    const studentIds = children.map((child) => child.id);
    const attendanceMap = {};

    if (studentIds.length) {
      studentIds.forEach((id) => {
        attendanceMap[id] = { present: 0, total: 0 };
      });

      const attendanceRecords = await prisma.attendance.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: { date: "desc" },
        take: studentIds.length * 10,
      });

      attendanceRecords.forEach((record) => {
        const stats = attendanceMap[record.studentId];
        if (!stats) return;
        stats.total += 1;
        if (record.status?.toUpperCase() === "PRESENT") {
          stats.present += 1;
        }
      });
    }

    const paymentsWhere =
      studentIds.length > 0
        ? {
            OR: [{ parentId }, { studentId: { in: studentIds } }],
          }
        : { parentId };

    const payments = await prisma.payment.findMany({
      where: paymentsWhere,
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { student: { select: { id: true, name: true } } },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: parentId }, { receiverId: parentId }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({
      parent,
      children: children.map((child) => ({
        ...child,
        attendance: attendanceMap[child.id] || { present: 0, total: 0 },
      })),
      payments,
      messages,
    });
  } catch (error) {
    console.error("Parent overview error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
