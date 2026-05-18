import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink("Bonjour, j'ai besoin d'aide sur ẞoost-by Ecr_aaM")}
      target="_blank"
      rel="noreferrer"
      aria-label="Support WhatsApp"
      className="fixed z-50 grid place-items-center rounded-full bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] glow hover-lift transition-transform active:scale-95"
      style={{
        height: 46,
        width: 46,
        right: "max(0.75rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
      <span className="absolute inset-0 rounded-full pulse-dot pointer-events-none" />
    </a>
  );
}
