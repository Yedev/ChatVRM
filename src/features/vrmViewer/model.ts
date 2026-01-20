import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMAnimation } from "../../lib/VRMAnimation/VRMAnimation";
import { VRMLookAtSmootherLoaderPlugin } from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";
import { LipSync } from "../lipSync/lipSync";
import { EmoteController } from "../emoteController/emoteController";
import { Screenplay } from "../messages/messages";

/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteController?: EmoteController;

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;
  private _talkingAction?: THREE.AnimationAction;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    this._lipSync = new LipSync(new AudioContext());
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        })
    );

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = "VRMRoot";

    VRMUtils.rotateVRM0(vrm);
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
  }

  /**
   * VRMアニメーションを読み込む
   *
   * https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md
   */
  public async loadAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip = vrmAnimation.createAnimationClip(vrm);
    const action = mixer.clipAction(clip);
    action.play();
  }

  /**
   * 聊天动画を読み込む（idle时显示第一帧，聊天时循环播放）
   */
  public async loadTalkingAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip = vrmAnimation.createAnimationClip(vrm);
    this._talkingAction = mixer.clipAction(clip);
    this._talkingAction.setLoop(THREE.LoopRepeat, Infinity);
    this._talkingAction.play();
    // 初始状态暂停在第一帧作为idle姿态
    this._talkingAction.paused = true;
    this._talkingAction.time = 0;
  }

  /**
   * 开始播放聊天动画（循环播放）
   */
  public startTalkingAnimation(): void {
    if (this._talkingAction) {
      this._talkingAction.paused = false;
    }
  }

  /**
   * 停止聊天动画，回到第一帧的idle姿态
   */
  public stopTalkingAnimation(): void {
    if (this._talkingAction) {
      this._talkingAction.paused = true;
      this._talkingAction.time = 0;
    }
  }

  /**
   * 音声を再生し、リップシンクを行う
   */
  public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
    this.emoteController?.playEmotion(screenplay.expression);
    // 开始聊天动画
    this.startTalkingAnimation();
    await new Promise((resolve) => {
      this._lipSync?.playFromArrayBuffer(buffer, () => {
        resolve(true);
      });
    });
    // 停止聊天动画，回到idle姿态
    this.stopTalkingAnimation();
  }

  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteController?.lipSync("aa", volume);
    }

    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}
