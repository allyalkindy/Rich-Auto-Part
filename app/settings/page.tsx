'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { User as UserIcon, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user) {
      setForm({ name: session.user.name || '', email: (session.user as any).email || '', password: '', confirmPassword: '' });
    }
  }, [status, session, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      if (form.password && form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/users/${session!.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update');
      }
      setMessage('Profile updated');
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Navigation>
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-xl shadow">
            {(session?.user?.name || '?').split(' ').map(n => n[0]).join('').slice(0,2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Settings <ShieldCheck className="w-5 h-5 text-primary-600" /></h1>
            <p className="text-gray-500">Manage your profile and security.</p>
          </div>
          <div className="ml-auto"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 border border-primary-200">{session?.user?.role}</span></div>
        </div>

        <div>
          <form onSubmit={handleSave} className="bg-white rounded-2xl shadow p-6 space-y-5 border border-primary-100">
            <h2 className="text-lg font-semibold text-primary-700">Profile</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 bg-white focus-within:ring-2 focus-within:ring-primary-500">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full py-2 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 bg-white focus-within:ring-2 focus-within:ring-primary-500">
                <Mail className="w-4 h-4 text-gray-400" />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="w-full py-2 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 bg-white focus-within:ring-2 focus-within:ring-primary-500">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" placeholder="Leave blank to keep current" className="w-full py-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 bg-white focus-within:ring-2 focus-within:ring-primary-500">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} type="password" placeholder="Repeat new password" className="w-full py-2 outline-none" />
                </div>
              </div>
            </div>
            {message && <div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-sm">{message}</div>}
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded-md p-3 text-sm">{error}</div>}
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </Navigation>
  );
}


