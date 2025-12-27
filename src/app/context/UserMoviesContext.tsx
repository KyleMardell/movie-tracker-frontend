"use client"

import { createContext, useEffect, useState } from "react";
import { getMovies } from "../lib/api";

export const UserMoviesContext = createContext<UserMoviesContextType | null>(null);

type UserMoviesContextType = {
    userMovies: any[];
    setUserMovies: React.Dispatch<React.SetStateAction<any[]>>;
};

export const UserMoviesProvider = ({ children }: { children: React.ReactNode }) => {
    const [userMovies, setUserMovies] = useState<any[]>([]);

    useEffect(() => {
        const handleMount = async () => {
            try {
                const movies = await getMovies();
                setUserMovies(movies.results);
            } catch (err) {
                console.log(err);
            }
        };
        handleMount();
    }, [])


    return (
        <UserMoviesContext.Provider value={{ userMovies, setUserMovies }}>
            {children}
        </UserMoviesContext.Provider>
    );
};