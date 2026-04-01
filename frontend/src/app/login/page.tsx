"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await client.post('/auth/login', { email, password });
            login(response.data.token, response.data.workspaceId, response.data.userId);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto bg-blue-600 h-12 w-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-200">
                        <Layers size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your workspace</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none bg-gray-50 focus:bg-white"
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none bg-gray-50 focus:bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 flex justify-center rounded-xl text-white text-sm font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        Create a workspace
                    </Link>
                </p>
            </div>
        </div>
    );
}
