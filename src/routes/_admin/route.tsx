import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "sub_admin");
    if (!isAdmin) throw redirect({ to: "/admin/login" });
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_gate_passed") !== "1") {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader admin />
      <main className="flex-1 mx-auto w-full max-w-6xl px-3 sm:px-5 pt-4 pb-12 space-y-4">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
