import axios from "axios";

axios.defaults.baseURL = 'https://movie-tracker-api.cap.kylemardell.me/';

type LoginPayload = {
    username: string
    password: string
}

export const login = (username: string, password: string) => {
    const data: LoginPayload = { username, password };
    return axios.post('/api/token/', data);
}