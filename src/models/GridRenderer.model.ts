import {Grid} from "./Grid.model";
import {GridPoint} from "./GridPoint.model";
import {Utils} from "../Utils";
import {GridRectangle} from "./GridRectangle.model";
import {WidgetConfig} from "./WidgetConfig.model";
export class GridRenderer {
    public _grid: Grid;
    set grid(grid: Grid) {
        this._grid = grid;
        this.positions = {};
        this.cachedNextPosition = undefined;
        this.obstructions = [];
        for (let i = 0; i < grid.rows * grid.columns; i++) {
            this.obstructions[i] = 0;
        }
    }

    get grid() {
        return this._grid;
    }

    public positions: any = {};
    public cachedNextPosition: GridRectangle;
    public obstructions: any[] = [];

    constructor(grid: Grid) {
        this.grid = grid || new Grid();

    }

    rasterizeCoords(left: number, top: number, gridWidth: number, gridHeight: number) {
        left = Math.min(Math.max(left, 0), gridWidth - 1);
        top = Math.min(Math.max(top, 0), gridHeight - 1);

        let x = Math.floor(top / gridHeight * this.grid.rows) + 1,
            y = Math.floor(left / gridWidth * this.grid.columns) + 1;
        return new GridPoint(x, y);
    }

    getWidgetIdAt(i: number, j: number) {
        for (let widgetId in this.positions) {
            let position = this.positions[widgetId];

            if (position.top <= i && i <= (position.top + position.height - 1) &&
                position.left <= j && j <= (position.left + position.width - 1)) {
                return widgetId;
            }
        }
        return null;
    }

    getWidgetPosition(widget: WidgetConfig) {
        return this.positions[widget.getId()];
    }

    setWidgetPosition(widgetId: string, newPosition: GridRectangle) {
        let currPosition = this.positions[widgetId];
        if (currPosition) {
            this.setObstructionValues(currPosition, 0);
        }

        newPosition = new GridRectangle({
            top: Utils.isNumber(newPosition.top) ? newPosition.top : currPosition.top,
            left: Utils.isNumber(newPosition.left) ? newPosition.left : currPosition.left,
            width: Utils.isNumber(newPosition.width) ? newPosition.width : currPosition.width,
            height: Utils.isNumber(newPosition.height) ? newPosition.height : currPosition.height,
        });
        this.positions[widgetId] = newPosition;

        this.setObstructionValues(this.positions[widgetId], 1);
        this.cachedNextPosition = undefined;
    }

    hasSpaceLeft() {
        for (let i = 0; i < this.obstructions.length; i++) {
            if (!this.obstructions[i]) {
                return true;
            }
        }
        return false;
    }

    getNextPosition(): GridRectangle {
        if (this.cachedNextPosition !== undefined) {
            return this.cachedNextPosition;
        }

        if (!this.hasSpaceLeft()) {
            return null;
        }

        let maxPosition: GridRectangle = this.findLargestEmptyArea();
        this.cachedNextPosition = maxPosition;
        return maxPosition;
    }

    isObstructed(i: number, j: number, excludedArea?: GridRectangle) {
        // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
        if (i < 1 || j < 1 || j > this.grid.columns || i > this.grid.rows) {
            return true;
        }
        let bottom = excludedArea && excludedArea.top + excludedArea.height - 1;
        let right = excludedArea && excludedArea.left + excludedArea.width - 1;
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
        return this.obstructions[(i - 1) * this.grid.columns + (j - 1)] === 1;
    }

    isAreaObstructed(area: GridRectangle, options?: any) {
        if (!area) {
            return false;
        }
        options = Utils.isObject(options) ? options : {};

        let top = area.top,
            left = area.left,
            bottom = area.bottom || area.top + area.height - 1,
            right = area.right || area.left + area.width - 1;

        if (!Utils.isNumber(top) || !Utils.isNumber(left) || !Utils.isNumber(bottom) || !Utils.isNumber(right)) {
            return false;
        }

        let verticalStart = options.fromBottom ? bottom : top,
            verticalStep = options.fromBottom ? -1 : 1,
            verticalEnd = (options.fromBottom ? top : bottom) + verticalStep;
        let horizontalStart = options.fromRight ? right : left,
            horizontalStep = options.fromRight ? -1 : 1,
            horizontalEnd = (options.fromRight ? left : right) + horizontalStep;

        for (let i = verticalStart; i !== verticalEnd; i += verticalStep) {
            for (let j = horizontalStart; j !== horizontalEnd; j += horizontalStep) {
                if (this.isObstructed(i, j, options.excludedArea)) {
                    return true;
                }
            }
        }
        return false;
    }

    getStyle(widgetId: string): any {
        let render = this.positions[widgetId];

        if (!render) {
            return {'display': 'none'};
        }

        return {
            top: ((render.top - 1) * this.grid.cellSize.height).toString() + '%',
            height: (render.height * this.grid.cellSize.height).toString() + '%',
            left: ((render.left - 1) * this.grid.cellSize.width).toString() + '%',
            width: (render.width * this.grid.cellSize.width).toString() + '%'
        };
    }

    setObstructionValues(area: GridRectangle, value: number) {
        for (let i = area.top - 1; i < area.top + area.height - 1; i++) {
            for (let j = area.left - 1; j < area.left + area.width - 1; j++) {
                this.obstructions[i * this.grid.columns + j] = value;
            }
        }
    }

    findLargestEmptyArea(): GridRectangle {
        let maxArea = null, currMaxArea = null,
            maxSurfaceArea = 0, currMaxSurfaceArea = 0;
        for (let i = 1; i <= this.grid.rows; i++) {
            for (let j = 1; j <= this.grid.columns; j++) {
                if (this._isObstructed(i, j)) {
                    continue;
                }

                let currAreaLimit = (this.grid.rows - i + 1) * (this.grid.columns - j + 1);
                if (currAreaLimit < maxSurfaceArea) {
                    break;
                }

                currMaxArea = this._findLargestEmptyAreaFrom(new GridPoint(i, j));
                currMaxSurfaceArea = currMaxArea.getSurfaceArea();

                if (currMaxSurfaceArea > maxSurfaceArea) {
                    maxSurfaceArea = currMaxSurfaceArea;
                    maxArea = currMaxArea;
                }
            }
        }
        return maxArea;
    }

    public _findLargestEmptyAreaFrom(start: GridPoint) {
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

                let currHeight = (i - start.top + 1),
                    currWidth = (j - start.left + 1),
                    currSurfaceArea = currHeight * currWidth;

                if (currSurfaceArea > maxSurfaceArea) {
                    maxSurfaceArea = currSurfaceArea;
                    maxArea = new GridRectangle({
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
        let widgets: WidgetConfig[] = this.grid && this.grid.widgets ? this.grid.widgets : [];
        let unpositionedWidgets: WidgetConfig[] = [];
        widgets.forEach((widget: WidgetConfig) => {
            let position: GridRectangle = widget.position;
            if (position.width * position.height === 0 ||
                this.isAreaObstructed(position)) {
                unpositionedWidgets.push(widget);
            } else {
                this.setWidgetPosition(widget.getId(), position);
            }
        });

        unpositionedWidgets.forEach((widget: WidgetConfig) => {
            let nextPosition = this.getNextPosition();
            if (nextPosition !== null) {
                widget.position = nextPosition;
                this.setWidgetPosition(widget.getId(), nextPosition);
            } else {
                widget.position = new GridRectangle();
                this.setWidgetPosition(widget.getId(), new GridRectangle());
            }
            if (emitWidgetPositionUpdated) {
                emitWidgetPositionUpdated(widget);
            }
        });

    }

}
