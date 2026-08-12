import { Button } from "@base-ui/react";
import { useEffect, useState } from "react";
import { CgClose, CgDanger } from "react-icons/cg";

export function GlobalErrorModal() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalError = (event: Event) => {
      const customEvent = event as CustomEvent;
      let msg = customEvent.detail;

      // Prettify common errors
      if (msg.includes("429")) {
        msg =
          "You are doing that too fast. Please slow down and try again (Rate Limit Exceeded).";
      } else if (msg.includes("unexpected error occurred invoking 'Join'")) {
        msg =
          "We couldn't join you into the lobby. It might be full or no longer active.";
      }

      setErrorMsg(msg);
    };

    window.addEventListener("globalerror", handleGlobalError);
    return () => {
      window.removeEventListener("globalerror", handleGlobalError);
    };
  }, []);

  if (!errorMsg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="system-panel max-w-md w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="bg-red-500/10 text-red-500 p-3 rounded-full shrink-0">
            <CgDanger size={24} />
          </div>
          <div className="flex-1 mt-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Error
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {errorMsg}
            </p>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <CgClose size={20} />
          </button>
        </div>
        <div className="flex justify-end mt-2">
          <Button
            className="system-button bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            onClick={() => setErrorMsg(null)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
