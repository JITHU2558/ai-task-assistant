"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [chats, setChats] = useState<any[]>([
    { id: 1, title: "New Chat", messages: [] },
  ]);
  const [activeChat, setActiveChat] = useState(0);
  const [input, setInput] = useState("");
  const [memory, setMemory] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // LOAD
  useEffect(() => {
    const savedMemory = localStorage.getItem("bnutt_memory");
    if (savedMemory) setMemory(JSON.parse(savedMemory));

    const savedChats = localStorage.getItem("bnutt_chats");
    if (savedChats) setChats(JSON.parse(savedChats));
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("bnutt_memory", JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem("bnutt_chats", JSON.stringify(chats));
  }, [chats]);

  // SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // 🧠 MEMORY PARSER
  const updateMemory = (text: string) => {
    const lower = text.toLowerCase();
    const newMemory = { ...memory };

    if (lower.includes("my name is") || lower.includes("i am") || lower.includes("i'm")) {
      const name = text.replace(/my name is|i am|i'm/gi, "").trim().split(" ")[0];
      if (name) newMemory.name = name;
    }

    if (lower.includes("favorite color")) {
      const color = text.split("is")[1]?.trim();
      if (color) newMemory.color = color;
    }

    setMemory(newMemory);
    return newMemory;
  };

  // 🔁 SHARED STREAM FUNCTION
  const streamResponse = async (messages: any[], chatIndex: number) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    let currentText = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      const chunk = decoder.decode(value || new Uint8Array());
      currentText += chunk;

      setChats((prev) => {
        const updated = [...prev];
        const chat = updated[chatIndex];
        if (!chat) return prev;

        const base = chat.messages.slice(0, -1);

        updated[chatIndex] = {
          ...chat,
          messages: [...base, { role: "assistant", content: currentText }],
        };

        return updated;
      });
    }

    setLoading(false);
  };

  // 🚀 SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);

    const chatIndex = activeChat;

    let updatedMemory = updateMemory(input);

    setChats((prev) => {
      const updated = [...prev];
      const chat = updated[chatIndex];
      if (!chat) return prev;

      const newMessages = [...chat.messages, { role: "user", content: input }];

      updated[chatIndex] = {
        ...chat,
        title: chat.title === "New Chat" ? input.slice(0, 20) : chat.title,
        messages: [...newMessages, { role: "assistant", content: "Thinking..." }],
      };

      return updated;
    });

    setInput("");

    const currentMessages = [
      {
        role: "system",
        content: `
You are BNutt, created by Jithu.

User Info:
Name: ${updatedMemory.name || "Unknown"}
Favorite Color: ${updatedMemory.color || "Unknown"}

Rules:
- Never say ChatGPT
- Be helpful and concise
`,
      },
      ...chats[chatIndex].messages,
      { role: "user", content: input },
    ];

    await streamResponse(currentMessages, chatIndex);
  };

  // 🔁 REGENERATE
  const regenerateResponse = async () => {
    if (loading) return;

    setLoading(true);

    const chatIndex = activeChat;

    const chat = chats[chatIndex];
    if (!chat) return;

    const messages = [...chat.messages];

    if (messages[messages.length - 1]?.role === "assistant") {
      messages.pop();
    }

    setChats((prev) => {
      const updated = [...prev];
      updated[chatIndex] = {
        ...chat,
        messages: [...messages, { role: "assistant", content: "Thinking..." }],
      };
      return updated;
    });

    const apiMessages = [
      {
        role: "system",
        content: `
You are BNutt, created by Jithi.
Be helpful and concise.
`,
      },
      ...messages,
    ];

    await streamResponse(apiMessages, chatIndex);
  };

  const createNewChat = () => {
    setChats((prev) => [
      ...prev,
      { id: Date.now(), title: "New Chat", messages: [] },
    ]);
    setActiveChat(chats.length);
  };

  const clearChats = () => {
    setChats([{ id: 1, title: "New Chat", messages: [] }]);
    setActiveChat(0);
    localStorage.removeItem("bnutt_chats");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-screen bg-[#0b1220] text-white">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f172a] p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4">BNutt AI</h1>

        <button onClick={createNewChat} className="bg-blue-600 p-2 rounded mb-2">
          + New Chat
        </button>

        <button onClick={clearChats} className="bg-red-600 p-2 rounded mb-4">
          Clear Chats
        </button>

        {chats.map((chat, i) => (
          <div
            key={chat.id}
            onClick={() => setActiveChat(i)}
            className={`p-2 rounded cursor-pointer ${
              i === activeChat ? "bg-blue-600" : "bg-gray-800"
            }`}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chats[activeChat]?.messages?.map((m: any, i: number) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="relative max-w-[70%] p-3 rounded-xl text-sm bg-gray-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>

                {m.role === "assistant" && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => copyToClipboard(m.content)}>📋</button>

                    {i === chats[activeChat].messages.length - 1 && (
                      <button onClick={regenerateResponse}>🔁</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 flex gap-2">
          <input
            disabled={loading}
            className="flex-1 p-2 bg-gray-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button onClick={sendMessage} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}