export class GridRectangle {
    top = 0;
    left = 0;
    width = 0;
    height = 0;
    bottom?: number;
    right?: number;

    static create(start: GridRectangle, end: GridRectangle) {
        let width = end.left - start.left + 1,
            height = end.top - start.top + 1;
        return new GridRectangle({ top: start.top, left: start.left, width: width, height: height });
    }

    constructor(obj?: { top?: number, left?: number, width?: number, height?: number }) {
        if (obj) {
            this.top = obj.top;
            this.left = obj.left;
            this.width = obj.width;
            this.height = obj.height;
        }
    }

    getBottom() {
        return this.top + this.height - 1;
    }

    getRight() {
        return this.left + this.width - 1;
    }

    getSurfaceArea() {
        return this.height * this.width;
    }
}
