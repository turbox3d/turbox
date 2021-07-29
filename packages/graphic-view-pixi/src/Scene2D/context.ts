import React from 'react';
import * as PIXI from 'pixi.js';
import { BaseCommandBox, ITool } from '@turbox3d/command-manager';
import { CoordinateType } from '@turbox3d/event-manager';
import { SceneContext } from '@turbox3d/graphic-view';
import { Vec2 } from '@turbox3d/shared';

function throwErr() {
  throw Error('Mesh2D Component should be rendered in Scene2D');
}

export const Scene2dContext = React.createContext && React.createContext<SceneContext<PIXI.DisplayObject, Vec2>>({
  updateInteractiveObject: throwErr,
  updateCursor: throwErr,
  getCommandBox: throwErr as () => BaseCommandBox | undefined,
  getTools: throwErr as () => ITool,
  coordinateTransform: throwErr as any as (point: Vec2, type: CoordinateType) => Vec2,
  getScreenShot: () => '',
});
