import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getDateRange(dateString) {
  const start = new Date(dateString);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const classId = searchParams.get("classId");

    if (!date || !classId) {
      return NextResponse.json(
        { error: "date and classId are required" },
        { status: 400 }
      );
    }

    const { start, end } = getDateRange(date);

    const records = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        studentId: true,
        status: true,
      },
    });

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { date, classId, records } = await request.json();

    if (!date || !classId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "date, classId and records are required" },
        { status: 400 }
      );
    }

    const { start, end } = getDateRange(date);

    const existing = await prisma.attendance.findFirst({
      where: {
        classId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Attendance already recorded for today" },
        { status: 409 }
      );
    }

    await prisma.attendance.createMany({
      data: records.map((record) => ({
        classId,
        studentId: record.studentId,
        status: record.status,
        date: start,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
