import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Payment id is required" }, { status: 400 });
    }

    const payload = await request.json();
    const data = {};
    if (payload.status) {
      data.status = payload.status;
    }
    if (payload.receiptUrl !== undefined) {
      data.receiptUrl = payload.receiptUrl;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.update({
      where: { id },
      data,
    });

    return NextResponse.json(payment);
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    console.error("Payments PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
