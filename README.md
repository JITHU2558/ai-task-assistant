# 🚀 BNutt AI – Smart AI Assistant with Task Management

BNutt AI is a full-stack AI-powered assistant built using Next.js, Supabase, and local AI models. It combines conversational AI with task management, allowing users to interact naturally while automatically creating and managing tasks.

---

## ✨ Features

* 💬 Real-time AI chat (streaming responses)
* 🧠 Local AI integration (Ollama – llama3)
* 🔐 User authentication (Supabase Auth)
* 📝 AI-powered task creation
* 📦 Task storage with database (Supabase)
* ✅ Task management (Create, Update, Delete)
* 🧑‍💻 Multi-user support with secure access (RLS)
* 📄 Markdown rendering in chat

---

## 🏗️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend:** Next.js API routes
* **Database:** Supabase (PostgreSQL)
* **Auth:** Supabase Auth
* **AI Model:** Ollama (llama3, local)
* **Deployment:** Vercel

---

## 📁 Project Structure

```
ai-assistant/
├── app/
│   ├── api/chat/route.ts
│   ├── login/page.tsx
│   ├── Chat.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── supabase.ts
├── public/
├── .env.local
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 🧠 How It Works

1. User sends message via chat UI
2. Message is sent to `/api/chat`
3. AI model (Ollama) generates response
4. Response is streamed back to UI
5. If structured task is detected → saved to database

---

## 🔒 Security

* Row Level Security (RLS) enabled
* Users can only access their own tasks
* Secure Supabase authentication

---

## ⚠️ Limitations

* Ollama works locally (not deployable on Vercel)
* No long-term memory yet
* Limited AI capability compared to GPT-4

---

## 🚀 Future Improvements

* Add AI memory (conversation history)
* Integrate external APIs (weather, calendar, etc.)
* Replace local AI with hosted model
* Mobile app version
* Smart task prioritization

---

## 🧑‍💻 Author

Built by Jithin P Biju
