import * as React from 'react';
import { fpsMonitor } from './fps';

interface IProp {
  className?: string;
}

interface IState {
  fps: number;
}

export class FPSMonitorComponent extends React.Component<IProp, IState> {
  state = {
    fps: 0,
  };
  private interval?: number;

  componentDidMount() {
    fpsMonitor.start();
    this.interval = window.setInterval(() => {
      this.setState({
        fps: fpsMonitor.getFPS(),
      });
    }, 1000);
  }

  componentWillUnmount() {
    fpsMonitor.end();
    this.interval && window.clearInterval(this.interval);
  }

  render() {
    const { className } = this.props;
    let color: string;
    if (this.state.fps >= 40) {
      color = '#00cc00';
    } else if (this.state.fps >= 20) {
      color = '#fdea42';
    } else {
      color = '#ff0000';
    }

    return (
      <div className={className || ''}>
        FPS：<span style={{ color }}>{this.state.fps}</span>
      </div>
    );
  }
}
