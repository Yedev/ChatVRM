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
            このアプリケーションについて
          </div>
          <div>
            Webブラウザだけで3Dキャラクターとの会話を、マイクやテキスト入力、音声合成を用いて楽しめます。キャラクター（VRM）の変更や性格設定、音声調整もできます。
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Technology
          </div>
          <div>
            3D model display uses
            <Link
              url={"https://github.com/pixiv/three-vrm"}
              label={"@pixiv/three-vrm"}
            />
            , conversation generation uses
            <Link
              url={"https://www.volcengine.com/product/doubao"}
              label={"Doubao (Volcano Engine)"}
            />
            , voice synthesis uses
            <Link url={"https://koemotion.rinna.co.jp/"} label={"Koemotion"} />
            's
            <Link
              url={
                "https://developers.rinna.co.jp/product/#product=koeiromap-free"
              }
              label={"Koeiromap API"}
            />
            .
          </div>
          <div className="my-16">
            このデモはGitHubでソースコードを公開しています。自由に変更や改変をお試しください！
            <br />
            リポジトリ：
            <Link
              url={"https://github.com/pixiv/ChatVRM"}
              label={"https://github.com/pixiv/ChatVRM"}
            />
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            利用上の注意
          </div>
          <div>
            差別的または暴力的な発言、特定の人物を貶めるような発言を、意図的に誘導しないでください。また、VRMモデルを使ってキャラクターを差し替える際はモデルの利用条件に従ってください。
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            Koeiromap APIキー
          </div>
          <input
            type="text"
            placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={koeiroMapKey}
            onChange={handleKoeiromapKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
          ></input>
          <div>
            APIキーはrinna Developersから発行してください。
            <Link
              url="https://developers.rinna.co.jp/product/#product=koeiromap-free"
              label="詳細はこちら"
            />
          </div>
        </div>
          <div className="my-24">
            <div className="my-8 font-bold typography-20 text-secondary">
              Volcano Engine API Key
            </div>
            <input
              type="text"
              placeholder="..."
              value={openAiKey}
              onChange={handleAiKeyChange}
              className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
            ></input>
            <div>
              Enter the API Key provided by Volcano Engine.
            </div>
            <div className="my-16">
              The API is accessed directly from the browser.
              <br />
              Model: doubao-seed-1-8-251228
            </div>
          </div>
        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
          >
            APIキーを入力してはじめる
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
