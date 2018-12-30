export interface IRectangle {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

export class Rectangle implements IRectangle {
  public top = 0;
  public left = 0;
  public width = 0;
  public height = 0;


  constructor(obj?: IRectangle) {
    if (obj) {
      this.top = +obj.top || 0;
      this.left = +obj.left || 0;
      this.width = +obj.width || 0;
      this.height = +obj.height || 0;
    }
  }

  public get bottom(): number {
    return this.top + this.height - 1;
  }

  public get right(): number {
    return this.left + this.width - 1;
  }

  getSurfaceArea(): number {
    return this.height * this.width;
  }
}
