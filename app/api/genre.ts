import { CrudApi } from ".";
import { queryKeys } from "./query-keys";
import type { CreateGenre, Genre, GenreUpdate } from "./types/genre";

export const {
	listQueryOptions: genresQueryOptions,
	useList: useGenres,
	useCreate: useCreateGenre,
	useUpdate: useUpdateGenreName,
	useDelete: useDeleteGenre,
} = new CrudApi<Genre, CreateGenre, GenreUpdate>("/genres", queryKeys.genres);
