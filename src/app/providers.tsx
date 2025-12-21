"use client"

import { createContext, useEffect, useState } from "react";


// Types
type AuthContextType = {
    user: string | null,
    accessToken: string | null,
    refreshToken: string | null,
    setAuthData: (data: {
        user: string
        accessToken: string
        refreshToken: string
    }) => void,
    logout: () => void,
    isLoading: boolean | true,
}

type AuthProviderProps = {
    children: React.ReactNode
}

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)


// Auth Provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setAuthData = (data: {
        user: string
        accessToken: string
        refreshToken: string
    }) => {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);
    };

    useEffect(() => {
        const stored = localStorage.getItem("movieTrackerData")
        if (stored) {
            const data = JSON.parse(stored)
            setUser(data.user)
            setAccessToken(data.accessToken)
            setRefreshToken(data.refreshToken)
        }
        setIsLoading(false);
    }, []);

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("movieTrackerData");
    }

    let value = {
        user,
        accessToken,
        refreshToken,
        setAuthData,
        logout,
        isLoading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>

    )
}