import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const studentId = searchParams.get("studentId");

    const where = {};
    if (parentId) {
      where.parentId = parentId;
    }
    if (studentId) {
      where.studentId = studentId;
    }

    const payments = await prisma.payment.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { dueDate: "asc" },
      include: {
        student: {
          select: { id: true, name: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const studentId = payload?.studentId;
    const parentId = payload?.parentId || null;
    const amount = Number(payload?.amount || 0);
    const description = payload?.description || "";
    const dueDate = payload?.dueDate ? new Date(payload.dueDate) : null;

    if (!studentId || !amount) {
      return NextResponse.json(
        { error: "studentId and amount are required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        studentId,
        parentId,
        amount,
        description,
        dueDate,
        status: payload?.status || "PENDING",
        receiptUrl: payload?.receiptUrl || null,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
