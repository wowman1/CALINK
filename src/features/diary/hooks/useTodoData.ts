import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function useTodoData(dateKey?: string) {
  const [todos, setTodos] = useState<any[]>([]);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchTodos = async () => {
      let query = supabase.from("todos").select("*");
      if (dateKey) query = query.eq("date_key", dateKey);

      const { data } = await query.order("created_at", { ascending: true });
      setTodos(data || []);
    };

    fetchTodos();

    // 실시간 구독
    const channel = supabase
      .channel("realtime-todos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTodos((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setTodos((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTodos((prev) => prev.filter((t) => t.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateKey, supabase]);

  const addTodo = async (content: string, targetDate: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("todos")
      .insert([{ content, date_key: targetDate, user_id: user.id }]);
  };

  const toggleTodo = async (id: string, isCompleted: boolean) => {
    await supabase
      .from("todos")
      .update({ is_completed: !isCompleted })
      .eq("id", id);
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
