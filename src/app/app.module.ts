import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/root/app.component';
import { NgxWidgetGridModule } from 'ngx-widget-grid';
import { FormsModule } from '@angular/forms';
import { ClarityModule, ClrFormsModule } from '@clr/angular';
import { AppModuleRouting } from './app.module.routing';
import { AboutComponent } from './components/about/about.component';
import { BasicExampleComponent } from './components/basic-example/basic-example.component';
import { FixedDimensionExampleComponent } from './components/fixed-dimension-example/fixed-dimension-example.component';
import {ClarityIcons, minusIcon, pencilIcon, plusIcon, trashIcon} from '@cds/core/icon';

@NgModule({
            declarations: [
              AppComponent,
              AboutComponent,
              BasicExampleComponent,
              FixedDimensionExampleComponent
            ],
            imports: [
              AppModuleRouting,
              BrowserModule,
              FormsModule,
              NgxWidgetGridModule,
              ClarityModule,
              ClrFormsModule
            ],
            providers: [],
            bootstrap: [AppComponent]
          })
export class AppModule {
  constructor() {
    ClarityIcons.addIcons(
      plusIcon,
      pencilIcon,
      minusIcon,
      trashIcon
    );
  }
}
