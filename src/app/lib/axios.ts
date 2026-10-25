import axios, { InternalAxiosRequestConfig } from "axios";
import { clearAuthData, getSession, updateSessionTokens } from "./session";

const baseURL = "https://api.movietracker.kylemardell.me/";
const api = axios.create({ baseURL });
// Refresh requests bypass the interceptors to avoid recursive refresh attempts.
const tokenApi = axios.create({ baseURL });
type SessionRequest = InternalAxiosRequestConfig & {
    _sessionVersion?: number;
    _accessToken?: string;
    _retry?: boolean;
};

let refreshInFlight: { version: number; promise: Promise<ReturnType<typeof getSession>> } | null = null;

export const refreshSession = () => {
    const session = getSession();
    if (!session.data) return Promise.reject(new Error("Not authenticated."));
    if (refreshInFlight?.version === session.version) return refreshInFlight.promise;
    const refreshToken = session.data.refreshToken;

    const promise = (async () => {
        try {
            const response = await tokenApi.post("/api/token/refresh/", { refresh: refreshToken });
            return updateSessionTokens(session.version, response.data.access, response.data.refresh);
        } catch {
            if (getSession().version === session.version) clearAuthData();
            throw new Error("Your session has expired. Please log in again.");
        } finally {
            if (refreshInFlight?.version === session.version) refreshInFlight = null;
        }
    })();
    refreshInFlight = { version: session.version, promise };
    return promise;
};

const isAuthRequest = (url = "") => /^\/?api\/(token(?:\/refresh)?|register)\/$/.test(url);

api.interceptors.request.use((config: SessionRequest) => {
    const session = getSession();
    // A retry from an old account must never execute under a new account.
    if (config._retry && config._sessionVersion !== session.version) {
        throw new axios.CanceledError("Session changed.");
    }
    config.headers.delete("Authorization");
    if (!isAuthRequest(config.url) && session.data) {
        config.headers.set("Authorization", `Bearer ${session.data.accessToken}`);
        config._accessToken = session.data.accessToken;
        config._sessionVersion = session.version;
    }
    return config;
});

api.interceptors.response.use(response => {
    const request = response.config as SessionRequest;
    if (request._sessionVersion !== undefined && request._sessionVersion !== getSession().version) {
        throw new axios.CanceledError("Session changed.");
    }
    return response;
}, async error => {
    const request = error.config as SessionRequest | undefined;
    if (!request || error.response?.status !== 401 || isAuthRequest(request.url)) throw error;

    const current = getSession();
    if (!current.data || request._sessionVersion !== current.version) throw new axios.CanceledError("Session changed.");
    if (request._retry) {
        clearAuthData();
        throw new Error("Your session has expired. Please log in again.");
    }
    request._retry = true;
    // Another request may have already refreshed while this 401 was in flight.
    if (request._accessToken === current.data.accessToken) await refreshSession();
    return api(request);
});

export default api;
