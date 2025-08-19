'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { User, Mail, Shield, Edit, Trash2, XCircle, Save, Plus, Search } from 'lucide-react';

interface UserDoc {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
}

export default function ManageStaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState<UserDoc | null>(null);
  const [edit, setEdit] = useState({ name: '', email: '', role: 'staff' as 'owner' | 'staff' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user?.role !== 'owner') router.push('/dashboard');
  }, [status, session, router]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } finally {
        setLoading(false);
      }
    }
    if (status === 'authenticated' && session?.user?.role === 'owner') load();
  }, [status, session]);

  function openModal(user: UserDoc) {
    setModalUser(user);
    setEdit({ name: user.name, email: user.email, role: user.role });
  }

  async function saveUser() {
    if (!modalUser) return;
    setSaving(true);
    const res = await fetch(`/api/users/${modalUser._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => (u._id === updated._id ? updated : u)));
      setModalUser(null);
    }
  }

  async function deleteUser() {
    if (!modalUser) return;
    setDeleting(true);
    const res = await fetch(`/api/users/${modalUser._id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      setUsers(prev => prev.filter(u => u._id !== modalUser._id));
      setModalUser(null);
    }
  }

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return null;

  return (
    <Navigation>
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
            <p className="text-gray-500">View and manage staff accounts. Click a row to edit or delete.</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-primary-500 focus:border-primary-500" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-700">{users.length}</span></div>
        </div>
        {loading ? (
          <div className="bg-white rounded-xl p-6 shadow">Loading users...</div>
        ) : (
          <div className="bg-white shadow rounded-2xl overflow-hidden border border-primary-100">
            <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <colgroup>
                <col className="w-1/2 sm:w-2/5" />
                <col className="w-1/2 sm:w-2/5" />
                <col className="w-1/3 sm:w-1/5" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users
                  .filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
                  .map((u) => {
                    const roleStyles = u.role === 'owner'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-green-100 text-green-700 border-green-200';
                    const roleLabel = u.role === 'owner' ? 'Owner' : 'Staff';
                    return (
                      <tr key={u._id} className="hover:bg-primary-50 cursor-pointer" onClick={() => openModal(u)}>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                              {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-none">{u.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 align-middle">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 truncate max-w-[140px] sm:max-w-none"><Mail className="w-4 h-4 text-gray-400" />{u.email}</div>
                        </td>
                        <td className="px-2 py-2 sm:px-6 sm:py-4 align-middle">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] sm:text-xs font-semibold ${roleStyles}`}>
                            <Shield className="w-3 h-3" /> {roleLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {modalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-xl relative max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-primary-600" onClick={() => setModalUser(null)}>
                <XCircle className="w-6 h-6" />
              </button>
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
                <h2 className="text-xl font-bold">Edit User</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} type="email" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select value={edit.role} onChange={e => setEdit({ ...edit, role: e.target.value as any })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                    <option value="staff">staff</option>
                    <option value="owner">owner</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-white">
                <button onClick={deleteUser} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                  <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button onClick={saveUser} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navigation>
  );
}


