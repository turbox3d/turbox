import * as ReactDOM from 'react-dom';
import * as React from 'react';

/** 渲染插件应用视图 */
export function renderPluginView(Target: React.ComponentType, pluginId: string) {
  const el = document.getElementById(`turbox-plugin-${pluginId}`);
  let containerNode: HTMLElement;
  if (el) {
    containerNode = el;
  } else {
    containerNode = document.createElement('div');
    containerNode.id = `turbox-plugin-${pluginId}`;
    containerNode.className = `turbox-plugin-${pluginId}-class`;
    document.body.appendChild(containerNode);
  }
  ReactDOM.render(React.createElement(Target), containerNode);
}
