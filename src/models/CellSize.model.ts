export class CellSize {
  public _height = 0;
  public _width = 0;

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
