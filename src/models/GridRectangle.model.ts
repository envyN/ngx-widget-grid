export class GridRectangle {
    top: number = 0;
    left: number = 0;
    width: number = 0;
    height: number = 0;
    bottom?: number;
    right?: number;

    constructor(obj?: {top?: number, left?: number, width?: number, height?: number}) {
        if (obj) {
            this.top = obj.top;
            this.left = obj.left;
            this.width = obj.width;
            this.height = obj.height;
        }
    }


    static create(start: GridRectangle, end: GridRectangle) {
        let width = end.left - start.left + 1,
            height = end.top - start.top + 1;
        return new GridRectangle({top: start.top, left: start.left, width: width, height: height});
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
