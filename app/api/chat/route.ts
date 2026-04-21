import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 🧠 SYSTEM PROMPT (TASK LOGIC)
  const systemPrompt = {
    role: "system",
    content: `
You are BNutt, an AI assistant.

When user asks to create a task, respond ONLY in JSON format:

{
  "type": "task",
  "title": "short task title",
  "time": "optional time"
}

If not a task, respond normally.
`,
  };

  // ✅ Inject system prompt
  const finalMessages = [systemPrompt, ...messages];

  // 🔁 STREAM RESPONSE
  const stream = await ollama.chat({
    model: "llama3",
    messages: finalMessages,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.message?.content || "";
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    })
  );
}
