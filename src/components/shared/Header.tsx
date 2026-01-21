"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePresence } from "@/context/PresenceContext";
import { createBrowserClient } from "@supabase/ssr";
import {
  MessageSquare,
  User,
  Calendar as CalendarIcon,
  LogOut,
} from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { onlineUserCount } = usePresence(); // 전역 상태에서 가져옴

  // 브라우저용 Supabase 클라이언트 생성
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    // 1. 초기 세션 확인
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 2. 인증 상태 변화 감지 (로그인/로그아웃 시 즉시 반영)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAuthAction = async () => {
    if (user) {
      // 로그아웃 로직
      await supabase.auth.signOut();
      router.push("/"); // 로그아웃 후 홈으로 이동
    } else {
      // 로그인 페이지로 이동
      router.push("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b-4 border-black px-6 md:px-12 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-rose-500 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
            <CalendarIcon className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <span className="text-2xl font-black tracking-tighter italic">
            캘<span className="text-rose-500">링크</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-8">
          {/* 실시간 사용자 배지 */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 border-2 border-green-600 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-700">
              LIVE {onlineUserCount}
            </span>
          </div>
          <Link
            href="/board"
            className="flex items-center gap-2 font-black text-sm hover:text-rose-500 transition-colors"
          >
            <MessageSquare className="w-5 h-5" strokeWidth={3} />
            <span className="hidden md:block">문의사항</span>
          </Link>

          {/* 로그인/로그아웃 버튼 상태 분기 */}
          <button
            onClick={handleAuthAction}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(244,63,94,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all
              ${
                user
                  ? "bg-white border-2 border-black text-black"
                  : "bg-black text-white"
              }
            `}
          >
            {user ? (
              <>
                <LogOut className="w-4 h-4" strokeWidth={3} />
                로그아웃
              </>
            ) : (
              <>
                <User className="w-4 h-4" strokeWidth={3} />
                로그인
              </>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
