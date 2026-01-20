import { Configuration, OpenAIApi } from "openai";

import type { NextApiRequest, NextApiResponse } from "next";

const VOLC_API_KEY = "3daaca7d-1f3e-40a8-90c6-38f4d2b17b90";
const VOLC_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const VOLC_MODEL = "doubao-seed-1-8-251228";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const apiKey = req.body.apiKey || VOLC_API_KEY || process.env.OPEN_AI_KEY;

  if (!apiKey) {
    res
      .status(400)
      .json({ message: "API Key is missing." });

    return;
  }

  const configuration = new Configuration({
    apiKey: apiKey,
    basePath: VOLC_BASE_URL,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const { data } = await openai.createChatCompletion({
      model: VOLC_MODEL,
      messages: req.body.messages,
    });

    const [aiRes] = data.choices;
    const message = aiRes.message?.content || "Error occurred";

    res.status(200).json({ message: message });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error calling API" });
  }
}
