"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Clock,
  Hash,
  Send,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiaryChatModalProps {
  dateKey: string;
  logs: any[];
  inputText: string;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  onClose: () => void;
  onDateLinkClick: (targetDate: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  todos: any[];
  onToggleTodo: (id: string, status: boolean) => void;
  onDeleteTodo: (id: string) => void;
  highlightLogId: string | null;
}

export default function DiaryChatModal({
  dateKey,
  logs,
  inputText,
  onInputChange,
  onSend,
  onClose,
  onDateLinkClick,
  onDelete,
  onUpdate,
  todos,
  onToggleTodo,
  onDeleteTodo,
  highlightLogId,
}: DiaryChatModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. useMemo로 현재 날짜의 로그들만 추출 (logs 자체가 변하지 않으면 참조값 유지)
  const dayLogs = useMemo(() => {
    return logs.filter((log) => log.date_key === dateKey);
  }, [logs, dateKey]);

  // 2. 이전 로그 개수를 추적하기 위한 Ref
  const prevLogsLength = useRef(dayLogs.length);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [dayLogs]);
  useEffect(() => {
    // A. 하이라이트 아이디가 새로 들어온 경우 (최우선순위)
    if (highlightLogId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`log-${highlightLogId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    // B. 새 로그가 실제로 추가되었을 때만 하단 스크롤 (전송 버튼 클릭 시)
    // 💡 단순히 글자를 칠 때는 dayLogs.length와 prevLogsLength가 같으므로 실행되지 않음
    if (dayLogs.length > prevLogsLength.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }

    // C. 현재 로그 개수 업데이트
    prevLogsLength.current = dayLogs.length;
  }, [highlightLogId, dayLogs.length]);
  // 💡 highlightLogId가 바뀌거나 '실제 로그 데이터'가 추가될 때만 이펙트 발생

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[700px] h-[600px] bg-white border-4 border-black rounded-[40px] shadow-cartoon overflow-hidden flex animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* [왼쪽 패널]: 할 일 관리 영역 (NEW!) */}
        <div className="w-[280px] border-r-4 border-black bg-slate-50 flex flex-col shrink-0">
          <div className="p-5 border-b-4 border-black bg-yellow-300">
            <h4 className="font-black italic flex items-center gap-2 text-sm">
              <CheckCircle2 size={18} /> TO-DO LIST
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {todos.length === 0 ? (
              <p className="text-[10px] font-bold text-slate-400 text-center mt-10">
                할 일이 없습니다.
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-start justify-between bg-white border-2 border-black p-2.5 rounded-xl shadow-cartoon-sm hover:-translate-y-0.5 transition-all mb-2"
                >
                  <button
                    onClick={() => onToggleTodo(todo.id, todo.is_completed)}
                    className="flex items-start gap-3 flex-1 text-left min-w-0"
                    /* min-w-0: Flex 자식이 부모 너비를 초과하지 않도록 고정 */
                  >
                    {/* 체크박스: shrink-0으로 크기 고정 */}
                    <div
                      className={cn(
                        "w-5 h-5 border-2 border-black rounded flex items-center justify-center transition-colors shrink-0 mt-0.5",
                        todo.is_completed ? "bg-green-400" : "bg-white",
                      )}
                    >
                      {todo.is_completed && (
                        <Check
                          size={14}
                          strokeWidth={4}
                          className="text-white"
                        />
                      )}
                    </div>

                    {/* 텍스트 영역: truncate 대신 break-words 사용 */}
                    <span
                      className={cn(
                        "text-xs font-bold leading-relaxed break-words whitespace-pre-wrap flex-1",
                        todo.is_completed
                          ? "line-through text-slate-400 decoration-2"
                          : "text-black",
                      )}
                    >
                      {todo.content}
                    </span>
                  </button>

                  {/* 삭제 버튼: shrink-0으로 자리 보존 */}
                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all shrink-0 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* [오른쪽 패널]: 기존 채팅 타임라인 */}
        <div className="flex-1 flex flex-col bg-white">
          {/* 헤더 */}
          <div className="bg-black text-white p-5 flex justify-between items-center shrink-0">
            <h3 className="font-black text-xl italic leading-none">
              {dateKey} LOG
            </h3>
            <button
              onClick={onClose}
              className="hover:rotate-90 transition-transform bg-white/10 p-1 rounded-full"
            >
              <X />
            </button>
          </div>

          {/* 채팅 타임라인 */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFDFB] custom-scrollbar"
          >
            {dayLogs.map((log) => (
              <div
                key={log.id}
                id={`log-${log.id}`} // ⭐ 각 로그 아이템에 ID를 부여해야 찾을 수 있습니다.
                className={cn(
                  "transition-all duration-700 p-2 rounded-2xl",
                  highlightLogId === log.id
                    ? "bg-yellow-100 ring-2 ring-yellow-400"
                    : "",
                  // highlightLogId가 null이 되면 위 조건은 false가 되어 스타일이 제거됨
                )}
              >
                <LogItem
                  log={log}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onDateLinkClick={onDateLinkClick}
                />
              </div>
            ))}
          </div>

          {/* 입력 바 */}
          <form
            onSubmit={onSend}
            className="p-5 border-t-4 border-black bg-white shrink-0"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="링크 활성 방법 : #YYYY-MM-DD"
                className="flex-1 bg-slate-50 border-2 border-black rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
              />
              <button
                type="submit"
                className="bg-rose-500 text-white p-3 border-2 border-black rounded-xl shadow-cartoon-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- 내부 로그 아이템 컴포넌트 ---
function LogItem({ log, onDelete, onUpdate, onDateLinkClick }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(log.content);

  // DiaryChatModal.tsx 내 LogItem의 renderContent 수정
  const renderContent = (content: string) => {
    // # 뒤에 숫자 4개-2개-2개 패턴 추출
    const parts = content.split(/(#\d{4}-\d{2}-\d{2})/g);

    return parts.map((part, i) => {
      const isFullDateFormat = /^#\d{4}-\d{2}-\d{2}$/.test(part);

      if (isFullDateFormat) {
        return (
          <span
            key={i}
            onClick={() => onDateLinkClick(part.substring(1))}
            className="text-blue-600 underline cursor-pointer font-black hover:text-blue-800 transition-colors"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleUpdateSubmit = () => {
    onUpdate(log.id, editValue);
    setIsEditing(false);
  };

  return (
    <div className="group space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
          <Clock className="w-3 h-3" />
          {new Date(log.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* 수정/삭제 버튼 (Hover 시 노출) */}
        {!isEditing && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-blue-500"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(log.id)}
              className="text-slate-400 hover:text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "bg-white border-2 border-black p-4 rounded-2xl rounded-tl-none font-bold text-sm shadow-cartoon-sm max-w-[95%] transition-all",
          isEditing && "border-blue-500 ring-4 ring-blue-500/10",
        )}
      >
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-slate-50 border-2 border-black rounded-lg p-2 text-xs font-bold focus:outline-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-black"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="p-1 text-blue-500 hover:scale-110"
              >
                <Check size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        ) : (
          <p>{renderContent(log.content)}</p>
        )}
      </div>
    </div>
  );
}
