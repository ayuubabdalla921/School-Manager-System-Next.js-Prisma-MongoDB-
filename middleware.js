import { NextResponse } from "next/server";

const ROLE_REDIRECTS = {
   ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
};

const ROUTE_PERMISSIONS = [
  { pattern: /^\/dashboard\/admin(\/.*)?$/, roles: ["ADMIN"] },
  { pattern: /^\/dashboard\/teacher(\/.*)?$/, roles: ["ADMIN", "TEACHER"] },
  {
    pattern: /^\/dashboard\/student(\/.*)?$/,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  { pattern: /^\/dashboard\/parent(\/.*)?$/, roles: ["ADMIN", "PARENT"] },
  { pattern: /^\/dashboard\/classes(\/.*)?$/, roles: ["ADMIN", "TEACHER"] },
  { pattern: /^\/dashboard\/attendance(\/.*)?$/, roles: ["ADMIN", "TEACHER"] },
  {
    pattern: /^\/dashboard\/payments(\/.*)?$/,
    roles: ["ADMIN", "PARENT"],
  },
  {
    pattern: /^\/dashboard\/messages(\/.*)?$/,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    pattern: /^\/dashboard\/settings(\/.*)?$/,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    pattern: /^\/dashboard\/profile(\/.*)?$/,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
];

const AUTH_PAGES = new Set(["/login", "/register"]);

const decodeTokenPayload = (token) => {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    if (typeof globalThis.atob === "function") {
      return JSON.parse(globalThis.atob(padded));
    }
    const bufferFactory = globalThis?.Buffer;
    if (bufferFactory?.from) {
      return JSON.parse(bufferFactory.from(padded, "base64").toString("utf-8"));
    }
    return null;
  } catch (error) {
    console.error("Failed to decode auth token", error);
    return null;
  }
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const payload = decodeTokenPayload(token);
  const role =
    typeof payload?.role === "string"
      ? payload.role.toUpperCase()
      : payload?.role
      ? String(payload.role).toUpperCase()
      : undefined;

  if (AUTH_PAGES.has(pathname)) {
    if (role) {
      const redirectUrl = new URL(ROLE_REDIRECTS[role] ?? "/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token || !role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const target = ROLE_REDIRECTS[role] ?? "/dashboard/student";
      return NextResponse.redirect(new URL(target, request.url));
    }

    for (const rule of ROUTE_PERMISSIONS) {
      if (rule.pattern.test(pathname) && !rule.roles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
