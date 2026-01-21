import Header from "@/components/shared/Header";
import DiaryFeatureSlider from "@/components/shared/DiaryFeatureSlider";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF5] relative flex flex-col overflow-hidden">
      <RetroGrid />
      <Header />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-8 py-12 md:py-20 flex flex-col items-center">
        {/* 헤드라인 섹션 */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter">
            캘린더와 <span className="text-rose-500 italic">링크</span>
          </h1>
          <p className="text-xl font-bold text-slate-500">
            채팅으로 남기는 일상과 날짜를 잇는 지능형 다이어리
          </p>
        </div>

        {/* 핵심 기능 슬라이더 섹션 */}
        <div className="w-full max-w-[900px]">
          <DiaryFeatureSlider />
        </div>

        <Link href={"/diary"}>
          <Button className="mt-16 h-16 px-12 rounded-2xl bg-black text-white text-xl font-black shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            시작하기 <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </Link>
      </main>
    </div>
  );
}
