import { Configuration, OpenAIApi } from "openai";
import { Message } from "../messages/messages";

// Volcano Engine (Doubao) Configuration
const VOLC_API_KEY = "3daaca7d-1f3e-40a8-90c6-38f4d2b17b90";
const VOLC_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const VOLC_MODEL = "doubao-seed-1-8-251228";

export async function getChatResponse(messages: Message[], apiKey: string) {
  // Use the provided key or fallback to the hardcoded one if empty (or always use hardcoded one as per request)
  const keyToUse = apiKey || VOLC_API_KEY;

  if (!keyToUse) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    apiKey: keyToUse,
    basePath: VOLC_BASE_URL,
  });
  // ブラウザからAPIを叩くときに発生するエラーを無くすworkaround
  // https://github.com/openai/openai-node/issues/6#issuecomment-1492814621
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: VOLC_MODEL,
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "エラーが発生しました";

  return { message: message };
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string
) {
  // Use the provided key or fallback to the hardcoded one
  const keyToUse = apiKey || VOLC_API_KEY;

  if (!keyToUse) {
    throw new Error("Invalid API Key");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${keyToUse}`,
  };

  const res = await fetch(`${VOLC_BASE_URL}/chat/completions`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: VOLC_MODEL,
      messages: messages,
      stream: true,
      max_tokens: 200,
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || !reader) {
    throw new Error("Something went wrong");
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          const chunks = data
            .split("data:")
            .filter((val) => !!val && val.trim() !== "[DONE]");
          for (const chunk of chunks) {
            const json = JSON.parse(chunk);
            const messagePiece = json.choices[0].delta.content;
            if (!!messagePiece) {
              controller.enqueue(messagePiece);
            }
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return stream;
}
