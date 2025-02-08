import { Task } from './task';
import { sortBy, nextTick } from './common';

/**
 * 任务优先级。数据越小，优先级越高
 */
export enum TaskPriority {
  /**
   * 用户行为（比如：各种交互行为）
   */
  UserAction = 0,
  /**
   * 更新领域数据
   */
  UpdateState = 1,
  /**
   * 更新 React 组件
   */
  RenderReact = 2,
  /**
   * 更新场景视图
   *
   * 暂定高优先级，因为基于之后场景组件化的机制，这一帧绘制的应该是上一帧的结果
   */
  RenderScene = -1,
}

/**
 * TODO:
 * 1. 收集这里的任务排队执行情况
 * 2. 根据搜集数据+行业中的任务切片方案来优化这边的任务执行
 */

// 存储的任务队列
let tasks: Task[] = [];

// 是否注册了任务待执行
let readyToExecute = false;

/**
 * 节流函数
 */
function throttleByFrames(func: Function, maxFPS: number) {
  const frameInterval = 1000 / maxFPS; // 计算每帧的时间间隔（毫秒）
  let lastTime = 0;

  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastTime >= frameInterval) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 执行任务队列
 */
function executeTask() {
  // 得到排序后的当前任务队列
  const currentTasks = sortBy(tasks, task => task.priority);
  // 清空存储的数据
  tasks = [];

  // 按顺序执行当前任务队列
  currentTasks.forEach((task) => {
    const { fn } = task;
    fn();
  });

  readyToExecute = false;
}

/**
 * throttle 函数执行为每帧一次
 * @param func 要执行的函数
 * @param priority 优先级
 */
export function throttleInAFrame<T extends(...args: any[]) => void>(func: T, priority: number = TaskPriority.UserAction, maxFPS = 60): T {
  let cacheArgs;
  let isPending = false;

  function execute() {
    isPending = false;
    func(...cacheArgs);
  }

  const f = throttleByFrames((...args: any[]) => {
    cacheArgs = args;
    if (!isPending) {
      isPending = true;
      tasks.push(Task.createTask(execute, priority));
      if (!readyToExecute) {
        readyToExecute = true;
        nextTick(executeTask);
      }
    }
  }, maxFPS);

  return f as T;
}
