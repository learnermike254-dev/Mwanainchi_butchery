import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

const sections = [
  { id: "overview", title: "1. Overview", body: "Mwanainchi Butchery (\"we\", \"us\") respects your privacy. This page summarises what we collect, why, and your rights as a customer in Kenya." },
  { id: "data", title: "2. Information we collect", body: "Your name, phone number, delivery address and order history. We collect M-Pesa transaction references for accounting only — never your PIN." },
  { id: "use", title: "3. How we use your data", body: "To prepare and deliver your orders, share order updates over WhatsApp/SMS, and improve our service. We never sell your data." },
  { id: "sharing", title: "4. Sharing", body: "We share strictly limited details with our delivery riders and Safaricom for M-Pesa payment confirmation. That's it." },
  { id: "rights", title: "5. Your rights", body: "You can request a copy or deletion of your data any time by WhatsApp. We respond within 7 days, in line with the Kenya Data Protection Act 2019." },
  { id: "terms", title: "6. Terms of Service", body: "Orders are confirmed once payment is received. Final weight may vary by ±5%; you're charged only for what is cut. Refunds are issued for any quality issue reported within 24 hours." },
  { id: "contact", title: "7. Contact", body: "Privacy questions: privacy@mwanainchi.co.ke or +254 748 471 264." },
];

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy & Terms — Mwanainchi Butchery" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy & Terms" subtitle="Plain English. Last updated May 2026." />
      <section className="section-y">
        <div className="container-page grid gap-10 md:grid-cols-[220px_1fr]">
          <nav className="sticky top-24 hidden h-fit space-y-1 md:block">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">{s.title}</a>
            ))}
          </nav>
          <article className="prose-content space-y-8">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl font-bold">{s.title}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
