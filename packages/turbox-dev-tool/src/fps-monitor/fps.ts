export class FPSMonitor {
  costTimes: number[] = [];
  prevTime?: number;
  raf?: number;

  getAverageCostTimePerFrame() {
    const length = this.costTimes.length;
    if (!length) {
      return 0;
    }
    return this.costTimes.reduce((prev, current) => prev + current, 0) / length;
  }

  record(costTime: number) {
    this.costTimes.push(costTime);
    if (this.costTimes.length > 60) {
      this.costTimes.shift();
    }
  }

  start() {
    this.end();
    this.raf = requestAnimationFrame(this.monitor);
  }

  end() {
    this.raf && cancelAnimationFrame(this.raf);
    this.costTimes = [];
    this.prevTime = void 0;
  }

  monitor = () => {
    const now = performance.now();
    if (this.prevTime !== void 0) {
      this.record(now - this.prevTime);
    }
    this.prevTime = now;
    this.raf = requestAnimationFrame(this.monitor);
  }

  getFPS() {
    const frame = Math.ceil(1000 / this.getAverageCostTimePerFrame());
    return Math.min(frame, 60);
  }
}

export const fpsMonitor = new FPSMonitor();
