import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Zap, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Inscription — ẞoost-by Ecr_aaM" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Bienvenue 👋");
    navigate({ to: "/app" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin + "/app",
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé ! Vérifiez votre email.");
  }

  async function googleSignIn() {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (res.error) { setBusy(false); return toast.error("Échec connexion Google"); }
    if (!res.redirected) navigate({ to: "/app" });
  }

  async function forgotPassword() {
    if (!email) return toast.error("Entrez votre email d'abord");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
    if (error) return toast.error(error.message);
    toast.success("Email de réinitialisation envoyé");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md fade-in">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-2xl gradient-primary grid place-items-center glow mb-3"><Zap className="h-6 w-6 text-primary-foreground" /></div>
            <h1 className="text-2xl font-bold tracking-tight"><span className="text-gradient">ẞoost</span>-by Ecr_aaM</h1>
            <p className="text-sm text-muted-foreground">{tab === "signup" ? "Créez votre compte pour commencer" : "Connectez-vous pour commander"}</p>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <div className="space-y-2 mb-3">
              <Button onClick={googleSignIn} disabled={busy} variant="outline" className="w-full border-border bg-secondary/40 h-11">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.5 6.3 28.9 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.9 0 19-7.9 19-19.5 0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.5 6.8 28.9 5 24 5 16.3 5 9.7 9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43c4.8 0 9.2-1.8 12.5-4.8l-5.8-4.9c-1.9 1.3-4.2 2.2-6.7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.4 39 16.2 43 24 43z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l5.8 4.9c-.4.4 6.5-4.7 6.5-14.3 0-1.3-.1-2.3-.4-3.5z"/></svg>
                {tab === "signup" ? "S'inscrire avec Google" : "Continuer avec Google"}
              </Button>
              <Button disabled variant="outline" className="w-full border-border bg-secondary/20 h-11 opacity-60 cursor-not-allowed">
                <Phone className="h-4 w-4 mr-2" />
                {tab === "signup" ? "S'inscrire par téléphone" : "Se connecter par téléphone"}
                <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">BIENTÔT</span>
              </Button>
            </div>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
              <span className="relative bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">ou avec email</span>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="signup">Inscription</TabsTrigger>
                <TabsTrigger value="login">Connexion</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={signIn} className="space-y-3">
                  <div>
                    <Label htmlFor="le">Email</Label>
                    <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="le" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lp">Mot de passe</Label>
                    <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="lp" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <button type="button" onClick={forgotPassword} className="text-xs text-accent hover:underline">Mot de passe oublié ?</button>
                  <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft">
                    {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Se connecter
                  </Button>
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Pas encore de compte ?{" "}
                    <button type="button" onClick={() => setTab("signup")} className="text-accent font-semibold hover:underline">S'inscrire</button>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-3">
                  <div>
                    <Label htmlFor="sn">Nom complet</Label>
                    <div className="relative mt-1"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="sn" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="se">Email</Label>
                    <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="se" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sp">Mot de passe</Label>
                    <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="sp" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground glow-soft">
                    {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Créer mon compte
                  </Button>
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Déjà un compte ?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-accent font-semibold hover:underline">Se connecter</button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-4 text-center">
            <Link to="/admin/login" className="text-[10px] text-muted-foreground hover:text-accent">Accès administrateur</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
