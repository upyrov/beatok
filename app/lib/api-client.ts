import { refresh } from "../api/auth";

export class AuthError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}

export async function handleApiError(response: Response): Promise<never> {
  let data: { message: string } | undefined;
  try {
    data = await response.json();
  } catch {
    // Ignore
  }
  console.error(
    `API Error (${response.status}):`,
    data?.message ?? "Something went wrong",
  );
  throw new Error(data?.message ?? "Something went wrong");
}

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
      refreshPromise = refresh()
        .catch((err) => {
          throw new AuthError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    await refreshPromise;
    response = await fetch(finalUrl, finalInit);

    if (response.status === 401) {
      throw new AuthError("Unauthorized");
    }
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  return response;
}
