(function() {
    'use strict';

    angular.module('angular-gridify', [])
        .directive('ngGridify', ['$log', '$timeout', '$window', function($log, $timeout, $window) {
            return {
                restrict: 'A',
                link: function link(scope, element, attrs) {

					var targets;

					var defaults = {
						wrapperSelector: '.wrapper',
						tileSelector: '[data-ratio]',
						perRow: 5,
						gutter: 0,
						// minRowLength: 3, // rows shorter than this will use the average row height (defaults to 50% of perRow if not set)
						// averageRatio: 1.5 // optionally try to balance rows by working in combination with perRow
					};

					var options = angular.extend(defaults, scope.$eval(attrs.ngGridify));

					var _perRow = function() {
						if (typeof(options.perRow) === 'string') {
							if (typeof(scope[options.perRow]) === 'function') {
								return scope[options.perRow]();
							} else {
								$log.error('ngGridify: perRow is not a function');
							}
						} else {
							return options.perRow;
						}
					};

					var _gutter = function() {
						if (typeof(options.gutter) === 'string') {
							if (typeof(scope[options.gutter]) === 'function') {
								return scope[options.gutter]();
							} else {
								$log.error('ngGridify: gutter is not a function');
							}
						} else {
							return options.gutter;
						}
					};

					var _resize = function() {

						var totalWidth = element[0].clientWidth;
						var totalRatio = 0, rowRatio = 0;

						var rows = [];
						var perRow = _perRow();
						var gutter = _gutter();

						var minRowLength = options.minRowLength !== undefined ? options.minRowLength : perRow * 0.5;

						var row = {tiles: []};
						angular.forEach(targets, function(tile, i){
							tile = angular.element(tile);

							tile.ratio = Number(tile.attr('data-ratio'));

							if (options.averageRatio !== undefined) {
								if (rowRatio + tile.ratio > options.averageRatio * perRow) {
									row.ratio = rowRatio;
									rows.push(row);

									row = {tiles: []};
									rowRatio = 0;
								}
							} else {
								if (row.tiles.length === perRow) {
									row.ratio = rowRatio;
									rows.push(row);

									row = {tiles: []};
									rowRatio = 0;
								}
							}

							rowRatio += tile.ratio;

							row.tiles.push(tile);
						});
						row.ratio = rowRatio;
						rows.push(row);

						angular.forEach(rows, function(row, i){
							rowRatio = row.tiles.length < minRowLength ? totalRatio / rows.length+1 : row.ratio;

							totalRatio += rowRatio;

							angular.forEach(row.tiles, function(tile, ii){
								var width = (tile.ratio / rowRatio) * (totalWidth - (gutter * (row.tiles.length - 1)));
								var height = width * (1 / tile.ratio);

								var css = {
									width: width,
									height: height
								};

								if (ii < row.tiles.length-1) {
									css.marginRight = gutter;
								}

								if (i < rows.length-1) {
									css.marginBottom = gutter;
								}

								tile.css(css);
							});
						});

						angular.element(element[0].querySelectorAll(options.wrapperSelector)).css('width', totalWidth + 1); // add 1 to prevent firefox sometimes wrapping tiles
					};

					// wait for ng-repeat elements to be rendered
					$timeout(function(){

						targets = angular.element(element[0].querySelectorAll(options.tileSelector));

						_resize();

						$timeout(_resize, 1); // trigger resize a second time just in case scrollbars kicked in

					}, 1);

					angular.element($window).on('resize', _resize);

                }
            };
        }]);

})();