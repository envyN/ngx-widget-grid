import { Directive, ElementRef, forwardRef, HostListener, Inject, Input, Renderer2 } from '@angular/core';
import { NgxWidgetGridComponent } from '../components/grid/grid.component';
import { Rectangle } from '../models/Rectangle.model';
import { NgxWidgetComponent } from '../components/widget/widget.component';
import { PathIterator } from '../models/PathIterator.model';

export interface RectanglePixels {
  top: number;
  left: number;
  height: number;
  width: number;
}

@Directive({
             selector: '[ngxWidgetMover]'
           })
export class NgxWidgetMoverDirective {

  public cellHeight: number;
  public cellWidth: number;
  public startRender: RectanglePixels;
  public gridPositions: Rectangle;
  public moverOffset: Rectangle;
  public desiredPosition: any;
  public startPosition: Rectangle;
  public enableDrag: string = null;
  private _onMoveListener = this.onMove.bind(this);
  private _onUpListener = this.onUp.bind(this);

  @Input()
  public ngxWidgetMover = false;

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              @Inject(forwardRef(() => NgxWidgetGridComponent))
              private gridCmp: NgxWidgetGridComponent,
              @Inject(forwardRef(() => NgxWidgetComponent))
              private widgetCmp: NgxWidgetComponent) {
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('pointerdown', ['$event'])
  onDown(event: MouseEvent) {
    event.preventDefault();
    this.renderer.addClass(this.widgetCmp.getEl().nativeElement, 'wg-moving');
    const widgetContainer = this.widgetCmp.getEl().nativeElement;

    this.startPosition = this.gridCmp.getWidgetPosition(this.widgetCmp);

    this.startRender = {
      top: widgetContainer.offsetTop,
      left: widgetContainer.offsetLeft,
      height: widgetContainer.clientHeight,
      width: widgetContainer.clientWidth
    }; // pixel values

    const eventOffsetX = event.offsetX || event.layerX;
    const eventOffsetY = event.offsetY || event.layerY;

    this.desiredPosition = {top: this.startRender.top, left: this.startRender.left};

    this.moverOffset = new Rectangle({
                                       top: eventOffsetY + this.el.nativeElement.offsetTop || 0,
                                       left: eventOffsetX + this.el.nativeElement.offsetLeft || 0
                                     });

    this.gridPositions = this.gridCmp.getGridRectangle();
    this.cellHeight = (this.gridCmp.grid.cellSize.height / 100) * this.gridPositions.height;
    this.cellWidth = (this.gridCmp.grid.cellSize.width / 100) * this.gridPositions.width;
    this.enableDrag = this.widgetCmp.getConfig().id;
    if (typeof PointerEvent !== 'undefined') {
      window.addEventListener('pointermove', this._onMoveListener);
      window.addEventListener('pointerup', this._onUpListener);
    } else {
      window.addEventListener('mousemove', this._onMoveListener);
      window.addEventListener('mouseup', this._onUpListener);
    }
  }

  onUp(event: MouseEvent) {
    if (this.enableDrag === this.widgetCmp.getConfig().id) {
      event.preventDefault();
      const eventClientX = event.clientX;
      const eventClientY = event.clientY;
      const startRender = this.startRender;
      const gridDimensions = this.gridPositions;
      const desiredPosition = this.desiredPosition;
      // normalize the drag position
      const dragPositionX = Math.round(eventClientX) - gridDimensions.left,
        dragPositionY = Math.round(eventClientY) - gridDimensions.top;

      desiredPosition.top = Math.min(
        Math.max(dragPositionY - this.moverOffset.top, 0),
        gridDimensions.height - startRender.height - 1
      );
      const anchorTop = this.getAnchor(Math.max(dragPositionY, 0), this.cellHeight, 1);
      const anchorLeft = this.getAnchor(Math.max(dragPositionX, 0), this.cellWidth, 1);
      const dropPosition: any = this.gridCmp.rasterizeCoords(anchorLeft, anchorTop);
      const obstructingWidgetId = this.gridCmp.areaObstructor(dropPosition);
      let finalPos;
      if (obstructingWidgetId && this.ngxWidgetMover) {
        const obstructingWidgetCmp: NgxWidgetComponent = this.gridCmp.getWidgetById(obstructingWidgetId);
        const obstructingWidgetPosition = this.gridCmp.getWidgetPositionByWidgetId(obstructingWidgetId);
        const draggedWidgetPosition = this.widgetCmp.position;
        this.widgetCmp.position = obstructingWidgetPosition;
        this.gridCmp.updateWidget(this.widgetCmp, true);
        obstructingWidgetCmp.position = draggedWidgetPosition;
        this.gridCmp.updateWidget(obstructingWidgetCmp, true);
      } else {
        finalPos = this.determineFinalPos(this.startPosition,
                                          this.desiredPosition,
                                          this.startRender,
                                          this.cellHeight,
                                          this.cellWidth);
        this.widgetCmp.position = finalPos;
        this.gridCmp.updateWidget(this.widgetCmp, false);
      }
      this.gridCmp.resetHighlights();
      this.renderer.removeClass(this.widgetCmp.getEl().nativeElement, 'wg-moving');
      this.enableDrag = null;
    }
    if (typeof PointerEvent !== 'undefined') {
      window.removeEventListener('pointermove', this._onMoveListener);
      window.removeEventListener('pointerup', this._onUpListener);
    } else {
      window.removeEventListener('mousemove', this._onMoveListener);
      window.removeEventListener('mouseup', this._onUpListener);
    }
  }

  onMove(event: MouseEvent) {
    if (this.enableDrag === this.widgetCmp.getConfig().id) {
      event.preventDefault();
      const eventClientX = event.clientX;
      const eventClientY = event.clientY;
      const startRender = this.startRender;
      const gridDimensions = this.gridPositions;
      const desiredPosition = this.desiredPosition;
      // normalize the drag position
      const dragPositionX = Math.round(eventClientX) - gridDimensions.left,
        dragPositionY = Math.round(eventClientY) - gridDimensions.top;

      desiredPosition.top = Math.min(
        Math.max(dragPositionY - this.moverOffset.top, 0),
        gridDimensions.height - startRender.height - 1
      );
      desiredPosition.left = Math.min(
        Math.max(dragPositionX - this.moverOffset.left, 0),
        gridDimensions.width - startRender.width - 1
      );
      const currentFinalPos: Rectangle = this.determineFinalPos(this.startPosition,
                                                                this.desiredPosition,
                                                                this.startRender,
                                                                this.cellHeight,
                                                                this.cellWidth);
      this.gridCmp.highlightArea(currentFinalPos);

      this.renderer.setStyle(this.widgetCmp.getEl().nativeElement, 'top', desiredPosition.top + 'px');
      this.renderer.setStyle(this.widgetCmp.getEl().nativeElement, 'left', desiredPosition.left + 'px');
    }
  }

  getAnchor(val: number, cellWOrH: number, marginFactor = 2): number {
    return (val % cellWOrH) > (cellWOrH / marginFactor) ? val + Math.floor(cellWOrH) : val;
  }

  determineFinalPos(startPos: Rectangle, desiredPos: Rectangle, startRender: RectanglePixels,
                    cellHt: number, cellWd: number): Rectangle {
    if (startRender.top === desiredPos.top && startRender.left === desiredPos.left) {
      return startPos;
    }

    const anchorTop = this.getAnchor(desiredPos.top, cellHt);
    const anchorLeft = this.getAnchor(desiredPos.left, cellWd);

    const movedDown = anchorTop >= startRender.top;
    const movedRight = anchorLeft >= startRender.left;

    const desiredFinalPosition: any = this.gridCmp.rasterizeCoords(anchorLeft, anchorTop);
    const path = new PathIterator(desiredFinalPosition, startPos);

    while (path.hasNext()) {
      const currPos = path.next();

      const targetArea = new Rectangle({
                                         top: currPos.top,
                                         left: currPos.left,
                                         height: startPos.height,
                                         width: startPos.width
                                       });

      const options = {
        excludedArea: startPos,
        fromBottom: movedDown,
        fromRight: movedRight
      };
      // If widget swap is enabled and area is obstructed, show original position
      if (this.ngxWidgetMover && this.gridCmp.isAreaObstructed(targetArea, options)) {
        return new Rectangle(startPos);
      }
      if (!this.gridCmp.isAreaObstructed(targetArea, options)) {
        // try to get closer to the desired position by leaving the original path
        let top = targetArea.top;
        const left = targetArea.left;
        const height = targetArea.height;
        const width = targetArea.width;
        if (desiredFinalPosition.top < top) {
          const checkRect = new Rectangle({top: top - 1, left, height, width});
          const isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
          while (desiredFinalPosition.top <= targetArea.top - 1 && isRectVacant) {
            targetArea.top--;
          }
        } else if (desiredFinalPosition.top > top) {
          const checkRect = new Rectangle({top: top + 1, left, height, width});
          const isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
          while (desiredFinalPosition.top >= targetArea.top + 1 && isRectVacant) {
            targetArea.top++;
          }
        }
        top = targetArea.top;
        if (desiredFinalPosition.left < left) {
          const checkRect = new Rectangle({top, left: left - 1, height, width});
          const isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
          while (desiredFinalPosition.left <= targetArea.left - 1 && isRectVacant) {
            targetArea.left--;
          }
        } else if (desiredFinalPosition.left > left) {
          const checkRect = new Rectangle({top, left: left + 1, height, width});
          const isRectVacant = !this.gridCmp.isAreaObstructed(checkRect, options);
          while (desiredFinalPosition.left >= targetArea.left + 1 && isRectVacant) {
            targetArea.left++;
          }
        }
        return new Rectangle(targetArea);
      }
    }
    return new Rectangle(startPos);
  }
}
