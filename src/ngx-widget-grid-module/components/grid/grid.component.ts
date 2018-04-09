import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  Renderer2
} from '@angular/core';
import { Grid } from '../../models/Grid.model';
import { NgxWidgetComponent } from '../widget/widget.component';
import { GridRenderer } from '../../models/GridRenderer.model';
import { Cell } from '../../models/Cell.model';
import { WidgetConfig } from '../../models/WidgetConfig.model';
import { Rectangle } from '../../models/Rectangle.model';

@Component({
             selector: 'ngx-widget-grid',
             styleUrls: ['./grid.component.scss'],
             templateUrl: './grid.component.html',
             changeDetection: ChangeDetectionStrategy.OnPush
           })
export class NgxWidgetGridComponent implements AfterViewInit {

  @Input() showGrid = false;
  @Input() public clickThrough = false;
  @Output() public widgetPositionChange = new EventEmitter();
  @Output() public gridFull = new EventEmitter();
  @ContentChildren(NgxWidgetComponent) public widgetComponents: QueryList<NgxWidgetComponent>;
  public grid: Grid;
  public gridRenderer: GridRenderer;
  public highlightedArea: Rectangle;
  public gridAlreadyFull = false;
  public _rows: number;
  public _columns: number;
  public _highlightNextPosition = false;

  constructor(private el: ElementRef,
              private _changeDetector: ChangeDetectorRef,
              private _renderer: Renderer2) {
    this.grid = new Grid(this.rows, this.columns);
    this.gridRenderer = new GridRenderer(this.grid);
  }

  get rows() {
    return this._rows;
  }

  @Input()
  set rows(rows) {
    this._rows = rows;
    this.updateGridSize();
  }

  get columns() {
    return this._columns;
  }

  @Input()
  set columns(cols) {
    this._columns = cols;
    this.updateGridSize();
  }

  get highlightNextPosition(): boolean {
    return this._highlightNextPosition;
  }

  @Input()
  set highlightNextPosition(highlightNext: boolean) {
    this._highlightNextPosition = highlightNext;
    if (highlightNext) {
      this.updateNextPositionHighlight();
    } else {
      this.resetHighlights();
    }
  }

  ngAfterViewInit(): void {
    this.refreshWidgets();
    this.widgetComponents.changes.subscribe(() => {
      this.clearGrid();
      this.refreshWidgets();
    });
  }

  refreshWidgets() {
    this.widgetComponents.forEach((widget: NgxWidgetComponent) => {
      if (!this.hasWidget(widget)) {
        this.addWidget(widget, true);
      } else {
      }
    });
    this.updateRendering();
  }

  hasWidget(widget: NgxWidgetComponent): boolean {
    return this.grid.hasWidget(widget.getConfig());
  }

  addWidget(widget: NgxWidgetComponent, deferredRender?: boolean) {
    this.grid.add(widget.getConfig());
    if (!deferredRender) {
      this.updateRendering();
    }
  }

  clearGrid() {
    this.grid.removeAll();
  }

  updateGridSize() {
    const columns = this.columns;
    const rows = this.rows;
    if (this.grid.columns !== columns || this.grid.rows !== rows) {
      this.grid.resize(rows, columns);
      this.updateRendering();
    }
  }

  updateRendering() {
    this.gridRenderer.render(this.grid, this.emitUpdatePosition.bind(this));
    this.updateNextPositionHighlight();
    // TODO: retrieve all widgets and call their updateRendering
    if (this.widgetComponents) {
      this.widgetComponents.forEach((widget: NgxWidgetComponent) => {
        this.updateWidget(widget);
      });
    }
  }

  getGridRectangle(): Rectangle {
    const gridContainer = this.el.nativeElement;

    // c.f. jQuery#offset: https://github.com/jquery/jquery/blob/2d715940b9b6fdeed005cd006c8bf63951cf7fb2/src/offset.js#L93-105
    const rect = gridContainer.getBoundingClientRect();
    if (rect.width || rect.height || gridContainer.getClientRects().length) {
      const doc = gridContainer.ownerDocument;
      const docElem = doc.documentElement;
      return new Rectangle({
                                 top: rect.top + window.pageYOffset - docElem.clientTop,
                                 left: rect.left + window.pageXOffset - docElem.clientLeft,
                                 height: rect.height,
                                 width: rect.width
                               });
    }
    return new Rectangle({top: 0, left: 0, height: 0, width: 0});
  }

  rasterizeCoords(x: number, y: number): Cell {
    return this.gridRenderer.rasterizeCoords(x, y, this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
  }

  updateWidget(widget: NgxWidgetComponent) {
    const config = widget.getConfig();
    const newPosition = config.position;
    const el: ElementRef = widget.getEl();
    this.gridRenderer.setWidgetPosition(config.getId(), newPosition);
    const widgetStyles = this.getWidgetStyle(widget);
    for (const style in widgetStyles) {
      if (widgetStyles.hasOwnProperty(style)) {
        this._renderer.setStyle(el.nativeElement, style, widgetStyles[style]);
      }
    }
    this.emitUpdatePosition(config);
    this.assessAvailableGridSpace();
  }

  getWidgetPosition(widget: NgxWidgetComponent) {
    return this.gridRenderer.getWidgetPosition(widget.getConfig());
  }

  getWidgetStyle(widget: NgxWidgetComponent) {
    return this.gridRenderer.getStyle(widget.getConfig()
                                            .getId());
  }

  isPointObstructed(i: number, j: number) {
    return this.gridRenderer ? this.gridRenderer.isObstructed(i, j) : true;
  }

  isAreaObstructed(area: Rectangle,
                   options: {
                     excludedArea?: Rectangle;
                     fromBottom?: boolean;
                     fromRight?: boolean;
                   }): boolean {
    return this.gridRenderer ? this.gridRenderer.isAreaObstructed(area, options) : true;
  }

  highlightArea(area: Rectangle) {
    if (area.top && area.left && area.height && area.width) {
      setTimeout(() => {
        this.highlightedArea = area;
        this._changeDetector.markForCheck();
      });
    }
  }

  updateNextPositionHighlight() {
    if (this.highlightNextPosition) {
      this.highlightedArea = this.gridRenderer.getNextPosition();
    }
  }

  getNextPosition() {
    return this.gridRenderer.getNextPosition();
  }

  getPositions() {
    return this.grid.widgets;
  }

  resetHighlights() {
    setTimeout(() => {
      this.highlightedArea = null;
      this._changeDetector.markForCheck();
    });
  }

  emitUpdatePosition(widget: WidgetConfig) {
    this.widgetPositionChange.emit({
                                     index: this.getWidgetIndex(widget),
                                     newPosition: widget.position
                                   });
  }

  getWidgetIndex(widgetConfig: WidgetConfig) {
    for (let i = this.grid.widgets.length - 1; i >= 0; i--) {
      if (this.grid.widgets[i].getId() === widgetConfig.getId()) {
        return i;
      }
    }
    return -1;
  }

  assessAvailableGridSpace() {
    const gridHasSpaceLeft = this.gridRenderer.hasSpaceLeft();
    if (this.gridAlreadyFull) {
      if (gridHasSpaceLeft) {
        this.gridFull.emit(false);
        this.gridAlreadyFull = false;
      } else {
        /*No change to grid status. was and still is full*/
      }
    } else {
      if (!gridHasSpaceLeft) {
        this.gridFull.emit(true);
        this.gridAlreadyFull = true;
      } else {
        /*No change to grid status. had and still has available space*/
      }
    }
  }
}
