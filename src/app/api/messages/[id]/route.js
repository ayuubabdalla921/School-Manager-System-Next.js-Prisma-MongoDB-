import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const id = context.params.id;

    const msg = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true
      }
    });

    if (!msg)
      return NextResponse.json({ error: "Message not found" }, { status: 404 });

    return NextResponse.json(msg);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const id = context.params.id;

    await prisma.message.delete({ where: { id } });

    return NextResponse.json({ message: "Message deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
