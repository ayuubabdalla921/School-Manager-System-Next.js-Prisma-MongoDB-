import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const raw = context.params.id; // e.g.  user1_user2
    const [userA, userB] = raw.split("_");

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
