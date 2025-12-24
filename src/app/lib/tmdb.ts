import axios from "axios";

const TMDB_READ_TOKEN = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

const tmdbApi = axios.create({
    baseURL: "https://api.themoviedb.org/3",
});

tmdbApi.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
        config.headers.Accept = "application/json";
        return config;
    },
    (error) => Promise.reject(error)
);

export const getPopularMovies = async (page:number) => {
    return tmdbApi.get("/movie/popular", {
        params: {
            language: "en-US",
            page,
        },
    });
};