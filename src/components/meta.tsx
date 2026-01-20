import { buildUrl } from "@/utils/buildUrl";
import Head from "next/head";
export const Meta = () => {
  const title = "ChatVRM";
  const description =
    "仅需 Web 浏览器即可通过麦克风、文本输入和语音合成与 3D 角色进行对话。您还可以更改角色 (VRM)、设定性格和调整语音。";
  const imageUrl = "https://pixiv.github.io/ChatVRM/ogp.png";
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
};
