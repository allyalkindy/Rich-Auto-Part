'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Loader from '@/components/ui/Loader';

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
    return <Loader fullScreen message="Loading..." />;
  }

  // Only owner can access this page
  if (status === 'authenticated' && session?.user?.role === 'owner') {
    return <RegisterForm />;
  }

  return null;
}
