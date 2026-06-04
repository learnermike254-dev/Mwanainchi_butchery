import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Redirecting..." }] }),
  component: LoginRedirect,
});

function LoginRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Customer login removed - redirect to order tracker
    navigate({ to: "/order-tracker", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to order tracker...</p>
      </div>
    </div>
  );
}
