import { lazy, Suspense } from "react";
import type { AudioPlayerProps } from "./audio-player";

const AudioPlayerCore = lazy(() =>
	import("./audio-player").then((m) => ({ default: m.AudioPlayer })),
);

export function AudioPlayer(props: AudioPlayerProps) {
	return (
		<Suspense
			fallback={
				<div
					className={`h-10 w-full animate-pulse bg-black/10 dark:bg-white/10 rounded-lg ${props.className ?? ""}`}
				/>
			}
		>
			<AudioPlayerCore {...props} />
		</Suspense>
	);
}
