import {CellSize} from "./CellSize.model";
import {WidgetConfig} from "./WidgetConfig.model";
export class Grid {
    private _widgets: WidgetConfig[] = [];
    private _rows: number = 3;
    private _columns: number = 3;
    private _cellSize: CellSize;

    constructor(rows?: number, columns?: number) {
        if (rows) {
            this._rows = rows;
        }
        if (columns) {
            this._columns = columns;
        }
        this._cellSize = new CellSize(this._rows, this._columns);
    }

    get rows() {
        return this._rows;
    }

    get columns() {
        return this._columns;
    }

    get cellSize() {
        return this._cellSize;
    }

    get widgets() {
        return this._widgets;
    }

    add(widget: WidgetConfig) {
        this._widgets.push(widget);
    }

    remove(widget: WidgetConfig) {
        let widgetIndex = this._widgets.indexOf(widget);
        if (widgetIndex > -1) {
            this._widgets.splice(widgetIndex, 1);
        }
    }

    hasWidget(widget: WidgetConfig) {
        let widgetIndex = this._widgets.indexOf(widget);
        return widgetIndex > -1;
    }

    resize(rows: number, columns: number) {
        columns = columns || 0;
        rows = rows || 0;

        if (columns > 0 && rows > 0 && columns !== this._columns || rows !== this._rows) {
            this._columns = columns;
            this._rows = rows;
            this._cellSize = new CellSize(this._rows, this._columns);
        }

    }
}
