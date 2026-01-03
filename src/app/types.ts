// Using to test types

export type TMDBMovie = {
    id: number;
    title: string;
    poster_path: string | null;
    overview: string;
    release_date: string;
};

export type TMDBMovieDetail = TMDBMovie & {
    runtime: number;
    genres: { id: number; name: string }[];
};

export type UserMovie = {
    id: number;
    tmdb_id: number;
    title: string;
    image_path: string;
    watched: boolean;
};

export type MovieToAdd = Omit<UserMovie, "id">;


export type MovieProvider = {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
};

export type CountryProviders = {
    link: string;
    flatrate?: MovieProvider[];
    rent?: MovieProvider[];
    buy?: MovieProvider[];
    ads?: MovieProvider[];
};

export type MovieModalProps = {
    movie: TMDBMovie | UserMovie;
    show: boolean;
    onHide: () => void;
};