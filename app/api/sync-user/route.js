'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function PostAuth() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    // Wait until Clerk user is fully loaded
    if (!isLoaded) return;

    const syncAndRedirect = async () => {
      try {
        if (!isSignedIn) {
          router.push('/sign-in');
          return;
        }

        // 1️⃣ Call the backend sync route
        const res = await fetch('/api/sync-user', { method: 'POST' });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Sync failed');

        // 2️⃣ Redirect based on role
        if (data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } catch (err) {
        console.error('❌ Error in post-auth:', err);
        router.push('/');
      }
    };

    syncAndRedirect();
  }, [isLoaded, isSignedIn, router, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-xl font-semibold text-gray-700">Syncing your account...</h2>
      <p className="text-sm text-gray-500 mt-2">Please wait while we set things up.</p>
    </div>
  );
}
