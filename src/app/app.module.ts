import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/root/app.component';
import { NgxWidgetGridModule } from 'ngx-widget-grid';
import { FormsModule } from '@angular/forms';
import { ClarityModule, ClrFormsModule } from '@clr/angular';
import { AppModuleRouting } from './app.module.routing';
import { AboutComponent } from './components/about/about.component';
import { BasicExampleComponent } from './components/basic-example/basic-example.component';

@NgModule({
            declarations: [
              AppComponent,
              AboutComponent,
              BasicExampleComponent
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
export class AppModule {}
