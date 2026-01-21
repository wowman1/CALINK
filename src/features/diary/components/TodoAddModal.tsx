"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";

import { createBrowserClient } from "@supabase/ssr";
import { useAlert } from "@/context/AlertContext";

interface TodoAddModalProps {
  dateKey: string;
  onClose: () => void;
}

export default function TodoAddModal({ dateKey, onClose }: TodoAddModalProps) {
  const [content, setContent] = useState("");
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showAlert(
        "로그인이 필요해요! 🔒",
        "할 일 기록은 로그인 후 이용하실 수 있습니다.",
      );
      return;
    }

    const { error } = await supabase.from("todos").insert([
      {
        date_key: dateKey,
        content: content,
        user_id: user.id,
        is_completed: false,
      },
    ]);

    if (!error) {
      onClose();
    } else {
      alert("할 일 추가 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-white/95 rounded-2xl p-3 flex flex-col justify-center animate-in fade-in zoom-in duration-200">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 text-slate-400 hover:text-black"
      >
        <X className="w-4 h-4" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-2">
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">
          New To-do
        </p>
        <input
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="무엇을 할까요?"
          className="w-full border-b-2 border-black bg-transparent py-1 text-xs font-bold focus:outline-none"
        />
        <button
          type="submit"
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-black text-white py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 hover:bg-rose-500 transition-colors"
        >
          <Check className="w-3 h-3" /> 추가하기
        </button>
      </form>
    </div>
  );
}
