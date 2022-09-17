# ngx-widget-grid
[![codebeat badge](https://codebeat.co/badges/8693fc3e-1013-4d82-a121-9a854c1da50b)](https://codebeat.co/projects/github-com-envyn-ngx-widget-grid-master)

A flexible grid layout for responsive dashboards.

This library got its inspiration from [*angular-widget-grid*](http://patbuergin.github.io/angular-widget-grid/) and has been written as a pure Angular 2.x [+] module.
#### Demo: https://envyn.github.io/ngx-widget-grid

## Installation
Install with [npm](http://www.npmjs.com/):

```sh
$ npm install ngx-widget-grid
```
or with [yarn](https://yarnpkg.com/)
```sh
$ yarn add ngx-widget-grid
```

Add the ngx-widget-grid module as a dependency to your application module:

```
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
  <ngx-widget [(position)]="{top: 2,left: 2,height: 1,width: 1}"
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
##### `position`
```html
<ngx-widget [(position)]="widget.position"></ngx-widget>
```
You can bind the position of the widget to data received from server so that even if the widget is moved, the new positions are always updated in the widget configuration.

##### `movable`
```html
<ngx-widget [movable]="true" [(position)]="widget.position"></ngx-widget>
```
If `movable` is true, users will be able to move the respective widget.

![Moving Widgets](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-2.png)

##### `resizable`
```html
<ngx-widget [resizable]="true" [(position)]="widget.position"></ngx-widget>
```
If `resizable` is true, users will be able to resize the respective widget.

![Resizing Widgets](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-3.png)

Optionally, you can limit the resize directions:
```html
<ngx-widget [resizeDirections]="['NW', 'NE', 'E', 'SW']" [(position)]="widget.position"></ngx-widget>
```

![Restricted Resizing](https://raw.githubusercontent.com/patbuergin/angular-widget-grid/master/doc/wg-4.png)

##### `swapOnMove`
````html
<ngx-widget [swapOnMove]="true" [(position)]="widget.position"></ngx-widget>
````
If `swapOnMove` is `true`, dragged widget will swap position and size with the widget over which the current one is dropped.
Default is `false` which means, widget will be placed in the nearest available area.
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
##### `gridFull`
The grid emits `gridFull`event as `true` (when grid has been fully occupied) or `false` when there is still some space left in the grid, so that you can e.g. enable/disable UI elements accordingly.
```html
<ngx-grid columns="20" rows="15" (gridFull)="onGridFull($event)">
```
```javascript
function onGridFull(isGridFull) {
    if(isGridFull){
        //...
        //make add widget button disabled
        //...
    }else{
        //...
        //make add widget button enabled
        //...
    }
}
```
##### `widgetPositionChange`
Emitted whenever the position of a widget is changed. The event comes with an attached object argument, which contains the affected widget's `index` and its `newPosition`.

```html
<ngx-grid columns="20" rows="15" (widgetPositionChange)="onWidgetChange($event)">
```

### Functions
#### getNextPosition
`getNextPosition` is a function you could call to get details about the next available position that is being highlighted as part of `highlightNextPosition`.


## Build (for developers/contributors)
* Install [yarn](https://yarnpkg.com/lang/en/docs/install/)
* Install dependencies
  ```nodejs
  yarn install
  ```
* Build library
  ```nodejs
  yarn build-lib
  ```
* Run
  ```nodejs
  yarn start
  ```
* Build
  ```nodejs
  yarn build
  ```
* Link
  ```nodejs
  cd dist && yarn link
  ```
* Publish (from repo root directory)
  ```nodejs
  yarn publish:lib --new-version <version>
  ```
## License
MIT
