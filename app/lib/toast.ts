export type ToastVariant = "error" | "info" | "success";

export function toast(message: string, variant: ToastVariant = "info") {
	window.dispatchEvent(
		new CustomEvent("globaltoast", {
			detail: { message, variant },
		}),
	);
}

export function toastError(...errors: unknown[]) {
	if (errors.length === 0) return;

	const message = errors
		.map((error) => {
			if (error instanceof Error) {
				return error.message;
			}
			return typeof error === "string" ? error : JSON.stringify(error);
		})
		.join(" ");

	toast(message || "An unexpected error occurred.", "error");
}
