import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

function buildSearchFilter(search) {
  if (!search) return {};
  const term = search.trim();
  if (!term) return {};
  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { phone: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1),
      50
    );
    const search = searchParams.get("search") || "";

    const where = {
      role: "TEACHER",
      ...buildSearchFilter(search),
    };

    const [teachers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: teachers,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, phone, gender, password } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password || "teacher123", 10);

    const payload = {
      name,
      email,
      password: hashed,
      role: "TEACHER",
    };

    if (phone) payload.phone = phone;
    if (gender) payload.gender = gender;

    const teacher = await prisma.user.create({
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
