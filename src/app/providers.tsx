"use client";

import { createContext, useEffect, useSyncExternalStore } from "react";
import { refreshSession } from "./lib/axios";
import {
    AuthData, clearAuthData, getAuthSnapshot, getServerAuthSnapshot,
    setAuthData, subscribeAuth,
} from "./lib/session";

type AuthContextType = {
    user: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    sessionVersion: number;
    setAuthData: (data: AuthData) => void;
    logout: () => void;
    isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const session = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
    const user = session.data?.user ?? null;

    useEffect(() => {
        if (!user) return;
        const interval = window.setInterval(() => {
            // The shared refresh operation clears auth state on failure.
            void refreshSession().catch(() => {});
        }, 28 * 60 * 1000);
        return () => window.clearInterval(interval);
    }, [user, session.version]);

    return (
        <AuthContext.Provider value={{
            user,
            accessToken: session.data?.accessToken ?? null,
            refreshToken: session.data?.refreshToken ?? null,
            sessionVersion: session.version,
            setAuthData,
            logout: clearAuthData,
            isLoading: session === getServerAuthSnapshot(),
        }}>
            {children}
        </AuthContext.Provider>
    );
};
