import {GridPoint} from "./GridPoint.model";
import {GridRectangle} from "./GridRectangle.model";
export class PathIterator {
    public start: GridRectangle;
    public topDelta: number;
    public leftDelta: number;
    public steps: number;
    public currStep: number;
    public currPos: GridPoint;
    public nextPos: GridPoint;

    constructor(start: GridRectangle, end: GridRectangle) {
        this.start = start;
        this.topDelta = end.top - start.top;
        this.leftDelta = end.left - start.left;
        this.steps = Math.max(Math.abs(this.topDelta), Math.abs(this.leftDelta));
        this.currStep = 0;
        this.currPos = null;
        this.nextPos = new GridPoint(start.top, start.left);
    }

    next() {
        this.currPos = this.nextPos;

        if (this.currStep < this.steps) {
            this.currStep++;
            let currTopDelta = Math.round((this.currStep / this.steps) * this.topDelta),
                currLeftDelta = Math.round((this.currStep / this.steps) * this.leftDelta);
            this.nextPos = new GridPoint(this.start.top + currTopDelta, this.start.left + currLeftDelta);
        } else {
            this.nextPos = null;
        }

        return this.currPos;
    }

    hasNext() {
        return this.nextPos !== null;
    }
}
