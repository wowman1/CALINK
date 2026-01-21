"use client";

import React from "react";
import { X, MessageSquare, ArrowRight, Clock, Hash } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LinkDetailModalProps {
  dateKey: string;
  logs: any[];
  onClose: () => void;
  onSelectLog: (dateKey: string, logId: string) => void;
}

export default function LinkDetailModal({
  dateKey,
  logs,
  onClose,
  onSelectLog,
}: LinkDetailModalProps) {
  const linkedLogs = logs.filter(
    (log) => log.date_key === dateKey && log.linked_date,
  );

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-white border-4 border-black rounded-[40px] shadow-cartoon overflow-hidden animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 날짜 강조 */}
        <div className="bg-blue-600 text-white p-6 border-b-4 border-black flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
              Timeline Links
            </span>
            <h3 className="font-black text-2xl italic tracking-tighter">
              {format(new Date(dateKey), "yyyy. MM. dd")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform bg-black/20 p-2 rounded-full"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 로그 리스트 영역 */}
        <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar bg-slate-50">
          {linkedLogs.length > 0 ? (
            linkedLogs.map((log, index) => (
              <div key={log.id} className="relative group">
                {/* 왼쪽 시간 표시 태그 */}
                <div className="absolute -left-2 -top-2 z-10 bg-yellow-400 border-2 border-black px-2 py-0.5 rounded-md shadow-cartoon-sm transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="text-[9px] font-black flex items-center gap-1 text-black">
                    <Clock size={10} />{" "}
                    {format(new Date(log.created_at), "HH:mm")}
                  </span>
                </div>

                {/* 메인 카드 버튼 */}
                <button
                  onClick={() => onSelectLog(dateKey, log.id)}
                  className="w-full flex flex-col gap-2 p-5 pt-7 bg-white border-2 border-black rounded-2xl hover:bg-blue-50 hover:translate-x-1 hover:-translate-y-1 transition-all text-left shadow-cartoon-sm group-active:shadow-none"
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-sm font-bold text-slate-800 leading-snug break-words">
                      {/* 본문 중 해시태그만 파란색 강조 */}
                      {log.content
                        .split(/(#\d{4}-\d{2}-\d{2})/)
                        .map((part: string, i: number) =>
                          part.startsWith("#") ? (
                            <span key={i} className="text-blue-600">
                              {" "}
                              {part}{" "}
                            </span>
                          ) : (
                            part
                          ),
                        )}
                    </p>
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                      <ArrowRight size={16} strokeWidth={3} />
                    </div>
                  </div>

                  {/* 구분선 및 하단 정보 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase italic">
                      Entry #{index + 1}
                    </span>
                  </div>
                </button>
              </div>
            ))
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-300">
                <Hash className="text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400 italic">
                연결된 로그가 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 푸터 안내 */}
        <div className="p-4 bg-white border-t-2 border-black text-center">
          <p className="text-[10px] font-bold text-slate-400 italic italic">
            기록을 선택하면 해당 시점으로 이동합니다 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
