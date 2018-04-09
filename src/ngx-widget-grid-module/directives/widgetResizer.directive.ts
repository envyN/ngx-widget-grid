import { Directive, ElementRef, forwardRef, HostListener, Inject, Input, Renderer2 } from '@angular/core';
import { NgxWidgetGridComponent } from '../components/grid/grid.component';
import { NgxWidgetComponent } from '../components/widget/widget.component';
import { Rectangle } from '../models/Rectangle.model';
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
  public parentContainer: any;
  public startRender: any;
  public gridPositions: Rectangle;
  public delta: { top: number, right: number, bottom: number, left: number };
  public draggerOffset: { top: number, right: number, bottom: number, left: number };
  public startPosition: Rectangle;
  public enableDrag: string = null;
  public _resizeDirection: string;
  private _onMoveListener = this.onMove.bind(this);
  private _onUpListener = this.onUp.bind(this);

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              @Inject(forwardRef(() => NgxWidgetGridComponent))
              private gridCmp: NgxWidgetGridComponent,
              @Inject(forwardRef(() => NgxWidgetComponent))
              private widgetCmp: NgxWidgetComponent) {
    this.parentContainer = this.el.nativeElement.parentElement;
  }

  public get resizeDirection() {
    return this._resizeDirection;
  }

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

  @HostListener('pointerdown', ['$event'])
  @HostListener('mousedown', ['$event'])
  onDown(event: MouseEvent) {
    event.preventDefault();
    this.enableDrag = this.widgetCmp.getConfig()
                          .getId();
    this.renderer.addClass(this.widgetCmp.getEl().nativeElement, 'wg-resizing');
    this.renderer.addClass(this.el.nativeElement, 'dragging');
    this.startPosition = this.gridCmp.getWidgetPosition(this.widgetCmp);

    this.startRender = {
      top: Math.ceil(this.widgetCmp.getEl().nativeElement.offsetTop),
      left: Math.ceil(this.widgetCmp.getEl().nativeElement.offsetLeft),
      height: Math.floor(this.parentContainer.offsetHeight),
      width: Math.floor(this.parentContainer.offsetWidth)
    }; // pixel values
    this.startRender.bottom = this.startRender.top + this.startRender.height;
    this.startRender.right = this.startRender.left + this.startRender.width;

    const eventOffsetX = event.offsetX || event.layerX;
    const eventOffsetY = event.offsetY || event.layerY;

    this.delta = {top: 0, right: 0, bottom: 0, left: 0};
    this.draggerOffset = {
      top: eventOffsetY,
      left: eventOffsetX,
      bottom: eventOffsetY - this.el.nativeElement.offsetHeight,
      right: eventOffsetX - this.el.nativeElement.offsetWidth
    };

    this.gridPositions = this.gridCmp.getGridRectangle();
    if (typeof PointerEvent !== 'undefined') {
      window.addEventListener('pointermove', this._onMoveListener);
      window.addEventListener('pointerup', this._onUpListener);
    } else {
      window.addEventListener('mousemove', this._onMoveListener);
      window.addEventListener('mouseup', this._onUpListener);
    }
  }

  onMove(event: MouseEvent) {
    if (this.enableDrag === this.widgetCmp.getConfig()
                                .getId()) {
      event.preventDefault();
      const eventClientX = event.clientX;
      const eventClientY = event.clientY;
      const gridDims = this.gridPositions;
      const startRender = this.startRender;
      // normalize the drag position
      const dragPositionX = Math.round(eventClientX) - gridDims.left;
      const dragPositionY = Math.round(eventClientY) - gridDims.top;
      const delta = this.delta;
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

      const currentFinalPos = this.determineFinalPos();
      this.gridCmp.highlightArea(currentFinalPos);

      this.renderer.setStyle(this.parentContainer, 'top', this.delta.top + 'px');
      this.renderer.setStyle(this.parentContainer, 'left', this.delta.left + 'px');
      this.renderer.setStyle(this.parentContainer, 'bottom', this.delta.bottom + 'px');
      this.renderer.setStyle(this.parentContainer, 'right', this.delta.right + 'px');
    }
  }

  onUp(event: MouseEvent) {
    if (this.enableDrag === this.widgetCmp.getConfig()
                                .getId()) {
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
    if (typeof PointerEvent !== 'undefined') {
      window.removeEventListener('pointermove', this._onMoveListener);
      window.removeEventListener('pointerup', this._onUpListener);
    } else {
      window.addEventListener('mousemove', this._onMoveListener);
      window.addEventListener('mouseup', this._onUpListener);
    }
  }

  findCollision(start: number, end: number, val: number, reverse = false): boolean {
    let foundCollision = false;
    for (let i = start; i <= end; i++) {
      const checker = reverse ? this.gridCmp.isPointObstructed(i, val) : this.gridCmp.isPointObstructed(val, i);
      if (checker) {
        foundCollision = true;
        break;
      }
    }
    return foundCollision;
  }

  determineFinalPos(): any {
    const finalPos: Rectangle = new Rectangle();
    const startRender = this.startRender;
    const delta = this.delta;
    const requestedStartPoint = this.gridCmp.rasterizeCoords(startRender.left + delta.left + 1, startRender.top + delta.top + 1);
    const requestedEndPoint = this.gridCmp.rasterizeCoords(startRender.right - delta.right - 1, startRender.bottom - delta.bottom - 1);

    const requestedPos = {
      top: requestedStartPoint.top,
      left: requestedStartPoint.left,
      right: requestedEndPoint.left,
      bottom: requestedEndPoint.top
    };
    // determine a suitable final position (one that is not obstructed)
    let foundCollision;
    const start = Math.max(this.startPosition.left, requestedPos.left);
    const end = Math.min(this.startPosition.right, requestedPos.right);
    if (this.moveUpAllowed && requestedPos.top < this.startPosition.top) {
      finalPos.top = this.startPosition.top;

      while (finalPos.top > requestedPos.top) {
        // check whether adding another row above would cause any conflict
        foundCollision = this.findCollision(start, end, finalPos.top - 1);
        if (foundCollision) {
          break;
        }
        finalPos.top--; // add row above
      }
    } else if (this.moveDownAllowed && requestedPos.bottom > this.startPosition.bottom) {
      finalPos.top = finalPos.top || requestedPos.top;
      finalPos.height = this.startPosition.bottom + 1 - this.startPosition.top;
      while (finalPos.bottom < requestedPos.bottom) {
        // check whether adding another row below would cause any conflict
        foundCollision = this.findCollision(start, end, finalPos.bottom + 1);
        if (foundCollision) {
          break;
        }
        finalPos.height++; // add row below
      }
    }

    finalPos.top = finalPos.top || requestedPos.top;
    finalPos.height = finalPos.height || requestedPos.bottom + 1 - finalPos.top;

    if (this.moveLeftAllowed && requestedPos.left < this.startPosition.left) {
      finalPos.left = this.startPosition.left;

      while (finalPos.left > requestedPos.left) {
        // check whether adding another column would cause any conflict
        foundCollision = this.findCollision(finalPos.top, finalPos.bottom, finalPos.left - 1, true);
        if (foundCollision) {
          break;
        }

        finalPos.left--; // add column
      }
    } else if (this.moveRightAllowed && requestedPos.right > this.startPosition.right) {
      finalPos.left = finalPos.left || requestedPos.left;
      finalPos.width = this.startPosition.right + 1 - this.startPosition.left;
      while (finalPos.right < requestedPos.right) {
        foundCollision = this.findCollision(finalPos.top, finalPos.bottom, finalPos.right + 1, true);
        if (foundCollision) {
          break;
        }

        finalPos.width++;
      }
    }

    finalPos.left = finalPos.left || requestedPos.left;
    finalPos.width = finalPos.width || requestedPos.right + 1 - finalPos.left;
    return finalPos;
  }
}
