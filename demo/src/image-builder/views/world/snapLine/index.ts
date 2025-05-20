import { Reactive, Component, g, Line2d } from '@turbox3d/turbox';
import { imageBuilderStore } from '../../../models';
import { RED } from '../../../common/consts/color';

@Reactive
export class SnapLine extends Component {
  render() {
    return [
      ...imageBuilderStore.scene.snapLines.map((sl, index) => g(Line2d, {
        key: `snapLine-${index}`,
        start: sl[0],
        end: sl[1],
        lineWidth: 1,
        lineColor: RED,
      })),
    ];
  }
}
