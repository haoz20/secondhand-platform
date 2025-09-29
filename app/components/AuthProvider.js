'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return (
    <SessionProvider basePath="/second-hand-marketplace/api/auth">
      {children}
    </SessionProvider>
  );
}