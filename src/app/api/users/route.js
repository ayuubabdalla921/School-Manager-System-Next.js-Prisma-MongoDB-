import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const BASE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  gender: true,
  createdAt: true,
};

const ALLOWED_ROLES = new Set(["ADMIN", "TEACHER", "STUDENT", "PARENT"]);

const normalizeOptionalString = (value) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

// GET ALL USERS
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: BASE_USER_SELECT,
    });

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

// ADMIN-ONLY USER CREATION
export async function POST(request) {
  try {
    const payload = await request.json();
    const name =
      typeof payload?.name === "string" ? payload.name.trim() : "";
    const email =
      typeof payload?.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const password =
      typeof payload?.password === "string" ? payload.password : "";
    const normalizedRole =
      typeof payload?.role === "string"
        ? payload.role.trim().toUpperCase()
        : "STUDENT";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return NextResponse.json(
        { error: "Invalid role supplied" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: normalizedRole,
        phone: normalizeOptionalString(payload?.phone),
        gender: normalizeOptionalString(payload?.gender),
      },
      select: BASE_USER_SELECT,
    });

    return NextResponse.json(
      { message: "User account created", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
