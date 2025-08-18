'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?next=/register');
    }
    if (status === 'authenticated' && session?.user?.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only owner can access this page
  if (status === 'authenticated' && session?.user?.role === 'owner') {
    return <RegisterForm />;
  }

  return null;
}
