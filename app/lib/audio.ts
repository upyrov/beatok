const isAudioFile = (file: File) =>
  file.type.startsWith("audio/") ||
  /\.(mp3|wav|flac|ogg|m4a|aac)$/i.test(file.name);

const max_duration = 5 * 60;

export async function validateAudioFile(file: File): Promise<{
  valid: boolean;
  durationSeconds: number;
  error?: string;
}> {
  const invalid = (error: string) => ({
    valid: false,
    durationSeconds: 0,
    error,
  });

  if (!isAudioFile(file)) {
    return invalid(
      "Please select a valid music file (.mp3, .wav, .flac, .ogg, .m4a, .aac)",
    );
  }

  try {
    const { parseBlob } = await import("music-metadata");
    const metadata = await parseBlob(file);
    const durationSeconds = Math.round(metadata.format.duration || 0);

    if (durationSeconds > max_duration) {
      return invalid("Audio duration cannot exceed 5 minutes (300 seconds).");
    }

    return { valid: true, durationSeconds };
  } catch {
    return invalid("Failed to read audio file metadata.");
  }
}
