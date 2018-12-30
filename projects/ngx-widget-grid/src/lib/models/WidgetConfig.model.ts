import { Rectangle } from './Rectangle.model';

export class WidgetConfig {
  static widgetCount = 0;
  public id: string;
  private _position: Rectangle = new Rectangle();

  constructor(rect?: Rectangle) {
    this.id = this.generateUID();
    if (rect) {
      this.position = rect;
    }
  }

  public get position(): Rectangle {
    return this._position;
  }

  public set position(gridArea: Rectangle) {
    this._position.top = +gridArea.top ? +gridArea.top : 0;
    this._position.left = +gridArea.left ? +gridArea.left : 0;
    this._position.width = +gridArea.width ? +gridArea.width : 0;
    this._position.height = +gridArea.height ? +gridArea.height : 0;
  }

  public generateUID() {
    return 'ngxDashboardWidget-' + ++WidgetConfig.widgetCount;
  }
}
