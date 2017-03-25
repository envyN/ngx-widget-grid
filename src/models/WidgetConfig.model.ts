import {GridRectangle} from "./GridRectangle.model";
import {Utils} from "../Utils";
export class WidgetConfig {
    static widgetCount: number = 0;
    public id: string;
    public top: number = 0;
    public left: number = 0;
    public width: number = 0;
    public height: number = 0;

    constructor(gridArea?: GridRectangle) {
        this.id = this.generateUID();
        if (gridArea) {
            this.top = gridArea.top || 0;
            this.left = gridArea.left || 0;
            this.width = gridArea.width || 0;
            this.height = gridArea.height || 0;
        }
    }

    public generateUID() {
        return 'vmDashboardWidget-' + ++WidgetConfig.widgetCount;
    }

    get position(): GridRectangle {
        return new GridRectangle({top: this.top, left: this.left, width: this.width, height: this.height});
    }

    set position(gridArea: GridRectangle) {
        this.top = Utils.isNumber(gridArea.top) ? gridArea.top : this.top;
        this.left = Utils.isNumber(gridArea.left) ? gridArea.left : this.left;
        this.width = Utils.isNumber(gridArea.width) ? gridArea.width : this.width;
        this.height = Utils.isNumber(gridArea.height) ? gridArea.height : this.height;
    }

    getId() {
        return this.id;
    }
}
