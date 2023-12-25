class Task {
  static createTask(fn: Function, priority: number) {
    return new Task(fn, priority);
  }

  // eslint-disable-next-line no-useless-constructor
  constructor(public fn: Function, public priority: number) {
    //
  }
}

export { Task };
