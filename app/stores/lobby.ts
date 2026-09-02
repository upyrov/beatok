import type { HubConnection } from "@microsoft/signalr";
import type { SetStateAction } from "react";
import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import type { DetailedLobby } from "~/api/types/lobby";

export interface LobbyState {
	lobby: DetailedLobby | null;
	connection: HubConnection | null;
}

interface LobbyActions {
	setLobby: (lobby: SetStateAction<DetailedLobby | null>) => void;
	setConnection: (connection: HubConnection | null) => void;
}

export type LobbyStoreType = LobbyState & LobbyActions;

export type LobbyStore = ReturnType<typeof createLobbyStore>;

export const createLobbyStore = (initProps?: Partial<LobbyState>) => {
	return createStore<LobbyStoreType>()((set) => ({
		lobby: initProps?.lobby ?? null,
		connection: initProps?.connection ?? null,
		setLobby: (update) =>
			set((state) => ({
				lobby: typeof update === "function" ? update(state.lobby) : update,
			})),
		setConnection: (connection) => set({ connection }),
	}));
};

export const LobbyContext = createContext<LobbyStore | null>(null);

export function useLobbyStore<T>(selector: (state: LobbyStoreType) => T): T {
	const store = useContext(LobbyContext);
	if (!store) throw new Error("Missing LobbyContext.Provider in the tree");
	return useStore(store, selector);
}
