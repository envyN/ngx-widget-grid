import {Routes, RouterModule} from '@angular/router';

import {NgModule} from '@angular/core';
import {AppComponent} from "./app.component";
import {DemoComponent} from "./demo/demo.component";
import {DocsComponent} from "./docs/docs.component";

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'demo',
    pathMatch: 'full'
  },
  {
    path: 'demo',
    component: DemoComponent
  },
  {
    path: 'docs',
    component: DocsComponent
  },
  {
    path: '**',
    component: AppComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
