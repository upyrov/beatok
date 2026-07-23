import { refresh } from "../api/auth";

let refreshPromise: Promise<void> | null = null;

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const urlString = input instanceof URL ? input.toString() : input;
  const isRelative = typeof urlString === "string" && urlString.startsWith("/");

  const finalUrl = isRelative
    ? `${import.meta.env.VITE_API_BASE_URL}${urlString}`
    : input;
  const finalInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  let response = await fetch(finalUrl, finalInit);

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refresh().finally(() => {
        refreshPromise = null;
      });
    }

    await refreshPromise;
    response = await fetch(finalUrl, finalInit);
  }

  return response;
}
