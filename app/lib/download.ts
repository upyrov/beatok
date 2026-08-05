export async function handleDownload(url: string, filename: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      const data: { message: string } | undefined = await response
        .json()
        .catch(() => {});
      throw new Error(data?.message ?? "Failed to download file");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error(error);
  }
}
