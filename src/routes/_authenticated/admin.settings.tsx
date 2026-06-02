import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSiteSettings, type SiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, Pencil, Loader2, Settings as SettingsIcon, Palette, Phone, Share2, Wallet, Megaphone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_gate_passed") !== "1") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { settings, refresh } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  useEffect(() => { setForm(settings); }, [settings.updated_at]);

  if (!form) return null;

  function set<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    const { id, updated_at, ...patch } = form;
    const { error } = await supabase
      .from("site_settings" as any)
      .update(patch as any)
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Paramètres enregistrés");
    setEditing(null);
    refresh();
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 glass-strong border-b border-border/60">
        <div className="mx-auto max-w-3xl px-3 h-14 flex items-center gap-3">
          <Link to="/admin" className="h-9 w-9 rounded-xl glass border border-white/10 grid place-items-center active:scale-95">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-9 w-9 rounded-xl gradient-primary grid place-items-center glow-soft">
            <SettingsIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-black">Paramètres du site</div>
            <div className="text-[10px] text-muted-foreground">Modifiable seulement par admin</div>
          </div>
          <div className="ml-auto">
            <Button onClick={save} disabled={saving} size="sm" className="gradient-primary text-primary-foreground">
              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Enregistrer
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-5 space-y-4">
        <Section icon={Palette} title="Branding" color="primary">
          <Field label="Nom du site" k="site_name" form={form} set={set} editing={editing} setEditing={setEditing} />
          <Field label="Slogan" k="slogan" form={form} set={set} editing={editing} setEditing={setEditing} />
          <Field label="URL du logo (optionnel)" k="logo_url" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="https://…/logo.png" />
          <Field label="Couleur principale (oklch / hex)" k="primary_color" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="oklch(0.78 0.17 65) ou #ff8800" />
          <Field label="Texte du pied de page" k="footer_text" form={form} set={set} editing={editing} setEditing={setEditing} />
        </Section>

        <Section icon={Share2} title="Réseaux sociaux & Contact" color="accent">
          <Field label="WhatsApp (local)" k="whatsapp_number" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="0347856539" />
          <Field label="WhatsApp (international)" k="whatsapp_intl" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="+261347856539" />
          <Field label="Lien Facebook" k="facebook_url" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="https://facebook.com/…" />
          <Field label="Lien Instagram" k="instagram_url" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="https://instagram.com/…" />
          <Field label="Lien TikTok" k="tiktok_url" form={form} set={set} editing={editing} setEditing={setEditing} placeholder="https://tiktok.com/@…" />
        </Section>

        <Section icon={Wallet} title="MVola / Dépôt" color="primary">
          <Field label="Numéro MVola" k="mvola_number" form={form} set={set} editing={editing} setEditing={setEditing} />
          <Field label="Nom du propriétaire MVola" k="mvola_owner" form={form} set={set} editing={editing} setEditing={setEditing} />
          <Field label="Montant minimum de recharge (Ar)" k="min_recharge" form={form} set={set} editing={editing} setEditing={setEditing} type="number" />
          <FieldArea label="Instructions de dépôt (affichées sur /recharge)" k="mvola_instructions" form={form} set={set} editing={editing} setEditing={setEditing} />
        </Section>

        <Section icon={Megaphone} title="Messages d'accueil" color="accent">
          <FieldArea label="Message d'accueil (bannière)" k="welcome_message" form={form} set={set} editing={editing} setEditing={setEditing} />
        </Section>
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }: { icon: any; title: string; color: "primary" | "accent"; children: React.ReactNode }) {
  return (
    <section className="glass-strong rounded-2xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-8 w-8 rounded-xl grid place-items-center ${color === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>
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
  editing: string | null;
  setEditing: (s: string | null) => void;
  placeholder?: string;
  type?: string;
};

function Field({ label, k, form, set, editing, setEditing, placeholder, type = "text" }: FieldProps) {
  const id = String(k);
  const isEditing = editing === id;
  const value = (form[k] ?? "") as any;
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        {isEditing ? (
          <Input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => set(k, (type === "number" ? Number(e.target.value) : e.target.value) as any)}
            onBlur={() => setEditing(null)}
            autoFocus
            className="h-10"
          />
        ) : (
          <button
            onClick={() => setEditing(id)}
            className="flex-1 h-10 px-3 rounded-xl glass border border-white/10 text-left text-sm hover:border-primary/40 transition flex items-center justify-between gap-2"
          >
            <span className="truncate text-foreground/90">{String(value) || <span className="text-muted-foreground italic">non défini</span>}</span>
            <Pencil className="h-3.5 w-3.5 text-primary shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}

function FieldArea({ label, k, form, set, editing, setEditing }: FieldProps) {
  const id = String(k);
  const isEditing = editing === id;
  const value = (form[k] ?? "") as any;
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1">
        {isEditing ? (
          <Textarea
            value={value}
            onChange={(e) => set(k, e.target.value as any)}
            onBlur={() => setEditing(null)}
            autoFocus
            rows={5}
          />
        ) : (
          <button
            onClick={() => setEditing(id)}
            className="w-full min-h-[3rem] p-3 rounded-xl glass border border-white/10 text-left text-sm hover:border-primary/40 transition flex items-start justify-between gap-2"
          >
            <span className="whitespace-pre-wrap text-foreground/90">{String(value) || <span className="text-muted-foreground italic">non défini</span>}</span>
            <Pencil className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
