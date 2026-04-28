"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(undefined);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auth
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🚨 Redirect
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  // Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsgs: Message[] = [
  ...messages,
  { role: "user", content: input },
];

    setMessages([
  ...newMsgs,
  { role: "assistant", content: "..." } as Message,
]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: newMsgs }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let text = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      text += decoder.decode(value);

      setMessages((prev) => {
        const base = prev.slice(0, -1);
        return [...base, { role: "assistant", content: text }];
      });
    }
  };

  if (user === undefined) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 flex gap-2">
        <input
          className="flex-1 p-2 bg-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}