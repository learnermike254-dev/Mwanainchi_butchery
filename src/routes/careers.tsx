import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MessageCircle, MapPin, Clock } from "lucide-react";

const roles = [
  { title: "Master Butcher", type: "Full-time", loc: "Utawala", desc: "5+ years experience cutting beef & goat. Lead the counter team." },
  { title: "Customer Care (WhatsApp)", type: "Part-time", loc: "Remote", desc: "Reply to orders, take notes, keep customers smiling." },
  { title: "Weekend Counter Assistant", type: "Part-time", loc: "Utawala", desc: "Saturdays & Sundays. Great with people, eager to learn." },
];

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers — Mwanainchi Butchery" }] }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <>
      <PageHero eyebrow="Careers" title="Join the Mwanainchi family." subtitle="We hire kind, hard-working people and pay them fairly. Sound like you?" />
      <section className="section-y">
        <div className="container-page grid gap-5 md:grid-cols-2">
          {roles.map((r) => (
            <article key={r.title} className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-warm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-bold">{r.title}</h3>
                <span className="rounded-full bg-accent/15 px-3 py-1 font-accent text-[11px] font-semibold uppercase tracking-wider text-accent">{r.type}</span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.loc}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Open</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{r.desc}</p>
              <a href={`https://wa.me/254748471264?text=Habari!%20I'd%20like%20to%20apply%20for%20${encodeURIComponent(r.title)}.`} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-2.5 font-heading text-sm font-semibold text-white">
                <MessageCircle className="h-4 w-4" /> Apply via WhatsApp
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
