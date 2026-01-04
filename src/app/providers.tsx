"use client"

import { createContext, useEffect, useState } from "react";
import { refreshAccessToken } from "./lib/api";


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
    isLoading: boolean,
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

    // sets auth data and saves access tokens to local storage
    const setAuthData = (data: {
        user: string
        accessToken: string
        refreshToken: string
    }) => {
        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken); 
        localStorage.setItem("movieTrackerData", JSON.stringify(data));
    };

    // logs out user by deleting access token from local storage
    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("movieTrackerData");
    }

    // auto refreshes token for use upon expiry
    const handleRefreshToken = async () => {
        if (!user) return;
        if (!refreshToken) return;
        try {
            const response = await refreshAccessToken(refreshToken);
            setAuthData({
                user: user!, // current user from state
                accessToken: response.access,
                refreshToken: response.refresh || refreshToken
            });
        } catch (err) {
            console.error("Failed to refresh token", err);
            logout();
        }
    };

    // checks local storage for access tokens
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

    // sets an interval to obtain a new refresh token prior to expiry
    useEffect(() => {
        const interval = setInterval(() => {
            handleRefreshToken();
        }, 28 * 60 * 1000); // adjust based on token expiry | min - sec - milisec
        return () => clearInterval(interval);
    }, [refreshToken, user]);

    // auth provider props
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