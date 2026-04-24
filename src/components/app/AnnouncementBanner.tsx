import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export function AnnouncementBanner() {
  const [msg, setMsg] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id,message")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const dismissed = localStorage.getItem("tipost_dismissed_ann");
        if (dismissed === data.id) return;
        setMsg(data.message);
        setId(data.id);
      });
  }, []);

  if (!msg) return null;

  return (
    <div
      className="border-b border-border text-sm"
      style={{ background: "linear-gradient(90deg, hsl(var(--accent)/0.18), hsl(var(--accent-2)/0.18))" }}
    >
      <div className="container flex items-center justify-between gap-4 py-2.5">
        <p className="truncate">📢 {msg}</p>
        <button
          aria-label="Dismiss"
          onClick={() => {
            if (id) localStorage.setItem("tipost_dismissed_ann", id);
            setMsg(null);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}