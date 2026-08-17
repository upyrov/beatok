import { lazy, Suspense } from "react";

const AudioPlayerCore = lazy(() =>
  import("./audio-player").then((m) => ({ default: m.AudioPlayer })),
);

export function AudioPlayer(props: any) {
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
