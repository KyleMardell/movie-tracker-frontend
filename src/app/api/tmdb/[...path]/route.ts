import { NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const MOVIE_ID = /^[1-9]\d*$/;
const PAGE = /^[1-9]\d{0,2}$/;

const isAllowedPath = (path: string[]) =>
    (path.length === 2 &&
        path[0] === "search" &&
        path[1] === "movie") ||
    (path.length === 2 &&
        path[0] === "movie" &&
        ["popular", "top_rated"].includes(path[1])) ||
    (path.length === 3 &&
        path[0] === "trending" &&
        path[1] === "movie" &&
        path[2] === "day") ||
    (path.length === 2 && path[0] === "movie" && MOVIE_ID.test(path[1])) ||
    (path.length === 4 &&
        path[0] === "movie" &&
        MOVIE_ID.test(path[1]) &&
        path[2] === "watch" &&
        path[3] === "providers");

const errorResponse = (message: string, status: number) =>
    NextResponse.json({ detail: message }, { status });

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;

    if (!isAllowedPath(path)) {
        return errorResponse("Unsupported movie data request.", 404);
    }

    const token = process.env.TMDB_READ_TOKEN;
    if (!token) {
        return errorResponse("Movie data is temporarily unavailable.", 503);
    }

    const requestUrl = new URL(request.url);
    const upstreamUrl = new URL(`${TMDB_BASE_URL}/${path.join("/")}`);
    const language = requestUrl.searchParams.get("language");
    const page = requestUrl.searchParams.get("page");
    const query = requestUrl.searchParams.get("query");

    if (language === "en-US") {
        upstreamUrl.searchParams.set("language", language);
    }

    if (path[0] === "search") {
        if (!query || query.trim().length === 0 || query.length > 200) {
            return errorResponse("A valid movie search query is required.", 400);
        }
        upstreamUrl.searchParams.set("query", query);
    }

    if (path[1] === "popular" || path[1] === "top_rated" || path[0] === "search") {
        if (!page || !PAGE.test(page) || Number(page) > 500) {
            return errorResponse("A valid movie page is required.", 400);
        }
        upstreamUrl.searchParams.set("page", page);
    }

    try {
        const response = await fetch(upstreamUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return errorResponse("Unable to load movie data. Please try again.", response.status);
        }

        return NextResponse.json(await response.json());
    } catch {
        return errorResponse("Unable to load movie data. Please try again.", 502);
    }
}
