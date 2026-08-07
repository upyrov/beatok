import { Button as BaseButton } from "@base-ui/react";
import { useWavesurfer } from "@wavesurfer/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CgPlayButton, CgPlayPause } from "react-icons/cg";

export function AudioPlayer({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: src,
    waveColor: "#4b5563",
    progressColor: "#f97316",
    height: 80,
    cursorWidth: 1,
    cursorColor: "#ffffff",
    normalize: true,
  });

  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on("decode", (duration) => setDuration(duration)),
    ];

    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [wavesurfer]);

  const handleClick = useCallback(() => wavesurfer?.playPause(), [wavesurfer]);

  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div
      className={`flex items-center gap-4 rounded-xl w-full shadow-2xl ${className}`}
    >
      <BaseButton
        type="button"
        onClick={handleClick}
        disabled={!isReady}
        className="shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white shadow-lg"
      >
        {isPlaying ? <CgPlayPause size={24} /> : <CgPlayButton size={24} />}
      </BaseButton>

      <div className="flex flex-col flex-1 gap-2 overflow-hidden">
        <div className="flex justify-between items-center w-full px-1">
          <span className="text-xs font-mono font-medium text-orange-500/80">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs font-mono font-medium text-gray-500">
            {formatTime(duration)}
          </span>
        </div>
        <div
          className="flex-1 bg-gray-950/50 rounded-lg overflow-hidden border border-gray-800/50"
          ref={containerRef}
        />
      </div>
    </div>
  );
}
