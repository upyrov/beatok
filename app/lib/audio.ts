function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  return [".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"].includes(extension);
}

async function getAudioDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    let resolved = false;

    // Safety timeout in case metadata loading gets stuck
    const timer = setTimeout(() => {
      cleanup();
      resolve(1); // fallback
    }, 5000);

    function cleanup() {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.src = ""; // Free up memory
      URL.revokeObjectURL(objectUrl);
    }

    function finalize(duration: number) {
      cleanup();
      if (isNaN(duration) || !isFinite(duration)) {
        resolve(1);
      } else {
        resolve(Math.max(1, Math.round(duration)));
      }
    }

    function handleTimeUpdate() {
      audio.currentTime = 0; // Reset for actual playback later if needed
      finalize(audio.duration);
    }

    function handleLoadedMetadata() {
      // Workaround for some browsers/formats (like Chrome with some WebM/Ogg) returning Infinity
      if (audio.duration === Infinity) {
        audio.currentTime = Number.MAX_SAFE_INTEGER;
        audio.addEventListener("timeupdate", handleTimeUpdate);
      } else {
        finalize(audio.duration);
      }
    }

    function handleError() {
      cleanup();
      reject(new Error("Failed to load audio file metadata"));
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);

    audio.src = objectUrl;
  });
}

const MAX_AUDIO_DURATION_SECONDS = 300; // 5 minutes

export async function validateAudioFile(file: File): Promise<{
  valid: boolean;
  durationSeconds: number;
  error?: string;
}> {
  if (!isAudioFile(file)) {
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
