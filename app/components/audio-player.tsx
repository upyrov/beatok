import { Button } from "@base-ui/react";
import { useWavesurfer } from "@wavesurfer/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CgPlayButton, CgPlayPause } from "react-icons/cg";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className = "" }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: src,
    waveColor: "#a1a1aa",
    progressColor: "#000000",
    height: 32,
    cursorWidth: 1,
    cursorColor: "#000000",
    normalize: true,
  });

  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on("decode", (duration) => setDuration(duration)),
      wavesurfer.on("ready", () => setDuration(wavesurfer.getDuration())),
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
      className={`transition duration-300 starting:opacity-0 starting:translate-y-1 flex items-center gap-2 rounded-lg w-full bg-gray-200 p-1.5 border border-black/5 ${className}`}
    >
      <Button
        type="button"
        onClick={handleClick}
        disabled={!isReady}
        className="shrink-0 w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-full transition-colors focus:outline-none text-black shadow-sm"
      >
        {isPlaying ? <CgPlayPause size={20} /> : <CgPlayButton size={20} />}
      </Button>

      <div className="flex-1 h-8 relative rounded min-w-20" ref={containerRef}>
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 z-10 pointer-events-none">
            {[0.4, 0.8, 0.5, 1, 0.6].map((scale, i) => (
              <div
                key={i}
                className="w-1 bg-black/20 rounded-full animate-pulse"
                style={{
                  height: `${scale * 16}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 text-[10px] font-mono text-gray-500 whitespace-nowrap px-1 text-right">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
