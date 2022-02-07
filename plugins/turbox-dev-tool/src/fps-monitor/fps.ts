export class FPSMonitor {
  costTimes: number[] = [];
  prevTime?: number;
  raf?: number;
  maxFPS = 120;

  getAverageCostTimePerFrame() {
    const length = this.costTimes.length;
    if (!length) {
      return 0;
    }
    return this.costTimes.reduce((prev, current) => prev + current, 0) / length;
  }

  record(costTime: number) {
    this.costTimes.push(costTime);
    if (this.costTimes.length > this.maxFPS) {
      this.costTimes.shift();
    }
  }

  start(maxFPS = 120) {
    this.maxFPS = maxFPS;
    this.end();
    if (this.maxFPS === 60) {
      this.raf = requestAnimationFrame(this.monitor);
    } else {
      this.raf = window.setTimeout(this.monitor, 1000 / this.maxFPS);
    }
  }

  end() {
    if (this.maxFPS === 60) {
      this.raf && cancelAnimationFrame(this.raf);
    } else {
      this.raf && window.clearTimeout(this.raf);
    }
    this.costTimes = [];
    this.prevTime = void 0;
    this.maxFPS = 120;
  }

  monitor = () => {
    const now = performance.now();
    if (this.prevTime !== void 0) {
      this.record(now - this.prevTime);
    }
    this.prevTime = now;
    if (this.maxFPS === 60) {
      this.raf = requestAnimationFrame(this.monitor);
    } else {
      this.raf = window.setTimeout(this.monitor, 1000 / this.maxFPS);
    }
  }

  getFPS() {
    return Math.ceil(1000 / this.getAverageCostTimePerFrame());
  }
}

export const fpsMonitor = new FPSMonitor();
