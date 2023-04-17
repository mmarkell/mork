import fetch from "node-fetch";
import { Engine } from "./AbstractEngine";
export class OpenAiClient implements Engine {
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("No OpenAI key");
    }
  }

  async prompt(text: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
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
