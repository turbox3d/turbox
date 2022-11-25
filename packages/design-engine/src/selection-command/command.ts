/* eslint-disable @typescript-eslint/member-ordering */
import { BaseCommand } from '@turbox3d/command-manager';
import { ViewEntity, SceneEvent } from '@turbox3d/event-manager';
import EntityObject from '../entity-object';
import { Selection } from './domain';
import HintCommand from '../hint-command/index';

export enum ESelectMode {
  /** 选择整体 */
  OVERALL = 'overall',
  /** 选择部件 */
  PART = 'part',
  /** 默认模式（无视层级，选中哪个部件就是哪个） */
  DEFAULT = 'default',
}

enum EClickAction {
  CLICK = 'click',
  DOUBLE_CLICK = 'double-click',
}

interface ISelectCommandParams {
  /** 选择模式 */
  selectMode?: ESelectMode;
  /** 可选中的 entity 类型 */
  selectEntityTypes?: symbol[];
  /** hint command 实例，select 与 hint 同时启用时需要传入 */
  hint?: HintCommand;
  /** 选中的回调 */
  onSelectHandler?: (models: EntityObject[]) => void;
  /** 取消选中的回调 */
  onUnselectHandler?: (models: EntityObject[]) => void;
}

export class SelectionCommand extends BaseCommand {
  static ESelectMode = ESelectMode;
  private selection = new Selection();
  private targetRootEntity?: EntityObject;
  private hint?: HintCommand;
  private modeMap = {
    [ESelectMode.OVERALL]: 1,
    [ESelectMode.PART]: 2,
    [ESelectMode.DEFAULT]: 1,
  };

  /** 获取被选中的 entities */
  getSelectedEntities() {
    return this.selection.selectedEntities;
  }

  /** 切换选择模式 */
  switchSelectMode(selectMode: ESelectMode) {
    this.selection.switchSelectMode(selectMode);
    this.selection.setLayerDepth(this.modeMap[this.selection.selectMode]);
  }

  /** 获取当前选择模式 */
  getSelectMode() {
    return this.selection.selectMode;
  }

  /**
   * 设置事件的多选状态，每次事件行为都会根据此状态判断是否为多选行为
   *
   * 注意：每次选择事件之前都需要设置，因为事件完成后状态会被清除，这只在需要自定义多选按键/状态的情况下才会用到（默认情况下按 shift 会设置）
   */
  setMultiSelect(isMultiple: boolean) {
    this.selection.setMultiSelect(isMultiple);
  }

  /** 选中指定模型 */
  select(models: EntityObject[], clearExisted = true) {
    if (clearExisted) {
      this.selection.clearAllSelected(this.onUnselectHandler);
    }
    this.selection.select(models, this.onSelectHandler);
  }

  /** 取消选中指定模型 */
  unselect(models: EntityObject[]) {
    this.selection.unselect(models, this.onUnselectHandler);
  }

  /** 清除已选中模型 */
  clearAllSelected() {
    this.selection.setLayerDepth(this.modeMap[this.selection.selectMode]);
    this.selection.clearAllSelected(this.onUnselectHandler);
  }

  /** 设置选中层级深度 */
  setLayerDepth(depth: number) {
    this.selection.setLayerDepth(depth);
  }

  /** 获取选中层级深度 */
  getLayerDepth() {
    return this.selection.layerDepth;
  }

  /** 设置可选中的 entity 类型 */
  setSelectEntityTypes(types?: symbol[]) {
    this.selection.setSelectEntityTypes(types);
  }

  /** 获取可选中的 entity 类型 */
  getSelectEntityTypes() {
    return this.selection.selectEntityTypes;
  }

  onSelectHandler = (models: EntityObject[]) => {
    //
  }

  onUnselectHandler = (models: EntityObject[]) => {
    //
  }

  active(params?: ISelectCommandParams) {
    if (params) {
      const { selectMode, selectEntityTypes, hint, onSelectHandler, onUnselectHandler } = params;
      this.switchSelectMode(selectMode || ESelectMode.OVERALL);
      this.setSelectEntityTypes(selectEntityTypes);
      this.hint = hint;
      onSelectHandler && (this.onSelectHandler = onSelectHandler);
      onUnselectHandler && (this.onUnselectHandler = onUnselectHandler);
    }
  }

  protected onClick(viewEntity: ViewEntity, event: SceneEvent) {
    if ((event.event as any).shiftKey) {
      this.setMultiSelect(true);
    }
    this.selectHandler(viewEntity, EClickAction.CLICK);
  }

  protected onDBClick(viewEntity: ViewEntity) {
    this.selectHandler(viewEntity, EClickAction.DOUBLE_CLICK);
  }

  /** 选中实体通用逻辑 */
  selectHandler(viewEntity: ViewEntity, action: EClickAction) {
    if (action === EClickAction.CLICK) {
      if (!this.selection.selectEntityTypes || !this.selection.selectEntityTypes.includes(viewEntity.type)) {
        this.selection.setLayerDepth(this.modeMap[this.selection.selectMode]);
      }
    }
    const model = EntityObject.getEntityById(viewEntity.id);
    const isMultiSelect = this.selection.isMultiSelectMode;
    if (!isMultiSelect) {
      this.selection.clearAllSelected(this.onUnselectHandler);
    }
    this.hint?.unHint();
    if (!model) {
      this.selection.setLayerDepth(this.modeMap[this.selection.selectMode]);
      this.setMultiSelect(false);
      return;
    }
    if (this.selection.selectEntityTypes && !this.selection.selectEntityTypes.includes(viewEntity.type)) {
      this.selection.setLayerDepth(this.modeMap[this.selection.selectMode]);
      this.setMultiSelect(false);
      return;
    }
    if (isMultiSelect && this.getSelectedEntities().includes(model)) {
      this.unselect([model]);
      this.setMultiSelect(false);
      return;
    }
    const path = model.getParentPathChain();
    const pathLength = path.length;
    if (this.targetRootEntity !== path[0]) {
      this.selection.setLayerDepth(this.modeMap[this.selection.selectMode]);
    }
    if (pathLength > 1) {
      if (this.selection.selectMode === ESelectMode.DEFAULT) {
        this.selection.select([model], this.onSelectHandler);
      } else {
        // eslint-disable-next-line no-nested-ternary
        const index = pathLength > this.selection.layerDepth ?
          (action === EClickAction.DOUBLE_CLICK ? this.selection.layerDepth : this.selection.layerDepth - 1) :
          this.selection.layerDepth + (pathLength - this.selection.layerDepth) - 1;
        this.selection.select([path[index]], this.onSelectHandler);
      }
    } else {
      this.selection.select([path[0]], this.onSelectHandler);
    }
    this.targetRootEntity = path[0];
    this.setMultiSelect(false);
  }
}
