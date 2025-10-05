'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-[#14B8A6]/10 via-white to-[#FFDAB9]/20 px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Number with Gradient */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold bg-gradient-to-r from-[#14B8A6] to-[#0d9488] bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mb-6">
          <div className="inline-block p-6 bg-[#FFDAB9]/30 rounded-full">
            <svg 
              className="w-24 h-24 text-[#14B8A6]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#292524] mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-stone-600 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. 
          Let&apos;s get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="px-8 py-4 bg-[#14B8A6] text-white rounded-xl font-semibold hover:bg-[#0d9488] transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
              />
            </svg>
            Go to Homepage
          </Link>
          
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-white border-2 border-stone-300 text-[#292524] rounded-xl font-semibold hover:border-[#14B8A6] hover:text-[#14B8A6] transition-all flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-600 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/users" 
              className="text-[#14B8A6] hover:text-[#0d9488] font-medium transition"
            >
              Browse Users
            </Link>
            <span className="text-stone-300">•</span>
            <Link 
              href="/sell" 
              className="text-[#14B8A6] hover:text-[#0d9488] font-medium transition"
            >
              Sell Items
            </Link>
            <span className="text-stone-300">•</span>
            <Link 
              href="/login" 
              className="text-[#14B8A6] hover:text-[#0d9488] font-medium transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
