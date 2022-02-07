import * as React from 'react';
import * as PIXI from 'pixi.js';
import { Reactive, Scene3D, Scene2D, MountSystem, reactive, Reaction, Component, render, ReactiveReact, Element } from '@turbox3d/turbox3d';
import { FPSMonitorComponent } from '@turbox3d/turbox-dev-tool';
import { appCommandBox } from '../../commands/index';
import { Camera } from './camera/index';
import { Light } from './light/index';
import { Rect3d } from './helper/index';
import { ModelsWorld, SceneUtil } from './modelsWorld/index';
// import './index.less';
import { ldeStore } from '../../models/index';
import { TempWorld } from './tempWorld/index';
import { EyeDistance } from '../../consts/scene';

@Reactive
class Shadow extends Component {
  render() {
    const { canvasZoom } = ldeStore.scene;
    const { x: width, y: height } = ldeStore.document.getBackgroundSize().multiplyScalar(canvasZoom);
    const background = ldeStore.document.getBackgroundModel();
    // return (
    //   <>
    //     {!background && <Rect3d color={0xFFFFFF} width={width} height={height} position={{ x: 0, y: 0, z: EyeDistance.EMPTY_BACKGROUND }} />}
    //   </>
    // );
    if (!background) {
      return [{
        component: Rect3d,
        props: {
          color: 0xFFFFFF,
          width,
          height,
          position: { x: 0, y: 0, z: EyeDistance.EMPTY_BACKGROUND },
        },
      }];
    }
    return null;
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
  scene2dChildren: Component[];
  scene3dChildren: Component[];
  maxFPS: number;
}> {
  render() {
    const { maxFPS, scene2dChildren, scene3dChildren } = this.props;
    return [{
      component: Scene2D,
      props: {
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
        children: [{
          component: TempWorld,
        }, ...scene2dChildren],
      },
    }, {
      component: Scene3D,
      props: {
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
        children: [{
          component: Camera,
        }, {
          component: Light,
        }, {
          component: ModelsWorld,
        }, {
          component: Shadow,
        }, ...scene3dChildren],
      },
    }] as Element[];
  }
}

@ReactiveReact
export class MainScene extends React.Component<{
  className?: string;
  style?: React.CSSProperties;
  maxFPS?: number;
  scene2dChildren?: any[];
  scene3dChildren?: any[];
}> {
  private reaction: Reaction;

  componentDidMount() {
    const { maxFPS = 60, scene3dChildren = [], scene2dChildren = [] } = this.props;
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
    render([{
      component: GraphicWorld,
      props: {
        scene2dChildren,
        scene3dChildren,
        maxFPS,
      }
    }]);
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
