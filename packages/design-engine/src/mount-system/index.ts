import { EnvViewMounter } from './ViewMounter';
import { renderPluginView } from './renderPluginView';

export default class MountSystem {
  static EnvViewMounter = EnvViewMounter;
  static renderPluginView = renderPluginView;
}
