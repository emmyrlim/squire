import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

const openai = new OpenAI({
  apiKey,
});

export async function callLLM(prompt: string): Promise<string> {
  // You can adjust the model, temperature, etc. as needed
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or "gpt-3.5-turbo"
    messages: [
      {
        role: "system",
        content:
          "You are an expert D&D session note-taker. Output only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  // Extract the assistant's reply
  const message = response.choices[0]?.message?.content;
  if (!message) throw new Error("No response from LLM");

  return message;
}
