"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  Link2,
  Send,
  Clock,
  Plus,
  X,
  Hash,
  Calendar as CalendarIcon,
  CheckCircle2,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import DiaryChatModal from "@/features/diary/components/DiaryChatModal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import TodoAddModal from "@/features/diary/components/TodoAddModal";
import { createBrowserClient } from "@supabase/ssr";
import AlertModal from "@/components/shared/AlertModal";
import LinkDetailModal from "@/features/diary/components/LinkDetailModal";

// 컴포넌트 내부에서 사용할 클라이언트 생성
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function DiaryDetailPage() {
  // --- 상태 관리 ---
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // 현재 보고 있는 달
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dbLogs, setDbLogs] = useState<any[]>([]);
  const [dbTodos, setDbTodos] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [todoAddDate, setTodoAddDate] = useState<string | null>(null); // + 버튼용 상태 추가
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가
  const router = useRouter(); // ⬅️ 컴포넌트 내부에서 초기화
  // 2. 상세 모달을 위한 상태
  const [linkDetailDate, setLinkDetailDate] = useState<string | null>(null);
  const [targetLogId, setTargetLogId] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    type: "confirm", // 기본값은 버튼 2개
    action: null as (() => void) | null, // ⭐ 추가: 확인 버튼 클릭 시 실행할 함수를 담는 곳
  });

  const [isLinksExpanded, setIsLinksExpanded] = useState(false);
  const DISPLAY_LIMIT = 5; // 처음에 보여줄 링크 개수

  // --- 1. 실시간 데이터 구독 (Logs & Todos) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: logs } = await supabase.from("diary_logs").select("*");
      const { data: todos } = await supabase.from("todos").select("*");
      setDbLogs(logs || []);
      setDbTodos(todos || []);
    };

    fetchInitialData();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diary_logs" },
        (payload) => {
          if (payload.eventType === "INSERT")
            setDbLogs((prev) => [...prev, payload.new]);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          if (payload.eventType === "INSERT")
            setDbTodos((prev) => [...prev, payload.new]);
          if (payload.eventType === "UPDATE")
            setDbTodos((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t)),
            );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 최신 로그 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedDate, dbLogs]);

  // esc 모달 끄기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // 1. 알림 모달이 열려있다면 닫기
        if (alertConfig.isOpen) {
          setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        }
        // 2. 링크 상세 모달이 열려있다면 닫기
        else if (linkDetailDate) {
          setLinkDetailDate(null);
        }
        // 3. 채팅 모달이 열려있다면 닫기
        else if (selectedDate) {
          handleCloseChatModal(); // 이전에 만든 입력창 초기화 포함 핸들러
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 리스너 제거 (메모리 누수 방지)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alertConfig.isOpen, linkDetailDate, selectedDate]);
  // 💡 모달 상태들을 의존성 배열에 넣어 최신 상태를 참조하도록 합니다.

  // --- 달력 그리드 계산 (중요!) ---
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // --- 월 이동 핸들러 ---
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToday = () => setCurrentMonth(new Date());

  const handleSelectLogFromDetail = (dateKey: string, logId: string) => {
    setLinkDetailDate(null); // 상세 모달 닫기
    setTargetLogId(logId); // 포커싱할 ID 저장
    setSelectedDate(dateKey); // 챗모달 열기
  };

  const handleDateLinkClick = (targetDate: string) => {
    // targetDate 형식: '2026-01-20'
    const date = new Date(targetDate);

    // 유효한 날짜인지 확인 (Invalid Date 체크)
    if (isNaN(date.getTime())) {
      console.error("유효하지 않은 날짜 형식입니다.");
      return;
    }

    // 해당 월로 캘린더 이동 (필요 시)
    //setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));

    // 챗모달 열기
    setSelectedDate(targetDate);
    //setTargetLogId(null); // 링크 클릭 이동 시에는 하이라이트 초기화 (혹은 특정 로직)
  };

  // --- 모달을 닫는 통합 핸들러 ---
  const handleCloseChatModal = () => {
    setSelectedDate(null); // 모달 닫기
    setTargetLogId(null); // 하이라이트 초기화
    setInputText(""); // ⭐ 입력창 텍스트 초기화 (이 줄 추가!)
  };

  // --- 2. 로그 전송 핸들러 ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 빈 텍스트 체크 (로그인 여부와 상관없이 먼저 체크)
    if (!inputText.trim()) {
      setAlertConfig({
        isOpen: true,
        title: "Empty Message! ✍️",
        message: "메시지를 입력해주세요. 빈 기록은 저장할 수 없어요!",
        confirmText: "확인",
        action: null,
        cancelText: "",
        type: "alert", // 👈 버튼을 하나로 만듭니다.
      });
      return;
    }

    if (!selectedDate) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. 로그인하지 않은 경우
    if (!user) {
      setAlertConfig({
        isOpen: true,
        title: "Stop! 🛑",
        message:
          "기록을 저장하려면 로그인이 필요해요. 로그인 페이지로 이동할까요?",
        confirmText: "로그인하기",
        action: null, // AlertModal의 onConfirm 로직에서 title 체크로 리다이렉트 처리 중이므로 null
        cancelText: "취소",
        type: "confirm", // 👈 버튼을 하나로 만듭니다.
      });
      return;
    }

    // 3. 링크 날짜 추출 및 유효성 검사 (기존 로직 동일)
    const dateMatch = inputText.match(/#(\d{4}-\d{2}-\d{2})/);
    let linkedDate = null;

    if (dateMatch) {
      const potentialDate = dateMatch[1];
      const dateObj = new Date(potentialDate);

      if (isNaN(dateObj.getTime())) {
        setAlertConfig({
          isOpen: true,
          title: "Invalid Date! 🛑",
          message:
            "입력하신 날짜 형식이 올바르지 않아요. #yyyy-mm-dd 형식을 확인해주세요!",
          confirmText: "다시 확인하기",
          action: null,
          cancelText: "",
          type: "alert", // 👈 버튼을 하나로 만듭니다.
        });
        return;
      }
      linkedDate = potentialDate;
    }

    // 4. DB Insert
    const { error } = await supabase.from("diary_logs").insert([
      {
        date_key: selectedDate,
        content: inputText,
        linked_date: linkedDate,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      setAlertConfig({
        isOpen: true,
        title: "Error! 😵",
        message: "로그 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        confirmText: "닫기",
        action: null,
        cancelText: "",
        type: "alert", // 👈 버튼을 하나로 만듭니다.
      });
    } else {
      setInputText("");
      setTargetLogId(null);
    }
  };

  // 1. 로그 삭제 단계 분리
  const handleDeleteLog = (logId: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Log? 🗑️",
      message: "정말 이 기록을 지우시겠어요? 삭제된 내용은 복구할 수 없습니다!",
      confirmText: "네, 삭제할게요",
      // ⭐ 모달의 확인 버튼을 누르면 아래 함수가 실행됩니다.
      action: () => performDelete(logId),
      cancelText: "",
      type: "alert", // 👈 버튼을 하나로 만듭니다.
    });
  };

  // 2. 실제 DB 삭제를 수행하는 내부 함수
  const performDelete = async (logId: string) => {
    const { error } = await supabase
      .from("diary_logs")
      .delete()
      .eq("id", logId);

    if (error) {
      // 실패 시 다시 에러 모달 표시
      setAlertConfig({
        isOpen: true,
        title: "Error! 😵",
        message: "삭제에 실패했습니다. 다시 시도해주세요.",
        confirmText: "닫기",
        action: null,
        cancelText: "",
        type: "alert", // 👈 버튼을 하나로 만듭니다.
      });
    } else {
      setDbLogs((prev) => prev.filter((log) => log.id !== logId));
      // 성공 시 모달 닫기 (action에서 처리하므로 여기서 추가 작업 불필요)
    }
  };

  // 2. 로그 수정 핸들러
  const handleUpdateLog = async (logId: string, newContent: string) => {
    const { error } = await supabase
      .from("diary_logs")
      .update({ content: newContent })
      .eq("id", logId);

    if (error) alert("수정에 실패했습니다.");
    else {
      setDbLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? { ...log, content: newContent } : log,
        ),
      );
    }
  };

  // 1. 할 일 체크 토글 핸들러
  const handleToggleTodo = async (todoId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_completed: !currentStatus })
      .eq("id", todoId);

    if (error) {
      alert("상태 업데이트에 실패했습니다.");
    } else {
      // 실시간 구독이 있지만, 즉각적인 UX를 위해 로컬 상태도 업데이트
      setDbTodos((prev) =>
        prev.map((t) =>
          t.id === todoId ? { ...t, is_completed: !currentStatus } : t,
        ),
      );
    }
  };

  // 2. 할 일 삭제 핸들러
  const handleDeleteTodo = async (todoId: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", todoId);

    if (error) {
      alert("삭제에 실패했습니다.");
    } else {
      setDbTodos((prev) => prev.filter((t) => t.id !== todoId));
    }
  };

  // --- 3. UI 헬퍼 함수 ---
  const getLinkedLogsForTop = () => dbLogs.filter((log) => log.linked_date);
  const getDayLogs = (date: string) =>
    dbLogs.filter((log) => log.date_key === date);
  const getDayTodos = (date: string) =>
    dbTodos.filter((todo) => todo.date_key === date);

  // --- 검색 로직 ---
  // 검색어가 포함된 로그를 가진 날짜들을 추출합니다. (현재 월 한정)
  const searchedDateKeys = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return dbLogs
      .filter((log) => {
        // 1. 검색어 포함 여부 (대소문자 무시)
        const matchesQuery = log.content
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // 2. 현재 캘린더에 표시된 월과 일치하는지 확인
        const logDate = new Date(log.date_key);
        const isSameMonthAsCurrent = isSameMonth(logDate, currentMonth);

        return matchesQuery && isSameMonthAsCurrent;
      })
      .map((log) => log.date_key);
  }, [searchQuery, dbLogs, currentMonth]); // ⭐ currentMonth를 의존성에 추가하여 달 변경 시 재계산

  // --- 1. 현재 선택된 월의 링크된 로그만 필터링 ---
  const currentMonthLinks = useMemo(() => {
    return dbLogs.filter((log) => {
      // 1. 링크가 있는지 확인
      if (!log.linked_date) return false;

      // 2. 로그의 날짜(date_key)가 현재 보고 있는 월(currentMonth)과 같은지 확인
      // log.date_key는 '2026-01-01' 형식의 문자열이므로 Date 객체로 변환하여 비교합니다.
      const logDate = new Date(log.date_key);
      return isSameMonth(logDate, currentMonth);
    });
  }, [dbLogs, currentMonth]); // dbLogs가 갱신되거나 월이 바뀔 때 재계산

  // 1. 중복 제거된 링크 날짜들 계산
  const uniqueLinkDates = useMemo(() => {
    const dates = currentMonthLinks.map((log) => log.date_key);
    return Array.from(new Set(dates)).sort(); // 오름차순 정렬
  }, [currentMonthLinks]);

  return (
    <div className="min-h-screen bg-[#FFFBF5] p-4 md:p-8 font-sans text-black pt-24">
      {/* 1. 상단: 링크 및 검색 영역 */}
      <section className="max-w-7xl mx-auto mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 바 (NEW!) */}
          <div className="flex-1 bg-white border-4 border-black rounded-2xl p-2 shadow-cartoon-sm flex items-center gap-3 px-4 focus-within:ring-4 ring-yellow-400/20 transition-all">
            <Search className="w-5 h-5 text-slate-400" strokeWidth={3} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="과거의 기록이나 #태그를 검색해보세요..."
              className="flex-1 bg-transparent border-none font-bold text-sm focus:outline-none placeholder:text-slate-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* 기존 링크된 로그 영역 (가로 너비 조정) */}
          <div className="md:w-1/2 bg-white border-4 border-black rounded-2xl p-2 shadow-cartoon-sm flex items-center gap-3 px-4 min-h-[60px] transition-all duration-300">
            <div className="flex items-center gap-2 bg-yellow-300 border-2 border-black px-3 py-1 rounded-lg font-black text-[10px] shrink-0 uppercase shadow-cartoon-sm">
              <Link2 className="w-3 h-3" /> Links
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {uniqueLinkDates.length > 0 ? (
                <>
                  {/* 현재 상태에 따라 전체를 보여주거나 제한된 수만 보여줌 */}
                  {(isLinksExpanded
                    ? uniqueLinkDates
                    : uniqueLinkDates.slice(0, DISPLAY_LIMIT)
                  ).map((dateKey) => (
                    <button
                      key={dateKey}
                      onClick={() => setLinkDetailDate(dateKey)}
                      className="px-3 py-1 border-2 border-black rounded-full font-bold text-[10px] bg-white hover:bg-yellow-200 transition-all shadow-sm hover:-translate-y-0.5"
                    >
                      #{format(new Date(dateKey), "MM/dd")}
                    </button>
                  ))}

                  {/* 링크 개수가 제한보다 많을 때만 버튼 표시 */}
                  {uniqueLinkDates.length > DISPLAY_LIMIT && (
                    <button
                      onClick={() => setIsLinksExpanded(!isLinksExpanded)}
                      className={cn(
                        "px-2 py-1 border-2 border-dashed border-black rounded-lg font-black text-[10px] transition-all flex items-center gap-1",
                        isLinksExpanded
                          ? "bg-rose-100 text-rose-600"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {isLinksExpanded ? (
                        <>
                          접기 <ChevronUp size={12} />
                        </>
                      ) : (
                        <>
                          +{uniqueLinkDates.length - DISPLAY_LIMIT} 더보기{" "}
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-slate-300 italic px-2">
                  이 달에 링크된 로그가 없습니다.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 검색 결과 안내 (검색 중일 때만 표시) */}
        {searchQuery && (
          <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-left-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <p className="text-xs font-black italic text-slate-500">
              "{searchQuery}" 검색 결과:{" "}
              <span className="text-black">{searchedDateKeys.length}개</span>의
              날짜에서 발견됨
            </p>
          </div>
        )}
      </section>

      {/* 2. 중앙: 캘린더 메인 영역 */}
      <section className="max-w-7xl mx-auto bg-white border-4 border-black rounded-[40px] shadow-cartoon p-6 md:p-10">
        {/* 달력 헤더 */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={goToday}
              className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black hover:bg-rose-500 transition-colors"
            >
              TODAY
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={prevMonth}
              variant="outline"
              className="border-4 border-black font-black shadow-cartoon-sm hover:translate-y-0.5 active:shadow-none transition-all"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={3} />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              className="border-4 border-black font-black shadow-cartoon-sm hover:translate-y-0.5 active:shadow-none transition-all"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={3} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div
              key={day}
              className="text-center font-black text-slate-400 text-xs mb-2"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((date, i) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, new Date());
            // ⭐ 여기서 변수를 정의합니다!
            // 검색어가 있고, 현재 날짜가 검색 결과 목록에 들어있는지 확인
            const isSearchResult =
              searchQuery.trim() !== "" && searchedDateKeys.includes(dateKey);

            const hasLink = dbLogs.some(
              (log) => log.date_key === dateKey && log.linked_date,
            );

            const hasLog = dbLogs.some((log) => log.date_key === dateKey);

            const dayTodos = dbTodos.filter((t) => t.date_key === dateKey);

            return (
              <div
                key={dateKey}
                onClick={() => isCurrentMonth && setSelectedDate(dateKey)}
                className={cn(
                  "min-h-[140px] border-2 border-black rounded-2xl p-3 transition-all relative group shadow-cartoon-sm", // 검색 결과일 때 하이라이트 효과 (노란색 배경)
                  !isCurrentMonth
                    ? "bg-slate-50 opacity-20 cursor-default"
                    : "bg-white cursor-pointer hover:bg-slate-50 hover:-translate-y-1",
                  isCurrentMonth && hasLink
                    ? "animate-link-glow border-blue-600 bg-blue-50/30"
                    : "",
                  searchQuery && isSearchResult
                    ? "bg-yellow-50 border-yellow-500 ring-4 ring-yellow-400/20 z-10 scale-105 shadow-lg"
                    : "bg-white",
                  // 검색 중인데 결과가 아닐 때 투명도 조절
                  searchQuery && !isSearchResult
                    ? "opacity-30 scale-95 border-dashed"
                    : "opacity-100",
                  // 일반적인 링크 반짝임
                  !searchQuery && hasLink
                    ? "animate-link-glow border-blue-600 bg-blue-50/30"
                    : "",
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={cn(
                      "w-8 h-8 flex items-center justify-center font-black rounded-lg border-2 border-black",
                      isToday
                        ? "animate-link-glow-red"
                        : "bg-white shadow-cartoon-sm",
                      isSearchResult
                        ? "bg-yellow-400"
                        : hasLog
                          ? "bg-rose-500 text-white"
                          : "bg-white",
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {isCurrentMonth && hasLink && (
                    <Link2 className="w-4 h-4 text-blue-600" strokeWidth={3} />
                  )}
                </div>

                {/* 검색어가 포함된 미리보기 텍스트 표시 (NEW!) */}
                {searchQuery && isSearchResult && (
                  <div className="mt-2 p-1 bg-white border border-yellow-200 rounded text-[9px] font-bold italic truncate text-yellow-700">
                    "...
                    {
                      dbLogs.find(
                        (l) =>
                          l.date_key === dateKey &&
                          l.content.includes(searchQuery),
                      )?.content
                    }
                    ..."
                  </div>
                )}

                {/* 할 일 목록 프리뷰 (실제 데이터) */}
                <div className="space-y-1 mt-1">
                  {isCurrentMonth &&
                    dayTodos.slice(0, 3).map((todo) => (
                      <div
                        key={todo.id}
                        className={cn(
                          "flex items-center gap-1 text-[10px] font-bold truncate",
                          todo.is_completed
                            ? "text-slate-300 line-through"
                            : "text-slate-600",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            todo.is_completed ? "bg-slate-300" : "bg-green-500",
                          )}
                        />
                        <span
                          className={todo.is_completed ? "line-through" : ""}
                        >
                          {todo.content}
                        </span>
                      </div>
                    ))}
                </div>
                {/* 3. [+] 할 일 추가 버튼 */}
                {isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 부모 div의 클릭 이벤트(모달 열기) 방지
                      setTodoAddDate(dateKey);
                    }}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-1 rounded-md"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}

                {/* 4. 할 일 추가 팝업 (해당 날짜일 때만 표시) */}
                {todoAddDate === dateKey && (
                  <TodoAddModal
                    dateKey={dateKey}
                    onClose={() => setTodoAddDate(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {linkDetailDate && (
        <LinkDetailModal
          dateKey={linkDetailDate}
          logs={dbLogs}
          onClose={() => setLinkDetailDate(null)}
          onSelectLog={handleSelectLogFromDetail}
        />
      )}

      {/* 3. 로그 입력 모달 (Chat UI) */}
      {selectedDate && (
        <DiaryChatModal
          dateKey={selectedDate}
          logs={dbLogs}
          inputText={inputText}
          onInputChange={setInputText}
          onSend={handleSend}
          onClose={handleCloseChatModal}
          onDateLinkClick={handleDateLinkClick}
          onDelete={handleDeleteLog}
          onUpdate={handleUpdateLog}
          todos={dbTodos.filter((t) => t.date_key === selectedDate)} // 해당 날짜 할 일만 전달
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          highlightLogId={targetLogId} // 포커싱할 ID 전달
        />
      )}

      {/* 커스텀 알림 모달 */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          // 1. 등록된 액션이 있으면 실행 (여기서 삭제 로직이 작동!)
          if (alertConfig.action) {
            alertConfig.action();
          }

          // 2. 기존 로그인 리다이렉트 로직 유지
          if (alertConfig.title.includes("Stop")) {
            router.push("/login");
          }

          // 3. 모달 닫기
          setAlertConfig((prev) => ({ ...prev, isOpen: false }));
        }}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        type={alertConfig.type}
        cancelText={alertConfig.cancelText}
      />
    </div>
  );
}
