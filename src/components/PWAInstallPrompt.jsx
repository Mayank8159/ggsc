import { useEffect, useState, useCallback } from "react";

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;

const PWAInstallPrompt = () => {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("chrome"); // "chrome" | "ios"

  const dismiss = useCallback(() => {
    setShow(false);
    sessionStorage.setItem("ggsc-pwa-dismissed", "1");
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("ggsc-pwa-dismissed")) return;
    if (isStandalone()) return;

    /* ── iOS: show manual instructions after delay ── */
    if (isIOS()) {
      setMode("ios");
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }

    /* ── Chrome / Edge: listen for beforeinstallprompt ── */
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setMode("chrome");
      setTimeout(() => setShow(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    /* Fallback: if event never fires within 6s, show iOS-style instructions anyway */
    const fallback = setTimeout(() => {
      if (!sessionStorage.getItem("ggsc-pwa-dismissed") && !isStandalone()) {
        setMode("chrome");
        setShow(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      clearTimeout(fallback);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    try {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      console.log("PWA install:", outcome);
    } catch (err) {
      console.warn("PWA install error:", err);
    }
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9990] flex justify-center px-4 pb-24 sm:px-6"
      style={{ animation: "pwa-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}
    >
      <div
        className="flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 sm:px-5 sm:py-4"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        {/* App icon */}
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #4285F4, #34A853)", boxShadow: "0 4px 12px rgba(66,133,244,0.25)" }}
        >
          <img src="/img/main.png" alt="GGSC" className="h-7 w-7 rounded-md object-cover" />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0a0a0a]" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
            {mode === "ios" ? "Add to Home Screen" : "Install GGSC"}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-black/45" style={{ fontFamily: "'Nanum Gothic', sans-serif" }}>
            {mode === "ios"
              ? "Tap the share button, then 'Add to Home Screen'"
              : "Add to your home screen for quick access"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={dismiss}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/40 transition-colors hover:bg-black/5"
            style={{ fontFamily: "'Nanum Gothic', sans-serif" }}
          >
            Later
          </button>
          {mode === "chrome" && (
            <button
              onClick={handleInstall}
              className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
              style={{ fontFamily: "'Nanum Gothic', sans-serif", background: "linear-gradient(135deg, #4285F4, #34A853)" }}
            >
              Install
            </button>
          )}
          {mode === "ios" && (
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white"
              style={{ fontFamily: "'Nanum Gothic', sans-serif", background: "linear-gradient(135deg, #4285F4, #34A853)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
