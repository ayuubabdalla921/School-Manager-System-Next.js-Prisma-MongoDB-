import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAvatar, setAvatar } from "@/lib/avatar-store";

const sanitizeUser = (user, avatarUrl) => {
  if (!user) return null;
  const safeUser = { ...user, avatarUrl: avatarUrl ?? "" };
  delete safeUser.password;
  return safeUser;
};

// GET ONE USER
export async function GET(req, context) {
  try {
    const id = context.params.id;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const avatarUrl = await getAvatar(id);
    return NextResponse.json(sanitizeUser(user, avatarUrl));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE USER
export async function PUT(req, context) {
  try {
    const id = context.params.id;
    const payload = (await req.json()) ?? {};
    const { avatarUrl, ...rest } = payload;

    let updatedUser = null;
    const hasDbFields = Object.keys(rest).length > 0;

    if (hasDbFields) {
      updatedUser = await prisma.user.update({
        where: { id },
        data: rest,
      });
    } else {
      updatedUser = await prisma.user.findUnique({ where: { id } });
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (typeof avatarUrl === "string") {
      await setAvatar(id, avatarUrl);
    }
    const resolvedAvatar = typeof avatarUrl === "string" ? avatarUrl : await getAvatar(id);

    return NextResponse.json(sanitizeUser(updatedUser, resolvedAvatar));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE USER
export async function DELETE(req, context) {
  try {
    const id = context.params.id;

    await prisma.user.delete({ where: { id } });
    await setAvatar(id, "");

    return NextResponse.json({ message: "User deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
