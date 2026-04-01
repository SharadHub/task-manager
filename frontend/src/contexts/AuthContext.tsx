"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    token: string | null;
    workspaceId: string | null;
    userId: string | null;
    login: (token: string, workspaceId: string, userId: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check initial token mapping
        const storedToken = localStorage.getItem('token');
        const storedWorkspace = localStorage.getItem('workspaceId');
        const storedUser = localStorage.getItem('userId');

        if (storedToken) {
            setToken(storedToken);
            setWorkspaceId(storedWorkspace);
            setUserId(storedUser);
        }
    }, []);

    const login = (newToken: string, newWorkspaceId: string, newUserId: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('workspaceId', newWorkspaceId);
        localStorage.setItem('userId', newUserId);
        setToken(newToken);
        setWorkspaceId(newWorkspaceId);
        setUserId(newUserId);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('workspaceId');
        localStorage.removeItem('userId');
        setToken(null);
        setWorkspaceId(null);
        setUserId(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ token, workspaceId, userId, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
