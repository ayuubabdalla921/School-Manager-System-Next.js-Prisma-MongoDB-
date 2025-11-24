import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET ALL SUBJECTS or FILTER BY classId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const where = {};
    if (classId) where.classId = classId;

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        class: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(subjects);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// CREATE SUBJECT
export async function POST(req) {
  try {
    const { name, code, classId } = await req.json();

    if (!name || !classId) {
      return NextResponse.json(
        { error: "name and classId are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        classId
      }
    });

    return NextResponse.json({
      message: "Subject created",
      subject
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
