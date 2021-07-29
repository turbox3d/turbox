import { Task } from './task';
import { sortBy } from './common';

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
 * 执行任务队列
 */
function executeTask() {
  if (readyToExecute) {
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
}

/**
 * 将任务添加到队列中
 * @param fn 任务的执行函数
 * @param priority 任务优先级
 */
function pushTask(fn: Function, priority: number) {
  tasks.push(Task.createTask(fn, priority));
  if (!readyToExecute) {
    readyToExecute = true;
    requestAnimationFrame(executeTask);
  }
}

/**
 * throttle 函数执行为每帧一次
 * @param func 要执行的函数
 * @param priority 优先级
 */
export function throttleInAFrame<T extends(...args: any[]) => void>(func: T, priority: number = TaskPriority.UserAction): T {
  let cacheArgs;
  let isPending = false;

  function execute() {
    isPending = false;
    func(...cacheArgs);
  }

  return function (...args: any[]) {
    cacheArgs = args;

    if (!isPending) {
      isPending = true;
      pushTask(execute, priority);
    }
  } as T;
}
