import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AnnouncementBar() {
  const [items, setItems] = useState<{ id: string; content: string }[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, content")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-border/60 glass">
      <div className="flex items-center gap-3 px-4 py-2">
        <Megaphone className="h-3.5 w-3.5 text-accent shrink-0" />
        <div className="flex-1 overflow-hidden">
          <div className="marquee whitespace-nowrap flex gap-10 text-xs text-muted-foreground">
            {loop.map((a, i) => (
              <span key={i}>{a.content}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
