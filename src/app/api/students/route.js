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
    const classId = searchParams.get("classId") || "";

    const where = {
      role: "STUDENT",
      ...buildSearchFilter(search),
      ...(classId
        ? {
            studentClasses: {
              some: { classId },
            },
          }
        : {}),
    };

    const [students, total] = await Promise.all([
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
          studentClasses: {
            take: 1,
            select: {
              class: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = students.map((student) => {
      const classRelation = student.studentClasses[0]?.class;
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone ?? "",
        gender: student.gender ?? "",
        class: classRelation
          ? { id: classRelation.id, name: classRelation.name }
          : null,
      };
    });

    return NextResponse.json({
      data: formatted,
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
    const body = await request.json();
    const { name, email, phone, gender, classId, password } = body;

    if (!name || !email || !classId) {
      return NextResponse.json(
        { error: "name, email and classId are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password || "student123", 10);

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.user.create({
        data: {
          name,
          email,
          phone,
          gender,
          password: hashedPassword,
          role: "STUDENT",
        },
      });

      await tx.studentClass.create({
        data: {
          studentId: student.id,
          classId,
        },
      });

      return student;
    });

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
