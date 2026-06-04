import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Mwanainchi Butchery" },
      { name: "description", content: "Visit us in Utawala or message us on WhatsApp. We answer within minutes." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Get in touch" title="We answer fast." subtitle="WhatsApp is the quickest — but we love a phone call too." />
      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <form className="rounded-3xl bg-card p-8 shadow-[var(--shadow-warm)]" onSubmit={(e) => e.preventDefault()}>
            <h2 className="font-display text-2xl font-bold">Send us a message</h2>
            <div className="mt-6 grid gap-4">
              <Field label="Your name"><input className="input" placeholder="e.g. Mary Wanjiku" /></Field>
              <Field label="Phone number"><input className="input" placeholder="07XX XXX XXX" /></Field>
              <Field label="What's it about?">
                <select className="input">
                  <option>General enquiry</option>
                  <option>Custom order</option>
                  <option>Bulk / event order</option>
                  <option>Delivery question</option>
                  <option>Feedback</option>
                </select>
              </Field>
              <Field label="Message"><textarea rows={4} className="input" placeholder="Tell us what you need…" /></Field>
              <button className="mt-2 h-12 rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90">Send message</button>
            </div>
          </form>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-border bg-cream">
              <iframe
                title="Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=36.92%2C-1.30%2C36.97%2C-1.27&layer=mapnik"
                className="h-[300px] w-full"
                loading="lazy"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info Icon={MapPin} t="Utawala Counter" d="Eastern Bypass, opposite Total Petrol Station, Utawala, Nairobi" />
              <Info Icon={Phone} t="Call us" d="+254 748 471 264" />
              <Info Icon={Clock} t="Open 7 days" d="7:00 AM – 9:00 PM" />
              <Info Icon={MessageCircle} t="WhatsApp" d="We reply within 5 minutes" />
            </div>
          </div>
        </div>
      </section>

      <style>{`.input{background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:0.75rem 1rem;font-family:var(--font-sans);font-size:0.95rem;color:var(--foreground);outline:none;transition:border-color .15s} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--primary) 18%,transparent)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Info({ Icon, t, d }: { Icon: React.ComponentType<{ className?: string }>; t: string; d: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent"><Icon className="h-5 w-5" /></div>
      <div>
        <div className="font-heading text-sm font-semibold">{t}</div>
        <div className="text-xs text-muted-foreground">{d}</div>
      </div>
    </div>
  );
}
