export type AuthData = {
    user: string;
    accessToken: string;
    refreshToken: string;
};

const STORAGE_KEY = "movieTrackerData";
const listeners = new Set<() => void>();
const serverSnapshot = { data: null as AuthData | null, version: 0 };

const isAuthData = (value: unknown): value is AuthData => {
    if (!value || typeof value !== "object") return false;
    const data = value as Record<string, unknown>;
    return ["user", "accessToken", "refreshToken"].every(key =>
        typeof data[key] === "string" && data[key].trim().length > 0
    );
};

const readStored = (): AuthData | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const value: unknown = JSON.parse(raw);
        if (isAuthData(value)) {
            return { user: value.user, accessToken: value.accessToken, refreshToken: value.refreshToken };
        }
    } catch {
        // Invalid JSON or unavailable storage must not prevent the login screen loading.
    }
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Storage unavailable. */ }
    return null;
};

let snapshot = { data: readStored(), version: 0 };
const publish = (data: AuthData | null, version = snapshot.version + 1) => {
    snapshot = { data, version };
    listeners.forEach(listener => listener());
    return snapshot;
};

// Reconcile direct storage removal and changes made by another browser tab.
export const getSession = () => {
    const data = readStored();
    if (data?.user !== snapshot.data?.user ||
        data?.accessToken !== snapshot.data?.accessToken ||
        data?.refreshToken !== snapshot.data?.refreshToken) {
        publish(data);
    }
    return snapshot;
};

export const getAuthSnapshot = () => snapshot;
export const getServerAuthSnapshot = () => serverSnapshot;
export const subscribeAuth = (listener: () => void) => {
    listeners.add(listener);
    const sync = () => { getSession(); };
    window.addEventListener("storage", sync);
    sync();
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", sync);
    };
};

export const setAuthData = (data: AuthData) => {
    if (!isAuthData(data)) throw new Error("Invalid authentication response.");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    publish(data);
};

export const clearAuthData = () => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Storage unavailable. */ }
    publish(null);
};

// A refresh must never restore a logged-out or replaced session.
export const updateSessionTokens = (version: number, accessToken: string, refreshToken?: string) => {
    const current = getSession();
    if (current.version !== version || !current.data) throw new Error("Session changed.");
    const data = { ...current.data, accessToken, refreshToken: refreshToken ?? current.data.refreshToken };
    if (!isAuthData(data)) throw new Error("Invalid token refresh response.");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return publish(data, version);
};
