import { createFileRoute } from "@tanstack/react-router";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { PageHero } from "@/components/PageHero";
import interior from "@/assets/butchery-interior.jpg";
import butcher from "@/assets/butcher-at-work.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Mwanainchi Butchery" },
      { name: "description", content: "How a small Utawala counter became Nairobi's friendliest neighbourhood butcher." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={interior} alt="Inside our Utawala butchery" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-mahogany/95 via-mahogany/40 to-transparent" />
        <div className="container-page relative z-10 flex min-h-[60vh] flex-col justify-end pb-16 pt-24 text-cream">
          <p className="font-accent text-xs uppercase tracking-[0.3em] text-warning">About us</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-tight md:text-7xl">A counter built on trust.</h1>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-accent text-xs uppercase tracking-[0.3em] text-accent">Fresh Cuts. Fast Food. Always Delivered.</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-foreground">Six years. Two counters. One promise.</h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>Mwanainchi began in 2018 as a single butchery counter on Eastern Bypass — a family who believed Nairobi deserved better than rushed, mystery meat.</p>
              <p>Today we run two services side by side: a <strong>premium butchery</strong> hand-cutting beef, kienyeji chicken, goat and pork from trusted Kajiado and Kiambu farms, and a <strong>fast food kitchen</strong> firing burgers, grilled chicken, nyama choma platters and hot drinks — all delivered Glovo-style to your door.</p>
              <p>Geoffrey, our master butcher, still cuts every meat order himself. Our chefs and riders make sure your fast food arrives hot, fast and exactly how you ordered it.</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="font-heading text-base font-bold text-primary">🥩 The Butchery</div>
                <p className="mt-1 text-sm text-muted-foreground">Cut to order. Fresh daily. Sourced fair from local farms.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="font-heading text-base font-bold text-primary">🍔 Fast Food & Delivery</div>
                <p className="mt-1 text-sm text-muted-foreground">Burgers, choma platters, fries & chai — hot to your door.</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-warm)]">
            <img src={butcher} alt="Geoffrey cutting steak" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-mahogany text-mahogany-foreground">
        <div className="container-page grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          {[
            ["6", "years serving Nairobi"],
            ["12,000+", "happy customers"],
            ["4,500 kg", "sold every month"],
            ["28", "cuts on offer"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-4xl font-bold text-warning md:text-6xl">{n}</div>
              <div className="mt-2 font-accent text-xs uppercase tracking-wider opacity-80">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <CategoryCarousel />
    </>
  );
}
