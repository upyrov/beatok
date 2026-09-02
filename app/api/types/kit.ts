import type { Genre } from "./genre";

export interface CreateKit {
	name: string;
	genreIds: string[];
}

export interface KitUpdate {
	name: string;
	genreIds: string[];
}

export interface Kit {
	id: string;
	name: string;
	genres: Genre[];
}
