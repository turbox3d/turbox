import { config, Domain, mutation, reactor, TimeTravel, HistoryOperationType, Action } from '@turbox3d/reactivity';
import { warn } from '@turbox3d/shared';
import EntityObject from '../entity-object/index';

export default class DocumentSystem extends Domain {
  @reactor() models: Map<string, EntityObject> = new Map();

  @reactor(false, false) loading = false;

  @reactor(false, false) undoable = false;

  @reactor(false, false) redoable = false;

  @reactor(false, false) disableUndoRedo = false;

  maxStepNumber = 20;
  name = 'document';

  initDomainContext() {
    return {
      isNeedRecord: true,
    };
  }

  /** 添加模型 */
  @mutation
  addModel(model: EntityObject | EntityObject[]) {
    const add = (m: EntityObject) => {
      if (this.models.has(m.id)) {
        return;
      }
      this.models.set(m.id, m);
    };
    if (Array.isArray(model)) {
      model.forEach(m => add(m));
      return;
    }
    add(model);
  }

  /** 删除模型 */
  @mutation
  removeModel(model: EntityObject | EntityObject[]) {
    if (Array.isArray(model)) {
      model.forEach(m => this.removeModelById(m.id));
      return;
    }
    this.removeModelById(model.id);
  }

  /** 根据 id 删除模型 */
  @mutation
  removeModelById(id: string | string[]) {
    if (Array.isArray(id)) {
      id.forEach(i => this.models.delete(i));
      return;
    }
    this.models.delete(id);
  }

  /** 清空所有模型 */
  @mutation
  clear() {
    this.models.clear();
  }

  /** 查找模型 */
  findModel(model: EntityObject | EntityObject[]) {
    if (Array.isArray(model)) {
      return model.map(m => this.findModelById(m.id)) as (EntityObject | undefined)[];
    }
    return this.findModelById(model.id) as EntityObject | undefined;
  }

  /** 根据 id 查找模型 */
  findModelById(id: string | string[]) {
    if (Array.isArray(id)) {
      return id.map(i => this.models.get(i));
    }
    return this.models.get(id);
  }

  /** 创建操作历史记录 */
  createTimeTravel(name: string, maxStepNumber = 20) {
    if (TimeTravel.get(name)) {
      warn(`Time travel ${name} already exists.`);
      return;
    }
    this.name = name;
    this.maxStepNumber = maxStepNumber;
    config({
      timeTravel: {
        isActive: true,
        maxStepNumber,
      },
    });
    TimeTravel.create(name);
    TimeTravel.get(name)!.onChange = (undoable, redoable, type, action) => {
      this.updateTimeTravelStatus(undoable, redoable);
      this.historyChangeCustomHook(type, action);
    };
  }

  /** 切换到指定的历史记录 */
  applyTimeTravel() {
    TimeTravel.switch(this.name);
  }

  /** 历史记录变更会触发的自定义钩子，子类可以重写 */
  historyChangeCustomHook(type: HistoryOperationType, action?: Action) {
    //
  }

  /** 清空历史记录 */
  clearTimeTravel() {
    TimeTravel.switch(this.name);
    TimeTravel.clear();
  }

  /** 暂停记录历史 */
  pauseRecord() {
    TimeTravel.switch(this.name);
    TimeTravel.pause();
  }

  /** 继续记录历史 */
  resumeRecord() {
    TimeTravel.switch(this.name);
    TimeTravel.resume();
  }

  /** 撤销 */
  undo() {
    if (this.disableUndoRedo) {
      return;
    }
    if (!this.undoable) {
      return;
    }
    TimeTravel.switch(this.name);
    const t = TimeTravel.get(this.name);
    if (!t) {
      return;
    }
    t.undo();
  }

  /** 重做 */
  redo() {
    if (this.disableUndoRedo) {
      return;
    }
    if (!this.redoable) {
      return;
    }
    TimeTravel.switch(this.name);
    const t = TimeTravel.get(this.name);
    if (!t) {
      return;
    }
    t.redo();
  }

  /** 文档加载状态设置为加载中 */
  @mutation
  isLoading() {
    this.loading = true;
  }

  /** 文档加载状态设置为加载完成 */
  @mutation
  isLoaded() {
    this.loading = false;
  }

  /** 自动保存 */
  protected async autoSave() {
    //
  }

  /** 载入文档 */
  protected async load() {
    //
  }

  /** 保存文档 */
  protected async save() {
    //
  }

  @mutation
  private updateTimeTravelStatus(undo = false, redo = false) {
    this.undoable = undo;
    this.redoable = redo;
  }
}
