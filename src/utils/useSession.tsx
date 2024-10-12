import { RealtimeChannel, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supaClient } from "../supa-client";

export interface UserProfile {
  user_id: string;
  username: string;
  avatarUrl?: string;
}

export interface ZeddshipUserInfo {
  session: Session | null;
  profile: UserProfile | null;
}

export function useSession(): ZeddshipUserInfo {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supaClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      supaClient.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setProfile(null);

        if (event === "SIGNED_OUT") {
          navigate("/");
          console.log(profile, session);
          // window.location.reload();
        }
      });
    });
  }, []);

  useEffect(() => {
    if (session?.user && !profile) {
      // Listen to user profile changes
      listenToUserProfileChanges(session.user.id).then((newChannel) => {
        if (newChannel) {
          if (channel) {
            channel.unsubscribe();
          }
          setChannel(newChannel);
        }
      });
    } else if (!session?.user) {
      channel?.unsubscribe();
      setChannel(null);
    }
  }, [session?.user?.id]);

  async function listenToUserProfileChanges(userId: string) {
    const { data, error } = await supaClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user profile:", error.message);
      setSession(null);
      setProfile(null);
      navigate("/");
      return null;
    }

    if (!data?.length) {
      console.warn("No user profile found for user_id:", userId);
      navigate("/welcome");
      return null;
    }

    setProfile(data[0]);

    return supaClient
      .channel("public:user_profiles")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profiles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(payload);
          setProfile(payload.new as UserProfile);
        }
      )
      .subscribe();
  }

  return { session, profile };
}
