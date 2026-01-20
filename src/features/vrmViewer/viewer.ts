import * as THREE from "three";
import { Model } from "./model";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { buildUrl } from "@/utils/buildUrl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;

  constructor() {
    this.isReady = false;

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      this._scene.add(this.model.vrm.scene);

      // 加载聊天动画，idle时显示第一帧，聊天时循环播放
      const talkingVrma = await loadVRMAnimation(buildUrl("/animation/talking/Talking.vrma"));
      if (talkingVrma) this.model.loadTalkingAnimation(talkingVrma);

      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  /**
   * Reactで管理しているCanvasを後から設定する
   */
  public setup(canvas: HTMLCanvasElement) {
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;
    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // camera
    this._camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
    // Initial position for full body view (approximate)
    this._camera.position.set(0, 1.0, 4.0); 
    this._cameraControls?.target.set(0, 0.85, 0);
    this._cameraControls?.update();
    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._cameraControls.screenSpacePanning = true;
    this._cameraControls.update();

    window.addEventListener("resize", () => {
      this.resize();
    });
    this.isReady = true;
    this.update();
  }

  /**
   * canvasの親要素を参照してサイズを変更する
   */
  public resize() {
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(
      parentElement.clientWidth,
      parentElement.clientHeight
    );

    if (!this._camera) return;
    this._camera.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera.updateProjectionMatrix();
  }

  /**
   * VRMのheadノードを参照してカメラ位置を調整する
   */
  public resetCamera() {
    // Try to target hips for full body view, fallback to head with offset
    const hipsNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("hips");
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");
    
    // Default targets
    let targetX = 0;
    let targetY = 0.85; // Approx waist height
    let targetZ = 0;

    if (hipsNode) {
        const hipsWPos = hipsNode.getWorldPosition(new THREE.Vector3());
        targetX = hipsWPos.x;
        targetY = hipsWPos.y;
        targetZ = hipsWPos.z;
    } else if (headNode) {
        const headWPos = headNode.getWorldPosition(new THREE.Vector3());
        targetX = headWPos.x;
        targetY = headWPos.y / 2; // Estimate waist height
        targetZ = headWPos.z;
    }

    if (this._camera) {
        // Distance for full body with 20 deg FOV (approx 4.0 - 5.0 units back)
        const distance = 4.5;
        this._camera.position.set(targetX, targetY, targetZ + distance);
        this._cameraControls?.target.set(targetX, targetY, targetZ);
        this._cameraControls?.update();
    }
  }

  public update = () => {
    requestAnimationFrame(this.update);
    const delta = this._clock.getDelta();
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
    }
  };
}
