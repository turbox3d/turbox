import { Mesh2D } from '@byted-tx3d/turbox';

import { GridHelper } from '../common/utils/grid-helper';

interface IProps {
  gridWidth: number;
  cellSize?: number;
  lineWidth?: number;
  lineColor?: number;
  drawBoundaries?: boolean;
}

export class Grid extends Mesh2D<IProps> {
  protected view!: GridHelper;

  draw() {
    const { lineWidth = 2, lineColor = 0xffffff, drawBoundaries = true, gridWidth, cellSize } = this.props;
    this.view = new GridHelper(gridWidth, cellSize);
    this.view.lineStyle({ width: lineWidth, color: lineColor });
    this.view.drawBoundaries = drawBoundaries;
    this.view.drawGrid();
    this.view.position.set(-gridWidth / 2 + window.innerWidth / 2, -gridWidth / 2 + window.innerHeight / 2);
  }
}
