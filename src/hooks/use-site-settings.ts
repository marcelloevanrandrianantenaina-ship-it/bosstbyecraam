import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: number;
  site_name: string;
  slogan: string;
  logo_url: string | null;
  primary_color: string;
  whatsapp_number: string;
  whatsapp_intl: string;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  mvola_number: string;
  mvola_owner: string;
  mvola_instructions: string | null;
  welcome_message: string | null;
  footer_text: string;
  min_recharge: number;
  updated_at: string;
};

const DEFAULTS: SiteSettings = {
  id: 1,
  site_name: "ẞoost-by Ecr_aaM",
  slogan: "Boostez vos réseaux sociaux",
  logo_url: null,
  primary_color: "oklch(0.78 0.17 65)",
  whatsapp_number: "0347856539",
  whatsapp_intl: "+261347856539",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  mvola_number: "0347856539",
  mvola_owner: "Randrianbelo Sophia",
  mvola_instructions: "",
  welcome_message: "",
  footer_text: "ẞoost-by Ecr_aaM © 2026",
  min_recharge: 1000,
  updated_at: new Date().toISOString(),
};

export function useSiteSettings() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings" as any)
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return DEFAULTS;
      return data as unknown as SiteSettings;
    },
    staleTime: 60_000,
  });

  // Live updates when admin edits
  useEffect(() => {
    const ch = supabase
      .channel("site_settings_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return { settings: query.data ?? DEFAULTS, isLoading: query.isLoading, refresh: query.refetch };
}

export function waLinkFromSettings(s: SiteSettings, text: string) {
  const digits = (s.whatsapp_intl || s.whatsapp_number).replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
