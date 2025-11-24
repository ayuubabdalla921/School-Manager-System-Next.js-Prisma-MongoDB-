import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

function isValidObjectId(value) {
  return typeof value === "string" && objectIdRegex.test(value);
}

// GET ALL MESSAGES
export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// SEND MESSAGE
export async function POST(req) {
  try {
    const { senderId, receiverId, content } = await req.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: "senderId, receiverId, content are required" },
        { status: 400 }
      );
    }

    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
      return NextResponse.json(
        { error: "senderId and receiverId must be valid Mongo ObjectId strings" },
        { status: 400 }
      );
    }

    const msg = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId
      }
    });

    return NextResponse.json({
      message: "Message sent",
      msg
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
