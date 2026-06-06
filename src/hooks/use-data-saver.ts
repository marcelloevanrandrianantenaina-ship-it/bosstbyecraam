import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const LS_KEY = "data_saver";

function applyClass(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("data-saver", on);
}

function readLocal(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LS_KEY) === "1";
}

function writeLocal(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, on ? "1" : "0");
}

/** Apply early on every page load (used at the root). */
export function useDataSaverBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    applyClass(readLocal());
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("data_saver")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const remote = !!(data as any)?.data_saver;
      writeLocal(remote);
      applyClass(remote);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
}

/** Toggle hook for the UI. */
export function useDataSaver() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState<boolean>(() => readLocal());

  useEffect(() => {
    applyClass(enabled);
  }, [enabled]);

  const toggle = useCallback(
    async (next: boolean) => {
      setEnabled(next);
      writeLocal(next);
      applyClass(next);
      if (user) {
        await supabase.from("profiles").update({ data_saver: next } as any).eq("id", user.id);
      }
    },
    [user?.id],
  );

  return { enabled, toggle };
}
