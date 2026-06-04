import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ChevronRight, MessageCircle, Truck, Leaf, Clock, Smartphone, Star, Quote, ShieldCheck, MapPin, Bike, UtensilsCrossed } from "lucide-react";
import butcherImg from "@/assets/butcher-at-work.jpg";
import { HeroVideo } from "@/components/HeroVideo";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { waOrderLink } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mwanainchi Butchery & Fast Food — Fresh Cuts. Fast Food. Always Delivered." },
      { name: "description", content: "Nairobi's premium butchery and fast food delivery — beef, chicken, goat, burgers, nyama choma platters. M-Pesa, WhatsApp ordering, fast delivery across Utawala." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO — full-width background video */}
      <section
        className="relative isolate overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="absolute inset-0"
          style={{ minHeight: "80svh" }}
        />
        <HeroVideo />

        <div
          className="container-page relative z-10 flex flex-col justify-end pb-16 pt-32 text-cream md:justify-center md:pb-24"
          style={{ minHeight: "80svh" }}
        >
          <p className="font-accent text-xs uppercase tracking-[0.35em] text-warning md:text-sm">
            Utawala · Nairobi · Since 2018
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[1.05] md:text-7xl lg:text-8xl">
            Fresh Cuts. Fast Food. <span className="accent-underline text-warning">Always delivered.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-cream/90 md:text-lg">
            Premium butchery and hot fast food — hand-cut beef, kienyeji chicken, juicy burgers and nyama choma platters, brought straight to your door across Nairobi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              hash="menu"
              className="inline-flex h-12 min-h-[44px] items-center gap-2 rounded-full bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.02] hover:bg-primary/90 md:h-14 md:px-8 md:text-base"
            >
              Order Now <ChevronRight className="h-4 w-4" />
            </Link>
            <a
              href={waOrderLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 min-h-[44px] items-center gap-2 rounded-full border-2 border-cream/70 bg-transparent px-6 font-heading text-sm font-semibold text-cream backdrop-blur transition hover:bg-cream hover:text-mahogany md:h-14 md:px-8 md:text-base"
            >
              <MessageCircle className="h-4 w-4" /> Order via WhatsApp
            </a>
          </div>
          <a href="#trust" className="mt-12 hidden items-center gap-2 self-start font-accent text-xs uppercase tracking-widest text-cream/70 hover:text-cream md:inline-flex">
            Scroll <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </a>
        </div>
      </section>

      {/* DELIVERY BANNER */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-warning" />
            <p className="font-heading text-sm font-semibold md:text-base">
              We deliver across Utawala, Embakasi, Donholm & Eastern Bypass — Order Now!
            </p>
          </div>
          <a
            href={waOrderLink()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-warning px-5 font-heading text-xs font-bold uppercase tracking-wider text-warning-foreground hover:bg-warning/90"
          >
            <MessageCircle className="h-4 w-4" /> Order Now
          </a>
        </div>
      </section>

      {/* TRUST BAR */}
      <section id="trust" className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:py-10">
          {[
            { Icon: Leaf, title: "100% Fresh", sub: "Cut today, not yesterday" },
            { Icon: Smartphone, title: "M-Pesa Accepted", sub: "Till 4484494" },
            { Icon: Truck, title: "Utawala Delivery", sub: "Free over KES 1,500" },
            { Icon: Clock, title: "Open 7 Days", sub: "7 AM – 9 PM" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-sm font-semibold text-foreground">{title}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-border bg-cream">
        <div className="container-page flex flex-wrap items-center justify-center gap-3 py-5 md:gap-8">
          {[
            { Icon: Leaf, label: "Fresh Daily" },
            { Icon: Bike, label: "Fast Delivery" },
            { Icon: ShieldCheck, label: "Quality Guaranteed" },
          ].map(({ Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-card px-4 py-2">
              <Icon className="h-4 w-4 text-accent" />
              <span className="font-heading text-sm font-semibold text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY CAROUSEL (replaces featured products) */}
      <CategoryCarousel />

      {/* ABOUT TEASER */}
      <section className="bg-card">
        <div className="container-page section-y grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-warm)]">
            <img src={butcherImg} alt="Our master butcher at work" width={1024} height={1024} loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
          <div>
            <p className="font-accent text-xs uppercase tracking-[0.25em] text-accent">Our Story</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Two counters. <span className="accent-underline">One promise.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              Mwanainchi is both a premium <strong>butchery</strong> and a fast food
              <strong> delivery kitchen</strong>. On one side we hand-cut beef, kienyeji chicken, goat and pork from
              trusted farms. On the other, our chefs fire up burgers, grilled chicken, nyama choma platters and hot
              chai — and our riders bring it all to your door, Glovo-style.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-heading text-sm font-bold text-primary">🥩 Fresh Butchery</div>
                <p className="mt-1 text-sm text-muted-foreground">Cut to order, sourced fresh daily.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-heading text-sm font-bold text-primary">🍔 Fast Food Delivery</div>
                <p className="mt-1 text-sm text-muted-foreground">Burgers, choma, sides — hot to your door.</p>
              </div>
            </div>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary hover:gap-3">
              Read our story <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW DELIVERY WORKS */}
      <section className="section-y">
        <div className="container-page">
          <div className="text-center">
            <p className="font-accent text-xs uppercase tracking-[0.25em] text-accent">Glovo-style, neighbourhood-fast</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">How delivery works</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">Three simple steps from craving to doorstep.</p>
          </div>
          <div className="relative mt-12 grid gap-10 md:grid-cols-3">
            {[
              { n: "01", Icon: UtensilsCrossed, t: "Browse the menu", d: "Pick fresh meat from the butchery, or hot burgers, choma & sides from the kitchen." },
              { n: "02", Icon: Smartphone, t: "Place your order", d: "Order on WhatsApp in seconds, or check out with M-Pesa STK Push." },
              { n: "03", Icon: Bike, t: "Fast delivery to your door", d: "Our riders bring it hot and fresh across Utawala & Eastern Nairobi." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-7 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground">
                  <s.Icon className="h-7 w-7" />
                </div>
                <div className="mt-3 font-accent text-xs font-bold uppercase tracking-widest text-primary">Step {s.n}</div>
                <h3 className="mt-1 font-display text-xl font-semibold text-foreground">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/shop" hash="menu" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Order Now <ChevronRight className="h-4 w-4" />
            </Link>
            <a href={waOrderLink()} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-[var(--whatsapp)] bg-[var(--whatsapp)]/10 px-6 font-heading text-sm font-semibold text-[var(--whatsapp)] hover:bg-[var(--whatsapp)]/20">
              <MessageCircle className="h-4 w-4" /> Order via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-cream">
        <div className="container-page section-y">
          <div className="text-center">
            <p className="font-accent text-xs uppercase tracking-[0.25em] text-accent">Wateja Wetu</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">What Nairobi says</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { q: "The beef was unbelievably fresh and the rider arrived in 25 minutes flat. Mwanainchi has spoiled me.", n: "Mary W.", e: "Utawala", tag: "Fresh Meat + Fast Delivery" },
              { q: "I ordered the nyama choma platter and burgers at 9pm — hot, juicy, and at my door in half an hour. Glovo who?", n: "Brian K.", e: "Embakasi", tag: "Fast Food Delivery" },
              { q: "Their kienyeji chicken tastes like home, and the masala fries are dangerously good. Weekly order locked in.", n: "Achieng' O.", e: "Donholm", tag: "Quality Guaranteed" },
            ].map((t) => (
              <figure key={t.n} className="relative rounded-2xl bg-card p-7 shadow-[var(--shadow-warm)]">
                <Quote className="absolute -top-3 left-6 h-8 w-8 rounded-full bg-primary p-1.5 text-primary-foreground" />
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-3 font-display text-lg leading-snug text-foreground">"{t.q}"</blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-2">
                  <span className="font-accent text-xs uppercase tracking-wider text-muted-foreground">— {t.n}, {t.e}</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-accent text-[10px] font-semibold uppercase tracking-wider text-accent">{t.tag}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
