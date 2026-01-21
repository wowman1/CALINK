// src/app/board/page.tsx (또는 features 내부에서 export)
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HelpCircle,
  Search,
  PenLine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import PostItem from "@/features/board/components/PostItem";
import WritePostModal from "@/features/board/components/WritePostModal";
import PostDetailModal from "@/features/board/components/PostDetailModal";
import AlertModal from "@/components/shared/AlertModal";
import { useRouter } from "next/navigation";

const BOARD_CATEGORIES = [
  "전체",
  "이용문의",
  "오류제보",
  "건의사항",
  "나의 작성글",
];

const ITEMS_PER_PAGE = 5; // 한 페이지에 보여줄 게시글 수

export default function BoardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // 전체 게시글 수 저장
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const [editData, setEditData] = useState<any>(null); // 수정할 데이터를 담을 상태
  const router = useRouter();
  // ⭐ 알림 모달 상태 추가
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    type: "confirm", // 기본값은 버튼 2개
    action: null as (() => void) | null,
  });

  // 초기 로드 시 유저 정보 가져오기
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const updatePostStatus = (postId: string, newStatus: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: newStatus } : post,
      ),
    );
    // 만약 현재 열려있는 상세 모달의 데이터도 갱신해야 한다면:
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev: any) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  // 🟢 1. 데이터 불러오기 (Fetch)
  // src/features/board/BoardPage.tsx

  const fetchPosts = async () => {
    setLoading(true);

    // 1. 기본 쿼리 시작
    let query = supabase.from("board_posts").select("*", { count: "exact" });

    // 2. 카테고리 필터 적용
    if (selectedCategory === "나의 작성글") {
      // 로그인한 유저의 ID가 있을 때만 필터링
      if (currentUser?.id) {
        query = query.eq("author_id", currentUser.id);
      } else {
        // 비로그인이면 빈 결과 반환
        setPosts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    } else if (selectedCategory !== "전체") {
      query = query.eq("category", selectedCategory);
    }

    // 3. 검색어 필터 적용 (제목에 검색어가 포함된 경우)
    if (searchQuery.trim()) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    // 4. 페이징 및 정렬 적용
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setPosts(data);
      setTotalCount(count || 0);
    } else if (error) {
      console.error("에러 코드:", error.code);
      console.error("에러 메시지:", error.message);
      console.error("에러 상세:", error.details);
    }

    setLoading(false);
  };

  // 검색어 입력 시 약간의 지연(Debounce)을 주면 서버 부하를 줄일 수 있지만,
  // 일단은 검색어 변경 시마다 호출되도록 설정합니다.
  useEffect(() => {
    // 카테고리나 검색어가 바뀌면 무조건 1페이지부터 다시 검색
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory, searchQuery, currentUser]);

  // 🔵 2. 데이터 저장하기 (Insert)
  const handleFormSubmit = async (formData: any) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAlertConfig({
        isOpen: true,
        title: "Stop! 🛑",
        message:
          "문의를 위해서는 로그인이 필요해요. 로그인 페이지로 이동할까요?",
        confirmText: "로그인하기",
        action: null, // AlertModal의 onConfirm 로직에서 title 체크로 리다이렉트 처리 중이므로 null
        type: "confirm",
        cancelText: "다음에 할래요",
      });
      return;
    }

    if (formData.id) {
      // 🔵 수정(Update) 로직
      const { error } = await supabase
        .from("board_posts")
        .update({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          is_secret: formData.isSecret,
        })
        .eq("id", formData.id);

      if (!error) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === formData.id
              ? { ...p, ...formData, is_secret: formData.isSecret }
              : p,
          ),
        );
        setAlertConfig({
          isOpen: true,
          title: "Success!",
          message: "글이 수정되었습니다.",
          confirmText: "확인",
          action: null,
          type: "alert",
          cancelText: "",
        });
      }
    } else {
      // 🟢 생성(Insert) 로직 (기존 handlePostSubmit 내용)
      // ... supabase.from("board_posts").insert([...]) ...
      const { error } = await supabase.from("board_posts").insert([
        {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          is_secret: formData.isSecret,
          author_id: user.id,
          author_name: user.user_metadata?.name || "익명", // 유저 메타데이터 활용
        },
      ]);
    }
    setEditData(null); // 수정 상태 초기화
    setIsWriteModalOpen(false);
    fetchPosts(); // 리스트 새로고침
  };

  // 🟡 3. 필터링 로직 (기존과 동일하되 posts 상태 사용)
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. 카테고리 필터링
      const matchesCategory =
        selectedCategory === "전체" ||
        (selectedCategory === "나의 작성글"
          ? post.author_id === currentUser?.id // 내 글인지 확인
          : post.category === selectedCategory); // 일반 카테고리 확인

      // 2. 검색어 필터링
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery, currentUser]);

  // 🔒 게시글 클릭 시 권한 체크 핸들러
  const handlePostClick = (post: any) => {
    if (post.is_secret) {
      const isOwner = currentUser && currentUser.id === post.author_id;
      const isAdmin =
        currentUser && currentUser.user_metadata?.role === "admin";

      if (!isOwner && !isAdmin) {
        // 권한이 없으면 AlertModal 띄우기
        setAlertConfig({
          isOpen: true,
          title: "Access Denied! 🔒",
          message: "비밀글입니다. 작성자만 확인하실 수 있어요!",
          confirmText: "확인",
          action: null,
          type: "alert",
          cancelText: "",
        });
        return;
      }
    }

    // 상세 정보 세팅 및 모달 열기
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  // 1. 실제 DB 삭제를 수행하는 함수
  const performPostDelete = async (postId: string) => {
    const { error } = await supabase
      .from("board_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      setAlertConfig({
        isOpen: true,
        title: "Error! 😵",
        message: "게시글 삭제에 실패했습니다. 다시 시도해 주세요.",
        confirmText: "닫기",
        action: null,
        type: "alert",
        cancelText: "",
      });
    } else {
      // 삭제 성공 시: 목록 새로고침 및 모달 닫기
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setIsDetailModalOpen(false); // 상세 모달이 열려있다면 닫기
    }
  };

  // 2. 삭제 확인 모달을 띄우는 핸들러
  const handleRequestDelete = (postId: string) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Post? 🗑️",
      message:
        "작성하신 문의글을 삭제하시겠습니까? 삭제된 글은 복구할 수 없습니다.",
      confirmText: "삭제하기",
      action: () => performPostDelete(postId), // 확인 버튼 클릭 시 실제 삭제 함수 호출
      type: "confirm",
      cancelText: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] p-6 md:p-12 font-sans text-black">
      <div className="max-w-5xl mx-auto">
        {/* 1. 헤더 섹션 */}
        <section className="mb-12 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500 text-white border-2 border-black px-4 py-1.5 rounded-xl font-black shadow-cartoon-sm">
            <HelpCircle className="w-5 h-5" /> 궁금한 점이 있으신가요?
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">
            Q&A Board
          </h1>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">
            기록과 연결에 대한 모든 궁금증을 남겨주세요. <br />
            다이어리 요정이 정성껏 답변해 드립니다!
          </p>
        </section>

        {/* 2. 필터 및 검색바 */}
        <section className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
          {/* 부모 컨테이너: px-4 또는 px-6을 주어 좌우 여백 확보 */}
          <div className="flex gap-3 overflow-x-auto pt-4 pb-6 px-4 w-full md:w-auto custom-scrollbar overflow-y-hidden -mx-4">
            {BOARD_CATEGORIES.map((cat) => {
              const isMyPosts = cat === "나의 작성글" || cat === "내가 쓴 문의";
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl border-2 border-black font-black transition-all whitespace-nowrap mb-1 relative group",
                    // 1. 일반 버튼 스타일
                    !isMyPosts &&
                      (isSelected
                        ? "bg-yellow-400 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0"),
                    // 2. '나의 작성글' 전용 특별 스타일
                    isMyPosts &&
                      (isSelected
                        ? "bg-rose-500 text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-black"
                        : "bg-rose-50 text-rose-600 border-rose-400 shadow-[2px_2px_0px_0px_rgba(244,63,94,0.4)] hover:bg-rose-100"),
                  )}
                >
                  {/* '나의 작성글'일 때 앞에 작은 아이콘(별 등) 추가 가능 */}
                  {isMyPosts && <span className="mr-1">✨</span>}
                  {cat}

                  {/* 마지막 아이템 오른쪽 잘림 방지를 위한 가상 요소 (선택사항) */}
                  <div className="absolute -right-4 w-4 h-full invisible" />
                </button>
              );
            })}
            {/* 마지막 여백을 강제로 만들어주는 투명 요소 */}
            <div className="flex-shrink-0 w-4" />
          </div>

          <div className="relative w-full md:w-[300px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목으로 검색..."
              className="w-full bg-white border-4 border-black rounded-2xl px-5 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              strokeWidth={3}
            />
          </div>
        </section>

        {/* 게시글 리스트 */}
        <section className="space-y-4 mb-24">
          {loading ? (
            <p className="text-center py-20 font-bold text-slate-400 italic">
              데이터를 불러오는 중...
            </p>
          ) : (
            <>
              {/* 상황 1: '내가 쓴 문의'인데 로그인이 안 된 경우 */}
              {selectedCategory === "나의 작성글" && !currentUser ? (
                <div className="py-20 text-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-[32px]">
                  <p className="text-slate-400 font-bold italic">
                    로그인 후 내가 작성한 문의를 확인해 보세요! 🔒
                  </p>
                </div>
              ) : posts.length > 0 ? (
                /* 상황 2: 필터링된 게시글이 있는 경우 */
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className="cursor-pointer"
                  >
                    <PostItem post={post} />
                  </div>
                ))
              ) : (
                /* 상황 3: 게시글이 하나도 없는 경우 */
                <div className="py-20 text-center bg-white border-4 border-dashed border-slate-200 rounded-[32px]">
                  <p className="text-slate-400 font-bold italic">
                    {selectedCategory === "나의 작성글"
                      ? "아직 작성하신 문의가 없어요. ✨"
                      : "게시글이 없습니다."}
                  </p>
                </div>
              )}
            </>
          )}

          {/* 페이지네이션 버튼 영역 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 mb-20">
              {/* 이전 페이지 */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 border-2 border-black rounded-xl bg-white disabled:opacity-30 shadow-cartoon-sm active:shadow-none transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              {/* 숫자 버튼 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10 h-10 border-2 border-black rounded-xl font-black transition-all shadow-cartoon-sm active:shadow-none",
                      currentPage === pageNum
                        ? "bg-yellow-400 -translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-slate-50",
                    )}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              {/* 다음 페이지 */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 border-2 border-black rounded-xl bg-white disabled:opacity-30 shadow-cartoon-sm active:shadow-none transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </section>

        {/* 플로팅 글쓰기 버튼 */}
        <div className="fixed bottom-10 right-10 z-50">
          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="flex items-center gap-3 bg-rose-500 text-white px-8 py-5 rounded-[24px] border-4 border-black font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
          >
            <PenLine className="w-6 h-6" /> 문의하기
          </button>
        </div>

        {/* 글쓰기 모달 추가 */}
        <WritePostModal
          isOpen={isWriteModalOpen}
          onClose={() => {
            setIsWriteModalOpen(false);
            setEditData(null);
          }}
          onSubmit={handleFormSubmit}
          categories={BOARD_CATEGORIES}
          initialData={editData} // 👈 이 값이 있으면 수정 모드로 작동
        />

        <PostDetailModal
          post={selectedPost}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          currentUser={currentUser}
          onDelete={handleRequestDelete}
          onEdit={(post) => {
            setEditData(post); // 기존 데이터를 세팅하고
            setIsDetailModalOpen(false); // 👈 상세 모달을 닫고
            setIsWriteModalOpen(true); // 모달을 엽니다 (WritePostModal 재사용)
          }}
          onStatusUpdate={updatePostStatus} // 👈 이 프롭스를 추가합니다.
        />

        {/* ⭐ 공통 알림 모달 연동 */}
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
    </div>
  );
}
