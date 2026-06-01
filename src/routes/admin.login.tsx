import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, Lock, Mail, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin — ẞoost-by Ecr_aaM" }] }),
  component: AdminLoginPage,
});

// 2nd-layer admin gate (in addition to Supabase admin role).
// These are stored client-side intentionally as a soft gate; the real
// authorization comes from the Supabase admin role check.
const GATE_1 = "26mars2008";
const GATE_2 = "admin26mars2008";
const GATE_3 = "26mars2008";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"creds" | "gate">("creds");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return toast.error("Identifiants incorrects"); }
    // Verify admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", auth.user!.id);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "sub_admin");
    setBusy(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return toast.error("ACCÈS REFUSÉ — Compte non administrateur");
    }
    setStep("gate");
  }

  function verifyGate(e: React.FormEvent) {
    e.preventDefault();
    if (p1 !== GATE_1 || p2 !== GATE_2 || p3 !== GATE_3) {
      toast.error("ACCÈS REFUSÉ");
      setP1(""); setP2(""); setP3("");
      return;
    }
    sessionStorage.setItem("admin_gate_passed", "1");
    toast.success("Accès admin accordé");
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary grid place-items-center glow mb-3">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Accès restreint — Authentification renforcée</p>
        </div>

        <div className="glass-strong rounded-2xl p-5 border border-primary/20">
          {step === "creds" ? (
            <form onSubmit={signIn} className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-accent font-bold mb-2">Étape 1/2 · Identifiants</div>
              <div>
                <Label htmlFor="ae">Email admin</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="ae" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="ap">Mot de passe</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="ap" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft">
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Continuer
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyGate} className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-accent font-bold mb-2">Étape 2/2 · Triple verrou</div>
              {[
                { v: p1, set: setP1, label: "Mot de passe 1" },
                { v: p2, set: setP2, label: "Mot de passe 2" },
                { v: p3, set: setP3, label: "Mot de passe 3" },
              ].map((f, i) => (
                <div key={i}>
                  <Label>{f.label}</Label>
                  <div className="relative mt-1">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" required value={f.v} onChange={(e) => f.set(e.target.value)} className="pl-9" />
                  </div>
                </div>
              ))}
              <Button type="submit" className="w-full gradient-primary text-primary-foreground glow-soft">
                Déverrouiller la console
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
