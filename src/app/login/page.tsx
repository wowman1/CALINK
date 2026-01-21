"use client";

import { supabase } from "@/lib/supabase/client";
import { Calendar } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5]">
      <div className="w-full max-w-md p-10 bg-white border-4 border-black rounded-[40px] shadow-cartoon text-center space-y-8">
        <div className="inline-block p-4 bg-rose-500 rounded-2xl border-2 border-black shadow-cartoon-sm">
          <Calendar className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <span className="text-2xl font-black tracking-tighter italic">
            캘<span className="text-rose-500">링크</span>
          </span>
          <p className="font-bold text-slate-500">
            구글 계정으로 간편하게 시작하세요!
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-4 border-black p-4 rounded-2xl font-black text-lg hover:bg-slate-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-cartoon-sm transition-all"
        >
          <img
            src="https://www.google.com/favicon.ico"
            className="w-5 h-5"
            alt="google"
          />
          Google로 로그인
        </button>
      </div>
    </div>
  );
}
