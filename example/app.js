angular.module('ExampleCtrl', []).controller('ExampleCtrl', ['$scope', '$window', function ($scope, $window) {

  var ctrl = this;

  ctrl.generateItems = function () {
    ctrl.items = [];

    for (var i = 0; i < 50; i++) {

      ctrl.items[i] = {
        ratio: Math.max(0.5, Math.random() * 2),
        color: '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
      };

    }
  };

  ctrl.generateItems();

  ctrl.removeItem = function (index) {
    ctrl.items.splice(index, 1);
  };

  ctrl.perRow = function () {
    return $window.innerWidth > 768 ? 5 : 3;
  };

}]);

angular.module('ExampleApp', ['hj.gridify', 'ExampleCtrl']);
