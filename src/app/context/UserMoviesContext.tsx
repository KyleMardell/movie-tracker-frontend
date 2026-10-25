"use client"

import { createContext, useEffect, useState } from "react";
import { getMovies } from "../lib/api";
import { useAuth } from "../useAuth";
import { UserMovie } from "../types";

// types
type UserMoviesContextType = {
    userMovies: UserMovie[];
    setUserMovies: React.Dispatch<React.SetStateAction<UserMovie[]>>;
};

// Creates the context
export const UserMoviesContext = createContext<UserMoviesContextType | null>(null);

// sets the users movie list as a context for use across the app
export const UserMoviesProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, sessionVersion } = useAuth();
    // Remount account-owned state and pending mutation callbacks on login/logout.
    return <MovieListSession key={sessionVersion} user={user}>{children}</MovieListSession>;
};

const MovieListSession = ({ children, user }: { children: React.ReactNode; user: string | null }) => {
    const [userMovies, setUserMovies] = useState<UserMovie[]>([]);

    useEffect(() => {
        const controller = new AbortController();
        const handleMount = async () => {
            try {
                const movies = await getMovies(controller.signal);
                if (!controller.signal.aborted) setUserMovies(movies);
            } catch {
                // Axios errors may contain credentials; do not log the raw error.
            }
        };
        if (user) {
            handleMount();
        }
        return () => controller.abort();
    }, [user])

    return (
        <UserMoviesContext.Provider value={{ userMovies, setUserMovies }}>
            {children}
        </UserMoviesContext.Provider>
    );
};
