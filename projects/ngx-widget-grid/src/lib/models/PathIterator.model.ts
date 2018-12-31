import { Cell } from './Cell.model';
import { Rectangle } from './Rectangle.model';

export class PathIterator {
  private _start: Rectangle;
  private _heightDelta: number;
  private _widthDelta: number;
  private _steps: number;
  private _currStep: number;
  private _currPos: Cell = null;
  private _nextPos: Cell = null;

  constructor(start: Rectangle, end: Rectangle) {
    if (!start) {
      console.error('Start not present for Path Iterator');
      return;
    }
    if (!end) {
      console.error('End not present for Path Iterator');
      return;
    }
    this._start = start;
    this._heightDelta = end.top - start.top;
    this._widthDelta = end.left - start.left;
    this._steps = Math.max(Math.abs(this._heightDelta), Math.abs(this._widthDelta));
    this._currStep = 0;
    this._currPos = null;
    this._nextPos = new Cell(start.top, start.left);
  }

  public next(): Cell {
    this._currPos = this._nextPos;

    if (this._currStep < this._steps) {
      this._currStep++;
      const currTopDelta = Math.round((this._currStep / this._steps) * this._heightDelta);
      const currLeftDelta = Math.round((this._currStep / this._steps) * this._widthDelta);
      this._nextPos = new Cell(this._start.top + currTopDelta, this._start.left + currLeftDelta);
    } else {
      this._nextPos = null;
    }

    return this._currPos;
  }

  public hasNext(): boolean {
    return this._nextPos !== null;
  }
}
