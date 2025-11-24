const SESSION_USER_COOKIE = "sessionUser";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encodeBase64 = (value) => {
  if (typeof globalThis?.btoa === "function") {
    return globalThis.btoa(value);
  }
  return Buffer.from(value, "utf-8").toString("base64");
};

const decodeBase64 = (value) => {
  if (typeof globalThis?.atob === "function") {
    return globalThis.atob(value);
  }
  return Buffer.from(value, "base64").toString("utf-8");
};

const findCookieValue = () => {
  if (typeof document === "undefined") {
    return null;
  }
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_USER_COOKIE}=`));
  if (!cookie) {
    return null;
  }
  return cookie.split("=")[1];
};

export const persistSessionUser = (user) => {
  if (!user || typeof document === "undefined") {
    return;
  }
  const resolvedRole =
    typeof user?.role === "string"
      ? user.role.toUpperCase()
      : user?.role
      ? String(user.role).toUpperCase()
      : "STUDENT";
  const userPayload = {
    id: user?.id || user?._id || "",
    name: user?.name || "",
    email: user?.email || "",
    role: resolvedRole,
    avatarUrl: user?.avatarUrl || "",
  };
  try {
    const encoded = encodeURIComponent(
      encodeBase64(JSON.stringify(userPayload))
    );
    document.cookie = `${SESSION_USER_COOKIE}=${encoded}; path=/; max-age=${SESSION_MAX_AGE}; sameSite=Lax`;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("session-user:updated"));
    }
  } catch (error) {
    console.error("Unable to persist session", error);
  }
};

export const readSessionUser = () => {
  const encoded = findCookieValue();
  if (!encoded) {
    return null;
  }
  try {
    const decoded = decodeBase64(decodeURIComponent(encoded));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Unable to read session", error);
    return null;
  }
};

export const clearSessionUser = () => {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${SESSION_USER_COOKIE}=; path=/; max-age=0; sameSite=Lax`;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("session-user:updated"));
  }
};
