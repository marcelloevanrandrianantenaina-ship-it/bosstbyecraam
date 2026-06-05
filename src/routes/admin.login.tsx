import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, Lock, Mail, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin — ẞoost-by Ecr_aaM" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !auth.user) {
      setBusy(false);
      return toast.error("Identifiants incorrects");
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", auth.user.id);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "sub_admin");
    setBusy(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return toast.error("ACCÈS REFUSÉ — Compte non administrateur");
    }
    sessionStorage.setItem("admin_gate_passed", "1");
    toast.success("Bienvenue dans la console admin");
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-md fade-in">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/auth"><ArrowLeft className="h-4 w-4" />Espace client</Link>
          </Button>
        </div>
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl gradient-primary grid place-items-center glow mb-3">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Accès restreint</p>
        </div>

        <div className="glass-strong rounded-2xl p-5 border border-primary/20">
          <form onSubmit={signIn} className="space-y-3">
            <div>
              <Label htmlFor="ae">Email admin</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="ae" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" />
              </div>
            </div>
            <div>
              <Label htmlFor="ap">Mot de passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="ap" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" autoComplete="current-password" />
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft">
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
