import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, level, teacherId } = await request.json();

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: "name and teacherId are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name,
        level,
        teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      level: updated.level,
      teacher: updated.teacher,
      studentCount: updated._count.students,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params || {};
    if (!id) {
      return NextResponse.json(
        { error: "Class id is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentClass.deleteMany({
        where: { classId: id },
      });
      await tx.subject.deleteMany({
        where: { classId: id },
      });
      await tx.class.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Class deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
