export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const urlString = input instanceof URL ? input.toString() : input;
  const isRelative = typeof urlString === "string" && urlString.startsWith("/");

  const url = isRelative
    ? `${import.meta.env.VITE_API_BASE_URL}${urlString}`
    : input;

  const response = await fetch(url, { ...init, credentials: "include" });

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
