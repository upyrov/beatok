import { refresh } from "../api/auth";
import { getQueryClient } from "./query-client";

export class AuthError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}

export async function handleApiError(response: Response): Promise<never> {
  const data: { message: string } | undefined = await response
    .json()
    .catch(() => {});

  const message =
    data?.message ?? "Something went wrong, please try again later";
  throw new Error(message);
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const urlString = input instanceof URL ? input.toString() : input;
  const isRelative = typeof urlString === "string" && urlString.startsWith("/");

  const url = isRelative
    ? `${import.meta.env.VITE_API_BASE_URL}${urlString}`
    : input;

  let response = await fetch(url, { ...init, credentials: "include" });

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
      return fetchWithAuth(input, init);
    } catch (error) {
      queryClient.setQueryData(["auth", "status"], "unauthenticated");
      throw new AuthError(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  if (!response.ok) {
    await handleApiError(response);
  }

  return response;
}
