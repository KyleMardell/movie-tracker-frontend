export const getErrorMessage = (
    error: unknown,
    fallback = "Something went wrong. Please try again."
) => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "object" && error !== null) {
        const response = "response" in error ? error.response : null;
        if (typeof response === "object" && response !== null && "data" in response) {
            const data = response.data;
            if (typeof data === "object" && data !== null) {
                if ("detail" in data && typeof data.detail === "string") {
                    return data.detail;
                }
                if ("message" in data && typeof data.message === "string") {
                    return data.message;
                }
            }
        }
    }

    return fallback;
};
