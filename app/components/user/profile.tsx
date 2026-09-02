import { Input as BaseInput, Button } from "@base-ui/react";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
	CgChart,
	CgSoftwareUpload,
	CgSpinner,
	CgTrash,
	CgTrending,
	CgTrophy,
	CgUser,
} from "react-icons/cg";
import { queryKeys } from "~/api/query-keys";
import type { Profile as IProfile } from "~/api/types/user";
import { useUpdateUser, useUploadAvatarUrl } from "~/api/user";
import { FileDropzone } from "~/components/file-dropzone";
import { toastError } from "~/lib/toast";
import { uploadFile } from "~/lib/upload";
import { debounce } from "~/lib/utils";

interface ProfileProps {
	user: IProfile;
	isCurrentUser: boolean;
}

export function Profile({ user, isCurrentUser }: ProfileProps) {
	const getUploadUrlMutation = useUploadAvatarUrl();
	const updateUserMutation = useUpdateUser();
	const queryClient = useQueryClient();
	const [imageLoaded, setImageLoaded] = useState(false);

	const handleAvatarUpload = useCallback(
		async (file: File, onProgress: (progress: number) => void) => {
			const fileExtension = file.name.split(".").pop() || "";
			const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
				extension: fileExtension,
				contentType: file.type,
			});

			await uploadFile(file, uploadUrl, onProgress);
			await updateUserMutation.mutateAsync({
				name: user.name ?? "",
				pictureKey: fileKey,
			});

			queryClient.invalidateQueries({
				queryKey: queryKeys.users.detail(user.id),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
		},
		[getUploadUrlMutation, updateUserMutation, queryClient, user.id],
	);

	const handleRemoveAvatar = useCallback(async () => {
		await updateUserMutation.mutateAsync({
			name: user.name ?? "",
			pictureKey: null,
		});
		queryClient.invalidateQueries({
			queryKey: queryKeys.users.detail(user.id),
		});
		queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
	}, [updateUserMutation, queryClient, user.id]);

	const [name, setName] = useState(user.name || "");

	const debouncedUpdateName = useMemo(
		() =>
			debounce(async (newName: string) => {
				if (!newName) return;
				try {
					await updateUserMutation.mutateAsync({
						name: newName,
						pictureKey: user.picture?.key ?? null,
					});
					queryClient.invalidateQueries({
						queryKey: queryKeys.users.detail(user.id),
					});
					queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
				} catch (error) {
					toastError(error);
				}
			}, 500),
		[updateUserMutation, queryClient, user.id],
	);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		debouncedUpdateName(newName);
	};

	const dropzoneOverlay = isCurrentUser ? (
		<div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-full overflow-hidden [&>div]:w-full [&>div]:h-full [&>div>div]:w-full [&>div>div]:h-full [&>div>div]:p-0 [&>div>div]:border-none [&>div>div]:bg-transparent [&>div>div]:rounded-none [&>div>p]:mb-0 [&>div>p]:flex [&>div>p]:items-center [&>div>p]:justify-center [&>div>p]:h-full">
			<FileDropzone
				label={<CgSoftwareUpload size={32} className="text-white/80" />}
				accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
				maxFiles={1}
				onUpload={handleAvatarUpload}
			/>
		</div>
	) : null;

	return (
		<div className="system-card flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
			<div className="flex flex-col items-center gap-2">
				<div className="relative group/avatar inline-flex shrink-0 w-24 h-24 sm:w-32 sm:h-32">
					{user.picture ? (
						<>
							{!imageLoaded && (
								<div className="absolute inset-0 flex items-center justify-center z-10">
									<div className="system-skeleton absolute inset-0 rounded-full w-full h-full" />
									<CgSpinner
										role="status"
										aria-label={"Loading..."}
										className="animate-spin text-gray-500 w-8 h-8 relative"
									/>
								</div>
							)}
							<img
								src={user.picture.url}
								alt={user.name ?? "Anonymous"}
								onLoad={() => setImageLoaded(true)}
								className={`object-cover ring-1 ring-black/5 dark:ring-white/10 w-full h-full rounded-full ${imageLoaded ? "" : "invisible"}`}
							/>
						</>
					) : (
						<div className="w-full h-full rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10">
							<CgUser className="text-gray-400 text-6xl group-hover:transition-colors" />
						</div>
					)}
					{dropzoneOverlay}
					{isCurrentUser && user.picture && (
						<Button
							type="button"
							onClick={handleRemoveAvatar}
							disabled={updateUserMutation.isPending}
							className="absolute bottom-2 -right-2 z-20 bg-black/80 hover:bg-red-500 text-white p-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
							title="Remove profile picture"
						>
							<CgTrash size={16} />
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-col flex-1 gap-2 items-center sm:items-start text-center sm:text-left w-full">
				{isCurrentUser ? (
					<div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-sm">
						<BaseInput
							value={name}
							onChange={handleNameChange}
							placeholder="Your Name"
							className="flex-1 system-input text-xl font-semibold w-full"
						/>
					</div>
				) : (
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-200">
						{user.name || "Anonymous"}
					</h1>
				)}
				<div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-2 text-sm text-muted-foreground w-full px-2">
					<div className="flex flex-col items-center">
						<span className="font-semibold text-foreground flex items-center gap-1.5">
							<CgChart /> Rating
						</span>
						<span className="mt-1">{user.rating}</span>
					</div>
					<div className="w-px h-8 bg-black/10 dark:bg-white/10" />
					<div className="flex flex-col items-center">
						<span className="font-semibold text-foreground flex items-center gap-1.5">
							<CgTrophy /> Wins
						</span>
						<span className="mt-1">{user.wins}</span>
					</div>
					<div className="w-px h-8 bg-black/10 dark:bg-white/10" />
					<div className="flex flex-col items-center">
						<span className="font-semibold text-foreground flex items-center gap-1.5">
							<CgTrending /> Win Rate
						</span>
						<span className="mt-1">{Math.round(user.winRate)}%</span>
					</div>
				</div>
			</div>
		</div>
	);
}
