import * as React from 'react';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { Reactive, Scene3D, Scene2D, MountSystem, reactive, Reaction, Component, render, ReactiveReact, createElement, Element } from '@turbox3d/turbox';
import { FPSMonitorComponent } from '@turbox3d/turbox-dev-tool';
import { appCommandBox } from '../../commands/index';
import { OrthographicCamera, PerspectiveCamera } from './camera/index';
import { DirectionalLight, AmbientLight, HemisphereLight } from './light/index';
import { Rect3d } from './helper/index';
import { ModelsWorld, SceneUtil } from './modelsWorld/index';
// import './index.less';
import { ldeStore } from '../../models/index';
import { TempWorld } from './tempWorld/index';
import { RenderOrder } from '../../consts/scene';

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
      !background && createElement(Rect3d, {
        color: 0xFFFFFF,
        width,
        height,
        position: { x: 0, y: 0, z: 0 },
        renderOrder: RenderOrder.EMPTY_BACKGROUND,
      }),
    ];
  }
}

const World2D = ReactiveReact(({ className = '', style = {} }) => {
  return (
    <MountSystem.EnvViewMounter
      mountPointId="scene2d"
      environments={['lite-design']}
      unmountDom={false}
      className={className}
      style={(ldeStore.scene.isSkewMode || ldeStore.scene.isPdfMode) ? {
        ...style,
        touchAction: 'none',
        zIndex: 5,
      } : style}
    />
  );
});

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
      createElement(Scene2D, {
        id: 'scene2d',
        draggable: false,
        scalable: false,
        container: 'scene2d',
        coordinateType: 'front',
        transparent: true,
        commandBox: appCommandBox,
        cameraPosition: { x: 0, y: 0 },
        resizeTo: 'scene2d',
        maxFPS,
        disableResize: true,
        resolution: ldeStore.scene.resolution,
        renderFlag: ldeStore.scene.renderFlag2d,
        children: [
          createElement(TempWorld),
          ...scene2dChildren
        ],
      }),
      createElement(Scene3D, {
        id: 'scene3d',
        container: 'scene3d',
        backgroundColor: 0xF6F6F6,
        commandBox: appCommandBox,
        cameraPosition: ldeStore.scene.cameraPosition,
        cameraTarget: ldeStore.scene.cameraTarget,
        cameraControls: ldeStore.scene.cameraControlsEnabled,
        resizeTo: 'scene3d',
        maxFPS,
        resolution: ldeStore.scene.resolution,
        renderFlag: ldeStore.scene.renderFlag3d,
        children: [
          mode === 'orthographic' ? createElement(OrthographicCamera) : createElement(PerspectiveCamera),
          createElement(ModelsWorld),
          createElement(Shadow),
          mode === 'perspective' && createElement(DirectionalLight),
          mode === 'perspective' && createElement(AmbientLight),
          ...scene3dChildren,
        ],
      })
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
  private reaction: Reaction;

  componentDidMount() {
    const { maxFPS = 60, scene3dChildren = [], scene2dChildren = [], mode = 'orthographic', deviceType = 'PC' } = this.props;
    this.reaction = reactive(() => {
      const rootView2d = (SceneUtil.get2DRootView() as PIXI.Container);
      const { sceneWidth, sceneHeight, canvasZoom, canvasPosition } = ldeStore.scene;
      if (rootView2d) {
        rootView2d.position.x = sceneWidth / 2 + canvasPosition.x;
        rootView2d.position.y = sceneHeight / 2 - canvasPosition.y;
        rootView2d.scale.x = canvasZoom;
        rootView2d.scale.y = -canvasZoom;
      }
    });
    render([
      createElement(GraphicWorld, {
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
  }

  componentWillUnmount() {
    this.reaction.dispose();
  }

  render() {
    const { className = '', style = {} } = this.props;
    return (
      <>
        <World2D className={className} style={style} />
        <World3D className={className} style={style} />
      </>
    );
  }
}
