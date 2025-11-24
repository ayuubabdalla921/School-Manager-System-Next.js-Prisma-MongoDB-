import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, phone, gender, classId } = body;

    if (!name || !email || !classId) {
      return NextResponse.json(
        { error: "name, email and classId are required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { name, email, phone, gender },
      });

      const existingClass = await tx.studentClass.findFirst({
        where: { studentId: id },
      });

      if (existingClass) {
        await tx.studentClass.update({
          where: { id: existingClass.id },
          data: { classId },
        });
      } else {
        await tx.studentClass.create({
          data: { studentId: id, classId },
        });
      }
    });

    return NextResponse.json({ message: "Student updated" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.$transaction(async (tx) => {
      await tx.studentClass.deleteMany({
        where: { studentId: id },
      });
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Student deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
