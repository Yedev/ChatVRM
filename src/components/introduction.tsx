import { useState, useCallback } from "react";
import { Link } from "./link";

type Props = {
  openAiKey: string;
  koeiroMapKey: string;
  onChangeAiKey: (openAiKey: string) => void;
  onChangeKoeiromapKey: (koeiromapKey: string) => void;
};
export const Introduction = ({
  openAiKey,
  koeiroMapKey,
  onChangeAiKey,
  onChangeKoeiromapKey,
}: Props) => {
  const [opened, setOpened] = useState(true);

  const handleAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAiKey(event.target.value);
    },
    [onChangeAiKey]
  );

  const handleKoeiromapKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeKoeiromapKey(event.target.value);
    },
    [onChangeKoeiromapKey]
  );

  return opened ? (
    <div className="absolute z-40 w-full h-full px-24 py-40  bg-black/30 font-M_PLUS_2">
      <div className="mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary ">
            关于本应用
          </div>
          <div>
            仅需 Web 浏览器即可通过麦克风、文本输入和语音合成与 3D 角色进行对话。您还可以更改角色 (VRM)、设定性格和调整语音。
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            技术介绍
          </div>
          <div>
            3D 模型显示使用
            <Link
              url={"https://github.com/pixiv/three-vrm"}
              label={"@pixiv/three-vrm"}
            />
            ，对话生成使用
            <Link
              url={"https://www.volcengine.com/product/doubao"}
              label={"Doubao (火山引擎)"}
            />
            ，语音合成使用
            <Link url={"https://koemotion.rinna.co.jp/"} label={"Koemotion"} />
            的
            <Link
              url={
                "https://developers.rinna.co.jp/product/#product=koeiromap-free"
              }
              label={"Koeiromap API"}
            />
            。
          </div>
          <div className="my-16">
            本演示的源代码已在 GitHub 上公开。欢迎自由修改和改编！
            <br />
            仓库：
            <Link
              url={"https://github.com/pixiv/ChatVRM"}
              label={"https://github.com/pixiv/ChatVRM"}
            />
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            使用注意事项
          </div>
          <div>
            请勿故意引导进行歧视性或暴力性发言，或贬低特定人物的发言。此外，使用 VRM 模型替换角色时，请遵守模型的使用条款。
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Koeiromap API 密钥
          </div>
          <input
            type="text"
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={koeiroMapKey}
            onChange={handleKoeiromapKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
          ></input>
          <div>
            API 密钥请从 rinna Developers 获取。
            <Link
              url="https://developers.rinna.co.jp/product/#product=koeiromap-free"
              label="详情请见此处"
            />
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            火山引擎 API 密钥
          </div>
          <input
            type="text"
            placeholder="..."
            value={openAiKey}
            onChange={handleAiKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
          ></input>
          <div>
            请输入火山引擎提供的 API 密钥。
          </div>
          <div className="my-16">
            API 直接从浏览器访问。
            <br />
            模型：doubao-seed-1-8-251228
          </div>
        </div>
        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
            输入 API 密钥并开始
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
