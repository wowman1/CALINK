// src/lib/supabase/supabaseClient.ts (또는 client.ts)
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* // 로그인 함수
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // 인증 완료 후 사용자를 다시 우리 웹사이트로 보낼 주소
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });
};
 */
