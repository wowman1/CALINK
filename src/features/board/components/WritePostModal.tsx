"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Lock, Unlock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: string[];
  initialData?: any; // 👈 수정 시 넘겨받을 기존 데이터
}

export default function WritePostModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}: WritePostModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[1]); // '전체' 제외 첫 카테고리
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);

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

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || categories[1]);
      setContent(initialData.content || "");
      setIsSecret(initialData.is_secret || false);
    } else if (!initialData && isOpen) {
      // 신규 작성 시 초기화
      setTitle("");
      setCategory(categories[1]);
      setContent("");
      setIsSecret(false);
    }
  }, [initialData, isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // id가 포함된 데이터를 넘겨주어 부모가 신규/수정을 판단하게 함
    onSubmit({
      id: initialData?.id,
      title,
      category,
      content,
      isSecret,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        className="w-full max-w-2xl bg-white border-4 border-black rounded-[40px] shadow-cartoon overflow-hidden animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-rose-500 text-white p-6 border-b-4 border-black flex justify-between items-center">
          <h3 className="text-2xl font-black italic tracking-tighter">
            {initialData ? "EDIT INQUIRY" : "NEW INQUIRY"}
          </h3>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform bg-black/20 p-2 rounded-full"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black text-sm text-slate-700">
              <Tag size={16} /> CATEGORY
            </label>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c !== "전체" && c !== "나의 작성글")
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl border-2 border-black font-bold text-sm transition-all shadow-cartoon-sm",
                      category === cat
                        ? "bg-yellow-400 -translate-y-1"
                        : "bg-white hover:bg-slate-50",
                    )}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div className="space-y-2">
            <label className="font-black text-sm text-slate-700 uppercase">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요!"
              className="w-full bg-slate-50 border-3 border-black rounded-2xl px-5 py-3 font-bold focus:outline-none focus:bg-white transition-colors"
              required
            />
          </div>

          {/* 내용 입력 */}
          <div className="space-y-2">
            <label className="font-black text-sm text-slate-700 uppercase">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="궁금한 내용을 자유롭게 적어주세요..."
              rows={5}
              className="w-full bg-slate-50 border-3 border-black rounded-2xl px-5 py-4 font-bold focus:outline-none focus:bg-white transition-colors resize-none"
              required
            />
          </div>

          {/* 하단 옵션 및 버튼 */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setIsSecret(!isSecret)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black font-black text-sm transition-all shadow-cartoon-sm",
                isSecret
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500",
              )}
            >
              {isSecret ? <Lock size={16} /> : <Unlock size={16} />}
              비밀글로 작성하기
            </button>

            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl border-4 border-black font-black text-xl shadow-cartoon-sm hover:-translate-y-1 hover:shadow-cartoon transition-all active:translate-y-0"
            >
              <Send size={20} /> 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
