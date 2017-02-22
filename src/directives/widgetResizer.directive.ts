import {Directive, Input, Renderer, ElementRef, HostListener, forwardRef, Inject} from "@angular/core";
import {NgxWidgetGridComponent} from "../components/grid/grid.component";
import {NgxWidgetComponent} from "../components/widget/widget.component";
import {GridRectangle} from "../models/GridRectangle.model";
import {RectanglePixels} from "./widgetMover.directive";
import {ResizeDirections} from "../Utils";

const MIN_HEIGHT: number = 42;
const MIN_WIDTH: number = 42;
@Directive({
    selector: '[ngx-widget-resizer]'
})
export class NgxWidgetResizerDirective {
    constructor(private el: ElementRef,
                private renderer: Renderer,
                @Inject(forwardRef(() => NgxWidgetGridComponent))
                private gridCmp: NgxWidgetGridComponent,
                @Inject(forwardRef(() => NgxWidgetComponent))
                private widgetCmp: NgxWidgetComponent) {
        this.parentContainer = this.el.nativeElement.parentElement;
    }

    private moveUpAllowed: boolean = false;
    private moveDownAllowed: boolean = false;
    private moveLeftAllowed: boolean = false;
    private moveRightAllowed: boolean = false;
    private _resizeDirection: string;
    @Input('ngx-widget-resizer')
    private set resizeDirection(dir: string) {
        this._resizeDirection = dir;
        this.moveUpAllowed = false;
        this.moveDownAllowed = false;
        this.moveLeftAllowed = false;
        this.moveRightAllowed = false;
        switch (dir) {
            case ResizeDirections.top:
                this.moveUpAllowed = true;
                break;
            case ResizeDirections.left:
                this.moveLeftAllowed = true;
                break;
            case ResizeDirections.bottom:
                this.moveDownAllowed = true;
                break;
            case ResizeDirections.right:
                this.moveRightAllowed = true;
                break;
            case ResizeDirections.topLeft:
                this.moveUpAllowed = true;
                this.moveLeftAllowed = true;
                break;
            case ResizeDirections.topRight:
                this.moveUpAllowed = true;
                this.moveRightAllowed = true;
                break;
            case ResizeDirections.bottomLeft:
                this.moveDownAllowed = true;
                this.moveLeftAllowed = true;
                break;
            case ResizeDirections.bottomRight:
                this.moveDownAllowed = true;
                this.moveRightAllowed = true;
                break;
            default:
        }
    }

    private get resizeDirection() {
        return this._resizeDirection;
    }

    private parentContainer: any;
    private cellHeight: number;
    private cellWidth: number;
    private startRender: any;
    private gridPositions: GridRectangle;
    private delta: {top: number, right: number, bottom: number, left: number};
    private draggerOffset: {top: number, right: number, bottom: number, left: number};
    private startPosition: any;
    private enableDrag: string = null;


    @HostListener('mousedown', ['$event'])
    onDown(event: MouseEvent) {
        event.preventDefault();
        this.enableDrag = this.widgetCmp.getConfig().getId();
        this.renderer.setElementClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing', true);
        this.renderer.setElementClass(this.el.nativeElement, 'dragging', true);
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

        this.delta = {top: 0, right: 0, bottom: 0, left: 0};
        this.draggerOffset = {
            top: eventOffsetY,
            left: eventOffsetX,
            bottom: eventOffsetY - this.el.nativeElement.offsetHeight,
            right: eventOffsetX - this.el.nativeElement.offsetWidth
        };

        this.gridPositions = this.gridCmp.getPositions();
    }

