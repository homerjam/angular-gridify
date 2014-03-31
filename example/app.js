angular.module('ExampleCtrl', []).controller('ExampleCtrl', ['$scope',
    function($scope) {

        $scope.tiles = [];

        $scope.generateTiles = function() {
            for (var i = 0; i < 50; i++) {

                $scope.tiles[i] = {
                    ratio: Math.random() * 2,
                    color: '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6)
                };

            }
        };

        $scope.generateTiles();

    }
]);

angular.module('ExampleApp', ['angular-gridify', 'ExampleCtrl']).config(function() {});
