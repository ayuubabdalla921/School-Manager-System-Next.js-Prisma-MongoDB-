"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { readSessionUser } from "@/lib/client-session";

const PROFILE_ROUTE = "/dashboard/profile";
const LOGOUT_ROUTE = "/logout";

const getInitials = (user) => {
  if (!user?.name) {
    return "AD";
  }
  const [first = "", second = ""] = user.name.trim().split(" ");
  const firstInitial = first.charAt(0);
  const secondInitial = second.charAt(0);
  const initials =
    (firstInitial ? firstInitial : "") + (secondInitial ? secondInitial : "");
  return initials ? initials.toUpperCase() : "AD";
};

export default function Navbar({ onToggleSidebar = () => {} }) {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    const syncUser = () => {
      setSessionUser(readSessionUser());
    };
    syncUser();
    window.addEventListener("session-user:updated", syncUser);
    return () => {
      window.removeEventListener("session-user:updated", syncUser);
    };
  }, []);

  const avatarInitials = useMemo(
    () => getInitials(sessionUser),
    [sessionUser]
  );

  const handleProfile = () => {
    router.push(PROFILE_ROUTE);
  };

  const handleSignOut = () => {
    router.push(LOGOUT_ROUTE);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/70">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <BellIcon className="h-6 w-6" />
          </button>

          <Menu as="div" className="relative">
            <MenuButton className="flex rounded-full">
              <Avatar className="cursor-pointer">
                {sessionUser?.avatarUrl ? (
                  <AvatarImage
                    src={sessionUser.avatarUrl}
                    alt={sessionUser?.name || "Profile photo"}
                  />
                ) : null}
                <AvatarFallback>{avatarInitials}</AvatarFallback>
              </Avatar>
            </MenuButton>

            <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg dark:bg-gray-800">
              <MenuItem>
                <button
                  onClick={handleProfile}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/40"
                >
                  Profile
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700/40"
                >
                  Sign out
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  );
}
