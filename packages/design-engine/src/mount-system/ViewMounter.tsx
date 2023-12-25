import * as React from 'react';
import { Reactive } from '@turbox3d/reactivity-react';
import EnvSystem from '../env-system/index';

interface IProps extends React.PropsWithChildren {
  /** 挂载点 */
  mountPointId?: string;
  /** 容器节点样式 */
  className?: string;
  /** 只在当前支持的环境下渲染，离开环境自动卸载 */
  environments?: string[];
  /** style */
  style?: React.CSSProperties;
  /** 切换环境时是否需要卸载 dom */
  unmountDom?: boolean;
}

@Reactive
export class EnvViewMounter extends React.Component<IProps> {
  static defaultProps = {
    className: '',
    mountPointId: '',
    environments: [],
    style: {},
    unmountDom: true,
  };

  render() {
    const { environments, className, mountPointId, style, unmountDom } = this.props;
    const matched = environments!.includes(EnvSystem.AppEnvMgr.appEnv);
    let styles = style;
    if (!matched) {
      if (unmountDom) {
        return null;
      }
      styles = {
        ...style,
        display: 'none',
      };
    }
    return (
      <div
        id={mountPointId}
        className={className}
        style={styles}
      >
        {this.props.children}
      </div>
    );
  }
}
