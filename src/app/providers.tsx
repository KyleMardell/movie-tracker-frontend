"use client"

import { createContext, useEffect, useState } from "react"


// Types
type AuthContextType = {
    user: string | null,
    accessToken: string | null,
    refreshToken: string | null,
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

    useEffect(() => {
        const stored = localStorage.getItem("movieTrackerData")
        if (stored) {
            const data = JSON.parse(stored)
            setUser(data.user)
            setAccessToken(data.accessToken)
            setRefreshToken(data.refreshToken)
        }
    }, []);

    let value = {
        user,
        accessToken,
        refreshToken,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>

    )
}