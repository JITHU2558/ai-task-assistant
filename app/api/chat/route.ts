import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const prompt = messages.map((m: any) => m.content).join("\n");

  const ollamaRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: true,
    }),
  });

  const reader = ollamaRes.body!.getReader();
  const decoder = new TextDecoder();

  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          try {
            const json = JSON.parse(line);

            if (json.response) {
              fullText += json.response;

              // ✅ Send only clean text
              controller.enqueue(
                new TextEncoder().encode(json.response)
              );
            }
          } catch (err) {
            // ignore bad JSON
          }
        }
      }

      controller.close();
    },
  });

  return new Response(stream);
}