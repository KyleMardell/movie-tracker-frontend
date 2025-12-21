import axios from "axios";

axios.defaults.baseURL = 'https://movie-tracker-api.cap.kylemardell.me/';

// Types
type LoginPayload = {
    username: string
    password: string
}

type RefreshResponse = {
    access: string;
    refresh?: string;
};

// Login function
export const login = (username: string, password: string) => {
    const data: LoginPayload = { username, password };
    return axios.post('/api/token/', data);
}

// Refresh access token function
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
    return response.data;
};