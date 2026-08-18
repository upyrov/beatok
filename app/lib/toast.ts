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

  window.dispatchEvent(
    new CustomEvent("globalerror", {
      detail: message || "An unexpected error occurred.",
    }),
  );
}
