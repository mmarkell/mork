import fetch from "node-fetch";
import { Engine } from "./AbstractEngine";
class OpenAiClient implements Engine {
  constructor() {
    if (!process.env.OPEN_AI_API_KEY) {
      throw new Error("No OpenAI key");
    }
  }

  async prompt(text: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    const data = (await response.json()) as any;
    return data.choices[0].message.content;
  }
}

export default new OpenAiClient();
