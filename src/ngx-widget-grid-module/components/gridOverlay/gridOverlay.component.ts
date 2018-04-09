import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Utils } from '../../Utils';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { GridRenderer } from '../../models/GridRenderer.model';
import { Rectangle } from '../../models/Rectangle.model';

@Component({
             selector: 'ngx-grid-overlay',
             styleUrls: ['./gridOverlay.component.scss'],
             templateUrl: './gridOverlay.component.html',
             changeDetection: ChangeDetectionStrategy.OnPush
           })
export class NgxGridOverlayComponent {

  public activeHighlight: any = null;
  public gridRows: { y: SafeStyle; height: SafeStyle; }[] = [];
  public gridCols: { x: SafeStyle; width: SafeStyle; }[] = [];
  public _renderer: GridRenderer;
  public _highlight?: Rectangle;
  public _showGrid = false;

  constructor(private sanitizer: DomSanitizer) {
  }


  get renderer(): GridRenderer {
    return this._renderer;
  }

  @Input()
  set renderer(renderer: GridRenderer) {
    this._renderer = renderer;
    if (Utils.isDefined(renderer)) {
      this.updateGridLines(renderer, this.showGrid);
    }
  }

  @Input()
  set rows(rows: number) {
    this.updateGridLines(this.renderer, this.showGrid);
  }

  @Input()
  set cols(rows: number) {
    this.updateGridLines(this.renderer, this.showGrid);
  }


  get highlight() {
    return this._highlight;
  }

  @Input()
  set highlight(highlight) {
    this._highlight = highlight;
    this.clearHighlight();
    if (highlight) {
      this.highlightArea(highlight, this.renderer);
    }
  }


  get showGrid() {
    return this._showGrid;
  }

  @Input()
  set showGrid(showGrid: boolean) {
    this._showGrid = showGrid;
    this.updateGridLines(this.renderer, showGrid);
  }

  updateGridLines(renderer: GridRenderer, showGrid: boolean): void {
    this.clearGridLines();
    if (showGrid) {
      this.showGridLines(renderer);
    }
  }

  clearHighlight(): void {
    this.activeHighlight = null;
  }

  clearGridLines(): void {
    this.gridRows.splice(0);
    this.gridCols.splice(0);
  }

  highlightArea(area: Rectangle, renderer: GridRenderer): void {
    const cellSize = renderer.grid.cellSize;
    const cellHeight = cellSize.height;
    const cellWidth = cellSize.width;

    this.activeHighlight = {
      x: (area.left - 1) * cellWidth + '%',
      y: (area.top - 1) * cellHeight + '%',
      height: area.height * cellHeight + '%',
      width: area.width * cellWidth + '%'
    };
    this.sanitizer.bypassSecurityTrustStyle(this.activeHighlight);
  }

  showGridLines(renderer: GridRenderer): void {
    const cellHeight = renderer.grid.cellSize.height;
    const cellWidth = renderer.grid.cellSize.width;
    const height = cellHeight + '%';
    const width = cellWidth + '%';
    const rows = renderer.grid.rows;
    const cols = renderer.grid.columns;
    for (let i = 1; i < rows; i += 2) {
      let y: string, h: string, row: { y: SafeStyle, height: SafeStyle };
      y = (i * cellHeight) + '%';
      h = 'calc(' + height + ' - 1px)';
      row = {
        y: this.sanitizer.bypassSecurityTrustStyle(y),
        height: this.sanitizer.bypassSecurityTrustStyle(h)
      };
      this.gridRows.push(row);
    }

    for (let i = 1; i < cols; i += 2) {
      let x: string, w: string, col: { x: SafeStyle, width: SafeStyle };
      x = (i * cellWidth) + '%';
      w = 'calc(' + width + ' - 1px)';
      col = {
        x: this.sanitizer.bypassSecurityTrustStyle(x),
        width: this.sanitizer.bypassSecurityTrustStyle(w)
      };
      this.gridCols.push(col);
    }
  }
}
