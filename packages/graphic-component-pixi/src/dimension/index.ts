import { Mesh2D } from '@turbox3d/renderer-pixi';
import { SceneEvent, ViewEntity } from '@turbox3d/event-manager';
import * as PIXI from 'pixi.js';
import { drawText, generateDimData } from '../_utils/utils';

interface IProps {
  data: IDimensionData[];
  editableTextPs?: IXY[]; // 需要隐藏文字的位置
  clickCallback?: Function;
}
interface IDimensionData {
  bbox: IXY[]; // 包围盒
  innerVX: number[]; // 竖直构件端点
  innerHY: number[]; // 水平构件端点
}
interface ILineData {
  p0: IXY;
  p1: IXY;
}
interface IText {
  roundLength: number;
  params: {
    offset: IXY;
    size: number;
    rotation: number;
  };
  endPoints: ILineData;
}
interface IXY {
  x: number;
  y: number;
}

const DIM_OFFSET = 80;
const DIM_INTERNAL = 80;
const textH = 40;
const textOffsetK = 1;// 标注垂直于文字方向偏移系数,分母为文字尺寸

export default class Dimension extends Mesh2D<IProps> {
  protected view = new PIXI.Container();
  private _interactContainer = new PIXI.Container();
  // public componentWillReceiveProps(para1,para2){
  //   console.warn(para1,para2)
  // }
  private graphic2endPsMap: Map<PIXI.Graphics, IText> = new Map();
  public draw() {
    this.view.removeChildren();
    const graphics = new PIXI.Graphics();
    this.view.addChild(graphics);
    this._interactContainer.removeChildren();
    this.view.addChild(this._interactContainer);

    // processedData 数据格式 { p0: { x: 1300, y: 2250 }, p1: { x: 2700, y: 2250 } },
    const textInfo: IText[] = [];
    const processedData = this.processData();

    graphics.lineStyle(1, 0x131313);
    graphics.line.native = true;
    for (let i = 0; i < processedData.length; i++) {
      const { data, angle, length } =
        generateDimData(processedData[i].p0.x, processedData[i].p0.y, processedData[i].p1.x, processedData[i].p1.y);

      const roundLength = Math.round(length);
      if (roundLength === 0) {
        // eslint-disable-next-line no-continue
        continue;
      }

      for (let j = 0; j < data.length; j += 2) {
        graphics.moveTo(data[j].x, data[j].y);
        graphics.lineTo(data[j + 1].x, data[j + 1].y);
      }

      const center = {
        x: (processedData[i].p0.x + processedData[i].p1.x) / 2,
        y: (processedData[i].p0.y + processedData[i].p1.y) / 2,
      };
      const textOffsetDir = { x: -Math.sin(angle), y: Math.cos(angle) };
      center.x += textOffsetK * textH * textOffsetDir.x;
      center.y += textOffsetK * textH * textOffsetDir.y;
      textInfo.push({ roundLength, params: { offset: { x: center.x, y: center.y }, size: textH, rotation: angle }, endPoints: { p0: processedData[i].p0, p1: processedData[i].p1 } });
    }

    // delete text data
    if (this.props.editableTextPs) {
      this.props.editableTextPs.forEach((p) => {
        let nearestD2 = Infinity;
        let nearestIndex = -1;
        textInfo.forEach((info, i) => {
          const tempD2 = (p.x - info.params.offset.x) ** 2 + (p.y - info.params.offset.y) ** 2;
          if (tempD2 < nearestD2) {
            nearestD2 = tempD2;
            nearestIndex = i;
          }
        });
        textInfo.splice(nearestIndex, 1); // delete nearest text
      });
    }

    // draw text
    graphics.lineStyle(0);
    textInfo.forEach(info => {
      drawText(graphics, info.roundLength, info.params);

      const interactGraphics = new PIXI.Graphics();
      interactGraphics.lineStyle(0);
      interactGraphics.beginFill(0x00ff00, 0.0001);
      const halfH = info.params.size / 2; const halfW = info.roundLength.toString().length * 0.8 * halfH;
      interactGraphics.drawRect(-halfW, -halfH, 2 * halfW, 2 * halfH);
      interactGraphics.position.set(info.params.offset.x, info.params.offset.y);
      interactGraphics.endFill();
      interactGraphics.rotation = info.params.rotation;
      this._interactContainer.addChild(interactGraphics);
      this.graphic2endPsMap.set(interactGraphics, info);
    });
  }
  protected onClickable() {
    return true;
  }
  protected onClick = (v: Partial<ViewEntity>, e: SceneEvent<any>) => {
    let targetG = this._interactContainer.children[0];
    this._interactContainer.children.forEach(c => {
      if (this._distance2(c.position, e.getScenePosition()) < this._distance2(targetG.position, e.getScenePosition())) targetG = c;
    });
    this.props.clickCallback?.(this.graphic2endPsMap.get(targetG as PIXI.Graphics));
  }

