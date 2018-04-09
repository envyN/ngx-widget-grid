import { NgModule } from '@angular/core';
import { NgxGridOverlayComponent } from './components/gridOverlay/gridOverlay.component';
import { NgxWidgetComponent } from './components/widget/widget.component';
import { NgxWidgetGridComponent } from './components/grid/grid.component';
import { CommonModule } from '@angular/common';
import { NgxWidgetMoverDirective } from './directives/widgetMover.directive';
import { NgxWidgetResizerDirective } from './directives/widgetResizer.directive';

@NgModule({
            imports: [CommonModule],
            declarations: [
              NgxGridOverlayComponent,
              NgxWidgetComponent,
              NgxWidgetGridComponent,
              NgxWidgetMoverDirective,
              NgxWidgetResizerDirective],
            providers: [],
            exports: [
              NgxWidgetComponent,
              NgxWidgetGridComponent
            ]
          })
export class NgxWidgetGridModule {
}
