import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "We'll be right back — Mwanainchi" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Maintenance,
});

function Maintenance() {
  const wa =
    "https://wa.me/254748471264?text=" +
    encodeURIComponent("Hi Mwaninchi! The website is down. I'd like to order.");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1A1A1A",
        color: "#FDF6EC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div
          style={{
            margin: "0 auto",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#C0392B",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontSize: 44,
            fontWeight: 800,
            boxShadow: "0 0 0 0 rgba(243,156,18,0.6)",
            animation: "mwnpulse 2s infinite",
          }}
        >
          M
        </div>
        <h1
          style={{
            marginTop: 28,
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#F39C12",
          }}
        >
          We'll be right back!
        </h1>
        <p style={{ marginTop: 12, opacity: 0.85, lineHeight: 1.55 }}>
          We're polishing the counter for a few minutes. Your craving doesn't have to wait —
          tap below and we'll take your order on WhatsApp right now.
        </p>
        <a
          href={wa}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
            padding: "14px 28px",
            borderRadius: 999,
            background: "#25D366",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 16,
            boxShadow: "0 10px 30px -10px rgba(37,211,102,0.6)",
          }}
        >
          💬 Order on WhatsApp
        </a>
        <div style={{ marginTop: 16, fontSize: 14, opacity: 0.85 }}>
          Or call us:{" "}
          <a href="tel:+254748471264" style={{ color: "#F39C12", fontWeight: 700 }}>
            +254 748 471 264
          </a>
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 14, justifyContent: "center", fontSize: 13, opacity: 0.7 }}>
          <a href="https://facebook.com/mwanainchi" style={{ color: "#FDF6EC" }}>Facebook</a>
          <a href="https://instagram.com/mwanainchi" style={{ color: "#FDF6EC" }}>Instagram</a>
          <a href="https://tiktok.com/@mwanainchi" style={{ color: "#FDF6EC" }}>TikTok</a>
        </div>
      </div>
      <style>{`
        @keyframes mwnpulse {
          0% { box-shadow: 0 0 0 0 rgba(243,156,18,0.5); }
          70% { box-shadow: 0 0 0 22px rgba(243,156,18,0); }
          100% { box-shadow: 0 0 0 0 rgba(243,156,18,0); }
        }
      `}</style>
    </div>
  );
}
