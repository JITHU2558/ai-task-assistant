import { NextResponse } from "next/server";

const GROQ_MODEL = "qwen/qwen3.6-27b";

export async function GET() {
  return NextResponse.json({
    status: "API is working",
    model: GROQ_MODEL,
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          reply: "GROQ_API_KEY is missing on the server.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const messages = body.messages || [];
    const image = body.image || null;

    if (!messages.length) {
      return NextResponse.json(
        {
          reply: "No messages provided.",
        },
        { status: 400 }
      );
    }

    let groqMessages: any[] = [...messages];

    // Add image to the latest user message
    if (image) {
      const lastMessage = messages[messages.length - 1];

      groqMessages = [
        ...messages.slice(0, -1),
        {
          role: "user",
          content: [
            {
              type: "text",
              text: lastMessage?.content || "Analyze this image.",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ];
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  model: GROQ_MODEL,
  messages: groqMessages,
  temperature: 0.7,
  reasoning_effort: "none",
  reasoning_format: "hidden",
}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GROQ ERROR:", data);

      return NextResponse.json(
        {
          reply:
            data?.error?.message ||
            "Groq AI service returned an error.",
        },
        { status: 500 }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response from AI.";

    return NextResponse.json({
      reply,
    });
  } catch (error: any) {
    console.error("CHAT API ERROR:", error);

    return NextResponse.json(
      {
        reply:
          error?.message ||
          "Something went wrong while contacting the AI.",
      },
      { status: 500 }
    );
  }
}