export async function uploadFile(
	file: File,
	url: string,
	onProgress?: (progress: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		if (onProgress) {
			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					onProgress(Math.round((event.loaded / event.total) * 100));
				}
			});
		}

		xhr.addEventListener("load", () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve();
			} else {
				reject(new Error(`Upload failed: ${xhr.statusText}`));
			}
		});

		xhr.addEventListener("error", () => reject(new Error("Network Error")));

		xhr.open("PUT", url, true);
		xhr.setRequestHeader("Content-Type", file.type);
		xhr.send(file);
	});
}
