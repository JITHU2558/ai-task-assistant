import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "API is working",
  });
}

export async function POST(req: Request) {
  try {
    const { messages = [], image } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          reply: "GROQ_API_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }

    if (!messages.length) {
      return NextResponse.json(
        {
          reply: "No messages provided.",
        },
        {
          status: 400,
        }
      );
    }

    let groqMessages: any[] = [...messages];

    // Vision request
    if (image) {
      const lastMessage = messages[messages.length - 1];

      groqMessages = [
        ...messages.slice(0, -1),
        {
          role: "user",
          content: [
            {
              type: "text",
              text: lastMessage.content,
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
          model: image
            ? "meta-llama/llama-4-scout-17b-16e-instruct"
            : "llama-3.1-8b-instant",
          messages: groqMessages,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return NextResponse.json(
        {
          reply: JSON.stringify(data),
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      reply:
        data.choices?.[0]?.message?.content ??
        "No response received.",
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        reply: err.message || "Unknown server error.",
      },
      {
        status: 500,
      }
    );
  }
}