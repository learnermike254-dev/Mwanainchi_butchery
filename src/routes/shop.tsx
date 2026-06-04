import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Info } from "lucide-react";
import { CompactProductCard } from "@/components/CompactProductCard";
import { CookingStyleCarousel } from "@/components/CookingStyleCarousel";
import { PageHero } from "@/components/PageHero";
import { MenuQRCode } from "@/components/MenuQRCode";
import { useCart } from "@/lib/cart";
import {
  products,
  fastFood,
  topCategories,
  
  formatKES,
  waOrderLink,
  type Category,
  type SubCategory,
} from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Menu — Mwanainchi Butchery & Fast Food" },
      { name: "description", content: "Fresh meat and hot fast food, delivered across Nairobi. Beef, chicken, goat, fish, burgers, nyama choma platters." },
    ],
  }),
  component: ShopPage,
});

const BUTCHERY_WITH_SUBS: Category[] = ["beef", "mutton", "pork"];

function ShopPage() {
  const [active, setActive] = useState<Category>("beef");
  const [sub, setSub] = useState<SubCategory | "all">("all");
  const { subtotal, count } = useCart();
  const location = useLocation();

  // Read ?category= from hash on mount/route change
  useEffect(() => {
    const hash = location.hash || "";
    const m = hash.match(/category=([a-z]+)/);
    if (m) {
      const cat = m[1] as Category;
      if (topCategories.find((c) => c.id === cat)) {
        setActive(cat);
        setSub("all");
      }
    }
    // Scroll to menu when hash starts with "menu"
    if (hash.startsWith("menu")) {
      requestAnimationFrame(() => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  const list = useMemo(() => {
    if (active === "fastfood") return fastFood;
    return products.filter((p) => p.category === active);
  }, [active]);

  const showSubs = BUTCHERY_WITH_SUBS.includes(active);
  const filtered = useMemo(() => {
    if (!showSubs || sub === "all") return list;
    return list.filter((p) => p.subCategory === sub);
  }, [list, sub, showSubs]);

  return (
    <>
      <PageHero
        eyebrow="Our Menu · Fresh Cuts. Fast Food. Always Delivered."
        title="Order fresh meat or hot food — delivered."
        subtitle="Switch between butchery cuts and fast food. Tap any item to add to your order or WhatsApp us directly."
      />

      {/* Category tabs */}
      <div id="menu" className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur md:top-20">
        <div className="container-page">
          <div className="-mx-2 flex gap-2 overflow-x-auto py-3 md:mx-0 md:justify-center">
            {topCategories.map((c) => {
              const on = active === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setActive(c.id); setSub("all"); }}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 min-h-[44px] font-heading text-sm font-semibold transition ${
                    on ? "bg-primary text-primary-foreground shadow" : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <span aria-hidden>{c.emoji}</span> {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="py-6 md:py-10">
        <div className="container-page">
          {/* Cooking style auto-moving carousel — only for beef/goat/pork */}
          {showSubs && <CookingStyleCarousel active={sub} onSelect={setSub} />}

          {/* Category tab bar for meat products */}
          {active !== "fastfood" && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["beef", "mutton", "pork", "fish", "chicken"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setActive(cat); setSub("all"); }}
                  className={`shrink-0 rounded-full border px-4 py-1.5 font-heading text-xs font-semibold capitalize transition ${
                    active === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {cat === "mutton" ? "Goat / Lamb" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="font-heading text-lg font-semibold text-foreground">No items found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different cooking style or category.</p>
              <button
                onClick={() => { setSub("all"); }}
                className="mt-4 rounded-full bg-primary px-5 py-2 font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
              {filtered.map((p) => <CompactProductCard key={p.id} product={p} />)}
            </div>
          )}

          {count > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-warm)]">
              <p className="font-heading text-sm font-semibold text-foreground">
                {count} item{count > 1 ? "s" : ""} in your cart · <span className="text-primary">{formatKES(subtotal)}</span>
              </p>
              <div className="flex items-center gap-2">
                <a href={waOrderLink()} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--whatsapp)]/30 bg-[var(--whatsapp)]/10 px-4 font-heading text-sm font-semibold text-[var(--whatsapp)]">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <Link to="/checkout" className="inline-flex h-11 items-center rounded-full bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  View Cart
                </Link>
              </div>
            </div>
          )}

          <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            Final weight & price confirmed at the counter — you only pay for what's cut.
          </p>
        </div>
      </section>

      <MenuQRCode />
    </>
  );
}
