import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { ChatLog } from "@/components/chatLog";

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, koeiroParam, chatLog })
      )
    );
  }, [systemPrompt, koeiroParam, chatLog]);

  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      speakCharacter(screenplay, viewer, koeiromapKey, onStart, onEnd);
    },
    [viewer, koeiromapKey]
  );

  const handleSendChat = useCallback(
    async (text: string) => {
      if (!text) return;

      setChatProcessing(true);
      // Add user message
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: text },
      ];
      setChatLog(messageLog);

      // Create messages for API
      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      const stream = await getChatResponseStream(messages, openAiKey).catch(
        (e) => {
          console.error(e);
          return null;
        }
      );

      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // Detect tag (though we removed emotion prompts, we keep this for compatibility)
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // Find sentences
          let match;
          while (
            (match = receivedMessage.match(
              /^(.+[。．！？\n]|.{10,}[、,])/
            ))
          ) {
            const sentence = match[0];
            receivedMessage = receivedMessage.slice(sentence.length);

            // Skip empty/noise
            const trimmedSentence = sentence.trim();
            if (
              !trimmedSentence ||
              !trimmedSentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            
            // Update Dialog
            aiTextLog += aiText;
            const currentAiTextLog = aiTextLog;
            
            setChatLog((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg.role === "assistant") {
                    const newLog = [...prev];
                    newLog[newLog.length - 1] = {
                        ...lastMsg,
                        content: currentAiTextLog
                    };
                    return newLog;
                } else {
                    return [...prev, { role: "assistant", content: currentAiTextLog }];
                }
            });

            // Synthesize and Play
            handleSpeakAi(aiTalks[0]);
          }
        }

        // Handle remaining buffer (flush)
        if (receivedMessage.length > 0) {
            const sentence = receivedMessage.trim();
            if (sentence) {
                const aiText = `${tag} ${sentence}`;
                const aiTalks = textsToScreenplay([aiText], koeiroParam);
                aiTextLog += aiText;
                const currentAiTextLog = aiTextLog;
                
                setChatLog((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg.role === "assistant") {
                        const newLog = [...prev];
                        newLog[newLog.length - 1] = {
                            ...lastMsg,
                            content: currentAiTextLog
                        };
                        return newLog;
                    } else {
                        return [...prev, { role: "assistant", content: currentAiTextLog }];
                    }
                });
                handleSpeakAi(aiTalks[0]);
            }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
        setChatProcessing(false);
      }
    },
    [systemPrompt, chatLog, handleSpeakAi, openAiKey, koeiroParam]
  );

  return (
    <div className={"font-M_PLUS_2 flex flex-row h-screen"}>
      <div className="flex-1 h-full flex flex-col">
        <VrmViewer />
        <MessageInputContainer
          isChatProcessing={chatProcessing}
          onChatProcessStart={handleSendChat}
        />
      </div>
      <div className="flex-1">
        <ChatLog messages={chatLog} />
      </div>
    </div>
  );
}
