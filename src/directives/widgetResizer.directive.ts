import { Directive, ElementRef, forwardRef, HostListener, Inject, Input, Renderer2 } from '@angular/core';
import { NgxWidgetGridComponent } from '../components/grid/grid.component';
import { NgxWidgetComponent } from '../components/widget/widget.component';
import { GridRectangle } from '../models/GridRectangle.model';
import { RESIZE_DIRECTIONS } from '../Utils';

const MIN_HEIGHT = 42;
const MIN_WIDTH = 42;

@Directive({
               selector: '[ngx-widget-resizer]'
           })
export class NgxWidgetResizerDirective {

    public moveUpAllowed = false;
    public moveDownAllowed = false;
    public moveLeftAllowed = false;
    public moveRightAllowed = false;
    public _resizeDirection: string;
    @Input('ngx-widget-resizer')
    public set resizeDirection(dir: string) {
        this._resizeDirection = dir;
        this.moveUpAllowed = false;
        this.moveDownAllowed = false;
        this.moveLeftAllowed = false;
        this.moveRightAllowed = false;
        switch (dir) {
            case RESIZE_DIRECTIONS.top:
                this.moveUpAllowed = true;
                break;
            case RESIZE_DIRECTIONS.left:
                this.moveLeftAllowed = true;
                break;
            case RESIZE_DIRECTIONS.bottom:
                this.moveDownAllowed = true;
                break;
            case RESIZE_DIRECTIONS.right:
                this.moveRightAllowed = true;
                break;
            case RESIZE_DIRECTIONS.topLeft:
                this.moveUpAllowed = true;
                this.moveLeftAllowed = true;
                break;
            case RESIZE_DIRECTIONS.topRight:
                this.moveUpAllowed = true;
                this.moveRightAllowed = true;
                break;
            case RESIZE_DIRECTIONS.bottomLeft:
                this.moveDownAllowed = true;
                this.moveLeftAllowed = true;
                break;
            case RESIZE_DIRECTIONS.bottomRight:
                this.moveDownAllowed = true;
                this.moveRightAllowed = true;
                break;
            default:
        }
    }

    public get resizeDirection() {
        return this._resizeDirection;
    }

    public parentContainer: any;
    public cellHeight: number;
    public cellWidth: number;
    public startRender: any;
    public gridPositions: GridRectangle;
    public delta: { top: number, right: number, bottom: number, left: number };
    public draggerOffset: { top: number, right: number, bottom: number, left: number };
    public startPosition: any;
    public enableDrag: string = null;

    constructor(private el: ElementRef,
                private renderer: Renderer2,
                @Inject(forwardRef(() => NgxWidgetGridComponent))
                private gridCmp: NgxWidgetGridComponent,
                @Inject(forwardRef(() => NgxWidgetComponent))
                private widgetCmp: NgxWidgetComponent) {
        this.parentContainer = this.el.nativeElement.parentElement;
    }

    @HostListener('mousedown', ['$event'])
    onDown(event: MouseEvent) {
        event.preventDefault();
        this.enableDrag = this.widgetCmp.getConfig().getId();
        this.renderer.addClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing');
        this.renderer.addClass(this.el.nativeElement, 'dragging');
        this.startPosition = this.gridCmp.getWidgetPosition(this.widgetCmp);
        this.startPosition.bottom = this.startPosition.top + this.startPosition.height - 1;
        this.startPosition.right = this.startPosition.left + this.startPosition.width - 1;

        this.startRender = {
            top: Math.ceil(this.widgetCmp.getEl().nativeElement.offsetTop),
            left: Math.ceil(this.widgetCmp.getEl().nativeElement.offsetLeft),
            height: Math.floor(this.parentContainer.offsetHeight),
            width: Math.floor(this.parentContainer.offsetWidth)
        }; // pixel values
        this.startRender.bottom = this.startRender.top + this.startRender.height;
        this.startRender.right = this.startRender.left + this.startRender.width;

        let eventOffsetX = event.offsetX || event.layerX;
        let eventOffsetY = event.offsetY || event.layerY;

        this.delta = { top: 0, right: 0, bottom: 0, left: 0 };
        this.draggerOffset = {
            top: eventOffsetY,
            left: eventOffsetX,
            bottom: eventOffsetY - this.el.nativeElement.offsetHeight,
            right: eventOffsetX - this.el.nativeElement.offsetWidth
        };

        this.gridPositions = this.gridCmp.getGridRectangle();
    }

