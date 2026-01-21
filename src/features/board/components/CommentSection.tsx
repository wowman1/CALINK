"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Send, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function CommentSection({
  postId,
  currentUser,
  onStatusUpdate,
}: {
  postId: string;
  currentUser: any;
  onStatusUpdate: (postId: string, status: string) => void; // 👈 추가
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("board_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const isAdmin = session.user.user_metadata?.role === "admin";

    // 1. 댓글 Insert
    const { error: commentError } = await supabase
      .from("board_comments")
      .insert([
        {
          post_id: postId,
          user_id: session.user.id,
          author_name: isAdmin
            ? "다이어리 요정 🧚‍♂️"
            : session.user.user_metadata?.name || "익명",
          content: newComment,
        },
      ]);

    if (commentError) return;

    // 2. 관리자라면 게시글 상태 업데이트 실행
    if (isAdmin) {
      const { error: statusError } = await supabase
        .from("board_posts")
        .update({ status: "답변완료" })
        .eq("id", postId);

      if (!statusError) {
        // ⭐ 핵심: DB 업데이트 성공 후 부모의 상태를 즉시 변경!
        onStatusUpdate(postId, "답변완료");
      }
    }

    setNewComment("");
    fetchComments();
  };

  const handleDeleteComment = async (id: string) => {
    const { error } = await supabase
      .from("board_comments")
      .delete()
      .eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-8 space-y-6 border-t-2 border-slate-100 pt-6">
      <h4 className="font-black text-lg flex items-center gap-2">
        <span className="bg-black text-white px-2 py-0.5 rounded text-xs">
          COMMENTS
        </span>
        {comments.length}
      </h4>

      {/* 댓글 리스트 */}
      <div className="space-y-4">
        {comments.map((comment) => {
          // 관리자가 쓴 글인지 확인 (이름이나 별도 컬럼 기준)
          const isReplyFromAdmin = comment.author_name.includes("요정");

          return (
            <div
              key={comment.id}
              className={cn(
                "group flex gap-3 items-start",
                isReplyFromAdmin ? "flex-row-reverse" : "flex-row", // 관리자 답변은 우측 정렬 느낌
              )}
            >
              {/* 아바타 영역 */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-black",
                  isReplyFromAdmin ? "bg-yellow-400" : "bg-slate-200",
                )}
              >
                {isReplyFromAdmin ? "🧚" : <User size={16} />}
              </div>

              {/* 댓글 말풍선 */}
              <div
                className={cn(
                  "flex-1 border-2 border-black rounded-2xl p-3 relative shadow-cartoon-sm",
                  isReplyFromAdmin
                    ? "bg-blue-50 border-blue-600"
                    : "bg-slate-50 border-black",
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={cn(
                      "font-black text-xs",
                      isReplyFromAdmin && "text-blue-600",
                    )}
                  >
                    {comment.author_name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {format(new Date(comment.created_at), "MM/dd HH:mm")}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-700 break-words">
                  {comment.content}
                </p>

                {currentUser?.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="absolute -right-2 -top-2 bg-white border-2 border-black p-1 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-cartoon-sm"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 댓글 입력창 */}
      {currentUser ? (
        <div className="relative mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 남겨주세요!"
            className="w-full bg-white border-3 border-black rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none min-h-[80px] pr-12"
          />
          <button
            onClick={handleSendComment}
            className="absolute right-3 bottom-3 bg-blue-500 text-white p-2 rounded-xl border-2 border-black shadow-cartoon-sm hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Send size={18} />
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center text-xs font-bold text-slate-400">
          로그인 후 댓글을 남길 수 있습니다.
        </div>
      )}
    </div>
  );
}
