'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import Loader from '@/components/ui/Loader';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <Loader fullScreen message="Loading..." />;
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="px-4">
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 max-w-md mx-auto mt-6">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      <LoginForm />
    </div>
  );
}
