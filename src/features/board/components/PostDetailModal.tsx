"use client";

import React, { useEffect } from "react";
import {
  X,
  User,
  Clock,
  MessageCircle,
  Lock,
  Trash2,
  PenLine,
} from "lucide-react";
import CommentSection from "./CommentSection";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PostDetailModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (postId: string) => void;
  currentUser: any;
  onEdit?: (post: any) => void; // 👈 추가
  onStatusUpdate: (postId: string, status: string) => void; // 👈 추가
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onDelete,
  onEdit,
  currentUser,
  onStatusUpdate,
}: PostDetailModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(); // 부모로부터 전달받은 닫기 함수 실행
      }
    };

    // 모달이 열려있을 때만 이벤트 리스너 등록
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    // 컴포넌트가 언마운트되거나 모달이 닫힐 때 리스너 제거 (메모리 누수 방지)
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const isOwner = currentUser?.id === post.author_id;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border-4 border-black rounded-[40px] shadow-cartoon overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-6 border-b-4 border-black flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-white text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">
              {post.category}
            </span>
            {post.is_secret && <Lock size={16} className="text-blue-200" />}
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform bg-black/20 p-2 rounded-full"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-black leading-tight break-words">
              {post.title}
            </h2>

            <div className="flex items-center gap-4 text-slate-400 font-bold text-sm border-b-2 border-slate-100 pb-4">
              <div className="flex items-center gap-1">
                <User size={14} /> {post.author_name}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />{" "}
                {format(new Date(post.created_at), "yyyy-MM-dd HH:mm")}
              </div>
            </div>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
            {/* 기존 본문 및 답변 영역 */}
            <div className="text-lg font-medium leading-relaxed ...">
              {post.content}
            </div>

            {/* 💬 댓글 섹션 추가 */}
            <CommentSection
              postId={post.id}
              currentUser={currentUser}
              onStatusUpdate={onStatusUpdate} // 👈 댓글 섹션으로 전달
            />
          </div>

          {/* 답변 영역 (status가 답변완료일 때만 예시로 표시) */}
          {/* {post.status === "답변완료" && (
            <div className="bg-slate-50 border-4 border-black rounded-3xl p-6 relative mt-10">
              <div className="absolute -top-4 left-6 bg-green-400 border-2 border-black px-4 py-1 rounded-full font-black text-sm shadow-cartoon-sm">
                Answer
              </div>
              <p className="text-slate-600 font-bold leading-relaxed pt-2">
                안녕하세요, 다이어리 요정입니다! 🧚‍♂️ <br />
                문의하신 내용은 현재 시스템에서 지원 예정인 기능입니다. 조금만
                더 기다려주세요!
              </p>
            </div>
          )} */}
        </div>

        {/* 푸터: 본인일 경우 삭제 버튼 노출 */}
        <div className="p-6 bg-slate-50 border-t-4 border-black flex justify-between items-center shrink-0">
          <span
            className={cn(
              "px-4 py-1.5 rounded-full border-2 border-black font-black text-xs shadow-cartoon-sm",
              post.status === "답변완료" ? "bg-green-400" : "bg-yellow-300",
            )}
          >
            상태: {post.status}
          </span>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(post)}
                className="flex items-center gap-2 text-blue-500 font-black hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
              >
                <PenLine size={18} /> 수정하기
              </button>
              <button
                onClick={() => onDelete?.(post.id)}
                className="flex items-center gap-2 text-rose-500 font-black hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors"
              >
                <Trash2 size={18} /> 삭제하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
