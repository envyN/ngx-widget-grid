# ngx-widget-grid

A flexible grid layout for responsive dashboards

Inspired from [**http://patbuergin.github.io/angular-widget-grid/**](http://patbuergin.github.io/angular-widget-grid/) and written as a pure Angular 2.x module.
#### Demo: http://patbuergin.github.io/angular-widget-grid/

## Installation
Install with [npm](http://www.npmjs.com/):

```sh
$ npm install ngx-widget-grid
```


Add the ngx-widget-grid module as a dependency to your application module:

```ecmascript 6
import { NgxWidgetGridModule } from 'ngx-widget-grid';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    NgxWidgetGridModule,
    ...
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Usage
#### Minimal Example
```html
<ngx-widget-grid [rows]="4" [columns]="5" [highlightNextPosition]="false"
                 [showGrid]="true" (widgetPositionChange)="onWidgetChange($event)">
  <ngx-widget [position]="{top: 2,left: 2,height: 1,width: 1}"
              [movable]="true" [resizable]="true">
    <div style="height:100%;width:100%; display:flex;">
      <div style="height:100%;width:100%; padding:10px; background-color: rgb(140, 198, 0);">
      </div>
    </div>
  </ngx-widget>
</ngx-widget-grid>
```
![Minimal Example](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-1.png)


### Adding Traits
#### Widgets
##### `movable`
```html
<ngx-widget [movable]="true" position="...">
```
If `movable` is true, users will be able to move the respective widget.

![Moving Widgets](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-2.png)

##### `resizable`
```html
<ngx-widget [resizable]="true" position="...">
```
If `resizable` is true, users will be able to resize the respective widget.

![Resizing Widgets](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-3.png)

Optionally, you can limit the resize directions:
```html
<ngx-widget [resizeDirections]="['NW', 'NE', 'E', 'SW']" ...>
```

![Restricted Resizing](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-4.png)

#### Grid: Options
##### `showGrid` (default: `false`)
```html
<ngx-grid columns="20" rows="15" [showGrid]="true">
```
Toggles the gridlines.

![Gridlines Enabled](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-5.png)

##### `highlightNextPosition` (default: `false`)
```html
<ngx-grid columns="20" rows="15" [highlightNextPosition]="true">
```
Highlights the largest free area in the grid, if any. This area will be automatically assigned to the next widget with a falsy or conflicting position.

![Highlight Next Position (1/2)](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-6.png)
![Highlight Next Position (2/2)](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-7.png)


### Events
##### `wg-grid-full` & `wg-grid-space-available` (TODO)
The grid emits `wg-grid-full` and `wg-grid-space-available` in the respective situations, so that you can e.g. enable/disable UI elements accordingly.


##### `widgetPositionChange`
Emitted whenever the position of a widget is changed. The event comes with an attached object argument, which contains the affected widget's `index` and its `newPosition`.

```html
<ngx-grid columns="20" rows="15" (widgetPositionChange)="onWidgetChange($event)">
```

## Build
Check out `/src` for the original source code.

