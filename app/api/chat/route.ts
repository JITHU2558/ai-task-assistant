import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await ollama.chat({
  model: "llama3",
    messages,
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