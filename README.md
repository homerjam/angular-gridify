# angular-gridify

Angular directive that creates a justified grid of elements

## Installation

`npm i -D angular-gridify`

or

`bower i -S angular-gridify`

## Demo

http://homerjam.github.io/angular-gridify/

## Usage

See example for more extensive instruction.

#### Important!
A `ratio` attribute is required on the collection items to calculate layout, this should be the result of `width / height`.

#### Basic usage example:
```js
module.controller('MyCtrl', function($scope, $window) {
    var ctrl = this;

    ctrl.getPerRow = function() {
        return $window.innerWidth > 1000 ? 3 : 2;
    };

    ctrl.collection = [
        // items here
    ];
});
```
```html
<div ng-controller="MyCtrl">

    <hj-gridify hj-gridify-options="{
        collection: ctrl.collection,
        perRow: ctrl.getPerRow,
        averageRatio: 1.5,
        gutter: 10,
    }">

        <div class="tile">
            Tile contents
        </div>

    </hj-gridify>

</div>
```
