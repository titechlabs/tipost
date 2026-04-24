import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { LoginGate } from "@/components/app/LoginGate";
import { AccessCodeGate } from "@/components/app/AccessCodeGate";
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
  codeId: string;
};

export default function AppPage() {
  const { session, loading } = useAuthSession();
  const [params] = useSearchParams();
  const refParam = params.get("ref") ?? "";

  const [profileLoading, setProfileLoading] = useState(false);
  const [hasCode, setHasCode] = useState<boolean | null>(null);
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
      .select("code_id,plan")
      .eq("id", session.user.id)
      .maybeSingle();
    if (!u?.code_id) {
      setHasCode(false);
      setInfo(null);
      setProfileLoading(false);
      return;
    }
    // Reset daily if needed (best-effort RPC)
    await supabase.rpc("reset_daily_if_needed", { _code_id: u.code_id });
    const { data: c } = await supabase
      .from("access_codes")
      .select("daily_used,daily_limit,plan")
      .eq("id", u.code_id)
      .maybeSingle();
    setHasCode(true);
    setInfo({
      plan: (u.plan ?? c?.plan ?? "free") as Plan,
      used: c?.daily_used ?? 0,
      limit: c?.daily_limit ?? 2,
      codeId: u.code_id,
    });
    setProfileLoading(false);
  };

  useEffect(() => {
    if (session) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, refreshKey]);

  if (loading || (session && profileLoading && hasCode === null)) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!session) return <LoginGate />;

  if (hasCode === false) {
    return (
      <AccessCodeGate
        initialRef={refParam}
        onUnlocked={() => setRefreshKey((k) => k + 1)}
      />
    );
  }

  if (!info) return null;

  const maxPerRun = info.plan === "pro" ? 10 : info.plan === "starter" ? 5 : 1;
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