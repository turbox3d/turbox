import { Reactive, Component, g, Rect2d, MathUtils } from '@turbox3d/turbox';
import { RenderOrder } from '../../../common/consts/scene';
import { appCommandManager } from '../../../commands';
import { BLUE } from '../../../common/consts/color';

@Reactive
export class HintLine extends Component {
  render() {
    const hinted = appCommandManager.default.hint.getHintedEntity();
    return [
      hinted &&
        g(Rect2d, {
          key: 'wireframe',
          x: hinted.position.x,
          y: hinted.position.y,
          width: hinted.size.x,
          height: hinted.size.y,
          central: true,
          lineWidth: 1,
          lineColor: BLUE,
          fillAlpha: 0,
          alignment: 1,
          rotation: hinted.rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
        }),
    ];
  }
}
