import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const id = context.params.id;

    const item = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: true,
        class: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    const id = context.params.id;
    const data = await req.json();

    const updated = await prisma.attendance.update({
      where: { id },
      data
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const id = context.params.id;

    await prisma.attendance.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Attendance deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
