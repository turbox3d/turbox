import { Mesh2D } from '@turbox3d/renderer-pixi';
import { GridHelper } from './grid-helper';

interface IGrid2dProps {
  gridWidth: number;
  cellSize?: number;
  lineWidth?: number;
  lineColor?: number;
  drawBoundaries?: boolean;
  zIndex?: number;
}

export default class Grid2d extends Mesh2D<IGrid2dProps> {
  protected view!: GridHelper;

  draw() {
    const { lineWidth = 2, lineColor = 0xffffff, drawBoundaries = true, gridWidth, cellSize = 0, zIndex = 0 } = this.props;
    this.view = new GridHelper(gridWidth, cellSize);
    this.view.lineStyle({ width: lineWidth, color: lineColor });
    this.view.drawBoundaries = drawBoundaries;
    this.view.drawGrid();
    this.view.position.set(-gridWidth / 2 + window.innerWidth / 2, -gridWidth / 2 + window.innerHeight / 2);
    this.view.zIndex = zIndex;
  }
}
