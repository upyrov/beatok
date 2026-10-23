import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { auth } from "../lib/firebase";

export async function fetchApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const urlString = input instanceof URL ? input.toString() : input;
  const isRelative = typeof urlString === "string" && urlString.startsWith("/");
  const url = isRelative
    ? `${import.meta.env.VITE_API_BASE_URL}${urlString}`
    : input;

  const headers = new Headers(init?.headers);
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401) throw new Error("Unauthorized");

  if (!response.ok) {
    let message = "Something went wrong, please try again later";
    try {
      const data = await response.json();
      message = data?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return undefined as T;
}

type ResolveItem<T> = T extends readonly [infer Item, ...unknown[]] ? Item : T;
type ResolveArgs<T> = T extends readonly [unknown, ...infer Args] ? Args : [];

export class CrudApi<TConfig, TCreate = unknown, TUpdate = unknown> {
  constructor(
    protected basePath: string,
    protected queryKeys: {
      lists: () => readonly unknown[];
      detail: (id: string) => readonly unknown[];
      list: (...args: ResolveArgs<TConfig>) => readonly unknown[];
    },
    protected buildListPath?: (...args: ResolveArgs<TConfig>) => string,
  ) {}

  listQueryOptions = (...args: ResolveArgs<TConfig>) => ({
    queryKey: this.queryKeys.list(...args),
    queryFn: () =>
      fetchApi<ResolveItem<TConfig>[]>(
        this.buildListPath ? this.buildListPath(...args) : this.basePath,
      ),
  });

  useList = (...args: ResolveArgs<TConfig>) =>
    useQuery({
      ...this.listQueryOptions(...args),
      placeholderData: keepPreviousData,
    });

  useCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: TCreate) =>
        fetchApi<ResolveItem<TConfig>>(this.basePath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: this.queryKeys.lists() });
      },
    });
  };

  useUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (params: { id: string; data: TUpdate }) =>
        fetchApi<ResolveItem<TConfig>>(`${this.basePath}/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params.data),
        }),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: this.queryKeys.detail(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: this.queryKeys.lists() });
      },
    });
  };

  useDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) =>
        fetchApi<void>(`${this.basePath}/${id}`, { method: "DELETE" }),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: this.queryKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: this.queryKeys.lists() });
      },
    });
  };
}
