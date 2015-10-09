# angular-gridify

Angular directive that creates a justified grid of elements

## Installation

`bower install angular-gridify --save`

## Demo

http://homerjam.github.io/angular-gridify/

## Usage

#### Important!
A `data-ratio` attribute is required to calculate to determine sizes and layout, this should be calculated as `width / height`.


#### Basic usage example:
```html
    <div class="gridify" ng-gridify="{wrapperSelector: '.wrapper', tileSelector: '.tile', perRow: 5, averageRatio: 1.5, gutter: 10, watch: 'tiles'}">

        <div class="wrapper">
            
            <div ng-repeat="tile in tiles" class="tile" data-ratio="{{tile.ratio}}"></div>

        </div>

    </div>
```

#### Using a function to set perRow value:
```js
module.controller('MyCtrl', function($scope, $window) {
    $scope.getPerRow = function() {
        return $window.innerWidth > 1000 ? 3 : 2;
    };
    
    $scope.tiles = [
        // items here
    ];
});
```
```html
<div ng-controller="MyCtrl">

    <div class="gridify" ng-gridify="{
        wrapperSelector: '.wrapper',
        tileSelector: '.tile',
        perRow: 'getPerRow',
        averageRatio: 1.5,
        gutter: 10,
        watch: 'tiles',
    }">
    
        <div class="wrapper">
            
            <div ng-repeat="tile in tiles" class="tile" data-ratio="{{tile.ratio}}"></div>
    
        </div>
    
    </div>
    
</div>
```
