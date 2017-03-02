import {Directive, Renderer, ElementRef, Inject, forwardRef, HostListener} from "@angular/core";
import {NgxWidgetGridComponent} from "../components/grid/grid.component";
import {GridRectangle} from "../models/GridRectangle.model";
import {NgxWidgetComponent} from "../components/widget/widget.component";
import {PathIterator} from "../models/PathIterator.model";
export interface RectanglePixels {
    top: number,
    left: number,
    height: number,
    width: number
}
@Directive({
    selector: '[ngx-widget-mover]'
})
export class NgxWidgetMoverDirective {

    constructor(private el: ElementRef,
                private renderer: Renderer,
                @Inject(forwardRef(() => NgxWidgetGridComponent))
                private gridCmp: NgxWidgetGridComponent,
                @Inject(forwardRef(() => NgxWidgetComponent))
                private widgetCmp: NgxWidgetComponent) {
    }

    private cellHeight: number;
    private cellWidth: number;
    private startRender: RectanglePixels;
    private gridPositions: any;
    private moverOffset: GridRectangle;
    private mouseDownPosition: any;
    private desiredPosition: any;
    private startPosition: GridRectangle;
    private enableDrag: string = null;

    @HostListener('mousedown', ['$event'])
    onDown(event: MouseEvent) {
        event.preventDefault();
        this.renderer.setElementClass(this.widgetCmp.getEl().nativeElement, 'wg-moving', true);
        this.mouseDownPosition = {x: event.clientX, y: event.clientY};
        let widgetContainer = this.widgetCmp.getEl().nativeElement;


        this.startPosition = this.gridCmp.getWidgetPosition(this.widgetCmp);

        this.startRender = {
            top: widgetContainer.offsetTop,
            left: widgetContainer.offsetLeft,
            height: widgetContainer.clientHeight,
            width: widgetContainer.clientWidth
        }; // pixel values

        let eventOffsetX = event.offsetX || event.layerX;
        let eventOffsetY = event.offsetY || event.layerY;

        this.desiredPosition = {top: this.startRender.top, left: this.startRender.left};

        this.moverOffset = new GridRectangle({
            top: eventOffsetY + this.el.nativeElement.offsetTop || 0,
            left: eventOffsetX + this.el.nativeElement.offsetLeft || 0
        });

        this.gridPositions = this.gridCmp.getGridRectangle();
        this.cellHeight = (this.gridCmp.grid.cellSize.height / 100) * this.gridPositions.height;
        this.cellWidth = (this.gridCmp.grid.cellSize.width / 100) * this.gridPositions.width;
        this.enableDrag = this.widgetCmp.getConfig().getId();
    }

    @HostListener('window:mouseup', ['$event'])
    onUp(event: MouseEvent) {
        if (this.enableDrag === this.widgetCmp.getConfig().getId()) {
            event.preventDefault();

            let finalPos = this.determineFinalPos(this.startPosition, this.desiredPosition, this.startRender, this.cellHeight, this.cellWidth);
            this.gridCmp.resetHighlights();
            this.renderer.setElementClass(this.widgetCmp.getEl().nativeElement, 'wg-moving', false);
            this.widgetCmp.position = finalPos;
            this.gridCmp.updateWidget(this.widgetCmp);
            this.enableDrag = null;
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMove(event: MouseEvent) {
        if (this.enableDrag === this.widgetCmp.getConfig().getId()) {
            event.preventDefault();
            let eventClientX = event.clientX,
                eventClientY = event.clientY;
            // normalize the drag position
            let dragPositionX = Math.round(eventClientX) - this.gridPositions.left,
                dragPositionY = Math.round(eventClientY) - this.gridPositions.top;

            this.desiredPosition.top = Math.min(Math.max(dragPositionY - this.moverOffset.top, 0), this.gridPositions.height - this.startRender.height - 1);
            this.desiredPosition.left = Math.min(Math.max(dragPositionX - this.moverOffset.left, 0), this.gridPositions.width - this.startRender.width - 1);

            let currentFinalPos: GridRectangle = this.determineFinalPos(this.startPosition, this.desiredPosition, this.startRender, this.cellHeight, this.cellWidth);
            this.gridCmp.highlightArea(currentFinalPos);

            this.renderer.setElementStyle(this.widgetCmp.getEl().nativeElement, 'top', this.desiredPosition.top + 'px');
            this.renderer.setElementStyle(this.widgetCmp.getEl().nativeElement, 'left', this.desiredPosition.left + 'px');

        }
    }

    determineFinalPos(startPosition: GridRectangle, desiredPosition: GridRectangle, startRender: RectanglePixels, cellHeight: number, cellWidth: number): GridRectangle {
        if (startRender.top === desiredPosition.top && startRender.left === desiredPosition.left) {
            return startPosition;
        }

        let anchorTop: number, anchorLeft: number;
        if ((desiredPosition.top % cellHeight) > cellHeight / 2) {
            anchorTop = desiredPosition.top + Math.floor(cellHeight);
        } else {
            anchorTop = desiredPosition.top;
        }

        if ((desiredPosition.left % cellWidth) > cellWidth / 2) {
            anchorLeft = desiredPosition.left + Math.floor(cellWidth);
        } else {
            anchorLeft = desiredPosition.left;
        }

        let movedDown = anchorTop >= startRender.top,
            movedRight = anchorLeft >= startRender.left;

        let desiredFinalPosition: any = this.gridCmp.rasterizeCoords(anchorLeft, anchorTop);
        let path = new PathIterator(desiredFinalPosition, startPosition);

        while (path.hasNext()) {
            let currPos = path.next();

            let targetArea: GridRectangle = new GridRectangle({
                top: currPos.top,
                left: currPos.left,
                height: startPosition.height,
                width: startPosition.width
            });

            let options: any = {
                excludedArea: startPosition,
                fromBottom: movedDown,
                fromRight: movedRight
            };

            if (!this.gridCmp.isAreaObstructed(targetArea, options)) {
                // try to get closer to the desired position by leaving the original path
                if (desiredFinalPosition.top < targetArea.top) {
                    while (desiredFinalPosition.top <= targetArea.top - 1 && !this.gridCmp.isAreaObstructed(new GridRectangle({
                        top: targetArea.top - 1,
                        left: targetArea.left,
                        height: targetArea.height,
                        width: targetArea.width
                    }), options)) {
                        targetArea.top--;
                    }
                } else if (desiredFinalPosition.top > targetArea.top) {
                    while (desiredFinalPosition.top >= targetArea.top + 1 && !this.gridCmp.isAreaObstructed(new GridRectangle({
                        top: targetArea.top + 1,
                        left: targetArea.left,
                        height: targetArea.height,
                        width: targetArea.width
                    }), options)) {
                        targetArea.top++;
                    }
                }

                if (desiredFinalPosition.left < targetArea.left) {
                    while (desiredFinalPosition.left <= targetArea.left - 1 && !this.gridCmp.isAreaObstructed(new GridRectangle({
                        top: targetArea.top,
                        left: targetArea.left - 1,
                        height: targetArea.height,
                        width: targetArea.width
                    }), options)) {
                        targetArea.left--;
                    }
                } else if (desiredFinalPosition.left > targetArea.left) {
                    while (desiredFinalPosition.left >= targetArea.left + 1 && !this.gridCmp.isAreaObstructed(new GridRectangle({
                        top: targetArea.top,
                        left: targetArea.left + 1,
                        height: targetArea.height,
                        width: targetArea.width
                    }), options)) {
                        targetArea.left++;
                    }
                }
                return new GridRectangle(targetArea);
            }
        }
        return new GridRectangle(startPosition);
    }
}
