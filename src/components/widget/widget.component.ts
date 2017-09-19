import { Component, ElementRef, EventEmitter, forwardRef, Inject, Input, OnDestroy, Output } from '@angular/core';
import { WidgetConfig } from '../../models/WidgetConfig.model';
import { GridRectangle } from '../../models/GridRectangle.model';
import { ALL_DIRECTIONS, RESIZE_DIRECTIONS } from '../../Utils';

@Component({
               selector: 'ngx-widget',
               styleUrls: ['./widget.component.css'],
               templateUrl: './widget.component.html'
           })
export class NgxWidgetComponent {

    public _position: GridRectangle;
    @Input()
    set position(position: GridRectangle) {
        this._position = position;
        this.widgetConfig.position = position;
        this.positionChange.emit(position);
    };

    get position(): GridRectangle {
        return this._position;
    }

    @Output()
    positionChange: EventEmitter<GridRectangle> = new EventEmitter();

    @Input() movable = false;

    public _resizable = false;
    @Input()
    set resizable(resizable: boolean) {
        this._resizable = resizable;
        if (resizable) {
            this.setResizeDirections();
        }
    }

    get resizable() {
        return this._resizable;
    }

    public allDirections: any = RESIZE_DIRECTIONS;

    public _resizeDirections: string[] = ALL_DIRECTIONS;
    public isTopResizable = false;
    public isRightResizable = false;
    public isBottomResizable = false;
    public isLeftResizable = false;
    public isTopRightResizable = false;
    public isTopLeftResizable = false;
    public isBottomRightResizable = false;
    public isBottomLeftResizable = false;

    @Input()
    set resizeDirections(dirs: string[]) {
        this._resizeDirections = dirs.filter((dir: string) => {
            return ALL_DIRECTIONS.indexOf(dir.toUpperCase()) !== -1;
        });
        this.setResizeDirections();
    }

    get resizeDirections() {
        return this._resizeDirections;
    }

    public widgetConfig: WidgetConfig;

    constructor(private elRef: ElementRef) {
        this.widgetConfig = new WidgetConfig(this.position);
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
