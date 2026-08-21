import WaveSurfer from "wavesurfer.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { CgPlayButton, CgPlayPause } from "react-icons/cg";
import { Keyboard } from "~/components/ui/keyboard";
import { audioPlayerStore } from "~/stores/audio-player";

export interface AudioPlayerProps {
  src: string;
  className?: string;
  syncStartAt?: string;
  hideControls?: boolean;
}

function formatTime(seconds: number) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  className = "",
  syncStartAt,
  hideControls = false,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const playerId = useRef(Math.random().toString(36).slice(2)).current;

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: src,
      waveColor: "#a1a1aa",
      progressColor: "#000000",
      height: 32,
      cursorWidth: 1,
      cursorColor: "#000000",
      normalize: true,
      interact: !hideControls,
    });
    setWavesurfer(ws);

    const updateTime = () => {
      if (timeRef.current) {
        timeRef.current.textContent = `${formatTime(ws.getCurrentTime())} / ${formatTime(ws.getDuration())}`;
      }
    };

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
      updateTime();
    });
    
    ws.on("decode", (duration) => {
      setDuration(duration);
    });

    ws.on("play", () => {
      setIsPlaying(true);
      window.dispatchEvent(
        new CustomEvent("audioplay", { detail: playerId }),
      );
    });
    
    ws.on("pause", () => {
      setIsPlaying(false);
    });

    ws.on("audioprocess", updateTime);
    ws.on("timeupdate", updateTime);

    return () => {
      ws.destroy();
    };
  }, [src, hideControls, playerId]);

  useEffect(() => {
    if (!wavesurfer) return;

    async function handleGlobalPlay(e: Event) {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== playerId && wavesurfer?.isPlaying()) {
        wavesurfer.pause();
      }
    }

    window.addEventListener("audioplay", handleGlobalPlay);
    return () => window.removeEventListener("audioplay", handleGlobalPlay);
  }, [wavesurfer, playerId]);

  useEffect(() => {
    if (!wavesurfer || !syncStartAt) return;

    const onReady = () => {
      const startMs = new Date(syncStartAt).getTime();
      const offsetSeconds = (Date.now() - startMs) / 1000;

      if (offsetSeconds > 0) {
        wavesurfer.setTime(offsetSeconds);
      }
      
      wavesurfer.play().catch((err) => {
        if (err.name === "NotAllowedError" || err.message.includes("play()")) {
          wavesurfer.setMuted(true);
          
          wavesurfer.play().catch(() => {});

          const enableAudio = () => {
            wavesurfer.setMuted(false);
            window.removeEventListener("click", enableAudio);
            window.removeEventListener("keydown", enableAudio);
          };
          
          window.addEventListener("click", enableAudio);
          window.addEventListener("keydown", enableAudio);
        }
      });
    };

    wavesurfer.on("ready", onReady);
    
    if (wavesurfer.getDuration() > 0) {
      onReady();
    }

    return () => {
      wavesurfer.un("ready", onReady);
    };
  }, [wavesurfer, syncStartAt]);

  const handleClick = useCallback(() => {
    if (!wavesurfer) return;
    if (wavesurfer.getMuted()) {
      wavesurfer.setMuted(false);
      if (!wavesurfer.isPlaying()) {
        wavesurfer.play();
      }
      return;
    }
    wavesurfer.playPause();
  }, [wavesurfer]);

  const stateRef = useRef({ isReady, hideControls, handleClick });
  stateRef.current = { isReady, hideControls, handleClick };

  useEffect(() => {
    audioPlayerStore.getState().mount(playerId, () => {
      const { isReady, hideControls, handleClick } = stateRef.current;
      if (isReady && !hideControls) {
        handleClick();
      }
    });
    return () => audioPlayerStore.getState().unmount(playerId);
  }, [playerId]);

  return (
    <div
      className={`transition duration-300 starting:opacity-0 starting:translate-y-1 flex items-center gap-2 rounded-lg w-full bg-gray-200 p-1.5 border border-black/5 relative ${className}`}
    >
      {!hideControls && (
        <button
          type="button"
          onClick={handleClick}
          disabled={!isReady}
          title="Play/Pause (Space)"
          className="shrink-0 w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-full transition-colors focus:outline-none text-black shadow-sm"
        >
          {isPlaying ? <CgPlayPause size={20} /> : <CgPlayButton size={20} />}
        </button>
      )}

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

      {!hideControls && (
        <div className="shrink-0 flex items-center gap-2">
          <Keyboard className="hidden md:inline-block">Space</Keyboard>
          <div ref={timeRef} className="text-[10px] font-mono text-gray-500 whitespace-nowrap px-1 text-right min-w-16">
            0:00 / 0:00
          </div>
        </div>
      )}
    </div>
  );
}
