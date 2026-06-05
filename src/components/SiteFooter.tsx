import { useSiteSettings } from "@/hooks/use-site-settings";
import { Zap } from "lucide-react";

export function SiteFooter() {
  const { settings } = useSiteSettings();
  return (
    <footer className="mx-auto max-w-6xl px-3 pt-8 pb-6 text-center text-[11px] text-muted-foreground space-y-1">
      <div className="inline-flex items-center gap-1.5 text-foreground/80 font-bold">
        <Zap className="h-3 w-3 text-primary" />
        {settings.footer_text || settings.site_name}
      </div>
      <div className="opacity-80">⚡ Service disponible 24h/24 · Paiement MVola sécurisé</div>
    </footer>
  );
}
