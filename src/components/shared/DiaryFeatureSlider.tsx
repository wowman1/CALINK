"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Link2,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  Plus,
} from "lucide-react";

export default function DiaryFeatureSlider() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="relative w-full">
      {/* 슬라이드 네비게이션 버튼 */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={() => setCurrentStep(1)}
          className={`p-3 rounded-full border-4 border-black transition-all ${
            currentStep === 1
              ? "bg-slate-200"
              : "bg-white shadow-cartoon hover:bg-slate-50"
          }`}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-6 h-6 font-black" />
        </button>
      </div>
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={() => setCurrentStep(2)}
          className={`p-3 rounded-full border-4 border-black transition-all ${
            currentStep === 2
              ? "bg-slate-200"
              : "bg-white shadow-cartoon hover:bg-slate-50"
          }`}
          disabled={currentStep === 2}
        >
          <ChevronRight className="w-6 h-6 font-black" />
        </button>
      </div>

      <div className="relative min-h-[500px] w-full bg-white border-4 border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            /* 프레임 1: 채팅방 로그 입력 UI */
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative p-8 flex flex-col h-[520px] bg-white rounded-[40px]"
            >
              {/* 1. 배경이 되는 캘린더 레이어 */}
              <div className="absolute inset-x-8 top-8 bottom-24 opacity-20 pointer-events-none">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-black text-2xl italic">
                    JANUARY 2026
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 border-2 border-black rounded-xl bg-slate-50"
                    />
                  ))}
                </div>
              </div>

              {/* 2. 클릭 상호작용 시뮬레이션 (마우스 커서) */}
              <motion.div
                initial={{ x: 100, y: 100 }}
                animate={{ x: -120, y: -40 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute z-30 pointer-events-none text-rose-500"
              >
                <MousePointer2
                  className="w-10 h-10 fill-current"
                  strokeWidth={3}
                />
              </motion.div>

              {/* 3. 날짜 클릭으로 활성화된 "채팅 로그 모달" */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-20 m-auto w-full max-w-[340px] bg-white border-4 border-black rounded-[32px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
              >
                {/* 모달 헤더: 클릭된 날짜 표시 */}
                <div className="bg-rose-500 p-4 border-b-4 border-black flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-black text-sm uppercase">
                      Jan 14, 2026 (Wed)
                    </span>
                  </div>
                  <div className="w-6 h-6 bg-white rounded-full border-2 border-black flex items-center justify-center">
                    <Plus
                      className="w-4 h-4 text-black rotate-45"
                      strokeWidth={4}
                    />
                  </div>
                </div>

                {/* 모달 내부: 채팅형 타임로그 */}
                <div className="p-5 space-y-4 h-[240px] overflow-y-auto bg-[#FFFDFB]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400">
                      <Clock className="w-3 h-3" /> 09:30 AM
                    </div>
                    <div className="bg-slate-100 border-2 border-black p-3 rounded-2xl rounded-tl-none font-bold text-[11px] leading-snug">
                      캘린더의 오늘 날짜를 클릭했어! <br />
                      이제 여기에 채팅하듯 일기를 써볼까? ✍️
                    </div>
                  </div>

                  <div className="space-y-1 ml-auto w-[85%]">
                    <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-slate-400">
                      10:15 AM <Clock className="w-3 h-3" />
                    </div>
                    <div className="bg-yellow-300 border-2 border-black p-3 rounded-2xl rounded-tr-none font-bold text-[11px] shadow-cartoon-sm leading-snug">
                      시간이 자동으로 찍히니까 편리하네. <br />
                      나중에 다른 날짜와 연결도 해봐야지! 🔗
                    </div>
                  </div>
                </div>

                {/* 모달 하단: 입력바 */}
                <div className="p-4 bg-white border-t-4 border-black">
                  <div className="flex items-center gap-3 bg-slate-50 border-2 border-black rounded-xl px-3 py-2">
                    <div className="flex-1 text-[10px] text-slate-400 font-bold italic">
                      오늘의 로그를 남기세요...
                    </div>
                    <Send className="w-4 h-4 text-black" strokeWidth={3} />
                  </div>
                </div>
              </motion.div>

              {/* 4. 프레임 캡션 */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-8">
                <p className="text-sm font-black text-slate-800 bg-white border-2 border-black inline-block px-4 py-1 rounded-full shadow-cartoon-sm">
                  STEP 01: 날짜를 클릭하고 로그를 시작하세요
                </p>
              </div>
            </motion.div>
          ) : (
            /* 프레임 2: 날짜 링크 시스템 UI */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="p-10 flex flex-col h-[500px]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black italic flex items-center gap-2">
                  <Link2 className="text-blue-600" /> LINKED TIMELINE
                </h3>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-blue-100 border-2 border-black rounded-full text-[10px] font-black">
                    #PROJECT
                  </div>
                  <div className="px-3 py-1 bg-rose-100 border-2 border-black rounded-full text-[10px] font-black">
                    #MEMORY
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-8">
                {Array.from({ length: 21 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-12 border-2 border-black rounded-xl flex items-center justify-center font-black transition-all
                    ${
                      i === 0
                        ? "bg-blue-400 text-white scale-110 shadow-cartoon-sm ring-4 ring-blue-100"
                        : "bg-white"
                    }
                    ${i === 13 ? "bg-yellow-300 shadow-cartoon-sm" : ""}
                    ${i > 13 ? "opacity-30" : ""}
                  `}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border-4 border-black p-6 rounded-[32px] relative overflow-hidden group cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="absolute right-4 top-4 opacity-10">
                  <Link2 className="w-20 h-20" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 font-black text-blue-600 text-xs">
                    <span className="w-2 h-2 bg-blue-600 rounded-full" /> JAN 01
                    - JAN 14 연결됨
                  </div>
                  <p className="font-bold text-slate-700 leading-tight">
                    "1월 1일에 세운 계획대로 잘 가고 있는 것 같아!" <br />
                    <span className="text-blue-600 underline">
                      로그 보러가기 →
                    </span>
                  </p>
                </div>
              </div>

              <p className="mt-auto text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                태그된 날짜를 클릭하면 해당 다이어리로 즉시 이동합니다
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex justify-center gap-3 mt-8">
        <div
          className={`w-3 h-3 rounded-full border-2 border-black ${
            currentStep === 1 ? "bg-black" : "bg-white"
          }`}
        />
        <div
          className={`w-3 h-3 rounded-full border-2 border-black ${
            currentStep === 2 ? "bg-black" : "bg-white"
          }`}
        />
      </div>
    </div>
  );
}
