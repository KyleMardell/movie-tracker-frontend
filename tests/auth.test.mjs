import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import axios from "axios";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const account = (user = "alice") => ({ user, accessToken: user + "-access", refreshToken: user + "-refresh" });
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};
const tick = () => new Promise(resolve => setImmediate(resolve));
const ok = (config, data = []) => ({ config, status: 200, data, headers: {}, statusText: "OK" });
const unauthorized = config => Promise.reject({ config, response: { status: 401 } });

function fixture(initial = null) {
    let stored = initial;
    const events = new Map(), clients = [], modules = new Map(), mocks = new Map();
    const browser = {
        localStorage: {
            getItem: () => stored,
            setItem: (_key, value) => { stored = value; },
            removeItem: () => { stored = null; },
        },
        addEventListener: (name, listener) => {
            if (!events.has(name)) events.set(name, new Set());
            events.get(name).add(listener);
        },
        removeEventListener: (name, listener) => events.get(name)?.delete(listener),
    };
    const axiosMock = { ...axios, create: config => {
        const client = axios.create(config);
        clients.push(client);
        return client;
    } };
    function load(relative) {
        let filename = path.resolve(root, relative);
        if (!path.extname(filename)) filename += fs.existsSync(filename + ".ts") ? ".ts" : ".tsx";
        if (modules.has(filename)) return modules.get(filename).exports;
        const loadedModule = { exports: {} };
        modules.set(filename, loadedModule);
        const localRequire = specifier => {
            if (mocks.has(specifier)) return mocks.get(specifier);
            if (specifier === "axios") return axiosMock;
            if (specifier.startsWith(".")) return load(path.resolve(path.dirname(filename), specifier));
            return require(specifier);
        };
        const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
        }).outputText;
        vm.runInNewContext(source, {
            exports: loadedModule.exports, module: loadedModule, require: localRequire, window: browser, AbortController,
        }, { filename });
        return loadedModule.exports;
    }
    const session = load("src/app/lib/session.ts");
    const transport = load("src/app/lib/axios.ts");
    return {
        session, ...transport, clients, browser, load, mocks,
        storage: () => stored === null ? null : JSON.parse(stored),
        removeStorage: () => { stored = null; },
        emitStorage: () => events.get("storage")?.forEach(listener => listener()),
    };
}

test("malformed and unavailable storage safely produces a logged-out session", () => {
    for (const raw of ["{broken", "null", "[]", "{}", '{"user":"alice","accessToken":1,"refreshToken":"x"}']) {
        const f = fixture(raw);
        assert.equal(f.session.getSession().data, null);
        assert.equal(f.storage(), null);
    }
    const f = fixture();
    f.browser.localStorage.getItem = () => { throw new Error("Unavailable"); };
    f.browser.localStorage.removeItem = () => { throw new Error("Unavailable"); };
    assert.equal(f.session.getSession().data, null);
    assert.throws(() => f.session.setAuthData({ user: "alice" }), /Invalid authentication/);
});

test("logout and direct storage removal strip inherited Authorization and notify UI subscribers", async () => {
    const f = fixture();
    const api = f.default;
    let authorization;
    api.defaults.headers.common.Authorization = "Bearer obsolete";
    api.defaults.adapter = async config => {
        authorization = config.headers.get("Authorization");
        return ok(config);
    };
    f.session.setAuthData(account());
    await api.get("/api/movies/");
    assert.equal(authorization, "Bearer alice-access");
    f.session.clearAuthData();
    await api.get("/api/movies/");
    assert.equal(authorization, undefined);
    f.session.setAuthData(account());
    let notified = 0;
    const unsubscribe = f.session.subscribeAuth(() => { notified++; });
    f.removeStorage();
    await api.get("/api/movies/");
    assert.equal(authorization, undefined);
    assert.equal(f.session.getAuthSnapshot().data, null);
    assert.equal(notified, 1);
    unsubscribe();
});

test("login and registration never inherit old authorization or trigger refresh on 401", async () => {
    const f = fixture();
    f.session.setAuthData(account());
    let calls = 0;
    f.clients[1].defaults.adapter = async config => { calls++; return ok(config); };
    f.default.defaults.headers.common.Authorization = "Bearer obsolete";
    f.default.defaults.adapter = config => {
        assert.equal(config.headers.get("Authorization"), undefined);
        return unauthorized(config);
    };
    await assert.rejects(f.default.post("/api/token/", { username: "test", password: "test" }));
    await assert.rejects(f.default.post("/api/register/", { username: "test", password: "test" }));
    assert.equal(calls, 0);
});

test("concurrent 401s and periodic refresh share one rotation and keep the session identity", async () => {
    const f = fixture();
    f.session.setAuthData(account());
    const version = f.session.getSession().version;
    const gate = deferred();
    let calls = 0;
    f.clients[1].defaults.adapter = async config => {
        calls++;
        await gate.promise;
        return ok(config, { access: "renewed-access", refresh: "rotated-refresh" });
    };
    f.default.defaults.adapter = config => config._retry ? Promise.resolve(ok(config)) : unauthorized(config);
    const one = f.default.get("/api/movies/");
    const two = f.default.get("/api/movies/");
    await tick();
    const periodic = f.refreshSession();
    assert.equal(calls, 1);
    gate.resolve();
    await Promise.all([one, two, periodic]);
    assert.equal(f.storage().refreshToken, "rotated-refresh");
    assert.equal(f.session.getAuthSnapshot().data.accessToken, "renewed-access");
    assert.equal(f.session.getSession().version, version);
    assert.equal(calls, 1);
});

