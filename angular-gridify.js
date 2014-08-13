/*

    Name: angular-gridify
    Description: Angular directive that creates a justified grid of elements
    Author: jameshomer85@gmail.com
    Licence: MIT

    Example usage:

    A `data-ratio` attribute is required to calculate to determine sizes and layout, this should be calculated as `width / height`

        <div class="gridify" ng-gridify="{wrapperSelector: '.wrapper', tileSelector: '.tile', perRow: 5, averageRatio: 1.5, gutter: 10, watch: 'tiles'}">

            <div class="wrapper">
                
                <div ng-repeat="tile in tiles" class="tile" data-ratio="{{tile.ratio}}"></div>

            </div>

        </div>

*/
(function() {
    'use strict';

    angular.module('angular-gridify', []).directive('ngGridify', ['$log', '$timeout', '$window',
        function($log, $timeout, $window) {
            return {
                restrict: 'A',
                link: function link(scope, element, attrs) {

                    var targets,

                        defaults = {
                            wrapperSelector: '.wrapper',
                            tileSelector: '[data-ratio]',
                            perRow: 5,
                            gutter: 0
                            // averageRatio: 1.5 // optionally try to balance rows by working in combination with `perRow`
                            // gutterColumns: 10 // gutter between columns, overrides `gutter`
                            // gutterRows: 10 // gutter between rows, overrides `gutter`
                            // maxRowHeight: 100 // rows will not exceed this height, use in combination with `alignment`
                            // alignment: 'left' // left/right/justify - alignment for rows which do not fill width
                            // minRowLength: 5 // optionally make rows longer than this fill the available width
                            // watch: 'tiles' // collection to watch for changes,
                            // forceAverageHeight: false // optionally force last row height to be the average of previous rows (useful for equal sized tiles)
                        },

                        options = angular.extend(defaults, scope.$eval(attrs.ngGridify));

                    element.css({
                        position: 'relative',
                        width: '100%'
                    });

                    var wrapper = angular.element(element[0].querySelectorAll(options.wrapperSelector));
                    wrapper.css({
                        overflow: 'hidden'
                    });

                    var _prop = function(propName) {
                        if (typeof(options[propName]) === 'string') {
                            if (typeof(scope[options[propName]]) === 'function') {
                                return scope[options[propName]]();
                            } else {
                                $log.error('ngGridify: ' + propName + ' is not a function');
                                return null;
                            }
                        } else if (typeof(options[propName]) === 'function') {
                            return options[propName]();
                        } else if (typeof(options[propName]) === 'number') {
                            return options[propName];
                        } else if (typeof(options[propName]) === 'object') {
                            $log.error('ngGridify: ' + propName + ' is not valid');
                        }
                    };

                    var _resize = function() {
                        var totalWidth = element[0].clientWidth,
                            totalRowHeight = 0,
                            totalRatio = 0,
                            rowRatio = 0,

                            rows = [],
                            perRow = _prop('perRow'),
                            gutter = _prop('gutter'),

                            gutterColumns = _prop('gutterColumns'),
                            gutterRows = _prop('gutterRows'),

                            minRowLength = options.minRowLength !== undefined ? _prop('minRowLength') : -1,
                            averageRatio = options.averageRatio !== undefined ? _prop('averageRatio') : 0,

                            maxRowHeight = options.maxRowHeight !== undefined ? _prop('maxRowHeight') : 0,

                            alignment = options.alignment || 'left',

                            forceAverageHeight = options.forceAverageHeight || false,

                            row = {
                                tiles: []
                            };

                        angular.forEach(targets, function(tile, i) {
                            tile = angular.element(tile);

                            tile.ratio = Number(tile.attr('data-ratio'));
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
                                        tiles: []
                                    };
                                    rowRatio = 0;
                                }
                            }

                            rowRatio += tile.ratio;

                            row.tiles.push(tile);
                        });

                        row.ratio = rowRatio;
                        rows.push(row);

                        angular.forEach(rows, function(row, i) {
                            // if this is the last row then figure out what ratio to use (may want tiles to fill width or may want tiles to use average height)
                            rowRatio = i === rows.length - 1 && (row.tiles.length < minRowLength || minRowLength === -1) && totalRatio > 0 ? Math.max(totalRatio / (rows.length - 1), row.ratio) : row.ratio;

                            totalRatio += rowRatio;

                            angular.forEach(row.tiles, function(tile, ii) {
                                // if this is the last row then figure out how many gutters we need for calculations
                                var gutters = i === rows.length - 1 && (row.tiles.length < minRowLength || minRowLength === -1) ? Math.max(row.tiles.length - 1, perRow - 1) : row.tiles.length - 1,
                                    width, height;

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

                                if (i < rows.length - 1 && ii === 0) {
                                    totalRowHeight += height;
                                }

                                var css = {
                                    float: alignment !== 'justify' ? alignment : 'left',
                                    width: width,
                                    height: height,
                                    marginLeft: 0,
                                    marginRight: 0
                                };

                                if (alignment === 'justify' && maxRowHeight > 0 && height === maxRowHeight) {
                                    css.marginLeft = ii > 0 ? (totalWidth - (maxRowHeight * rowRatio)) / (row.tiles.length - 1) : 0;

                                } else {
                                    if (alignment === 'right') {
                                        css.marginLeft = ii < row.tiles.length - 1 ? (gutterColumns || gutter) : 0;
                                    } else {
                                        css.marginRight = ii < row.tiles.length - 1 ? (gutterColumns || gutter) : 0;
                                    }
                                }

                                css.marginBottom = i < rows.length - 1 ? (gutterRows || gutter) : 0;

                                tile.css(css);
                            });
                        });

                        wrapper.css('width', totalWidth + 1); // add 1 to prevent firefox sometimes wrapping tiles
                    };

                    var throttleOnAnimationFrame = function(func) {
                        var timeout;
                        return function() {
                            var context = this,
                                args = arguments;
                            $window.cancelAnimationFrame(timeout);
                            timeout = $window.requestAnimationFrame(function() {
                                func.apply(context, args);
                                timeout = null;
                            });
                        };
                    };

                    var _throttledResize = throttleOnAnimationFrame(_resize);

                    angular.element($window).on('resize', _throttledResize);

                    var _init = function() {
                        targets = angular.element(element[0].querySelectorAll(options.tileSelector));

                        _resize();

                        $timeout(_resize); // trigger resize a second time just in case scrollbars kicked in
                    };

                    $timeout(_init); // wait for ng-repeat elements to be rendered

                    if (options.watch) {
                        scope.$watch(options.watch, function(n, o) {
                            _init();
                        });
                    }

                    scope.$on('$destroy', function() {
                        angular.element($window).off('resize', _throttledResize);
                    });

                }
            };
        }
    ]);

})();