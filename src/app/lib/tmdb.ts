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

export const searchMovies = async (movie: string, page:number) => {
    return tmdbApi.get(`/search/movie`, {
        params: {
            language: "en-US",
            page,
            query: movie,
        },
    });
};

export const getPopularMovies = async (page:number) => {
    return tmdbApi.get("/movie/popular", {
        params: {
            language: "en-US",
            page,
        },
    });
};

export const getTrendingMovies = async () => {
    return tmdbApi.get("/trending/movie/day", {
        params: {
            language: "en-US",
        },
    });
};

export const getTopRatedMovies = async (page:number) => {
    return tmdbApi.get("/movie/top_rated", {
        params: {
            language: "en-US",
            page,
        },
    });
};

export const getMovieDetail = async (id:number) => {
    return tmdbApi.get(`/movie/${id}`, {
        params: {
            language: "en-US",
        },
    });
};

export const getMovieProviders = async (id: number) => {
    return tmdbApi.get(`/movie/${id}/watch/providers`);
};