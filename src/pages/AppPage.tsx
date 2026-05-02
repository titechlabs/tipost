import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/app/TopBar";
import { AnnouncementBanner } from "@/components/app/AnnouncementBanner";
import { Generator } from "@/components/app/Generator";
import { PostHistory } from "@/components/app/PostHistory";
import { ReferralCard } from "@/components/app/ReferralCard";

type Plan = "free" | "starter" | "pro";

type AccessInfo = {
  plan: Plan;
  used: number;
  limit: number;
  codeId: string | null;
  credits: number;
};

export default function AppPage() {
  const { session, loading } = useAuthSession();

  const [profileLoading, setProfileLoading] = useState(false);
  const [info, setInfo] = useState<AccessInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [presetTopic, setPresetTopic] = useState<string | undefined>();

  useEffect(() => {
    document.title = "TiPost — Generate Posts";
  }, []);

  const loadProfile = async () => {
    if (!session?.user) return;
    setProfileLoading(true);
    const { data: u } = await supabase
      .from("users")
      .select("code_id,plan,post_credits")
      .eq("id", session.user.id)
      .maybeSingle();

    // Count posts created today (used for accurate daily display across plans)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from("post_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .gte("created_at", startOfDay.toISOString());
    const usedToday = todayCount ?? 0;

    if (!u?.code_id) {
      // Free trial: use post_credits
      const credits = u?.post_credits ?? 0;
      setInfo({
        plan: "free",
        used: Math.max(0, 1 - credits),
        limit: 1,
        codeId: null,
        credits,
      });
      setProfileLoading(false);
      return;
    }
    // Reset daily if needed (best-effort RPC)
    await supabase.rpc("reset_daily_if_needed", { _code_id: u.code_id });
    const { data: c } = await supabase
      .from("access_codes")
      .select("daily_used,daily_limit,plan,last_reset_date")
      .eq("id", u.code_id)
      .maybeSingle();
    // If the reset hasn't happened yet (e.g. RPC failed), fall back to today's count
    const today = new Date().toISOString().slice(0, 10);
    const usedFromCode =
      c?.last_reset_date === today ? c?.daily_used ?? 0 : 0;
    const used = Math.max(usedFromCode, usedToday);
    setInfo({
      plan: (u.plan ?? c?.plan ?? "free") as Plan,
      used,
      limit: c?.daily_limit ?? 2,
      codeId: u.code_id,
      credits: u.post_credits ?? 0,
    });
    setProfileLoading(false);
  };

  useEffect(() => {
    if (session) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, refreshKey]);

  if (loading || (session && profileLoading && !info)) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (!info) return null;

  const maxPerRun = info.plan === "pro" ? 10 : info.plan === "starter" ? 5 : 1;
  const outOfCredits = !info.codeId && info.credits <= 0;
  const email = session.user.email ?? "";
  const avatar = (session.user.user_metadata as Record<string, unknown>)?.avatar_url as string | undefined;

  return (
    <div className="min-h-screen">
      <TopBar
        email={email}
        plan={info.plan}
        used={info.used}
        limit={info.limit}
        avatarUrl={avatar}
      />
      <AnnouncementBanner />
      <main className="container max-w-5xl py-8 sm:py-12 space-y-8">
        <Generator
          key={presetTopic ?? "default"}
          userId={session.user.id}
          maxPerRun={maxPerRun}
          outOfCredits={outOfCredits}
          presetTopic={presetTopic}
          onGenerated={() => setRefreshKey((k) => k + 1)}
        />
        <PostHistory
          userId={session.user.id}
          refreshKey={refreshKey}
          onRegenerate={(t) => {
            setPresetTopic(t);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
        <ReferralCard userId={session.user.id} />
      </main>
    </div>
  );
}