import { CrudApi } from ".";
import { queryKeys } from "./query-keys";
import type { CreateKit, Kit, KitUpdate } from "./types/kit";

export const {
	listQueryOptions: kitsQueryOptions,
	useList: useKits,
	useCreate: useCreateKit,
	useUpdate: useUpdateKit,
	useDelete: useDeleteKit,
} = new CrudApi<Kit, CreateKit, KitUpdate>("/kits", queryKeys.kits);
