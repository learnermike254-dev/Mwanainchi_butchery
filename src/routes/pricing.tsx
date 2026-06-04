import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { products, formatKES } from "@/lib/products";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Transparent Pricing — Mwanainchi Butchery" },
      { name: "description", content: "All our prices, plain and simple. Plus our 'name your price' custom-cut service." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const groups: Record<string, typeof products> = {};
  products.forEach((p) => { (groups[p.category] ||= []).push(p); });

  return (
    <>
      <PageHero eyebrow="Pricing" title="Honest prices. No surprises." subtitle="Per-kilo rates updated weekly. Bulk and event packages available — just ask." />
      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-left">
              <thead className="bg-mahogany text-mahogany-foreground">
                <tr>
                  <th className="px-5 py-4 font-accent text-xs uppercase tracking-wider">Cut</th>
                  <th className="px-5 py-4 font-accent text-xs uppercase tracking-wider">Category</th>
                  <th className="px-5 py-4 text-right font-accent text-xs uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? "bg-cream/40" : ""}>
                    <td className="px-5 py-4">
                      <div className="font-heading text-sm font-semibold text-foreground">{p.name}</div>
                      <div className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">{p.swahili}</div>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-muted-foreground">{p.category}</td>
                    <td className="px-5 py-4 text-right font-display text-lg font-bold text-primary">
                      {formatKES(p.pricePerKg)}<span className="text-xs font-normal text-muted-foreground">/{p.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="h-fit rounded-3xl bg-gradient-to-br from-primary to-mahogany p-8 text-cream shadow-[var(--shadow-lift)]">
            <p className="font-accent text-xs uppercase tracking-[0.25em] text-warning">Name Your Price</p>
            <h3 className="mt-3 font-display text-3xl font-bold leading-tight">Can't see what you need?</h3>
            <p className="mt-3 text-cream/85">Tell us your budget — we'll cut to match. Hosting nyama choma, a wedding, or filling the freezer? Talk to us first.</p>
            <a href="https://wa.me/254748471264?text=Habari!%20Nataka%20kuagiza%20custom%20order." target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-3 font-heading text-sm font-semibold text-white hover:scale-[1.02]">
              <MessageCircle className="h-4 w-4" /> Custom order via WhatsApp
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
