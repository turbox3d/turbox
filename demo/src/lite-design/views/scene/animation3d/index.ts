import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mesh3D } from '@turbox3d/turbox';
import { IDictionary } from '../../../types/types';

// 确定需要哪些变更属性
interface IAnimationProps {
  /**
   * 模型路径
   */
  modelUrl: string;
  /**
   * 当前激活的动画名
   */
  activeAction?: string;
  /**
   *
   */
  isPlay?: boolean;
  /**
   * 开始时间，默认0
   */
  startTime?: number;
  /**
   * 循环模式
   */
  loopMode?: THREE.AnimationActionLoopStyles;
  /**
   * 循环次数
   */
  loopTimes?: number;
  /**
   * 每次loop结束派发
   */
  loopCall?: (data: { type: 'loop'; action: THREE.AnimationAction; loopDelta: number }) => void;
  /**
   * 所有loop结束后派发
   */
  finishCall?: (data: { type: 'finished'; action: THREE.AnimationAction; direction: 1 | -1 }) => void;
  /**
   * 时间比率，默认1
   */
  timeScale?: number;
}

const cache: IDictionary<GLTF> = {};
let loader: GLTFLoader;

function loadGltf(url: string) {
  if (cache[url]) {
    return Promise.resolve(cache[url]);
  }
  if (!loader) {
    loader = new GLTFLoader();
  }
  return new Promise<GLTF>((resolve, reject) => {
    loader.load(
      url,
      gltf => {
        cache[url] = gltf;
        resolve(gltf);
      },
      undefined,
      reject
    );
  });
}

export class Animation3d extends Mesh3D<IAnimationProps> {
  protected reactivePipeLine = [this.updateModel, this.updateAnimation];
  protected view = new THREE.Group();
  private gltfModel?: THREE.Group;
  private oriLoopCall?: Function;
  private oriFinishCall?: Function;
  /**
   * 主融合器
   */
  private mixer?: THREE.AnimationMixer;
  /**
   * 所有的动画数据
   */
  private actions: IDictionary<THREE.AnimationAction> = {};

  tick = (deltaTime: number) => {
    if (!this.props.isPlay || !this.mixer) {
      return;
    }
    this.mixer.update(deltaTime);
  }

  componentDidMount() {
    // 加入循环
    this.context.getSceneTools().addTicker(this.tick);
  }

  componentWillUnmount() {
    this.context.getSceneTools().removeTicker(this.tick);
  }

  /**
   * 动画更新，播放停止，开始时间等等
   * @returns
   */
  updateAnimation() {
    const { activeAction, startTime, isPlay, loopTimes, loopMode, loopCall, finishCall } = this.props;
    if (!activeAction || !this.actions[activeAction]) {
      return;
    }
    const action = this.actions[activeAction];
    if (!isPlay) {
      action.stop();
    } else {
      action.setLoop(loopMode || THREE.LoopRepeat, loopTimes || 0);
      action.startAt(startTime || 0);
      action.play();
    }
    // 事件
    if (this.mixer) {
      if (this.oriLoopCall !== loopCall) {
        if (this.oriLoopCall) {
          this.mixer.removeEventListener('loop', this.oriLoopCall as any);
        }
        if (loopCall) {
          this.mixer.addEventListener('loop', loopCall as any);
        }
      }
      if (this.oriFinishCall !== finishCall) {
        if (this.oriFinishCall) {
          this.mixer.removeEventListener('finished', this.oriFinishCall as any);
        }
        if (finishCall) {
          this.mixer.addEventListener('finished', finishCall as any);
        }
      }
    }
  }

  /**
   * 更新模型数据
   * @returns
   */
  async updateModel() {
    const { modelUrl } = this.props;
    if (!modelUrl) {
      return;
    }

    const gltf = await loadGltf(modelUrl).catch(err => {
      console.error(err);
    });

    if (!gltf) {
      return;
    }
    // 原来的mixer需要移除循环
    if (this.mixer) {
      //
    }
    // 原先的模型需要移除
    if (this.gltfModel) {
      this.view.remove(this.gltfModel);
    }
    // 动画建立
    const model = gltf.scene.clone();
    this.gltfModel = model;
    this.view.add(model);
    this.mixer = new THREE.AnimationMixer(model);
    const actions: IDictionary<THREE.AnimationAction> = {};
    for (let i = 0; i < gltf.animations.length; i++) {
      const clip = gltf.animations[i];
      const action = this.mixer.clipAction(clip);
      actions[clip.name] = action;
    }
    this.actions = actions;
    this.updateAnimation();
  }
}
