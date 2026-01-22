"use client";

import React from "react";
import { X, LogIn, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: string; // alert는 버튼 1개, confirm은 버튼 2개
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "다음에 할게요",
  type = "confirm", // 기본값은 버튼 2개
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black mb-2">{title}</h2>
        <p className="text-gray-600 font-medium mb-6 whitespace-pre-wrap">
          {message}
        </p>

        <div className="flex gap-3">
          {/* 확인 버튼 (언제나 노출) */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-yellow-400 border-2 border-black font-black hover:bg-yellow-300 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {confirmText}
          </button>

          {/* 취소 버튼 (type이 confirm일 때만 노출) */}
          {type === "confirm" && (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white border-2 border-black font-black hover:bg-gray-100 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
