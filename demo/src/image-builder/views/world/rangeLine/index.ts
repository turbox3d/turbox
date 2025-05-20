import { Reactive, Component, g, Rect2d, MathUtils } from '@turbox3d/turbox';
import { imageBuilderStore } from '../../../models';
import { RED } from '../../../common/consts/color';
import { RenderOrder } from '../../../common/consts/scene';

@Reactive
export class RangeLine extends Component {
  render() {
    const showInvalidRangeFrame = imageBuilderStore.scene.isShowInvalidRangeFrame();
    const frames = imageBuilderStore.document.getFrameEntities();
    return [
      showInvalidRangeFrame &&
        g(Rect2d, {
          key: 'range-wireframe',
          width: frames[0].size.x,
          height: frames[0].size.y,
          x: frames[0].position.x,
          y: frames[0].position.y,
          rotation: frames[0].rotation.z * MathUtils.DEG2RAD,
          zIndex: RenderOrder.GIZMO,
          central: true,
          lineWidth: 1,
          lineColor: RED,
          fillAlpha: 0,
          alignment: 1,
        }),
    ];
  }
}
