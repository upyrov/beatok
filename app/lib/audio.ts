export const MUSIC_FILE_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".flac",
  ".ogg",
  ".m4a",
  ".aac",
];

export const MUSIC_FILE_ACCEPT = MUSIC_FILE_EXTENSIONS.join(",");

export function isMusicFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  return MUSIC_FILE_EXTENSIONS.includes(extension);
}

export async function getAudioDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    let resolved = false;

    function cleanup() {
      if (resolved) return;
      resolved = true;
      URL.revokeObjectURL(objectUrl);
    }

    const timer = setTimeout(() => {
      cleanup();
      resolve(1); // fallback if metadata loading times out
    }, 5000);

    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration === Infinity) {
        audio.currentTime = Number.MAX_SAFE_INTEGER;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          audio.currentTime = 0;
          const duration = audio.duration;
          clearTimeout(timer);
          cleanup();
          resolve(Math.max(1, Math.round(duration || 0)));
        };
      } else {
        const duration = audio.duration;
        clearTimeout(timer);
        cleanup();
        if (isNaN(duration) || !isFinite(duration)) {
          resolve(1);
          return;
        }
        resolve(Math.max(1, Math.round(duration)));
      }
    });

    audio.addEventListener("error", () => {
      clearTimeout(timer);
      cleanup();
      reject(new Error("Failed to load audio file metadata"));
    });

    audio.src = objectUrl;
  });
}

export const MAX_AUDIO_DURATION_SECONDS = 300; // 5 minutes

export async function validateAudioFile(file: File): Promise<{
  valid: boolean;
  durationSeconds: number;
  error?: string;
}> {
  if (!isMusicFile(file)) {
    return {
      valid: false,
      durationSeconds: 0,
      error:
        "Please select a valid music file (.mp3, .wav, .flac, .ogg, .m4a, .aac)",
    };
  }
  try {
    const durationSeconds = await getAudioDurationSeconds(file);
    if (durationSeconds > MAX_AUDIO_DURATION_SECONDS) {
      return {
        valid: false,
        durationSeconds,
        error: "Audio duration cannot exceed 5 minutes (300 seconds).",
      };
    }
    return { valid: true, durationSeconds };
  } catch (err) {
    return {
      valid: false,
      durationSeconds: 0,
      error: "Failed to read audio file metadata.",
    };
  }
}
