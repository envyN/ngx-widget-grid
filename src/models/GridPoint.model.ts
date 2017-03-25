export class GridPoint {
    public _top: number;
    public _left: number;

    constructor(top: number, left: number) {
        this._top = top;
        this._left = left;
    }

    get top() {
        return this._top;
    }

    get left() {
        return this._left;
    }
}
