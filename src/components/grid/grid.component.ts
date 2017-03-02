import {
    Component, Input, Output, EventEmitter, ElementRef,
    AfterViewInit, QueryList, ContentChildren, Renderer
} from "@angular/core";
import {Grid} from "../../models/Grid.model";
import {NgxWidgetComponent} from "../widget/widget.component";
import {GridRenderer} from "../../models/GridRenderer.model";
import {GridPoint} from "../../models/GridPoint.model";
import {WidgetConfig} from "../../models/WidgetConfig.model";
import {GridRectangle} from "../../models/GridRectangle.model";
@Component({
    selector: 'ngx-widget-grid',
    styleUrls: ['./grid.component.css'],
    templateUrl: './grid.component.html'
})
export class NgxWidgetGridComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        this.refreshWidgets();
        this.widgetComponents.changes.subscribe(() => {
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

    constructor(private el: ElementRef, private _renderer: Renderer) {
        this.grid = new Grid(this.rows, this.columns);
        this.gridRenderer = new GridRenderer(this.grid);
    }

    private _rows: number;
    @Input()
    set rows(rows) {
        this._rows = rows;
        this.updateGridSize();
    }

    get rows() {
        return this._rows;
    }

    private _columns: number;
    @Input()
    set columns(cols) {
        this._columns = cols;
        this.updateGridSize();
    }

    get columns() {
        return this._columns;
    }

    @Input() private showGrid: boolean = false;

    private _highlightNextPosition: boolean = false;

    @Input()
    set highlightNextPosition(highlightNext: boolean) {
        this._highlightNextPosition = highlightNext;
        if (highlightNext) {
            this.updateNextPositionHighlight();
        } else {
            this.resetHighlights();
        }
    }

    get highlightNextPosition(): boolean {
        return this._highlightNextPosition;
    }

    @Input()
    public clickThrough: boolean = false;

    @Output('widgetPositionChange')
    private widgetPositionChangeEmitter = new EventEmitter();

    @Output('gridFull')
    private gridFullEmitter = new EventEmitter();

    @ContentChildren(NgxWidgetComponent)
    private widgetComponents: QueryList<NgxWidgetComponent>;

    public grid: Grid;
    private gridRenderer: GridRenderer;
    private highlightedArea: GridRectangle;
    private gridAlreadyFull: boolean = false;

    hasWidget(widget: NgxWidgetComponent): boolean {
        return this.grid.hasWidget(widget.getConfig());
    }

    addWidget(widget: NgxWidgetComponent, deferredRender?: boolean) {
        this.grid.add(widget.getConfig());
        if (!deferredRender) {
            this.updateRendering();
        }
    }

    removeWidget(widget: NgxWidgetComponent) {
        this.grid.remove(widget.getConfig());
        this.updateRendering();
    }

    updateGridSize() {
        let columns = this.columns;
        let rows = this.rows;
        if (this.grid.columns !== columns || this.grid.rows !== rows) {
            this.grid.resize(rows, columns);
            this.updateRendering();
        }
    }

    updateRendering() {
        this.gridRenderer.render(this.grid, this.emitUpdatePosition.bind(this));
        this.updateNextPositionHighlight();
        //TODO: retrieve all widgets and call their updateRendering
        if (this.widgetComponents) {
            this.widgetComponents.forEach((widget: NgxWidgetComponent) => {
                this.updateWidget(widget);
            });
        }
    }

    getGridRectangle(): GridRectangle {
        let gridContainer = this.el.nativeElement;

        // c.f. jQuery#offset: https://github.com/jquery/jquery/blob/2d715940b9b6fdeed005cd006c8bf63951cf7fb2/src/offset.js#L93-105
        let rect = gridContainer.getBoundingClientRect();
        if (rect.width || rect.height || gridContainer.getClientRects().length) {
            let doc = gridContainer.ownerDocument;
            let docElem = doc.documentElement;
            return new GridRectangle({
                top: rect.top + window.pageYOffset - docElem.clientTop,
                left: rect.left + window.pageXOffset - docElem.clientLeft,
                height: rect.height,
                width: rect.width
            });
        }
        return new GridRectangle({top: 0, left: 0, height: 0, width: 0});
    }

    rasterizeCoords(x: number, y: number): GridPoint {
        return this.gridRenderer.rasterizeCoords(x, y, this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
    }

    updateWidget(widget: NgxWidgetComponent) {
        let config = widget.getConfig();
        let newPosition = config.position;
        let el: ElementRef = widget.getEl();
        this.gridRenderer.setWidgetPosition(config.getId(), newPosition);
        let widgetStyles: any = this.getWidgetStyle(widget);
        for (let style in widgetStyles) {
            this._renderer.setElementStyle(el.nativeElement, style, widgetStyles[style]);
        }
        this.emitUpdatePosition(config);
        this.assessAvailableGridSpace();
    }

    getWidgetPosition(widget: NgxWidgetComponent) {
        return this.gridRenderer.getWidgetPosition(widget.getConfig());
    }

    getWidgetStyle(widget: NgxWidgetComponent) {
        return this.gridRenderer.getStyle(widget.getConfig().getId());
    }

    isPointObstructed(i: number, j: number) {
        return this.gridRenderer ? this.gridRenderer.isObstructed(i, j) : true;
    }

    isAreaObstructed(area: GridRectangle, options: any): boolean {
        return this.gridRenderer ? this.gridRenderer.isAreaObstructed(area, options) : true;
    }

    highlightArea(area: GridRectangle) {
        if (area.top && area.left && area.height && area.width) {
            setTimeout(() => {
                this.highlightedArea = area;
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
        });
    }

    emitUpdatePosition(widget: WidgetConfig) {
        this.widgetPositionChangeEmitter.emit({
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
        let gridHasSpaceLeft = this.gridRenderer.hasSpaceLeft();
        if (this.gridAlreadyFull) {
            if (gridHasSpaceLeft) {
                this.gridFullEmitter.emit(false);
                this.gridAlreadyFull = false;
            } else {
                /*No change to grid status. was and still is full*/
            }
        } else {
            if (!gridHasSpaceLeft) {
                this.gridFullEmitter.emit(true);
                this.gridAlreadyFull = true;
            } else {
                /*No change to grid status. had and still has available space*/
            }
        }
    }
}
