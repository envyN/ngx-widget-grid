import { Grid } from './Grid.model';
import { Cell } from './Cell.model';
import { Utils } from '../Utils';
import { Rectangle } from './Rectangle.model';
import { WidgetConfig } from './WidgetConfig.model';

export class GridRenderer {
  public positions: { [key: string]: Rectangle } = {};
  public cachedNextPosition: Rectangle;
  public obstructions: string[] = [];
  public _grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid || new Grid();

  }

  get grid() {
    return this._grid;
  }

  set grid(grid: Grid) {
    this._grid = grid;
    this.positions = {};
    this.cachedNextPosition = undefined;
    this.obstructions = [];
    for (let i = 0; i < grid.rows * grid.columns; i++) {
      this.obstructions[i] = null;
    }
  }

  rasterizeCoords(left: number, top: number, gridWidth: number, gridHeight: number): Cell {
    left = Math.min(Math.max(left, 0), gridWidth - 1);
    top = Math.min(Math.max(top, 0), gridHeight - 1);

    const x = Math.floor(top / gridHeight * this.grid.rows) + 1;
    const y = Math.floor(left / gridWidth * this.grid.columns) + 1;
    return new Cell(x, y);
  }

  getWidgetIdAt(i: number, j: number) {
    for (const widgetId in this.positions) {
      if (this.positions.hasOwnProperty(widgetId)) {
        const position = this.positions[widgetId];

        if (position.top <= i && i <= (position.top + position.height - 1) &&
          position.left <= j && j <= (position.left + position.width - 1)) {
          return widgetId;
        }
      }
    }
    return null;
  }

  getWidgetPosition(widgetId: string) {
    return this.positions[widgetId];
  }

  setWidgetPosition(widgetId: string, newPosition: Rectangle, swappingPositions: boolean) {
    const currPosition = this.positions[widgetId];
    if (currPosition && !swappingPositions) {
      this.setObstructionValues(currPosition, null);
    }

    newPosition = new Rectangle({
                                  top: Utils.isNumber(newPosition.top) ? newPosition.top : currPosition.top,
                                  left: Utils.isNumber(newPosition.left) ? newPosition.left : currPosition.left,
                                  width: Utils.isNumber(newPosition.width) ? newPosition.width : currPosition.width,
                                  height: Utils.isNumber(newPosition.height) ? newPosition.height : currPosition.height
                                });
    this.positions[widgetId] = newPosition;

    this.setObstructionValues(this.positions[widgetId], widgetId);
    this.cachedNextPosition = undefined;
  }

  hasSpaceLeft() {
    for (const obstruction of this.obstructions) {
      if (obstruction === null) {
        return true;
      }
    }
    return false;
  }

  getNextPosition(): Rectangle {
    if (this.cachedNextPosition !== undefined) {
      return this.cachedNextPosition;
    }

    if (!this.hasSpaceLeft()) {
      return null;
    }

    const maxPosition: Rectangle = this.findLargestEmptyArea();
    this.cachedNextPosition = maxPosition;
    return maxPosition;
  }

  isObstructed(i: number, j: number, excludedArea?: Rectangle) {
    // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
    if (i < 1 || j < 1 || j > this.grid.columns || i > this.grid.rows) {
      return true;
    }
    const bottom = excludedArea && excludedArea.top + excludedArea.height - 1;
    const right = excludedArea && excludedArea.left + excludedArea.width - 1;
    // pass if (i, j) is within the excluded area, if any
    if (excludedArea &&
      excludedArea.top <= i &&
      i <= bottom &&
      excludedArea.left <= j &&
      j <= right) {
      return false;
    }

    return this._isObstructed(i, j);
  }

  public _isObstructed(i: number, j: number) {
    return this.obstructions[(i - 1) * this.grid.columns + (j - 1)] !== null;
  }

  isAreaObstructed(area: Rectangle,
                   options?: {
                     excludedArea?: Rectangle;
                     fromBottom?: boolean;
                     fromRight?: boolean;
                   }) {
    if (!area) {
      return false;
    }
    options = Utils.isObject(options) ? options : {};

    const top = area.top;
    const left = area.left;
    const bottom = area.bottom || area.top + area.height - 1;
    const right = area.right || area.left + area.width - 1;

    if (!Utils.isNumber(top) || !Utils.isNumber(left) || !Utils.isNumber(bottom) || !Utils.isNumber(right)) {
      return false;
    }

    const verticalStart = options.fromBottom ? bottom : top;
    const verticalStep = options.fromBottom ? -1 : 1;
    const verticalEnd = (options.fromBottom ? top : bottom) + verticalStep;
    const horizontalStart = options.fromRight ? right : left;
    const horizontalStep = options.fromRight ? -1 : 1;
    const horizontalEnd = (options.fromRight ? left : right) + horizontalStep;

    for (let i = verticalStart; i !== verticalEnd; i += verticalStep) {
      for (let j = horizontalStart; j !== horizontalEnd; j += horizontalStep) {
        if (this.isObstructed(i, j, options.excludedArea)) {
          return true;
        }
      }
    }
    return false;
  }

  getStyle(widgetId: string): {
    display: string;
  } | {
    top: string;
    height: string;
    left: string;
    width: string;
  } {
    const render = this.positions[widgetId];

    if (!render) {
      return {display: 'none'};
    }

    return {
      top: ((render.top - 1) * this.grid.cellSize.height).toString() + '%',
      height: (render.height * this.grid.cellSize.height).toString() + '%',
      left: ((render.left - 1) * this.grid.cellSize.width).toString() + '%',
      width: (render.width * this.grid.cellSize.width).toString() + '%'
    };
  }

  setObstructionValues(area: Rectangle, value: string) {
    for (let i = area.top - 1; i < area.top + area.height - 1; i++) {
      for (let j = area.left - 1; j < area.left + area.width - 1; j++) {
        this.obstructions[i * this.grid.columns + j] = value;
      }
    }
  }

  findLargestEmptyArea(): Rectangle {
    let maxArea: Rectangle = null;
    let currMaxArea: Rectangle = null;
    let maxSurfaceArea = 0;
    let currMaxSurfaceArea = 0;
    for (let i = 1; i <= this.grid.rows; i++) {
      for (let j = 1; j <= this.grid.columns; j++) {
        if (this._isObstructed(i, j)) {
          continue;
        }

        const currAreaLimit = (this.grid.rows - i + 1) * (this.grid.columns - j + 1);
        if (currAreaLimit < maxSurfaceArea) {
          break;
        }

        currMaxArea = this._findLargestEmptyAreaFrom(new Cell(i, j));
        currMaxSurfaceArea = currMaxArea.getSurfaceArea();

        if (currMaxSurfaceArea > maxSurfaceArea) {
          maxSurfaceArea = currMaxSurfaceArea;
          maxArea = currMaxArea;
        }
      }
    }
    return maxArea;
  }

  public _findLargestEmptyAreaFrom(start: Cell) {
    if (!Utils.isDefined(this.grid) || !Utils.isNumber(this.grid.columns) || !Utils.isNumber(this.grid.rows)) {
      return null;
    }

    let maxArea = null,
      maxSurfaceArea = 0,
      endColumn = this.grid.columns;
    for (let i = start.top; i <= this.grid.rows; i++) {
      for (let j = start.left; j <= endColumn; j++) {
        if (this._isObstructed(i, j)) {
          endColumn = j - 1;
          continue;
        }

        const currHeight = (i - start.top + 1);
        const currWidth = (j - start.left + 1);
        const currSurfaceArea = currHeight * currWidth;

        if (currSurfaceArea > maxSurfaceArea) {
          maxSurfaceArea = currSurfaceArea;
          maxArea = new Rectangle({
                                    top: start.top,
                                    left: start.left,
                                    width: currWidth,
                                    height: currHeight
                                  });
        }
      }
    }
    return maxArea;
  }

  render(grid: Grid, emitWidgetPositionUpdated?: Function) {
    this.grid = grid;
    const widgets: WidgetConfig[] = this.grid && this.grid.widgets ? this.grid.widgets : [];
    const unpositionedWidgets: WidgetConfig[] = [];
    widgets.forEach((widget: WidgetConfig) => {
      const position: Rectangle = widget.position;
      if (position.width * position.height === 0 ||
        this.isAreaObstructed(position)) {
        unpositionedWidgets.push(widget);
      } else {
        this.setWidgetPosition(widget.id, position, false);
      }
    });

    unpositionedWidgets.forEach((widget: WidgetConfig) => {
      const nextPosition = this.getNextPosition();
      if (nextPosition !== null) {
        widget.position = nextPosition;
        this.setWidgetPosition(widget.id, nextPosition, false);
      } else {
        widget.position = new Rectangle();
        this.setWidgetPosition(widget.id, new Rectangle(), false);
      }
      if (emitWidgetPositionUpdated) {
        emitWidgetPositionUpdated(widget);
      }
    });
  }
}
