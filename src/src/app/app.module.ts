import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {ClarityModule} from "clarity-angular";
import {AppRoutingModule} from "./app-routing.module";
import {DemoComponent} from "./demo/demo.component";
import {DocsComponent} from "./docs/docs.component";
import {NgxWidgetGridModule} from "ngx-widget-grid/dist";

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    DocsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ClarityModule.forRoot(),
    NgxWidgetGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
