import axios from "axios";

// read access token from environment variables
const TMDB_READ_TOKEN = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN;

// set base url for tmdb api
const tmdbApi = axios.create({
    baseURL: "https://api.themoviedb.org/3",
});

// Attach access token to every request
tmdbApi.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${TMDB_READ_TOKEN}`;
        config.headers.Accept = "application/json";
        return config;
    },
    (error) => Promise.reject(error)
);

// Search movies
export const searchMovies = async (movie: string, page:number) => {
    return tmdbApi.get(`/search/movie`, {
        params: {
            language: "en-US",
            page,
            query: movie,
        },
    });
};

// Get popular movies list by page number
export const getPopularMovies = async (page:number) => {
    return tmdbApi.get("/movie/popular", {
        params: {
            language: "en-US",
            page,
        },
    });
};

// Get trending movies list: returns a list of 20 movies only
export const getTrendingMovies = async () => {
    return tmdbApi.get("/trending/movie/day", {
        params: {
            language: "en-US",
        },
    });
};

// Get top rates movies list by page number
export const getTopRatedMovies = async (page:number) => {
    return tmdbApi.get("/movie/top_rated", {
        params: {
            language: "en-US",
            page,
        },
    });
};

// Get a movies details by movie id
export const getMovieDetail = async (id:number) => {
    return tmdbApi.get(`/movie/${id}`, {
        params: {
            language: "en-US",
        },
    });
};

// Get a list of movie watch providers by id number
export const getMovieProviders = async (id: number) => {
    return tmdbApi.get(`/movie/${id}/watch/providers`);
};