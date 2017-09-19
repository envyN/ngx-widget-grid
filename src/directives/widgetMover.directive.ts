import { Directive, ElementRef, forwardRef, HostListener, Inject, Renderer2 } from '@angular/core';
import { NgxWidgetGridComponent } from '../components/grid/grid.component';
import { GridRectangle } from '../models/GridRectangle.model';
import { NgxWidgetComponent } from '../components/widget/widget.component';
import { PathIterator } from '../models/PathIterator.model';

export interface RectanglePixels {
    top: number;
    left: number;
    height: number;
    width: number;
}

@Directive({
               selector: '[ngx-widget-mover]'
           })
export class NgxWidgetMoverDirective {

    public cellHeight: number;
    public cellWidth: number;
    public startRender: RectanglePixels;
    public gridPositions: any;
    public moverOffset: GridRectangle;
    public mouseDownPosition: any;
    public desiredPosition: any;
    public startPosition: GridRectangle;
    public enableDrag: string = null;

    constructor(private el: ElementRef,
                private renderer: Renderer2,
                @Inject(forwardRef(() => NgxWidgetGridComponent))
                private gridCmp: NgxWidgetGridComponent,
                @Inject(forwardRef(() => NgxWidgetComponent))
                private widgetCmp: NgxWidgetComponent) {
    }

    @HostListener('mousedown', ['$event'])
    onDown(event: MouseEvent) {
        event.preventDefault();
        this.renderer.addClass(this.widgetCmp.getEl().nativeElement, 'wg-moving');
        this.mouseDownPosition = { x: event.clientX, y: event.clientY };
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

        this.desiredPosition = { top: this.startRender.top, left: this.startRender.left };

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

            let finalPos = this.determineFinalPos(this.startPosition,
                                                  this.desiredPosition,
                                                  this.startRender,
                                                  this.cellHeight,
                                                  this.cellWidth);
            this.gridCmp.resetHighlights();
            this.renderer.removeClass(this.widgetCmp.getEl().nativeElement, 'wg-moving');
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
            let startRender = this.startRender;
            let gridDimensions = this.gridPositions;
            let desiredPosition = this.desiredPosition;
            // normalize the drag position
            let dragPositionX = Math.round(eventClientX) - gridDimensions.left,
                dragPositionY = Math.round(eventClientY) - gridDimensions.top;

            desiredPosition.top = Math.min(
                Math.max(dragPositionY - this.moverOffset.top,
                    0
                ),
                gridDimensions.height - startRender.height - 1
            );
            desiredPosition.left = Math.min(
                Math.max(dragPositionX - this.moverOffset.left,
                    0
                ),
                gridDimensions.width - startRender.width - 1
            );

            let currentFinalPos: GridRectangle = this.determineFinalPos(this.startPosition,
                                                                        this.desiredPosition,
                                                                        this.startRender,
                                                                        this.cellHeight,
                                                                        this.cellWidth);
            this.gridCmp.highlightArea(currentFinalPos);

            this.renderer.setStyle(this.widgetCmp.getEl().nativeElement, 'top', desiredPosition.top + 'px');
            this.renderer.setStyle(this.widgetCmp.getEl().nativeElement, 'left', desiredPosition.left + 'px');

        }
    }

    getAnchor(val: number, max: number): number {
        return (val % max) > (max / 2) ? val + Math.floor(max) : val;
    }

    determineFinalPos(startPosition: GridRectangle,
                      desiredPosition: GridRectangle,
                      startRender: RectanglePixels,
                      cellHeight: number,
                      cellWidth: number): GridRectangle {
        if (startRender.top === desiredPosition.top && startRender.left === desiredPosition.left) {
            return startPosition;
        }

        let anchorTop = this.getAnchor(desiredPosition.top, cellHeight),
            anchorLeft = this.getAnchor(desiredPosition.left, cellWidth);

        let movedDown = anchorTop >= startRender.top,
            movedRight = anchorLeft >= startRender.left;

        let desiredFinalPosition: any = this.gridCmp.rasterizeCoords(anchorLeft, anchorTop);
        let path = new PathIterator(desiredFinalPosition, startPosition);

        while (path.hasNext()) {
            let currPos = path.next();

            let targetArea = new GridRectangle({
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
                let top = targetArea.top,
                    left = targetArea.left,
                    height = targetArea.height,
                    width = targetArea.width;
                if (desiredFinalPosition.top < top) {
                    let checkRect = new GridRectangle({ top: top - 1, left, height, width }),
                        isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
                    while (desiredFinalPosition.top <= targetArea.top - 1 && isRectVacant) {
                        targetArea.top--;
                    }
                } else if (desiredFinalPosition.top > top) {
                    let checkRect = new GridRectangle({ top: top + 1, left, height, width }),
                        isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
                    while (desiredFinalPosition.top >= targetArea.top + 1 && isRectVacant) {
                        targetArea.top++;
                    }
                }
                top = targetArea.top;
                if (desiredFinalPosition.left < left) {
                    let checkRect = new GridRectangle({ top, left: left - 1, height, width }),
                        isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
                    while (desiredFinalPosition.left <= targetArea.left - 1 && isRectVacant) {
                        targetArea.left--;
                    }
                } else if (desiredFinalPosition.left > left) {
                    let checkRect = new GridRectangle({ top, left: left + 1, height, width }),
                        isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
                    while (desiredFinalPosition.left >= targetArea.left + 1 && isRectVacant) {
                        targetArea.left++;
                    }
                }
                return new GridRectangle(targetArea);
            }
        }
        return new GridRectangle(startPosition);
    }
}
