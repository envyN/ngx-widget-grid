export class CellSize {
  private _height: number = 0;
  private _width: number = 0;

  constructor(rowCount: number, columnCount: number) {
    let height = rowCount ? 100 / rowCount : 0,
      width = columnCount ? 100 / columnCount : 0;
    this._height = height;
    this._width = width;
  };

  get height() {
    return this._height;
  }

  get width() {
    return this._width;
  }
}
