import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  const { message, history } = await request.json();

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "あなたは優秀なインタビュアーです。ユーザーの意見に対して、必ず何か一つだけ、簡潔な深掘りのための質問を返してください。フレンドリーな口調でお願いします。",
  });

  const chat = model.startChat({
    history: history,
  });

  const result = await chat.sendMessage(message);
  const response = result.response;
  const text = response.text();

  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
}