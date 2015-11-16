/*

    Name: angular-gridify
    Description: Angular directive that creates a justified grid of elements
    Author: jameshomer85@gmail.com
    Licence: MIT

    Example usage:

    A `ratio` attribute is required on the collection items to calculate layout, this should be the result of `width / height`

        <div hj-gridify="{collection: collection, perRow: 5, averageRatio: 1.5, gutter: 10}">

          <div class="tile">
            Tile contents
          </div>

        </div>

*/
(function () {
  'use strict';

  angular.module('hj.gridify', [])

    .directive('inject', ['$log', function ($log) {
      return {
        link: function ($scope, $element, $attrs, controller, $transclude) {
          if (!$transclude) {
            $log.error('ngTransclude:' +
              'Illegal use of ngTransclude directive in the template! ' +
              'No parent directive that requires a transclusion found. ' +
              'Element: {0}',
              $element);
          }
          var innerScope = $scope.$new();
          $transclude(innerScope, function (clone) {
            $element.empty();
            $element.append(clone);
            $element.on('$destroy', function () {
              innerScope.$destroy();
            });
          });
        },
      };
    }])

    .directive('hjGridify', ['$rootScope', '$log', '$timeout', '$window',
      function ($rootScope, $log, $timeout, $window) {
        return {
          restrict: 'EA',
          transclude: true,
          template: function ($element, $attr) {
            var itemAs = $attr.hjGridifyItemAs || 'item';
            return '' +
              '<div class="hj-gridify__wrapper">' +
              '<div ng-repeat="' + itemAs + ' in vm.collection" class="hj-gridify__tile" style="display: none" ng-transclude inject></div>' +
              '</div>' +
              '';
          },
          controllerAs: 'vm',
          controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            var vm = this;

            var defaults = {
              perRow: 5,
              gutter: 0,
              watch: true,
              // averageRatio: 1.5, // optionally try to balance rows by working in combination with `perRow`
              // gutterColumns: 10, // gutter between columns, overrides `gutter`
              // gutterRows: 10, // gutter between rows, overrides `gutter`
              // maxRowHeight: 100, // rows will not exceed this height, use in combination with `alignment`
              // alignment: 'left', // left/right/justify - alignment for rows which do not fill width
              // minRowLength: 5, // optionally make rows longer than this fill the available width
              // forceAverageHeight: false, // optionally force last row height to be the average of previous rows (useful for equal sized tiles)
            };

            var options;

            if ($attrs.hjGridifyOptions !== undefined) {
              var origOptions = $scope.$eval($attrs.hjGridifyOptions);

              options = angular.extend(defaults, origOptions);

              $scope.$watch(function () {
                var tempOptions = $scope.$eval($attrs.hjGridifyOptions);

                if (!angular.equals(origOptions, tempOptions)) {
                  origOptions = tempOptions;
                }

                return origOptions;
              }, function (newOptions) {
                options = angular.extend(defaults, newOptions);
              });

            } else {
              options = defaults;
            }

            $element.css({
              position: 'relative',
              display: 'block',
              width: '100%',
            });

            var wrapper = angular.element($element[0].querySelectorAll('.hj-gridify__wrapper'));

            wrapper.css({
              overflow: 'hidden',
            });

            var tiles;

            vm.collection = options.collection;

            var getOption = function (optionName) {
              if (typeof (options[optionName]) === 'string') {
                if (typeof ($scope[options[optionName]]) === 'function') {
                  return $scope[options[optionName]]();
                }
                $log.error('hjGridify: ' + optionName + ' is not a function');
                return null;
              } else if (typeof (options[optionName]) === 'function') {
                return options[optionName]();
              } else if (typeof (options[optionName]) === 'number') {
                return options[optionName];
              } else if (typeof (options[optionName]) === 'object') {
                $log.error('hjGridify: ' + optionName + ' is not valid');
              }
            };

            var resize = function () {
              var totalWidth = $element[0].clientWidth;
              var totalRowHeight = 0;
              var totalRatio = 0;
              var rowRatio = 0;

              var rows = [];
              var perRow = getOption('perRow');
              var gutter = getOption('gutter');

              var gutterColumns = getOption('gutterColumns');
              var gutterRows = getOption('gutterRows');

              var minRowLength = options.minRowLength !== undefined ? getOption('minRowLength') : -1;
              var averageRatio = options.averageRatio !== undefined ? getOption('averageRatio') : 0;

              var maxRowHeight = options.maxRowHeight !== undefined ? getOption('maxRowHeight') : 0;

              var alignment = options.alignment || 'left';

              var forceAverageHeight = options.forceAverageHeight || false;

              var row = {
                tiles: []
              };

              angular.forEach(tiles, function (tile, i) {
                tile = angular.element(tile);

                if (!vm.collection[i].ratio) {
                  return $log.error('hjGridify: tile is missing `ratio` property');
                }

                tile.ratio = vm.collection[i].ratio;
                tile.inverseRatio = 1 / tile.ratio;

                if (averageRatio) {
                  // check if total averageRatio has been exceeded for the row or if row will exceed maxRowHeight - if true create new row
                  if (rowRatio + tile.ratio > averageRatio * perRow && (maxRowHeight === 0 || (maxRowHeight > 0 && totalWidth * (1 / rowRatio) < maxRowHeight))) {
                    row.ratio = rowRatio;
                    rows.push(row);

                    row = {
                      tiles: []
                    };
                    rowRatio = 0;
                  }
                } else {
                  if (row.tiles.length === perRow) {
                    row.ratio = rowRatio;
                    rows.push(row);

                    row = {
                      tiles: [],
                    };
                    rowRatio = 0;
                  }
                }

                rowRatio += tile.ratio;

                row.tiles.push(tile);
              });

              row.ratio = rowRatio;
              rows.push(row);

              angular.forEach(rows, function (row, i) {
                // if this is the last row then figure out what ratio to use (may want tiles to fill width or may want tiles to use average height)
                rowRatio = i === rows.length - 1 && (row.tiles.length < minRowLength || minRowLength === -1) && totalRatio > 0 ? Math.max(totalRatio / (rows.length - 1), row.ratio) : row.ratio;

                totalRatio += rowRatio;

                angular.forEach(row.tiles, function (tile, j) {
                  // if this is the last row then figure out how many gutters we need for calculations
                  var gutters = i === rows.length - 1 && (row.tiles.length < minRowLength || minRowLength === -1) ? Math.max(row.tiles.length - 1, perRow - 1) : row.tiles.length - 1;
                  var width;
                  var height;

                  if (forceAverageHeight && i === rows.length - 1 && rows.length > 1) {
                    height = totalRowHeight / (rows.length - 1);
                    width = height * tile.ratio;

                  } else {
                    width = (tile.ratio / rowRatio) * (totalWidth - ((gutterColumns || gutter) * gutters));
                    height = width * (1 / tile.ratio);
                  }

                  if (maxRowHeight > 0 && height > maxRowHeight) {
                    height = maxRowHeight;
                    width = height / tile.inverseRatio;
                  }

                  if (i < rows.length - 1 && j === 0) {
                    totalRowHeight += height;
                  }

                  var css = {
                    position: 'relative',
                    display: 'block',
                    float: alignment !== 'justify' ? alignment : 'left',
                    width: Math.floor(width),
                    height: Math.floor(height),
                    marginLeft: 0,
                    marginRight: 0,
                  };

                  if (alignment === 'justify' && maxRowHeight > 0 && height === maxRowHeight) {
                    css.marginLeft = j > 0 ? (totalWidth - (maxRowHeight * rowRatio)) / (row.tiles.length - 1) : 0;

                  } else {
                    if (alignment === 'right') {
                      css.marginLeft = j < row.tiles.length - 1 ? (gutterColumns || gutter) : 0;
                    } else {
                      css.marginRight = j < row.tiles.length - 1 ? (gutterColumns || gutter) : 0;
                    }
                  }

                  css.marginBottom = i < rows.length - 1 ? (gutterRows || gutter) : 0;

                  for (var k in css) {
                    if (typeof css[k] === 'number') {
                      css[k] = css[k] + 'px';
                    }
                  }

                  tile.css(css);
                });
              });

              wrapper.css('width', totalWidth);
            };

            var throttleOnAnimationFrame = function (func) {
              var timeout;
              return function () {
                var context = this;
                var args = arguments;
                $window.cancelAnimationFrame(timeout);
                timeout = $window.requestAnimationFrame(function () {
                  func.apply(context, args);
                  timeout = null;
                });
              };
            };

            var throttledResize = throttleOnAnimationFrame(resize);

            angular.element($window).on('resize', throttledResize);

            var init = function () {
              tiles = angular.element($element[0].querySelectorAll('.hj-gridify__tile'));

              resize();

              $timeout(resize); // trigger resize a second time just in case scrollbars kicked in
            };

            $timeout(init); // wait for ng-repeat elements to be rendered

            if (options.watch) {
              $scope.$watch(function () {
                return options.collection;
              }, function () {
                vm.collection = options.collection;

                $timeout(init); // wait for ng-repeat elements to be rendered
              }, true);
            }

            $scope.$on('gridify:init', function () {
              $timeout(init); // wait for ng-repeat elements to be rendered
            });

            $scope.$on('$destroy', function () {
              angular.element($window).off('resize', throttledResize);
            });

          }],
        };
      }
    ]);

})();
