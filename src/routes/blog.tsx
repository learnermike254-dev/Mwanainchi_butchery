import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageHero } from "@/components/PageHero";
import { ChevronRight, Utensils, Truck, PartyPopper, Newspaper, ChefHat } from "lucide-react";
import butcherAtWork from "@/assets/butcher-at-work.jpg";
import butcheryInterior from "@/assets/butchery-interior.jpg";
import heroNyama from "@/assets/hero-nyama.jpg";
import meatSteaks from "@/assets/meat-steaks.jpg";
import goatFull from "@/assets/goat-full.jpg";
import chickenWhole from "@/assets/chicken-whole.jpg";
import sausages from "@/assets/sausages.jpg";
import ffBurgerCombo from "@/assets/ff-burger-combo.jpg";
import ffShawarma from "@/assets/ff-shawarma.jpg";
import { listPublishedPosts } from "@/lib/admin.functions";

type Category = "Recipe" | "Catering" | "Events" | "News" | "Guide";

const categories: { id: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "Recipe", label: "Recipes", icon: ChefHat },
  { id: "Catering", label: "Outside Catering", icon: Truck },
  { id: "Events", label: "Events & Bookings", icon: PartyPopper },
  { id: "News", label: "News & Promos", icon: Newspaper },
  { id: "Guide", label: "Guides", icon: Utensils },
];

const fallbackPosts: { tag: Category; title: string; excerpt: string; image: string }[] = [
  { tag: "Catering", title: "Outside catering — weddings, ruracios & corporate events", excerpt: "From a 50-pax engagement to a 1,000-pax company gala — our team handles the meat, the choma jiko, the chefs and the service. Custom menus from KES 850/head.", image: heroNyama },
  { tag: "Events", title: "Book Mwanainchi for your next nyama choma night", excerpt: "Private dining for 10–80 guests. Reserve our open-grill section, choose a set menu, and we handle the rest. Deposits from KES 5,000.", image: butcheryInterior },
  { tag: "Catering", title: "Funeral & memorial catering — handled with care", excerpt: "Same-day quotations, discreet service, transport included within Nairobi. We deliver hot food, drinks and disposables on time.", image: butcherAtWork },
  { tag: "Recipe", title: "The perfect Sunday nyama choma", excerpt: "Charcoal heat, salt timing, and the rest you can't skip — our master butcher's exact method.", image: meatSteaks },
  { tag: "News", title: "Festive bundles for Jamhuri Day", excerpt: "Family packs starting at KES 2,500 with free delivery in Utawala. Order by Friday for guaranteed weekend slots.", image: sausages },
  { tag: "Recipe", title: "Wet-fry chicken like grandma's", excerpt: "A 30-minute weeknight kuku that tastes like Sunday.", image: chickenWhole },
  { tag: "Guide", title: "Beef cuts explained — Kenya edition", excerpt: "From mkono to fillet — what to ask for, what they cost, and how to cook each one.", image: meatSteaks },
  { tag: "Catering", title: "Office lunch deliveries from KES 350/head", excerpt: "Hot, packed and on time. Choose burgers, choma platters or wraps. Free delivery for orders over 20 packs.", image: ffBurgerCombo },
  { tag: "Recipe", title: "Choosing goat for choma", excerpt: "Age, cut and seasoning secrets for restaurant-grade mbuzi at home.", image: goatFull },
  { tag: "News", title: "Now serving: Chicken Shawarma Wraps", excerpt: "Our newest fast-food menu addition — toasted, saucy and ready in under 6 minutes.", image: ffShawarma },
];

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Recipes, Catering & News | Mwanainchi Butchery" },
      { name: "description", content: "Cooking tips, outside catering services, event bookings, promotions and news from Nairobi's friendliest butchery and grill." },
      { property: "og:title", content: "Mwanainchi Blog — Recipes, Catering & News" },
      { property: "og:description", content: "Outside catering, event bookings, recipes and the latest from our kitchen." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const fetchPosts = useServerFn(listPublishedPosts);
  const [dbPosts, setDbPosts] = useState<any[] | null>(null);

  useEffect(() => {
    fetchPosts().then((d) => setDbPosts(d ?? [])).catch(() => setDbPosts([]));
  }, [fetchPosts]);

  // Prefer admin-managed posts; fall back to defaults until any are published
  const posts =
    dbPosts && dbPosts.length > 0
      ? dbPosts.map((p) => ({ tag: (p.tag as Category) ?? "News", title: p.title, excerpt: p.excerpt ?? "", image: p.image_url || heroNyama }))
      : fallbackPosts;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Recipes, catering & news."
        subtitle="Cooking notes, outside catering services, event bookings and updates from the Mwanainchi team."
      />

      <section className="border-b border-border bg-muted/30">
        <div className="container-page py-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <a key={c.id} href={`#${c.id.toLowerCase()}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-heading text-sm font-medium transition hover:border-primary hover:text-primary">
                <c.icon className="h-4 w-4" />
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="catering" className="section-y">
        <div className="container-page">
          <article className="grid gap-8 overflow-hidden rounded-3xl bg-card md:grid-cols-2">
            <img src={heroNyama} alt="Mwanainchi outside catering — nyama choma platter" className="aspect-[4/3] h-full w-full object-cover md:aspect-auto" />
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="inline-block self-start rounded-full bg-accent/15 px-3 py-1 font-accent text-[11px] font-semibold uppercase tracking-wider text-accent">Featured Service</span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">Outside catering, done the Mwanainchi way</h2>
              <p className="mt-3 text-muted-foreground">Weddings, ruracios, corporate launches, funerals, birthdays — we bring the meat, the grills, the chefs and the service. Custom menus, transparent pricing, and zero stress on your big day.</p>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-1 font-heading text-sm font-semibold text-primary hover:gap-2">
                Request a catering quote <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section-y pt-0">
        <div className="container-page">
          <h3 className="font-display text-2xl font-bold md:text-3xl">Latest from the blog</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <article key={i} id={p.tag.toLowerCase()} className="overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-warm)]">
                <img src={p.image} alt={p.title} className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <span className="inline-block rounded-full bg-accent/15 px-2.5 py-1 font-accent text-[10px] font-semibold uppercase tracking-wider text-accent">{p.tag}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
