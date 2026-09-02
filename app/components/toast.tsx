import { useEffect, useState } from "react";
import { CgCheckO, CgClose, CgDanger, CgInfo } from "react-icons/cg";
import type { ToastVariant } from "~/lib/toast";

interface ToastData {
	message: string;
	variant: ToastVariant;
}

export function Toast() {
	const [toast, setToast] = useState<ToastData | null>(null);

	useEffect(() => {
		const handleGlobalToast = (event: Event) => {
			const customEvent = event as CustomEvent<ToastData>;
			let { message: msg, variant } = customEvent.detail;

			// Prettify common errors
			if (variant === "error" && typeof msg === "string") {
				msg = msg
					.replace(/^Firebase:\s*/i, "")
					.replace(/\s*\(auth\/[a-z-]+\)\.?/i, "")
					.replace(
						/^Error\s*\(\s*auth\/[a-z-]+\s*\)\.?/i,
						"An authentication error occurred.",
					)
					.trim();

				if (msg.includes("429")) {
					msg =
						"You are doing that too fast. Please slow down and try again (Rate Limit Exceeded).";
				} else if (msg.includes("unexpected error occurred invoking 'Join'")) {
					msg =
						"We couldn't join you into the lobby. It might be full or no longer active.";
				}
			}

			setToast({ message: msg, variant });

			// Auto-hide after 3 seconds
			setTimeout(
				() => setToast((prev) => (prev?.message === msg ? null : prev)),
				3000,
			);
		};

		window.addEventListener("globaltoast", handleGlobalToast);
		return () => window.removeEventListener("globaltoast", handleGlobalToast);
	}, []);

	if (!toast) return null;

	const icons = {
		error: <CgDanger size={20} />,
		info: <CgInfo size={20} />,
		success: <CgCheckO size={20} />,
	};

	const colors = {
		error: "text-red-500 border-red-500/20",
		info: "text-blue-500 border-blue-500/20",
		success: "text-green-500 border-green-500/20",
	};

	return (
		<div className="fixed bottom-4 right-4 z-100 animate-in slide-in-from-bottom-4 fade-in duration-300">
			<div
				className={`bg-white dark:bg-gray-900 border shadow-xl rounded-lg p-4 max-w-sm flex items-start gap-3 ${colors[toast.variant]}`}
			>
				<div className="shrink-0 mt-0.5">{icons[toast.variant]}</div>
				<div className="flex-1">
					<p className="text-sm text-gray-900 dark:text-white font-medium leading-relaxed">
						{toast.message}
					</p>
				</div>
				<button
					onClick={() => setToast(null)}
					className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition shrink-0"
				>
					<CgClose size={16} />
				</button>
			</div>
		</div>
	);
}