test("a delayed old-token 401 reuses an already refreshed token without another rotation", async () => {
    const f = fixture();
    f.session.setAuthData(account());
    const delayed = deferred();
    let refreshes = 0;
    f.clients[1].defaults.adapter = async config => {
        refreshes++;
        return ok(config, { access: "renewed-access" });
    };
    f.default.defaults.adapter = async config => {
        if (!config._retry) {
            await delayed.promise;
            return unauthorized(config);
        }
        assert.equal(config.headers.get("Authorization"), "Bearer renewed-access");
        return ok(config);
    };
    const request = f.default.get("/api/movies/");
    await tick();
    await f.refreshSession();
    delayed.resolve();
    await request;
    assert.equal(refreshes, 1);
    assert.equal(f.storage().refreshToken, "alice-refresh");
});

test("refresh failure clears storage and authenticated UI without recursive refresh", async () => {
    const f = fixture();
    f.session.setAuthData(account());
    let observed, calls = 0;
    f.session.subscribeAuth(() => { observed = f.session.getAuthSnapshot().data; });
    f.clients[1].defaults.adapter = config => { calls++; return unauthorized(config); };
    await assert.rejects(f.refreshSession(), /session has expired/);
    assert.equal(f.storage(), null);
    assert.equal(observed, null);
    assert.equal(calls, 1);
});

test("logout during refresh cannot resurrect the session", async () => {
    const f = fixture();
    f.session.setAuthData(account());
    const gate = deferred();
    f.clients[1].defaults.adapter = async config => {
        await gate.promise;
        return ok(config, { access: "late-access", refresh: "late-refresh" });
    };
    const refresh = f.refreshSession();
    const rejected = assert.rejects(refresh, /session has expired/);
    await tick();
    f.session.clearAuthData();
    gate.resolve();
    await rejected;
    assert.equal(f.session.getSession().data, null);
    assert.equal(f.storage(), null);
});

test("old refresh success or failure cannot overwrite or log out a replacement account", async () => {
    for (const fail of [false, true]) {
        const f = fixture();
        f.session.setAuthData(account());
        const gate = deferred();
        f.clients[1].defaults.adapter = async config => {
            await gate.promise;
            if (fail) return unauthorized(config);
            return ok(config, { access: "late-access", refresh: "late-refresh" });
        };
        const rejected = assert.rejects(f.refreshSession());
        await tick();
        const previous = f.session.getSession().version;
        f.session.setAuthData(account("bob"));
        assert.notEqual(f.session.getSession().version, previous);
        gate.resolve();
        await rejected;
        assert.equal(f.session.getSession().data.user, "bob");
        assert.equal(f.storage().accessToken, "bob-access");
    }
});

test("in-flight movie responses from a previous account are rejected", async () => {
    const f = fixture();
    f.session.setAuthData(account());
    const gate = deferred();
    f.default.defaults.adapter = async config => { await gate.promise; return ok(config, [{ id: 1 }]); };
    const rejected = assert.rejects(f.default.get("/api/movies/"), error => axios.isCancel(error));
    await tick();
    f.session.setAuthData(account("bob"));
    gate.resolve();
    await rejected;
});

test("cross-tab account changes notify subscribers and create a fresh session identity", () => {
    const f = fixture();
    f.session.setAuthData(account());
    const previous = f.session.getSession().version;
    let notifications = 0;
    f.session.subscribeAuth(() => { notifications++; });
    f.browser.localStorage.setItem("movieTrackerData", JSON.stringify(account("bob")));
    f.emitStorage();
    assert.equal(f.session.getAuthSnapshot().data.user, "bob");
    assert.notEqual(f.session.getSession().version, previous);
    assert.equal(notifications, 1);
});

test("movie provider keys account state and ignores an aborted late list response", async () => {
    const f = fixture();
    let user = "alice", version = 1;
    const effects = [], updates = [];
    const gate = deferred();
    let signal;
    f.mocks.set("react", {
        createContext: () => ({ Provider: "provider" }),
        useState: initial => [initial, value => updates.push(value)],
        useEffect: effect => effects.push(effect),
    });
    f.mocks.set("react/jsx-runtime", { jsx: (type, props, key) => ({ type, props, key }) });
    f.mocks.set("../useAuth", { useAuth: () => ({ user, sessionVersion: version }) });
    f.mocks.set("../lib/api", { getMovies: requestSignal => { signal = requestSignal; return gate.promise; } });
    const { UserMoviesProvider } = f.load("src/app/context/UserMoviesContext.tsx");
    const first = UserMoviesProvider({ children: null });
    const firstRender = first.type(first.props);
    assert.equal(firstRender.props.value.userMovies.length, 0);
    const cleanup = effects.pop()();
    cleanup();
    assert.equal(signal.aborted, true);
    user = "bob"; version++;
    const second = UserMoviesProvider({ children: null });
    assert.notEqual(first.key, second.key);
    assert.equal(second.type(second.props).props.value.userMovies.length, 0);
    gate.resolve([{ id: 1 }]);
    await tick();
    assert.equal(updates.length, 0);
    user = null; version++;
    const loggedOut = UserMoviesProvider({ children: null });
    assert.notEqual(second.key, loggedOut.key);
    assert.equal(loggedOut.type(loggedOut.props).props.value.userMovies.length, 0);
});
