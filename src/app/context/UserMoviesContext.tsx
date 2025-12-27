"use client"

import { createContext, useEffect, useState } from "react";
import { getMovies } from "../lib/api";
import { useAuth } from "../useAuth";

export const UserMoviesContext = createContext<UserMoviesContextType | null>(null);

type UserMoviesContextType = {
    userMovies: any[];
    setUserMovies: React.Dispatch<React.SetStateAction<any[]>>;
};

export const UserMoviesProvider = ({ children }: { children: React.ReactNode }) => {
    const [userMovies, setUserMovies] = useState<any[]>([]);
    const { user} = useAuth();

    
    useEffect(() => {
        const handleMount = async () => {
            try {
                const movies = await getMovies();
                setUserMovies(movies.results);
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