import { useRef, useState } from "react";
import { CgPlayButton, CgPlayPause } from "react-icons/cg";
import { formatTime } from "~/lib/time";

export function AudioPlayer({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function handleClick() {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }

  return (
    <div
      className={`flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200 w-full ${className}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        type="button"
        onClick={handleClick}
        className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-400 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        {isPlaying ? <CgPlayPause /> : <CgPlayButton />}
      </button>

      <span className="text-xs font-mono font-medium text-gray-600 w-10 text-right">
        {formatTime(currentTime)}
      </span>

      <input
        type="range"
        min="0"
        max={duration || 100}
        value={currentTime}
        onChange={handleChange}
        step="0.01"
        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />

      <span className="text-xs font-mono font-medium text-gray-600 w-10">
        {formatTime(duration)}
      </span>
    </div>
  );
}
