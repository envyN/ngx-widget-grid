import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { WidgetConfig } from '../../models/WidgetConfig.model';
import { Rectangle } from '../../models/Rectangle.model';
import { ALL_DIRECTIONS, RESIZE_DIRECTIONS } from '../../Utils';

@Component({
             selector: 'ngx-widget',
             styleUrls: ['./widget.component.scss'],
             templateUrl: './widget.component.html',
             changeDetection: ChangeDetectionStrategy.OnPush
           })
export class NgxWidgetComponent {

  @Input() swapOnMove = false;
  @Output()
  positionChange: EventEmitter<Rectangle> = new EventEmitter();
  @Input() movable = false;
  public allDirections = RESIZE_DIRECTIONS;
  public isTopResizable = false;
  public isRightResizable = false;
  public isBottomResizable = false;
  public isLeftResizable = false;
  public isTopRightResizable = false;
  public isTopLeftResizable = false;
  public isBottomRightResizable = false;
  public isBottomLeftResizable = false;
  public widgetConfig: WidgetConfig;
  public _position: Rectangle;
  public _resizable = false;
  public _resizeDirections: RESIZE_DIRECTIONS[] = ALL_DIRECTIONS;

  constructor(private elRef: ElementRef) {
    this.widgetConfig = new WidgetConfig(this.position);
  }

  get position(): Rectangle {
    return this._position;
  }

  @Input()
  set position(position: Rectangle) {
    this._position = position;
    this.widgetConfig.position = position;
    this.positionChange.emit(position);
  }

  get resizable() {
    return this._resizable;
  }

  @Input()
  set resizable(resizable: boolean) {
    this._resizable = resizable;
    if (resizable) {
      this.setResizeDirections();
    }
  }

  get resizeDirections() {
    return this._resizeDirections;
  }

  @Input()
  set resizeDirections(dirs: RESIZE_DIRECTIONS[]) {
    this._resizeDirections = <RESIZE_DIRECTIONS[]>dirs.filter((dir: RESIZE_DIRECTIONS) => {
      return ALL_DIRECTIONS.indexOf(<RESIZE_DIRECTIONS>(<string>dir).toUpperCase()) !== -1;
    });
    this.setResizeDirections();
  }

  setResizeDirections() {
    this.isTopResizable = false;
    this.isRightResizable = false;
    this.isBottomResizable = false;
    this.isLeftResizable = false;
    this.isTopRightResizable = false;
    this.isTopLeftResizable = false;
    this.isBottomRightResizable = false;
    this.isBottomLeftResizable = false;
    this._resizeDirections.forEach((dir) => {
      switch (dir) {
        case RESIZE_DIRECTIONS.top:
          this.isTopResizable = true;
          break;
        case RESIZE_DIRECTIONS.left:
          this.isLeftResizable = true;
          break;
        case RESIZE_DIRECTIONS.bottom:
          this.isBottomResizable = true;
          break;
        case RESIZE_DIRECTIONS.right:
          this.isRightResizable = true;
          break;
        case RESIZE_DIRECTIONS.topLeft:
          this.isTopLeftResizable = true;
          break;
        case RESIZE_DIRECTIONS.topRight:
          this.isTopRightResizable = true;
          break;
        case RESIZE_DIRECTIONS.bottomLeft:
          this.isBottomLeftResizable = true;
          break;
        case RESIZE_DIRECTIONS.bottomRight:
          this.isBottomRightResizable = true;
          break;
        default:
      }
    });
  }

  getConfig(): WidgetConfig {
    return this.widgetConfig;
  }

  getEl(): ElementRef {
    return this.elRef;
  }
}
