import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { bootstrapAdmin } from "@/lib/admin.functions";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin login — Mwanainchi" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("admin@mwanainchi.co.ke");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure the admin account exists on first ever load
    bootstrapAdmin().catch((err) => {
      console.error("Admin bootstrap failed:", err);
      // Silent fail - admin account may already exist
    });
  }, []);

  useEffect(() => {
    if (user) navigate({ to: "/admin" });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("working");
    
    try {
      // Ensure admin exists, then sign in
      const boot = await bootstrapAdmin();
      if (!boot.ok) {
        setError(`Setup error: ${boot.error || "Failed to initialize admin account"}`);
        setStatus("idle");
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message || "Sign in failed");
        setStatus("idle");
        return;
      }
      
      navigate({ to: "/admin" });
    } catch (err) {
      setError(`An error occurred: ${String(err) || "Unknown error"}`);
      setStatus("idle");
    }
  }

  return (
    <section className="paper-texture min-h-[calc(100vh-4rem)]">
      <div className="container-page section-y grid place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-warm)]">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mahogany text-cream">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Restricted area. Staff credentials only.
            </p>
          </div>

          <form className="mt-7 grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-1.5 text-left">
              <span className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="grid gap-1.5 text-left">
              <span className="font-accent text-[11px] uppercase tracking-wider text-muted-foreground">Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={status === "working"}
              className="h-12 rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {status === "working" ? "Signing in…" : "Sign in to admin"}
            </button>
          </form>
        </div>
      </div>
      <style>{`.input{background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:0.85rem 1rem;font-family:var(--font-sans);font-size:0.95rem;color:var(--foreground);outline:none;width:100%} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--primary) 18%,transparent)}`}</style>
    </section>
  );
}
