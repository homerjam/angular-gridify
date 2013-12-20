(function() {
    'use strict';

    angular.module('ng-gridify', [])
        .directive('ngGridify', ['$log', '$timeout', '$window', function($log, $timeout, $window) {
            return {
                restrict: 'A',
                link: function link(scope, element, attrs) {

					var targets;

					var defaults = {
						wrapperSelector: '.wrapper',
						tileSelector: '[data-ratio]',
						columns: 3,
						gutter: 0
					};

					var options = angular.extend(defaults, scope.$eval(attrs.ngGridify));

					var _columns = function() {
						if (typeof(options.columns) === 'string') {
							if (typeof(scope[options.columns]) === 'function') {
								return scope[options.columns]();
							} else {
								$log.error('ngGridify: columns is not a function');
							}
						} else {
							return options.columns;
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
						var totalRatio = 0;

						var rows = [];
						var columns = _columns();
						var gutter = _gutter();

						var row = [];
						angular.forEach(targets, function(t, i){
							if (row.length === columns) {
								rows.push(row);
								row = [];
							}
							row.push(angular.element(t));
						});
						rows.push(row);

						angular.forEach(rows, function(r, i){
							var rowRatio = 0;

							if (r.length === columns) {
								angular.forEach(r, function(t, ii){
									rowRatio += Number(t.attr('data-ratio'));
								});

								totalRatio += rowRatio;

							} else {
								rowRatio = Math.max(r.length*2, totalRatio / rows.length);
							}

							angular.forEach(r, function(t, ii){
								var tRatio = Number(t.attr('data-ratio'));
								var width = (tRatio / rowRatio) * (totalWidth - (gutter * (columns - 1)));
								var height = width * (1 / tRatio);

								var css = {
									width: width,
									height: height
								};

								if (ii < r.length-1) {
									css.marginRight = gutter;
								}

								if (i < rows.length-1) {
									css.marginBottom = gutter;
								}

								t.css(css);
							});
						});

						element.children(options.wrapperSelector).css('width', totalWidth + 1); // add 1 to prevent firefox sometimes wrapping tiles
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