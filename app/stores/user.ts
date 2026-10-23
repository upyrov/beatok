import { create } from "zustand";
import type { Me } from "~/api/types/user";

interface UserState {
  user: Me | null;
}
interface UserActions {
  setUser: (user: Me | null) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
