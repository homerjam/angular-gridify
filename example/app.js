angular.module('ExampleCtrl', []).controller('ExampleCtrl', ['$scope',
    function($scope) {

        $scope.tiles = [];

        for (var i = 0; i < 50; i++) {

            $scope.tiles[i] = {
                ratio: Math.random() * 2,
                color: '#' + ('000000' + Math.floor(Math.random()*16777215).toString(16)).slice(-6)
            };

        }

    }
]);

angular.module('ExampleApp', ['ng-gridify', 'ExampleCtrl']).config(function() {});