import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const { name, email, phone, gender } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    const payload = { name, email };
    if (phone !== undefined) payload.phone = phone;
    if (gender !== undefined) payload.gender = gender;

    const teacher = await prisma.user.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
      },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const assignedClasses = await prisma.class.count({
      where: { teacherId: id },
    });

    if (assignedClasses > 0) {
      return NextResponse.json(
        {
          error:
            "Teacher is assigned to existing classes. Please reassign or delete those classes first.",
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Teacher deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
