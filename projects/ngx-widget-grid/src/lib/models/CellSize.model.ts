export class CellSize {
  private _height = 0;
  private _width = 0;

  constructor(rowCount: number, columnCount: number) {
    this._height = rowCount ? 100 / rowCount : 0;
    this._width = columnCount ? 100 / columnCount : 0;
  };

  get height() {
    return this._height;
  }

  get width() {
    return this._width;
  }
}
