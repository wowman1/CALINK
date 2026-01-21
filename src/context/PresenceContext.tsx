"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const PresenceContext = createContext({ onlineUserCount: 1 });

export const PresenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [onlineUserCount, setOnlineUserCount] = useState(1);

  useEffect(() => {
    let browserId = localStorage.getItem("browser_session_id");
    if (!browserId) {
      browserId = Math.random().toString(36).substring(2, 11);
      localStorage.setItem("browser_session_id", browserId);
    }

    const channel = supabase.channel("global-online-users", {
      config: { presence: { key: browserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        // 0으로 떨어지는 현상을 방지하기 위한 최소값 1 설정 (내가 접속 중이므로)
        setOnlineUserCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    // 페이지 이동 시 채널을 껐다 켜지 않도록 유지합니다.
    return () => {
      // 컴포넌트가 아예 언마운트(앱 종료) 될 때만 해제
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUserCount }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);
