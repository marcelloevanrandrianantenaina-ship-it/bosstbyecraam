import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, type SiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Palette, Share2, Wallet, Megaphone, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { settings, refresh } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(settings); }, [settings.updated_at]);

  if (!form) return null;

  function set<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    const { id, updated_at, ...patch } = form;
    const { error } = await supabase.from("site_settings" as any).update(patch as any).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Paramètres enregistrés");
    refresh();
  }

  return (
    <div className="space-y-4 fade-in pb-4">
      <PageHeader
        eyebrow="Configuration"
        title="Paramètres du site"
        subtitle="Branding, contact et dépôt MVola"
        icon={Settings2}
        action={
          <Button onClick={save} disabled={saving} className="gradient-primary text-primary-foreground glow-soft">
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Enregistrer
          </Button>
        }
      />


      <Section icon={Palette} title="Branding">
        <Field label="Nom du site" k="site_name" form={form} set={set} />
        <Field label="Slogan" k="slogan" form={form} set={set} />
        <Field label="URL du logo" k="logo_url" form={form} set={set} placeholder="https://…/logo.png" />
        <Field label="Texte du pied de page" k="footer_text" form={form} set={set} />
      </Section>

      <Section icon={Share2} title="Réseaux sociaux & Contact">
        <Field label="WhatsApp (local)" k="whatsapp_number" form={form} set={set} placeholder="0347856539" />
        <Field label="WhatsApp (international)" k="whatsapp_intl" form={form} set={set} placeholder="+261347856539" />
        <Field label="Lien Facebook" k="facebook_url" form={form} set={set} />
        <Field label="Lien Instagram" k="instagram_url" form={form} set={set} />
        <Field label="Lien TikTok" k="tiktok_url" form={form} set={set} />
      </Section>

      <Section icon={Wallet} title="MVola / Dépôt">
        <Field label="Numéro MVola" k="mvola_number" form={form} set={set} />
        <Field label="Nom du propriétaire MVola" k="mvola_owner" form={form} set={set} />
        <Field label="Montant minimum recharge (Ar)" k="min_recharge" form={form} set={set} type="number" />
        <FieldArea label="Instructions de dépôt" k="mvola_instructions" form={form} set={set} />
      </Section>

      <Section icon={Megaphone} title="Messages">
        <FieldArea label="Message d'accueil" k="welcome_message" form={form} set={set} />
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-strong rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary grid place-items-center">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-black">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

type FieldProps = {
  label: string;
  k: keyof SiteSettings;
  form: SiteSettings;
  set: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void;
  placeholder?: string;
  type?: string;
};

function Field({ label, k, form, set, placeholder, type = "text" }: FieldProps) {
  const value = (form[k] ?? "") as any;
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => set(k, (type === "number" ? Number(e.target.value) : e.target.value) as any)}
        className="mt-1 h-10"
      />
    </div>
  );
}

function FieldArea({ label, k, form, set }: FieldProps) {
  const value = (form[k] ?? "") as any;
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => set(k, e.target.value as any)}
        rows={4}
        className="mt-1"
      />
    </div>
  );
}
