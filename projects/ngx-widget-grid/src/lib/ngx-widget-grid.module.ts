import { NgModule } from '@angular/core';
import { NgxGridOverlayComponent } from './components/gridOverlay/gridOverlay.component';
import { NgxWidgetComponent } from './components/widget/widget.component';
import { NgxWidgetGridComponent } from './components/grid/grid.component';
import { NgxWidgetMoverDirective } from './directives/widgetMover.directive';
import { NgxWidgetResizerDirective } from './directives/widgetResizer.directive';
import { CommonModule } from '@angular/common';

@NgModule({
            imports: [
              CommonModule
            ],
            declarations: [
              NgxGridOverlayComponent,
              NgxWidgetComponent,
              NgxWidgetGridComponent,
              NgxWidgetMoverDirective,
              NgxWidgetResizerDirective
            ],
            exports: [
              NgxWidgetComponent,
              NgxWidgetGridComponent
            ]
          })
export class NgxWidgetGridModule {}
