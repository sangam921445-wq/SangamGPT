import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: "Chat API is not configured yet. Add OPENAI_API_KEY to your local .env.local file and Vercel Environment Variables."
      }, { status: 503 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are SangamGPT, a helpful, clear and friendly AI assistant. Answer in the user's language." },
          ...messages.slice(-20)
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "The AI provider returned an error." }, { status: response.status });
    }
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "I could not generate a response." });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
