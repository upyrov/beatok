function isAudioFile(file: File) {
	return (
		file.type.startsWith("audio/") ||
		/\.(mp3|wav|flac|ogg|m4a|aac)$/i.test(file.name)
	);
}

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
		const durationSeconds = await new Promise<number>((resolve) => {
			const audio = new Audio();
			const url = URL.createObjectURL(file);
			audio.src = url;
			audio.addEventListener("loadedmetadata", () => {
				URL.revokeObjectURL(url);
				resolve(Math.round(audio.duration) || 0);
			});
			audio.addEventListener("error", async () => {
				URL.revokeObjectURL(url);
				try {
					const arrayBuffer = await file.arrayBuffer();
					const AudioContextClass =
						window.AudioContext || (window as any).webkitAudioContext;
					const audioContext = new AudioContextClass();
					const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
					resolve(Math.round(audioBuffer.duration) || 0);
				} catch {
					resolve(0); // If all fails, still allow upload
				}
			});
		});

		if (durationSeconds <= 0) {
			return invalid("Failed to read audio file metadata.");
		}
		if (durationSeconds > 5 * 60) {
			return invalid("Audio duration cannot exceed 5 minutes.");
		}

		return { valid: true, durationSeconds };
	} catch (error) {
		// We shouldn't hit this since we resolve(0) now, but just in case
		return { valid: true, durationSeconds: 0 };
	}
}
