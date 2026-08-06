import { auth } from "./firebase";

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const urlString = input instanceof URL ? input.toString() : input;
  const isRelative = typeof urlString === "string" && urlString.startsWith("/");

  const url = isRelative
    ? `${import.meta.env.VITE_API_BASE_URL}${urlString}`
    : input;

  const headers = new Headers(init?.headers);

  // Wait for the initial authentication state to resolve
  await auth.authStateReady();

  const token = await auth.currentUser?.getIdToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const data: { message: string } | undefined = await response
      .json()
      .catch(() => {});

    throw new Error(
      data?.message ?? "Something went wrong, please try again later",
    );
  }

  return response;
}
