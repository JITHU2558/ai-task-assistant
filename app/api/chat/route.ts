import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  // temporary fake AI response (we'll upgrade later)
  const improved = `Better version: ${text} (more clear and structured)`;

  return NextResponse.json({ improved });
}

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
