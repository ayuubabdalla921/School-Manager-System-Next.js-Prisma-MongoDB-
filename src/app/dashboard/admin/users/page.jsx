import prisma from "@/lib/prisma";
import UserManagement from "./UserManagement";

export const dynamic = "force-dynamic";

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      gender: true,
      createdAt: true,
    },
  });

  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}

export default async function AdminUsersPage() {
  const initialUsers = await getUsers();

  return (
    <div className="space-y-6 px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Administration
        </p>
        <h1 className="text-2xl font-semibold">User accounts</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage all school accounts in one place: provision new users and
          adjust their roles instantly.
        </p>
      </div>

      <UserManagement initialUsers={initialUsers} />
    </div>
  );
}
