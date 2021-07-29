import React from 'react';
import * as THREE from 'three';
import { BaseCommandBox, ITool } from '@turbox3d/command-manager';
import { CoordinateType } from '@turbox3d/event-manager';
import { SceneContext } from '@turbox3d/graphic-view';
import { Vec3 } from '@turbox3d/shared';

function throwErr() {
  throw Error('Mesh3D Component should be rendered in Scene3D');
}

export const Scene3dContext = React.createContext && React.createContext<SceneContext<THREE.Object3D, Vec3>>({
  updateInteractiveObject: throwErr,
  updateCursor: throwErr,
  getCommandBox: throwErr as () => BaseCommandBox | undefined,
  getTools: throwErr as () => ITool,
  coordinateTransform: throwErr as any as (point: Vec3, type: CoordinateType) => Vec3,
  getScreenShot: () => '',
});
