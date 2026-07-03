import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

async function getUser() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getUser,
  });
}
