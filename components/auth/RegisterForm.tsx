'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, ShieldCheck, Copy } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function generateTempPassword(length = 12): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const syms = '!@#$%^&*()_+-=[]{};:,.<>?';
  const all = upper + lower + nums + syms;
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += syms[Math.floor(Math.random() * syms.length)];
  for (let i = 4; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [copyTooltip, setCopyTooltip] = useState('Copy');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setTempPassword('');

    const password = generateTempPassword(12);
    const payload = { ...data, role: 'staff', password };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || 'Registration failed');
      } else {
        setSuccess(`Staff account for ${data.email} created successfully.`);
        setTempPassword(password);
        reset();
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Request timed out. Make sure you have network acess');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary-600"><ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold">Owner Action</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-primary-700">Register Staff Member</h2>
          <p className="mt-2 text-center text-sm text-gray-600">A strong temporary password will be generated automatically. Share it with your staff to sign in.</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
            Role
            <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">Staff</span>
          </div>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Staff Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-primary-500" />
                </span>
                <input
                  {...register('name')}
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white shadow-sm"
                  placeholder="Enter staff full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Staff Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-primary-500" />
                </span>
                <input
                  {...register('email')}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white shadow-sm"
                  placeholder="Enter staff email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {success && (
            <div className="space-y-3">
              <div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-sm text-center">{success}</div>
              {tempPassword && (
                <div className="flex items-center justify-between gap-3 p-3 border border-primary-200 rounded-lg bg-primary-50">
                  <div className="text-sm">
                    <div className="text-gray-600">Temporary Password</div>
                    <div className="font-mono font-semibold text-gray-900 break-all">{tempPassword}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      setCopyTooltip('Copied!');
                      setTimeout(() => setCopyTooltip('Copy'), 1200);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 shadow"
                    title={copyTooltip}
                    onMouseLeave={() => setCopyTooltip('Copy')}
                  >
                    <Copy className="w-4 h-4" /> {copyTooltip}
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
            >
              {isLoading ? 'Creating...' : 'Create Staff Account'}
            </button>
            <a href="/dashboard" className="text-sm font-medium text-primary-600 hover:text-primary-500">Back to Dashboard</a>
          </div>
        </form>
      </div>
    </div>
  );
}
