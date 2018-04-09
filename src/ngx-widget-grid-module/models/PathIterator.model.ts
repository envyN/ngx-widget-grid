import { Cell } from './Cell.model';
import { Rectangle } from './Rectangle.model';

export class PathIterator {
  public start: Rectangle;
  public topDelta: number;
  public leftDelta: number;
  public steps: number;
  public currStep: number;
  public currPos: Cell;
  public nextPos: Cell;

  constructor(start: Rectangle, end: Rectangle) {
    this.start = start;
    this.topDelta = end.top - start.top;
    this.leftDelta = end.left - start.left;
    this.steps = Math.max(Math.abs(this.topDelta), Math.abs(this.leftDelta));
    this.currStep = 0;
    this.currPos = null;
    this.nextPos = new Cell(start.top, start.left);
  }

  next(): Cell {
    this.currPos = this.nextPos;

    if (this.currStep < this.steps) {
      this.currStep++;
      const currTopDelta = Math.round((this.currStep / this.steps) * this.topDelta);
      const currLeftDelta = Math.round((this.currStep / this.steps) * this.leftDelta);
      this.nextPos = new Cell(this.start.top + currTopDelta, this.start.left + currLeftDelta);
    } else {
      this.nextPos = null;
    }

    return this.currPos;
  }

  hasNext(): boolean {
    return this.nextPos !== null;
  }
}
