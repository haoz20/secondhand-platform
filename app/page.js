'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Welcome to the Second-Hand Marketplace</h1>
      <p className="text-lg text-gray-600 mb-8">Buy and sell pre-owned items with ease.</p>
      
      {status === "loading" && (
        <div className="text-lg text-gray-600">Loading...</div>
      )}

      {session ? (
        <div className="text-center">
          <p className="mb-6 text-lg text-gray-700">
            Welcome back, <span className="font-semibold">{session.user?.name || session.user?.email}</span>!
          </p>
          <div className="flex space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/profile"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              View Profile
            </Link>
          </div>
          <button
            onClick={() => signOut({ 
              callbackUrl: `${window.location.origin}/second-hand-marketplace` 
            })}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
