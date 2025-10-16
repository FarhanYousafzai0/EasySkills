'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';


 
export default function PostAuth() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    // Wait until Clerk is ready
    if (!isLoaded) return;

    const syncAndRedirect = async () => {
      try {
        // If user somehow lands here while not signed in
        if (!isSignedIn) {
          router.replace('/sign-in');
          return;
        }

        // 1️⃣ Sync Clerk <-> MongoDB
        const res = await fetch('/api/sync-user', { method: 'POST' });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to sync user');

        // 2️⃣ Determine user role
        const role =
          data.role ||
          user?.publicMetadata?.role ||
          user?.unsafeMetadata?.role ||
          'student';

        // 3️⃣ Redirect based on role
        if (role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/student');
        }
      } catch (err) {
        console.error('❌ PostAuth error:', err);
        router.replace('/sign-in');
      }
    };

    syncAndRedirect();
  }, [isLoaded, isSignedIn, router, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-xl font-semibold text-gray-700">
        Syncing your account...
      </h2>
      <p className="text-sm text-gray-500 mt-2">
        Please wait while we prepare your dashboard.
      </p>
    </div>
  );
}
