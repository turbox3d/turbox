class Task {
  static createTask(fn: Function, priority: number) {
    return new Task(fn, priority);
  }

  fn: Function;
  priority: number;

  constructor(fn: Function, priority: number) {
    this.fn = fn;
    this.priority = priority;
  }
}

export { Task };
