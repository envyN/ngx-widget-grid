import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AboutComponent } from './components/about/about.component';
import { BasicExampleComponent } from './components/basic-example/basic-example.component';
import { FixedDimensionExampleComponent } from './components/fixed-dimension-example/fixed-dimension-example.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'about',
    pathMatch: 'full'
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'basic',
    component: BasicExampleComponent
  },
  {
    path: 'fixedDimension',
    component: FixedDimensionExampleComponent
  },
  {
    path: '**',
    redirectTo: 'about',
    pathMatch: 'full'
  }
];

@NgModule({
            imports: [RouterModule.forRoot(routes,
                                           {
    useHash: true,
    preloadingStrategy: PreloadAllModules,
    relativeLinkResolution: 'legacy'
})],
            exports: [RouterModule]
          })
export class AppModuleRouting {}
