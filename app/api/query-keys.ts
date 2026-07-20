import type { LobbyFilter } from "./types/lobby-filter";

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },
  lobbies: {
    all: ["lobbies"] as const,
    lists: () => [...queryKeys.lobbies.all, "list"] as const,
    list: (filters: LobbyFilter) =>
      [...queryKeys.lobbies.lists(), { filters }] as const,
    details: () => [...queryKeys.lobbies.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.lobbies.details(), id] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  genres: {
    all: ["genres"] as const,
    lists: () => [...queryKeys.genres.all, "list"] as const,
    list: () => [...queryKeys.genres.lists()] as const,
    details: () => [...queryKeys.genres.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.genres.details(), id] as const,
  },
  kits: {
    all: ["kits"] as const,
    lists: () => [...queryKeys.kits.all, "list"] as const,
    list: () => [...queryKeys.kits.lists()] as const,
    details: () => [...queryKeys.kits.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.kits.details(), id] as const,
  },
  sounds: {
    all: ["sounds"] as const,
    lists: () => [...queryKeys.sounds.all, "list"] as const,
    list: () => [...queryKeys.sounds.lists()] as const,
    details: () => [...queryKeys.sounds.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.sounds.details(), id] as const,
  },
  submissions: {
    all: ["submissions"] as const,
    lists: () => [...queryKeys.submissions.all, "list"] as const,
    list: () => [...queryKeys.submissions.lists()] as const,
    details: () => [...queryKeys.submissions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.submissions.details(), id] as const,
    upload: (extension: string) =>
      [...queryKeys.submissions.all, "upload", extension] as const,
  },
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },
};
