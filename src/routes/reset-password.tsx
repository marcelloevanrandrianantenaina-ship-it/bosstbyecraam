import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash.includes("type=recovery")) {
      // still allow if there is a session
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-6 fade-in">
        <div className="mx-auto h-12 w-12 rounded-2xl gradient-primary grid place-items-center glow mb-3"><Zap className="h-6 w-6 text-primary-foreground" /></div>
        <h1 className="text-xl font-bold text-center mb-4">Nouveau mot de passe</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="np">Mot de passe</Label>
            <Input id="np" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground">
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Mettre à jour
          </Button>
        </form>
      </div>
    </div>
  );
}
