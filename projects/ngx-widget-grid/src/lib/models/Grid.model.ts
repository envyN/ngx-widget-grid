import { CellSize } from './CellSize.model';
import { WidgetConfig } from './WidgetConfig.model';

export class Grid {
  private _widgets: WidgetConfig[] = [];
  private _rows = 3;
  private _columns = 3;
  private _cellSize: CellSize;

  constructor(rows?: number, columns?: number) {
    if (+rows) {
      this._rows = +rows;
    }
    if (+columns) {
      this._columns = +columns;
    }
    this._cellSize = new CellSize(this._rows, this._columns);
  }

  get widgets() {
    return this._widgets;
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

  add(widget: WidgetConfig) {
    this._widgets.push(widget);
  }

  remove(widget: WidgetConfig) {
    const widgetIndex = this._widgets.indexOf(widget);
    if (widgetIndex > -1) {
      this._widgets.splice(widgetIndex, 1);
    }
  }

  removeAll() {
    this._widgets.splice(0);
  }

  hasWidget(widget: WidgetConfig) {
    const widgetIndex = this._widgets.indexOf(widget);
    return widgetIndex > -1;
  }

  resize(rows: number, columns: number) {
    columns = +columns || 0;
    rows = +rows || 0;

    if (columns > 0 && rows > 0 && columns !== this._columns || rows !== this._rows) {
      this._columns = columns;
      this._rows = rows;
      this._cellSize = new CellSize(this._rows, this._columns);
    }
  }
}
