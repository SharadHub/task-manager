"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function Register() {
    const [workspaceName, setWorkspaceName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await client.post('/auth/register', {
                workspaceName,
                name,
                email,
                password,
            });
            login(response.data.token, response.data.workspaceId, response.data.userId);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-200 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto bg-indigo-600 h-12 w-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-200">
                        <Briefcase size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Create Workspace</h2>
                    <p className="text-sm text-gray-500 mt-2">Start managing tasks for your team</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company / Workspace Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none bg-gray-50 focus:bg-white"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            placeholder="Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none bg-gray-50 focus:bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none bg-gray-50 focus:bg-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none bg-gray-50 focus:bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 flex justify-center mt-6 rounded-xl text-white text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create Workspace'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
}