  private _distance2(p0: PIXI.IPointData, p1: PIXI.IPointData) {
    return (p0.x - p1.x) ** 2 + (p0.y - p1.y) ** 2;
  }
  /**
   * @description: 矩形交错网格构件上获取标注端点坐标数组
   *
   *       3-------------A------------2
   *       |             |            |
   *       |             |            |
   *       |             |            |
   *       C-------------B------------D
   *       |                          |
   *       |                          |
   *       |                          |
   *       0--------------------------1
   *
   *      bbox是整个构件的包围盒四个点
   *      AB是内插的竖直构件，上方的标注需要体现其水平X位置，
   *      CD是内插的水平构件，右方标注需要体现其竖直Y位置
   */
  private processData() {
    let lineData: ILineData[] = [
      // { p0: { x: 1300, y: 2250 }, p1: { x: 2700, y: 2250 } },
    ];

    // 遍历窗
    this.props.data.forEach((data) => {
      const oneBlockLineData: ILineData[] = [];

      const { bbox, innerHY, innerVX } = data;

      // 计算最外围标注
      // 有内插标注则则最外围标注有额外偏移
      const interHK = innerVX.length ? 1 : 0;
      const interVK = innerHY.length ? 1 : 0;
      // 上方横
      oneBlockLineData.push({
        p0: { x: bbox[3].x, y: bbox[3].y + DIM_OFFSET + interHK * DIM_INTERNAL },
        p1: { x: bbox[2].x, y: bbox[3].y + DIM_OFFSET + interHK * DIM_INTERNAL },
      });
      // 右侧竖
      oneBlockLineData.push({
        p0: { x: bbox[1].x + DIM_OFFSET + interVK * DIM_INTERNAL, y: bbox[2].y },
        p1: { x: bbox[1].x + DIM_OFFSET + interVK * DIM_INTERNAL, y: bbox[1].y },
      });

      // 竖直构件x排序
      if (innerVX.length) {
        let PX: number[] = [bbox[3].x, bbox[2].x];
        PX = PX.concat(innerVX);
        PX.sort((a, b) => a - b);
        for (let i = 0; i < PX.length - 1; i++) {
          oneBlockLineData.push({
            p0: { x: PX[i], y: bbox[2].y + DIM_OFFSET },
            p1: { x: PX[i + 1], y: bbox[2].y + DIM_OFFSET },
          });
        }
      }

      // 水平构件y排序
      if (innerHY.length) {
        let PY: number[] = [bbox[2].y, bbox[1].y];
        PY = PY.concat(innerHY);
        PY.sort((a, b) => b - a);
        for (let i = 0; i < PY.length - 1; i++) {
          oneBlockLineData.push({
            p0: { x: bbox[1].x + DIM_OFFSET, y: PY[i] },
            p1: { x: bbox[1].x + DIM_OFFSET, y: PY[i + 1] },
          });
        }
      }
      lineData = lineData.concat(oneBlockLineData);
    });

    return lineData;
  }
}
