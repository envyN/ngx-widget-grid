export class Utils {
  static isNumber(val: any): boolean {
    return typeof val === 'number';
  }

  static isDefined(val: any): boolean {
    return val !== undefined;
  }

  static isObject(val: any): boolean {
    return typeof val === 'object';
  }

}

export enum RESIZE_DIRECTIONS {
  topLeft = 'NW',
  top = 'N',
  topRight = 'NE',
  right = 'E',
  bottomRight = 'SE',
  bottom = 'S',
  bottomLeft = 'SW',
  left = 'W'
}

export const ALL_DIRECTIONS: RESIZE_DIRECTIONS[] = [
  RESIZE_DIRECTIONS.bottom,
  RESIZE_DIRECTIONS.left,
  RESIZE_DIRECTIONS.right,
  RESIZE_DIRECTIONS.top,
  RESIZE_DIRECTIONS.bottomLeft,
  RESIZE_DIRECTIONS.bottomRight,
  RESIZE_DIRECTIONS.topLeft,
  RESIZE_DIRECTIONS.topRight
];
