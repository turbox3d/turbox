import { CommandManager, SelectionCommand, HintCommand, SceneEvent, SceneTool, ViewEntity } from '@turbox3d/turbox';

import { MoveCommand } from './move';
import { imageBuilderStore } from '../../models';

/**
 * 画布默认激活的全局事件指令集
 */
class DefaultCommand extends CommandManager.compose({
  hint: HintCommand,
  select: SelectionCommand,
  move: MoveCommand,
}) {
  active() {
    this.select.active({
      hint: this.hint,
    });
    this.hint.active(this.select);
    this.move.active();
  }

  protected onWheel(entity: ViewEntity, event: SceneEvent<any>, tools: SceneTool): void {
    const sceneTool = imageBuilderStore.scene.sceneTools;
    if (!sceneTool) {
      return;
    }
    const rootView = sceneTool.getRootView();
    imageBuilderStore.scene.$update({
      canvasZoom: rootView.scale.x,
    });
  }
}

export { DefaultCommand };
