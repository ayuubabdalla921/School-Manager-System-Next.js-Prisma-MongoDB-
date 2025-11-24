import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const id = context.params.id;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        class: true
      }
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    const id = context.params.id;
    const data = await req.json();

    const updated = await prisma.subject.update({
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

    await prisma.subject.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Subject deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
