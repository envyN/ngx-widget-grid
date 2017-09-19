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

    static equals(obj1: any, obj2: any): boolean {
        if (typeof obj1 === 'object' && typeof obj2 === 'object') {
            let o1Keys = Object.keys(obj1), o2Keys = Object.keys(obj2), bothEqual = true;
            if (o1Keys.length === o2Keys.length) {
                o1Keys.forEach((o1Key) => {
                        if (o2Keys.indexOf(o1Key) !== -1) {
                            let childEquals = Utils.equals(obj1[o1Key], obj2[o1Key]);
                            if (!childEquals) {
                                bothEqual = false;
                            }
                        } else {
                            bothEqual = false;
                        }
                    }
                );
                return bothEqual;
            } else {
                return false;
            }
        }        else {
            return obj1 === obj2;
        }
    }
}
export const RESIZE_DIRECTIONS = {
    topLeft: 'NW',
    top: 'N',
    topRight: 'NE',
    right: 'E',
    bottomRight: 'SE',
    bottom: 'S',
    bottomLeft: 'SW',
    left: 'W'
};
export const ALL_DIRECTIONS: string[] = [
    RESIZE_DIRECTIONS.bottom,
    RESIZE_DIRECTIONS.left,
    RESIZE_DIRECTIONS.right,
    RESIZE_DIRECTIONS.top,
    RESIZE_DIRECTIONS.bottomLeft,
    RESIZE_DIRECTIONS.bottomRight,
    RESIZE_DIRECTIONS.topLeft,
    RESIZE_DIRECTIONS.topRight
];
