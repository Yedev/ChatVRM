import type { NextApiRequest, NextApiResponse } from "next";
import { TalkStyle } from "@/features/messages/messages";

type Data = {
  audio: string;
};

// 字节跳动 TTS API 配置
const BYTEDANCE_CONFIG = {
  appid: "9744575718",
  accessToken: "9GGD8Zh-jixVX7EgzFKjIn-PDPTiUzBO",
  cluster: "volcano_tts",
  host: "openspeech.bytedance.com",
};

// 语音类型映射
const voiceTypeMap: Record<TalkStyle, string> = {
  talk: "zh_female_jitangnv_saturn_bigtts",
  happy: "zh_female_jitangnv_saturn_bigtts",
  sad: "zh_female_jitangnv_saturn_bigtts",
  angry: "zh_female_jitangnv_saturn_bigtts",
  fear: "zh_female_jitangnv_saturn_bigtts",
  surprised: "zh_female_jitangnv_saturn_bigtts",
};

/**
 * 生成 UUID
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Base64 字符串转 Data URL
 */
function base64ToDataUrl(base64: string): string {
  return `data:audio/mp3;base64,${base64}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const message = req.body.message as string;
  const style = (req.body.style || "talk") as TalkStyle;

  try {
    const voiceType = voiceTypeMap[style] || voiceTypeMap.talk;

    const requestBody = {
      app: {
        appid: BYTEDANCE_CONFIG.appid,
        token: BYTEDANCE_CONFIG.accessToken,
        cluster: BYTEDANCE_CONFIG.cluster,
      },
      user: {
        uid: "388808087185088",
      },
      audio: {
        voice_type: voiceType,
        encoding: "mp3",
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0,
      },
      request: {
        reqid: generateUUID(),
        text: message,
        text_type: "plain",
        operation: "query",
        with_frontend: 1,
        frontend_type: "unitTson",
      },
    };

    const response = await fetch(
      `https://${BYTEDANCE_CONFIG.host}/api/v1/tts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer;${BYTEDANCE_CONFIG.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = (await response.json()) as any;
    if (data.code === 3000 && data.data) {
      // 返回 Data URL，可直接用于播放
      const audioUrl = base64ToDataUrl(data.data);
      res.status(200).json({ audio: audioUrl });
    } else {
      res.status(400).json({ audio: "" });
    }
  } catch (error) {
    console.error("Bytedance TTS Error:", error);
    res.status(500).json({ audio: "" });
  }
}
