'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Icon } from "@mui/material";
import AccountBoxIcon from '@mui/icons-material/AccountBox';

export default function NavigationBar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#06B6D4]/20 via-[#FFDAB9]/30 to-[#F59E0B]/20 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-lg border-b border-white/50 dark:border-slate-700 backdrop-blur-md">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#0F4C75] dark:text-[#14B8A6] hover:text-[#14B8A6] dark:hover:text-[#0d9488] transition">
              YaungWel
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/users"
                  className="text-[#292524] dark:text-slate-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Users
                </Link>
                <Link
                  href="/sell"
                  className="text-[#292524] dark:text-slate-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Sell Item
                </Link>
                <Link
                  href={`/users/${session.user.id}`}
                  className="text-[#292524] dark:text-slate-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  My Profile
                </Link>
                <span className="text-[#292524] dark:text-slate-200 text-sm">
                  <AccountBoxIcon className="inline-block mr-1" />
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: `${window.location.origin}/second-hand-marketplace` })}
                  className="bg-gradient-to-r from-[#DC2626] to-[#b91c1c] text-white px-4 py-2 rounded-md text-sm font-medium hover:from-[#b91c1c] hover:to-[#991b1b] transition shadow-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
              <Link
                  href="/users"
                  className="text-[#292524] dark:text-slate-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Users
                </Link>
                <Link
                  href="/login"
                  className="text-[#292524] dark:text-slate-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#14B8A6] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0d9488] transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {session ? (
              <Link
                href={`/users/${session.user.id}`}
                className="bg-[#14B8A6] text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#292524] dark:text-slate-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#14B8A6] text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}