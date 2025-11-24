// post method for user registration in a web application using Next.js and Prisma
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const ALLOWED_ROLES = new Set(["ADMIN", "TEACHER", "STUDENT", "PARENT"]);

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = payload?.name?.trim();
    const email = payload?.email?.toLowerCase();
    const password = payload?.password;
    const role = (payload?.role || "STUDENT").toUpperCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Invalid role supplied" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { password: _password, ...safeUser } = user;

    return NextResponse.json(
      { message: "User registered successfully", user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}



