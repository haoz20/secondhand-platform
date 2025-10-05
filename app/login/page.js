'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res.error) {
        setError('Invalid credentials. Please try again.');
        return;
      }

      router.replace('/'); // Or any other protected page
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F4]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-[#292524]">
          Log in to your Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[#292524]">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="w-full px-4 py-2 mt-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#292524] bg-white"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#292524]"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="w-full px-4 py-2 mt-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-[#292524] bg-white"
              required
            />
          </div>

          {error && (
            <div className="px-4 py-2 text-sm text-[#DC2626] bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-[#14B8A6] rounded-md hover:bg-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              Log In
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-stone-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#14B8A6] hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}