import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1),
      50
    );
    const search = searchParams.get("search") || "";

    let teacherIdsForSearch = [];
    const term = search.trim();
    if (term) {
      const teachers = await prisma.user.findMany({
        where: {
          role: "TEACHER",
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      teacherIdsForSearch = teachers.map((t) => t.id);
    }

    const where = term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { level: { contains: term, mode: "insensitive" } },
            ...(teacherIdsForSearch.length
              ? [{ teacherId: { in: teacherIdsForSearch } }]
              : []),
          ],
        }
      : {};

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          level: true,
          teacherId: true,
          _count: { select: { students: true } },
        },
      }),
      prisma.class.count({ where }),
    ]);

    const teacherIds = Array.from(
      new Set(classes.map((cls) => cls.teacherId).filter(Boolean))
    );

    const teachers = teacherIds.length
      ? await prisma.user.findMany({
          where: { id: { in: teacherIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const teacherMap = teachers.reduce((acc, teacher) => {
      acc[teacher.id] = teacher;
      return acc;
    }, {});

    return NextResponse.json({
      data: classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        teacher: teacherMap[cls.teacherId] || null,
        studentCount: cls._count.students,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Classes GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, level, teacherId } = await request.json();

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: "name and teacherId are required" },
        { status: 400 }
      );
    }

    const createdClass = await prisma.class.create({
      data: {
        name,
        level,
        teacherId,
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json(
      {
        id: createdClass.id,
        name: createdClass.name,
        level: createdClass.level,
        teacher: createdClass.teacher,
        studentCount: createdClass._count.students,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
