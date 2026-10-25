const tmdbApi = async (path: string, params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
        searchParams.set(key, String(value));
    });

    const query = searchParams.toString();
    const response = await fetch(`/api/tmdb/${path}${query ? `?${query}` : ""}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data.detail === "string"
                ? data.detail
                : "Unable to load movie data. Please try again."
        );
    }

    return { data };
};

export const searchMovies = async (movie: string, page: number) =>
    tmdbApi("search/movie", {
        language: "en-US",
        page,
        query: movie,
    });

export const getPopularMovies = async (page: number) =>
    tmdbApi("movie/popular", {
        language: "en-US",
        page,
    });

export const getTrendingMovies = async () =>
    tmdbApi("trending/movie/day", {
        language: "en-US",
    });

export const getTopRatedMovies = async (page: number) =>
    tmdbApi("movie/top_rated", {
        language: "en-US",
        page,
    });

export const getMovieDetail = async (id: number) =>
    tmdbApi(`movie/${id}`, {
        language: "en-US",
    });

export const getMovieProviders = async (id: number) =>
    tmdbApi(`movie/${id}/watch/providers`);
