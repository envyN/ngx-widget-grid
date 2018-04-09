import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NgxWidgetGridModule } from '../ngx-widget-grid-module/ngx-widget-grid.module';
import { ClarityModule } from '@clr/angular';

@NgModule({
            declarations: [
              AppComponent
            ],
            imports: [
              BrowserModule,
              FormsModule,
              NgxWidgetGridModule,
              ClarityModule
            ],
            providers: [],
            bootstrap: [AppComponent]
          })
export class AppModule {
}
