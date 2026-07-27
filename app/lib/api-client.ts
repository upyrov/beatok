import { refresh } from "../api/auth";
import { getQueryClient } from "./query-client";

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
    `API Error (${response.status})${data?.message ? `: ${data.message}` : ""}`,
  );
  throw new Error(
    data?.message ?? "Something went wrong, please try again later",
  );
}

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
    const queryClient = getQueryClient();

    if (queryClient.getQueryData(["auth", "status"]) === "unauthenticated") {
      throw new AuthError("Unauthorized");
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ["auth", "refresh"],
        queryFn: refresh,
        staleTime: 0,
        retry: false,
      });
      queryClient.setQueryData(["auth", "status"], "authenticated");
    } catch (err) {
      queryClient.setQueryData(["auth", "status"], "unauthenticated");
      throw new AuthError(err instanceof Error ? err.message : String(err));
    }

    response = await fetch(finalUrl, finalInit);

    if (response.status === 401) {
      queryClient.setQueryData(["auth", "status"], "unauthenticated");
      throw new AuthError("Unauthorized");
    }
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  return response;
}
