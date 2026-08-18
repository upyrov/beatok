import { useEffect, useState } from "react";
import { CgClose, CgDanger } from "react-icons/cg";

export function GlobalErrorToast() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalError = (event: Event) => {
      const customEvent = event as CustomEvent;
      let msg = customEvent.detail;

      // Prettify common errors
      if (typeof msg === "string") {
        msg = msg
          .replace(/^Firebase:\s*/i, "")
          .replace(/\s*\(auth\/[a-z-]+\)\.?/i, "")
          .replace(
            /^Error\s*\(\s*auth\/[a-z-]+\s*\)\.?/i,
            "An authentication error occurred.",
          )
          .trim();
      }

      if (msg.includes("429")) {
        msg =
          "You are doing that too fast. Please slow down and try again (Rate Limit Exceeded).";
      } else if (msg.includes("unexpected error occurred invoking 'Join'")) {
        msg =
          "We couldn't join you into the lobby. It might be full or no longer active.";
      }

      setErrorMsg(msg);

      // Auto-hide after 3 seconds
      setTimeout(
        () => setErrorMsg((prev) => (prev === msg ? null : prev)),
        3000,
      );
    };

    window.addEventListener("globalerror", handleGlobalError);
    return () => window.removeEventListener("globalerror", handleGlobalError);
  }, []);

  if (!errorMsg) return null;

  return (
    <div className="fixed bottom-4 right-4 z-100 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 border border-red-500/20 shadow-xl rounded-lg p-4 max-w-sm flex items-start gap-3">
        <div className="text-red-500 shrink-0 mt-0.5">
          <CgDanger size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-white font-medium leading-relaxed">
            {errorMsg}
          </p>
        </div>
        <button
          onClick={() => setErrorMsg(null)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition shrink-0 cursor-pointer"
        >
          <CgClose size={16} />
        </button>
      </div>
    </div>
  );
}
