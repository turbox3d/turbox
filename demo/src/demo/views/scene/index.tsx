import * as PIXI from 'pixi.js';
import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import {
  Reactive,
  Scene3D,
  Scene2D,
  MountSystem,
  reactive,
  Reaction,
  Component,
  render,
  ReactiveReact,
  g,
  Element,
  Animation3d
} from '@turbox3d/turbox';
import { FPSMonitorComponent } from '@turbox3d/turbox-dev-tool';

import { appCommandManager } from '../../commands/index';
import { RenderOrder } from '../../common/consts/scene';
import { ldeStore } from '../../models/index';

// import { Animation3d } from './animation3d';
import { OrthographicCamera, PerspectiveCamera } from './camera/index';
import { Rect3d } from './helper/index';
import { DirectionalLight, AmbientLight, HemisphereLight } from './light/index';
import { ModelsWorld, SceneUtil } from './modelsWorld/index';
import './index.scss';
import { TempWorld } from './tempWorld/index';

export const m = {
  getControls: (): any => {
    //
  },
};

@Reactive
class Shadow extends Component {
  render() {
    const { canvasZoom } = ldeStore.scene;
    const { x: width, y: height } = ldeStore.document.getBackgroundSize().multiplyScalar(canvasZoom);
    const background = ldeStore.document.getBackgroundModel();
    // return (
    //   <>
    //     {!background && <Rect3d color={0xFFFFFF} width={width} height={height} position={{ x: 0, y: 0, z: 0 }} />}
    //   </>
    // );
    return [
      !background &&
        g(Rect3d, {
          color: 0xffffff,
          opacity: 0,
          width,
          height,
          position: { x: 0, y: 0, z: 0 },
          renderOrder: RenderOrder.EMPTY_BACKGROUND,
        }),
    ];
  }
}

const World2D = ReactiveReact(({ className = '', style = {} }) => (
  <MountSystem.EnvViewMounter
    mountPointId="scene2d"
    environments={['lite-design']}
    unmountDom={false}
    className={className}
    style={
      ldeStore.scene.isSkewMode || ldeStore.scene.isPdfMode ?
        {
            ...style,
            touchAction: 'none',
            zIndex: 5,
          } :
        style
    }
  />
));

const World3D = ReactiveReact(({ className = '', style = {} }) => {
  React.useEffect(() => {
    const domElement = document.getElementById('scene3d');
    ldeStore.scene.$update({
      sceneWidth: domElement!.clientWidth,
      sceneHeight: domElement!.clientHeight,
    });
  }, []);
  return (
    <MountSystem.EnvViewMounter
      mountPointId="scene3d"
      environments={['lite-design']}
      unmountDom={false}
      className={className}
      style={style}
    />
  );
});

@Reactive
class GraphicWorld extends Component<{
    scene2dChildren: Element[];
    scene3dChildren: Element[];
    maxFPS: number;
    mode: 'orthographic' | 'perspective';
  }> {
  render() {
    const { maxFPS, scene2dChildren, scene3dChildren, mode } = this.props;
    return [
      g(Scene2D, {
        id: 'scene2d',
        draggable: false,
        scalable: false,
        container: 'scene2d',
        coordinateType: 'front',
        transparent: true,
        commandMgr: appCommandManager,
        cameraPosition: { x: 0, y: 0 },
        resizeTo: 'scene2d',
        maxFPS,
        disableResize: true,
        resolution: ldeStore.scene.resolution,
        renderFlag: ldeStore.scene.renderFlag2d,
        children: [g(TempWorld), ...scene2dChildren],
      }),
      g(Scene3D, {
        id: 'scene3d',
        container: 'scene3d',
        backgroundColor: 0xf6f6f6,
        commandMgr: appCommandManager,
        cameraPosition: ldeStore.scene.cameraPosition,
        resizeTo: 'scene3d',
        maxFPS,
        resolution: ldeStore.scene.resolution,
        renderFlag: ldeStore.scene.renderFlag3d,
        children: [
          mode === 'orthographic' ? g(OrthographicCamera) : g(PerspectiveCamera),
          g(ModelsWorld),
          g(Shadow),
          g(Animation3d, {
            modelUrl: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/models/Flamingo.glb',
            isPlay: true,
            activeAction: 'flamingo_flyA_',
            loopTimes: 999,
            loopCall: data => {
              console.log(data.loopDelta);
            },
            finishCall: data => {
              console.log(data.direction);
            },
          }),
          mode === 'perspective' && g(DirectionalLight),
          mode === 'perspective' && g(AmbientLight),
          ...scene3dChildren,
        ],
      }),
    ];
  }
}

@ReactiveReact
export class MainScene extends React.Component<{
  className?: string;
  style?: React.CSSProperties;
  maxFPS?: number;
  scene2dChildren?: any[];
  scene3dChildren?: any[];
  mode?: 'orthographic' | 'perspective';
  deviceType?: 'iPad' | 'PC';
}> {
  private reaction!: Reaction;
  private reaction3d!: Reaction;

  componentDidMount() {
    const {
      maxFPS = 60,
      scene3dChildren = [],
      scene2dChildren = [],
      mode = 'orthographic',
      deviceType = 'PC',
    } = this.props;
    render([
      g(GraphicWorld, {
        scene2dChildren,
        scene3dChildren,
        maxFPS,
        mode,
      }),
    ]);
    ldeStore.scene.$update({
      deviceType,
    });
    window.addEventListener('resize', () => {
      const domElement = document.getElementById('scene3d');
      ldeStore.scene.$update({
        sceneWidth: domElement!.clientWidth,
        sceneHeight: domElement!.clientHeight,
      });
    });
    const app = SceneUtil.getApp() as THREE.WebGLRenderer;
    app.shadowMap.enabled = true;
    this.reaction = reactive(() => {
      const rootView2d = SceneUtil.get2DRootView() as PIXI.Container;
      const { sceneWidth, sceneHeight, canvasZoom, canvasPosition } = ldeStore.scene;
      if (rootView2d) {
        rootView2d.position.x = sceneWidth / 2 + canvasPosition.x;
        rootView2d.position.y = sceneHeight / 2 - canvasPosition.y;
        rootView2d.scale.x = canvasZoom;
        rootView2d.scale.y = -canvasZoom;
      }
    });
    const controls = new OrbitControls(SceneUtil.getCamera(), document.getElementById('scene3d')!);
    controls.object = SceneUtil.getCamera();
    m.getControls = () => controls;
    this.reaction3d = reactive(() => {
      controls.enabled = ldeStore.scene.cameraControlsEnabled;
      const { x, y, z } = ldeStore.scene.cameraTarget;
      controls.target = new THREE.Vector3(x, y, z);
    });
  }

  componentWillUnmount() {
    this.reaction.dispose();
    this.reaction3d.dispose();
  }

  render() {
    const { className = '', style = {} } = this.props;
    return (
      <>
        <World2D className={className} style={style} />
        <World3D className={className} style={style} />
        <FPSMonitorComponent className="fps-monitor" />
      </>
    );
  }
}
