# Change Log
## 6.0.2 (2019-03-13)
### Fixes
* Fix #18

## 6.0.1 (2019-01-11)
### Fixes
* Fix #16

## 6.0.0 (2018-12-31)
### Fixes
* Fix #4 Added `swapOnMove` for enabling widget swaps on move-drop
* Updated library to Angular 6 and updated the demo app as well

## 5.0.1 (2018-04-13)
### Fixes
* Fix #13 where applications dont pass AOT build due to incomplete metadata.json being generated

## 5.0.0 (2018-04-10)
### Features
* Migrated to **Angular 5.0.0** and hence changing the version number to 5.0.0 skipping 3,4 in between to keep library version in sync with the major version of angular 
* Touch support
* Performance improvement to handle resize and move better along with use of OnPush ChangeDetectionStrategy
* Cleaned up dependencies and peerDependencies
* New Build tools: Yarn + ng-cli
* Shift to [ng-packagr](https://github.com/dherges/ng-packagr) for packaging the library

### Breaking Changes
* `GridRectangle` class has been renamed to `Rectangle`
* `GridPoint` class has been renamed to `Cell`

## 2.0.0
### Features
* Migrated to Angular 4.0.0. Updated peerDependencies
## 1.0.7
### Features
* Further development to be tracked in branch : 'angular-2'
* Aot Compilable
