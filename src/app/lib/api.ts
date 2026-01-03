import api from "./axios";

// Types
type LoginPayload = {
    username: string;
    password: string;
};

type SignUpPayload = {
    username: string;
    password: string;
};

type RefreshResponse = {
    access: string;
    refresh?: string;
};

type Movie = {
    title: string;
    tmdb_id: number;
    image_path: string;
    watched: boolean;
};

// Login function
export const login = async (username: string, password: string) => {
    const data: LoginPayload = { username, password };
    return api.post('/api/token/', data);
};

// Sign Up function
export const signUpUser = async (username: string, password: string) => {
    const data: SignUpPayload = { username, password };
    const response = await api.post("/api/register/", data);
    return response;
};

// Refresh access token function
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
    return response.data;
};

// Add Movie to users list
export const addMovie = async (movie: Movie) => {
    const response = await api.post('/api/movies/',  movie);
    return response;
};

// Get users Movie list
export const getMovies = async () => {
    const response = await api.get('/api/movies/');
    return response.data;
};

// Delete Movie from users list
export const deleteMovie = async (id: number) => {
    const response = await api.delete(`/api/movies/${id}/`);
    return response;
};

// Update Movie watched status
export const updateWatchedMovie = async (id: number) => {
    const response = await api.put(`/api/movies/${id}/toggle-watched/`)
    return response;
};