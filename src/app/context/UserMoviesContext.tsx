"use client"

import { createContext, useEffect, useState } from "react";
import { getMovies } from "../lib/api";
import { useAuth } from "../useAuth";

// types
type UserMoviesContextType = {
    userMovies: any[];
    setUserMovies: React.Dispatch<React.SetStateAction<any[]>>;
};

// Creates the context
export const UserMoviesContext = createContext<UserMoviesContextType | null>(null);

// sets the users movie list as a context for use across the app
export const UserMoviesProvider = ({ children }: { children: React.ReactNode }) => {
    const [userMovies, setUserMovies] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const handleMount = async () => {
            try {
                const movies = await getMovies();
                setUserMovies(movies);
            } catch (err) {
                console.log(err);
            }
        };
        if (user) {
            handleMount();
        }
    }, [user])

    return (
        <UserMoviesContext.Provider value={{ userMovies, setUserMovies }}>
            {children}
        </UserMoviesContext.Provider>
    );
};