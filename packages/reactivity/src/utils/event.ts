export class Emitter {
  private listeners = {};

  on(eventName: string, callback: (...args: any[]) => void) {
    const listeners = this.listeners[eventName] || [];
    listeners.push(callback);
    this.listeners[eventName] = listeners;
  }

  emit(eventName: string) {
    const args = Array.prototype.slice.apply(arguments).slice(1);
    const listeners = this.listeners[eventName];
    const self = this;
    if (!Array.isArray(listeners)) return;
    listeners.forEach(function (callback) {
      try {
        callback.apply(self, args);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
