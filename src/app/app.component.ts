import { Component, HostListener, ViewChild } from '@angular/core';
import { NgxWidgetGridComponent } from '../ngx-widget-grid-module/components/grid/grid.component';

@Component({
             selector: 'app-root',
             templateUrl: './app.component.html',
             styleUrls: ['./app.component.scss']
           })
export class AppComponent {
  title = 'app works!';
  single: any[] = [{
    'name': 'Success',
    'value': 50
  },
    {
      'name': 'Failed',
      'value': 26
    },
    {
      'name': 'InProgress',
      'value': 15
    }];
  multi: any[];
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Status';
  showYAxisLabel = true;
  yAxisLabel = 'Executions';
  colorScheme = {
    domain: ['#60B515', '#E62700', '#0094D2', '#EFD603', '#E62700']
  };
  @ViewChild('grid') grid: NgxWidgetGridComponent;
  private dashboardPages: any[] = [{}];
  private resized = true;
  private rows = 6;
  private cols = 6;
  private widgets = [
    {
      top: 1,
      left: 1,
      height: 1,
      width: 1
    },
    {
      top: 2,
      left: 2,
      height: 1,
      width: 1
    }, {
      top: 3,
      left: 3,
      height: 2,
      width: 2
    }];
  private view: number[] = null;
  private showGrid = true;
  private highlightNextPosition = false;
  private clickThrough = true;
  private editable = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resized = false;
    setTimeout(() => {
      this.resized = true;
    }, 0);
  }

  toggleHighlight(doHighlight: boolean) {
    this.highlightNextPosition = !!doHighlight;
  }

  addWidget() {
    const nextPosition = this.grid.getNextPosition();
    if (nextPosition) {
      this.widgets.push(nextPosition);
    } else {
      console.warn('No Space Available!! ');
    }
  }

  askDeleteWidget(index) {
    console.log('deleting', index);
    this.widgets.splice(index, 1);
  }

  deleteWidget() {
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
  }

  toggleClickThrough() {
    this.clickThrough = !this.clickThrough;
  }

  onWidgetChange(event) {
    this.view = [400, 300];
    setTimeout(() => {
      this.view = undefined;
    }, 0);
  }


  doRows(add: boolean) {
    if (add) {
      this.rows++;
    } else {
      if (this.rows > 1) {
        this.rows--;
      }
    }
  }

  doCols(add: boolean) {
    if (add) {
      this.cols++;
    } else {
      if (this.cols > 1) {
        this.cols--;
      }
    }
  }


  onSelect(event) {
    console.log(event);
  }
}
