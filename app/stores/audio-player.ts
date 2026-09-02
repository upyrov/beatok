import { createStore } from "zustand/vanilla";

interface AudioPlayerState {
	activeId: string | null;
	players: Map<string, () => void>;
}

interface AudioPlayerActions {
	mount: (id: string, toggle: () => void) => void;
	unmount: (id: string) => void;
	setActive: (id: string) => void;
	toggleActive: () => void;
}

type AudioPlayerStore = AudioPlayerState & AudioPlayerActions;

export const audioPlayerStore = createStore<AudioPlayerStore>((set, get) => ({
	activeId: null,
	players: new Map(),

	mount: (id, toggle) =>
		set((state) => {
			const newPlayers = new Map(state.players);
			newPlayers.set(id, toggle);
			return {
				players: newPlayers,
				activeId: state.activeId ? state.activeId : id,
			};
		}),

	unmount: (id) =>
		set((state) => {
			const newPlayers = new Map(state.players);
			newPlayers.delete(id);
			return {
				players: newPlayers,
				activeId:
					state.activeId === id
						? newPlayers.keys().next().value || null
						: state.activeId,
			};
		}),

	setActive: (id) => set({ activeId: id }),

	toggleActive: () => {
		const { activeId, players } = get();
		if (activeId) {
			const toggle = players.get(activeId);
			if (toggle) toggle();
		}
	},
}));
