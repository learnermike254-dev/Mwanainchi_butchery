import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { topCategories } from "@/lib/products";

const AUTO_MS = 3000;

export function CategoryCarousel() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = topCategories.length;

  useEffect(() => {
    if (paused) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap || "16");
    el.scrollTo({ left: index * (card.offsetWidth + gap), behavior: "smooth" });
  }, [index]);

  // Swipe gesture support
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return; // ignore taps
      setIndex((i) => diff > 0 ? (i + 1) % total : (i - 1 + total) % total);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [total]);

  const go = (cat: string) => {
    navigate({ to: "/shop", hash: `menu?category=${cat}` });
  };

  return (
    <section className="py-8 md:py-16 bg-cream">
      <div className="container-page">
        <div className="text-center">
          <p className="font-accent text-xs uppercase tracking-[0.25em] text-accent">Shop by category</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">Pick your favourite cut</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Tap a category to jump straight into the menu.</p>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => { setPaused(true); setIndex((i) => (i - 1 + total) % total); setTimeout(() => setPaused(false), 2000); }}
            className="absolute left-0 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow hover:bg-secondary md:h-11 md:w-11"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => { setPaused(true); setIndex((i) => (i + 1) % total); setTimeout(() => setPaused(false), 2000); }}
            className="absolute right-0 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow hover:bg-secondary md:h-11 md:w-11"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <div
            ref={trackRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setTimeout(() => setPaused(false), 2000)}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-8 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6 md:px-14"
            style={{ scrollbarWidth: "none" }}
          >
            {topCategories.map((c) => (
              <button
                key={c.id}
                data-card
                type="button"
                onClick={() => go(c.id)}
                aria-label={`Shop ${c.label}`}
                className="group relative shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-warm)] transition-transform duration-[250ms] ease-out hover:scale-[1.03] focus-visible:scale-[1.03]"
                style={{
                  width: "clamp(150px, 58vw, 300px)",
                  minWidth: 150,
                  willChange: "transform",
                }}
              >
                <div className="relative h-44 w-full overflow-hidden md:h-52">
                  <img
                    src={c.image}
                    alt={c.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mahogany/85 via-mahogany/20 to-transparent" />
                  <span className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-2xl shadow" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                    <h3 className="font-display text-2xl font-bold text-cream">{c.label}</h3>
                    <p className="mt-0.5 text-xs text-cream/85">{c.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-heading text-sm font-semibold text-foreground">Shop now</span>
                  <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-4 flex justify-center gap-2">
            {topCategories.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-label={`Go to ${c.label}`}
                onClick={() => { setPaused(true); setIndex(i); setTimeout(() => setPaused(false), 2000); }}
                className={`h-3 rounded-full transition-all md:h-2 ${
                  i === index ? "w-7 bg-primary md:w-6" : "w-3 bg-border md:w-2 hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
