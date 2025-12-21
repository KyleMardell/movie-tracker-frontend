import api from "./axios";

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
    return api.post('/api/token/', data);
}

// Refresh access token function
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
    return response.data;
};