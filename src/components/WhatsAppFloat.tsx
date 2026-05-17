import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink("Bonjour, j'ai besoin d'aide sur ẞoost-by Ecr_aaM")}
      target="_blank"
      rel="noreferrer"
      aria-label="Support WhatsApp"
      className="fixed bottom-5 right-5 z-50 h-13 w-13 grid place-items-center rounded-full bg-[oklch(0.72_0.18_155)] text-[oklch(0.1_0.02_250)] glow hover-lift"
      style={{ height: 52, width: 52 }}
    >
      <MessageCircle className="h-6 w-6" strokeWidth={2.4} />
      <span className="absolute inset-0 rounded-full pulse-dot" />
    </a>
  );
}