    @HostListener('window:mousemove', ['$event'])
    onMove(event: MouseEvent) {
        event.preventDefault();
        if (this.enableDrag === this.widgetCmp.getConfig().getId()) {
            let eventClientX = event.clientX,
                eventClientY = event.clientY;
            // normalize the drag position
            let dragPositionX = Math.round(eventClientX) - this.gridPositions.left,
                dragPositionY = Math.round(eventClientY) - this.gridPositions.top;

            if (this.moveUpAllowed) {
                this.delta.top = Math.min(Math.max(dragPositionY - this.draggerOffset.top, 0), this.gridPositions.height) - this.startRender.top;
                this.delta.top = Math.min(this.delta.top, this.startRender.height - MIN_HEIGHT);
            } else if (this.moveDownAllowed) {
                this.delta.bottom = this.startRender.bottom - Math.min(Math.max(dragPositionY - this.draggerOffset.bottom, 0), this.gridPositions.height);
                this.delta.bottom = Math.min(this.delta.bottom, this.startRender.height - MIN_HEIGHT);
            }

            if (this.moveLeftAllowed) {
                this.delta.left = Math.min(Math.max(dragPositionX - this.draggerOffset.left, 0), this.gridPositions.width) - this.startRender.left;
                this.delta.left = Math.min(this.delta.left, this.startRender.width - MIN_WIDTH);
            } else if (this.moveRightAllowed) {
                this.delta.right = this.startRender.right - Math.min(Math.max(dragPositionX - this.draggerOffset.right, 0), this.gridPositions.width);
                this.delta.right = Math.min(this.delta.right, this.startRender.width - MIN_WIDTH);
            }

            let currentFinalPos = this.determineFinalPos();
            this.gridCmp.highlightArea(currentFinalPos);

            this.renderer.setElementStyle(this.parentContainer, 'top', this.delta.top + 'px');
            this.renderer.setElementStyle(this.parentContainer, 'left', this.delta.left + 'px');
            this.renderer.setElementStyle(this.parentContainer, 'bottom', this.delta.bottom + 'px');
            this.renderer.setElementStyle(this.parentContainer, 'right', this.delta.right + 'px');
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onUp(event: MouseEvent) {
        event.preventDefault();
        if (this.enableDrag === this.widgetCmp.getConfig().getId()) {
            this.el.nativeElement.setAttribute('draggable', false);
            this.renderer.setElementClass(this.el.nativeElement, 'dragging', false);
            this.renderer.setElementClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing', false);
            this.enableDrag = null;
            this.widgetCmp.position = this.determineFinalPos();
            this.gridCmp.updateWidget(this.widgetCmp);
            this.gridCmp.resetHighlights();

            // reset style
            this.renderer.setElementClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing', false);
            this.renderer.setElementClass(this.el.nativeElement, 'dragging', false);
            this.renderer.setElementStyle(this.parentContainer, 'top', '');
            this.renderer.setElementStyle(this.parentContainer, 'left', '');
            this.renderer.setElementStyle(this.parentContainer, 'bottom', '');
            this.renderer.setElementStyle(this.parentContainer, 'right', '');
        }
    }

    determineFinalPos(): any {
        let finalPos: GridRectangle = new GridRectangle();

        let requestedStartPoint = this.gridCmp.rasterizeCoords(this.startRender.left + this.delta.left + 1, this.startRender.top + this.delta.top + 1),
            requestedEndPoint = this.gridCmp.rasterizeCoords(this.startRender.right - this.delta.right - 1, this.startRender.bottom - this.delta.bottom - 1);

        let requestedPos = {
            top: requestedStartPoint.top,
            right: requestedEndPoint.left,
            bottom: requestedEndPoint.top,
            left: requestedStartPoint.left
        };

        // determine a suitable final position (one that is not obstructed)
        let foundCollision, i, j;
        if (this.moveUpAllowed && requestedPos.top < this.startPosition.top) {
            finalPos.top = this.startPosition.top;

            while (finalPos.top > requestedPos.top) {
                // check whether adding another row would cause any conflict
                foundCollision = false;
                for (j = Math.max(this.startPosition.left, requestedPos.left); j <= Math.min(this.startPosition.right, requestedPos.right); j++) {
                    if (this.gridCmp.isPointObstructed(finalPos.top - 1, j)) {
                        foundCollision = true;
                        break;
                    }
                }
                if (foundCollision) {
                    break;
                }

                finalPos.top--; // add row
            }
        } else if (this.moveDownAllowed && requestedPos.bottom > this.startPosition.bottom) {
            finalPos.bottom = this.startPosition.bottom;

            while (finalPos.bottom < requestedPos.bottom) {
                foundCollision = false;
                for (j = Math.max(this.startPosition.left, requestedPos.left); j <= Math.min(this.startPosition.right, requestedPos.right); j++) {
                    if (this.gridCmp.isPointObstructed(finalPos.bottom + 1, j)) {
                        foundCollision = true;
                        break;
                    }
                }
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
                foundCollision = false;
                for (i = finalPos.top; i <= finalPos.bottom; i++) {
                    if (this.gridCmp.isPointObstructed(i, finalPos.left - 1)) {
                        foundCollision = true;
                        break;
                    }
                }
                if (foundCollision) {
                    break;
                }

                finalPos.left--; // add column
            }
        } else if (this.moveRightAllowed && requestedPos.right > this.startPosition.right) {
            finalPos.right = this.startPosition.right;

            while (finalPos.right < requestedPos.right) {
                foundCollision = false;
                for (i = finalPos.top; i <= finalPos.bottom; i++) {
                    if (this.gridCmp.isPointObstructed(i, finalPos.right + 1)) {
                        foundCollision = true;
                        break;
                    }
                }
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
