import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/products";
import { useWhatsAppOrderModal } from "./WhatsAppOrderModal";

const PREFILL = "Hi Mwaninchi! I'd like to place an order.";

export function WhatsAppFab() {
  const { open } = useWhatsAppOrderModal();

  const onClick = (e: React.MouseEvent) => {
    // Modifier-click or middle-click: jump straight to WhatsApp with pre-fill
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    open();
  };

  return (
    <button
      onClick={onClick}
      aria-label="Order via WhatsApp"
      title={PREFILL}
      className="pulse-ring fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[var(--whatsapp)] px-5 py-3.5 text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden font-heading text-sm font-semibold sm:inline">
        Order via WhatsApp
      </span>
    </button>
  );
}