    @HostListener('window:mousemove', ['$event'])
    onMove(event: MouseEvent) {
        if (this.enableDrag === this.widgetCmp.getConfig().getId()) {
            event.preventDefault();
            let eventClientX = event.clientX,
                eventClientY = event.clientY;
            let gridDims = this.gridPositions;
            let startRender = this.startRender;
            // normalize the drag position
            let dragPositionX = Math.round(eventClientX) - gridDims.left,
                dragPositionY = Math.round(eventClientY) - gridDims.top;
            let delta = this.delta;
            if (this.moveUpAllowed) {
                delta.top = Math.min(Math.max(dragPositionY - this.draggerOffset.top, 0), gridDims.height) - startRender.top;
                delta.top = Math.min(delta.top, startRender.height - MIN_HEIGHT);
            } else if (this.moveDownAllowed) {
                delta.bottom = startRender.bottom - Math.min(Math.max(dragPositionY - this.draggerOffset.bottom, 0), gridDims.height);
                delta.bottom = Math.min(delta.bottom, startRender.height - MIN_HEIGHT);
            }

            if (this.moveLeftAllowed) {
                delta.left = Math.min(Math.max(dragPositionX - this.draggerOffset.left, 0), gridDims.width) - startRender.left;
                delta.left = Math.min(delta.left, startRender.width - MIN_WIDTH);
            } else if (this.moveRightAllowed) {
                delta.right = startRender.right - Math.min(Math.max(dragPositionX - this.draggerOffset.right, 0), gridDims.width);
                delta.right = Math.min(delta.right, startRender.width - MIN_WIDTH);
            }

            let currentFinalPos = this.determineFinalPos();
            this.gridCmp.highlightArea(currentFinalPos);

            this.renderer.setStyle(this.parentContainer, 'top', this.delta.top + 'px');
            this.renderer.setStyle(this.parentContainer, 'left', this.delta.left + 'px');
            this.renderer.setStyle(this.parentContainer, 'bottom', this.delta.bottom + 'px');
            this.renderer.setStyle(this.parentContainer, 'right', this.delta.right + 'px');
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onUp(event: MouseEvent) {
        if (this.enableDrag === this.widgetCmp.getConfig().getId()) {
            event.preventDefault();
            this.el.nativeElement.setAttribute('draggable', false);
            this.renderer.removeClass(this.el.nativeElement, 'dragging');
            this.renderer.removeClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing');
            this.enableDrag = null;
            this.widgetCmp.position = this.determineFinalPos();
            this.gridCmp.updateWidget(this.widgetCmp);
            this.gridCmp.resetHighlights();

            // reset style
            this.renderer.removeClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing');
            this.renderer.removeClass(this.el.nativeElement, 'dragging');
            this.renderer.setStyle(this.parentContainer, 'top', '');
            this.renderer.setStyle(this.parentContainer, 'left', '');
            this.renderer.setStyle(this.parentContainer, 'bottom', '');
            this.renderer.setStyle(this.parentContainer, 'right', '');
        }
    }

    findCollision(start: number, end: number, val: number): boolean {
        let foundCollision = false;
        for (let i = start; i <= end; i++) {
            if (this.gridCmp.isPointObstructed(val, i)) {
                foundCollision = true;
                break;
            }
        }
        return foundCollision;
    }

    determineFinalPos(): any {
        let finalPos: GridRectangle = new GridRectangle();
        let startRender = this.startRender;
        let delta = this.delta;
        let requestedStartPoint = this.gridCmp.rasterizeCoords(startRender.left + delta.left + 1, startRender.top + delta.top + 1),
            requestedEndPoint = this.gridCmp.rasterizeCoords(startRender.right - delta.right - 1, startRender.bottom - delta.bottom - 1);

        let requestedPos = {
            top: requestedStartPoint.top,
            right: requestedEndPoint.left,
            bottom: requestedEndPoint.top,
            left: requestedStartPoint.left
        };

        // determine a suitable final position (one that is not obstructed)
        let foundCollision;
        let start = Math.max(this.startPosition.left, requestedPos.left);
        let end = Math.min(this.startPosition.right, requestedPos.right);
        if (this.moveUpAllowed && requestedPos.top < this.startPosition.top) {
            finalPos.top = this.startPosition.top;

            while (finalPos.top > requestedPos.top) {
                // check whether adding another row would cause any conflict
                foundCollision = this.findCollision(start, end, finalPos.top - 1);
                if (foundCollision) {
                    break;
                }

                finalPos.top--; // add row
            }
        } else if (this.moveDownAllowed && requestedPos.bottom > this.startPosition.bottom) {
            finalPos.bottom = this.startPosition.bottom;

            while (finalPos.bottom < requestedPos.bottom) {
                foundCollision = this.findCollision(start, end, finalPos.bottom + 1);
                if (foundCollision) {
                    break;
                }

                finalPos.bottom++;
            }
        }

        finalPos.top = finalPos.top || requestedPos.top;
        finalPos.bottom = finalPos.bottom || requestedPos.bottom;

        if (this.moveLeftAllowed && requestedPos.left < this.startPosition.left) {
            finalPos.left = this.startPosition.left;

            while (finalPos.left > requestedPos.left) {
                // check whether adding another column would cause any conflict
                foundCollision = this.findCollision(finalPos.top, finalPos.bottom, finalPos.left - 1);
                if (foundCollision) {
                    break;
                }

                finalPos.left--; // add column
            }
        } else if (this.moveRightAllowed && requestedPos.right > this.startPosition.right) {
            finalPos.right = this.startPosition.right;

            while (finalPos.right < requestedPos.right) {
                foundCollision = this.findCollision(finalPos.top, finalPos.bottom, finalPos.right + 1);
                if (foundCollision) {
                    break;
                }

                finalPos.right++;
            }
        }

        finalPos.right = finalPos.right || requestedPos.right;
        finalPos.left = finalPos.left || requestedPos.left;
        finalPos.height = finalPos.bottom - finalPos.top + 1;
        finalPos.width = finalPos.right - finalPos.left + 1;

        return finalPos;
    }
}
