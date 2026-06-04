import { useEffect, useRef, useState } from "react";
import { cookingSubCategories, type SubCategory } from "@/lib/products";

type Props = {
  active: SubCategory | "all";
  onSelect: (sub: SubCategory | "all") => void;
};

export function CookingStyleCarousel({ active, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Duplicate the list so the translate loop is seamless.
  const items = [...cookingSubCategories, ...cookingSubCategories];

  // Respect reduced-motion: disable the auto-scroll animation entirely.
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setAnimate(false);
  }, []);

  return (
    <div className="mb-6">
      <style>{`
        @keyframes cooking-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <p className="font-accent text-xs uppercase tracking-[0.2em] text-accent">
          Choose by cooking style
        </p>
        <button
          onClick={() => onSelect("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition ${
            active === "all"
              ? "bg-mahogany text-mahogany-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/70"
          }`}
        >
          All cuts
        </button>
      </div>

      {/* ── Mobile: static snap-scroll row ── */}
      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
        {cookingSubCategories.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              title={s.blurb}
              className={`flex w-36 shrink-0 snap-start flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
                on
                  ? "border-mahogany bg-mahogany text-mahogany-foreground shadow"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <span className="text-xl" aria-hidden>{s.icon}</span>
              <span className="font-heading text-xs font-bold leading-tight">{s.label}</span>
              <span className={`text-[10px] leading-tight ${on ? "text-mahogany-foreground/80" : "text-muted-foreground"}`}>
                {s.blurb}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Desktop: original auto-marquee ── */}
      <div
        className="group relative mt-3 hidden overflow-hidden py-1 md:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />

        <div
          ref={trackRef}
          className="flex w-max gap-3"
          style={
            animate
              ? {
                  animation: "cooking-marquee 28s linear infinite",
                  animationPlayState: paused ? "paused" : "running",
                }
              : undefined
          }
        >
          {items.map((s, i) => {
            const on = active === s.id;
            return (
              <button
                key={`${s.id}-${i}`}
                onClick={() => onSelect(s.id)}
                title={s.blurb}
                className={`flex w-44 shrink-0 flex-col items-start gap-1 rounded-2xl border p-4 text-left transition ${
                  on
                    ? "border-mahogany bg-mahogany text-mahogany-foreground shadow"
                    : "border-border bg-card text-foreground hover:border-mahogany/40 hover:shadow"
                }`}
              >
                <span className="text-2xl" aria-hidden>{s.icon}</span>
                <span className="font-heading text-sm font-bold">{s.label}</span>
                <span className={`text-xs ${on ? "text-mahogany-foreground/80" : "text-muted-foreground"}`}>
                  {s.blurb}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
