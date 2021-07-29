class Emitter {
  private listeners = {};

  on(eventName: string, callback: (...args: any[]) => void) {
    const listeners = this.listeners[eventName] || [];
    listeners.push(callback);
    this.listeners[eventName] = listeners;
  }

  emit(eventName: string, ...args: any[]) {
    const listeners = this.listeners[eventName];
    if (!Array.isArray(listeners)) return;
    listeners.forEach((callback) => {
      try {
        callback.apply(this, args);
      } catch (e) {
        console.error(e);
      }
    });
  }

  off(eventName: string) {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = [];
  }
}

export const emitter = new Emitter();
