import { useEffect, useState } from "react";

const PWAInstallPrompt = () => {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    /* Don't show if already dismissed this session */
    if (sessionStorage.getItem("ggsc-pwa-dismissed")) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      /* Show after a short delay so it doesn't flash immediately */
      setTimeout(() => setShow(true), 2500);
    };

    /* If already installed (standalone mode), don't show */
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (navigator.standalone) return;

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    console.log("PWA install:", outcome);
    setDeferred(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("ggsc-pwa-dismissed", "1");
  };

  if (!show || dismissed) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9990] flex justify-center px-4 pb-5 sm:px-6"
      style={{
        animation: "pwa-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <div
        className="flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3 sm:px-5 sm:py-4"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        {/* App icon */}
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, #4285F4, #34A853)",
            boxShadow: "0 4px 12px rgba(66,133,244,0.25)",
          }}
        >
          <img
            src="/img/main.png"
            alt="GGSC"
            className="h-7 w-7 rounded-md object-cover"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold text-[#0a0a0a]"
            style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
          >
            Install GGSC
          </p>
          <p
            className="mt-0.5 text-xs text-black/45"
            style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
          >
            Add to your home screen for quick access
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={handleDismiss}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/40 transition-colors hover:bg-black/5"
            style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            style={{
              fontFamily: "'Nanum Gothic', sans-serif",
              background: "linear-gradient(135deg, #4285F4, #34A853)",
            }}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
