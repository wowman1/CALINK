// src/features/board/components/PostItem.tsx
import { Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  category: string;
  title: string;
  author_name: string;
  created_at: string;
  status: string;
  is_secret: boolean;
}

export default function PostItem({ post }: { post: Post }) {
  // 날짜 포맷팅 함수 추가 (예: 2026-01-20 형식으로)
  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(".", "");
  };

  return (
    <div className="group bg-white border-4 border-black rounded-[24px] p-6 flex items-center justify-between shadow-cartoon transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
      <div className="flex items-center gap-6">
        {/* 상태 표시 아이콘 */}
        <div
          className={cn(
            "hidden md:flex w-16 h-16 rounded-2xl border-2 border-black items-center justify-center font-black text-[10px] text-center px-1 shadow-cartoon-sm",
            post.status === "답변완료" ? "bg-green-400" : "bg-slate-100",
          )}
        >
          {post.status}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-slate-300 font-bold text-[10px]">
              {formatDate(post.created_at)}
            </span>
          </div>
          <h3 className="text-xl font-black flex items-center gap-2 group-hover:text-blue-600 transition-colors">
            {post.is_secret && <Lock className="w-4 h-4 text-slate-400" />}
            {post.title}
          </h3>
          <p className="text-sm font-bold text-slate-400">
            작성자: {post.author_name}
          </p>
        </div>
      </div>

      <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shrink-0">
        <ChevronRight className="w-6 h-6" strokeWidth={3} />
      </div>
    </div>
  );
}
