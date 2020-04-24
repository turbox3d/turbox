import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { init, isRunning } from '../core/init';

/**
 * Includes render on dom, init built-in middleware, create store, load domain global tree and so on.
 */
export function render(
  component: React.ReactElement<any>,
  querySelector: string,
  callback?: () => void
): React.ReactElement<any> {
  if (!isRunning) {
    init();
  }

  ReactDOM.render(component, document.querySelector(querySelector) as HTMLElement, callback);

  return component;
}
