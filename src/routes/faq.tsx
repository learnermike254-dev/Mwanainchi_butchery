import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { ChevronDown } from "lucide-react";

const groups = [
  {
    title: "Ordering",
    items: [
      ["What's the minimum order?", "There's no minimum. Order 250g or 25kg — we cut to your need."],
      ["Can I customise my cut?", "Absolutely. Add a note at checkout or WhatsApp us — Geoffrey will cut it to spec."],
      ["Do you accept orders by phone?", "Yes. Call or WhatsApp +254 748 471 264 between 7 AM and 9 PM."],
    ],
  },
  {
    title: "Delivery",
    items: [
      ["Where do you deliver?", "Utawala (free over KES 1,500), and most of Embakasi, Donholm, Kayole and Ruai for a small fee."],
      ["How long does delivery take?", "Same day if ordered before 6 PM. Most Utawala orders arrive within 90 minutes."],
    ],
  },
  {
    title: "M-Pesa Payment",
    items: [
      ["What's your Till number?", "Till 4484494 (Buy Goods). STK Push happens automatically at checkout."],
      ["Can I pay cash on delivery?", "Yes — please tell our rider when they arrive."],
    ],
  },
  {
    title: "Quality",
    items: [
      ["How fresh is the meat?", "We slaughter and cut daily. Nothing on our counter is more than 24 hours old."],
      ["Do you stock halal meat?", "Yes — all our meat is locally sourced and halal-certified."],
    ],
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Mwanainchi Butchery" },
      { name: "description", content: "Answers about ordering, delivery, M-Pesa, and how we keep our meat fresh." },
    ],
  }),
  component: FaqPage,
});

function Acc({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-heading text-base font-semibold text-foreground md:text-lg">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">{a}</p>}
    </div>
  );
}

function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Maswali yetu ya kawaida." subtitle="Quick answers to the things customers ask us most." />
      <section className="section-y">
        <div className="container-page max-w-3xl space-y-12">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{g.title}</h2>
              <div className="mt-4 rounded-2xl border border-border bg-card px-6">
                {g.items.map(([q, a]) => <Acc key={q} q={q} a={a} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
