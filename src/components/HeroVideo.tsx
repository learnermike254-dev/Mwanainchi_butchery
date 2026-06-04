import { useEffect, useRef } from "react";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Set preload="auto" only on desktop, leave "none" on mobile per spec
    if (window.matchMedia("(min-width: 768px)").matches) {
      v.preload = "auto";
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      if (reduced.matches) {
        v.pause();
      } else {
        v.play().catch(() => {});
      }
    };
    applyMotion();
    reduced.addEventListener?.("change", applyMotion);
    return () => reduced.removeEventListener?.("change", applyMotion);
  }, []);

  return (
    <>
      <video
        ref={ref}
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ willChange: "transform", backgroundColor: "#2C1810" }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
    </>
  );
}
