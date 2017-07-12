angular.module('app.modules.dashboard.progress-bar', [])

.directive('progressBarDefault', function($state, $window, $timeout) {
    return {
        restrict: 'EA',
        scope: true,
        templateUrl: 'modules/dashboard/progress-bar/progress-bar.tpl.html',
        link: function($scope, $element, $attr) {
            $scope.min = parseInt($attr.min);
            $scope.max = parseInt($attr.max);
            $scope.start = parseInt($attr.start);
            $scope.end = parseInt($attr.end);

            $scope.styleBar = {};
            $scope.styleBar.left = '0%';
            $scope.styleValue = {};
            $scope.styleIndicator = {};

            var $bar = $element.find('.bar');

            var styleBarWidth = 0;
            var styleValueLeft = 0;

            function resize() {
                //var left = $bar.width();
                //var width = $element.width();

                if($scope.end === $scope.max) {
                    $scope.styleValue.left = 'calc(' + styleValueLeft + '% - 19px)';
                    $scope.styleIndicator.left = '38px';
                } else if($scope.end === $scope.min) {
                    $scope.styleValue.left = 'calc(' + styleValueLeft + '% + 18px)';
                    $scope.styleIndicator.left = '4px';
                }
            }

            function init() {
                if($scope.end > $scope.max) {
                    $scope.end = $scope.max;
                }

                styleBarWidth = +(100 * ($scope.end - $scope.start) / ($scope.max)).toFixed(2);
                $scope.styleBar.width = styleBarWidth + '%';

                styleValueLeft = +(100 * ($scope.end) / ($scope.max)).toFixed(2);
                $scope.styleValue.left = styleValueLeft + '%';

                $timeout(function() {
                    resize();
                }, 100);
            }

            init();
            $scope.$watch('end', function() {
                init();
            });

            // Resize popup
            angular.element($window).bind('resize', function() {
                if($state.$current.name === 'loggedIn.modules.dashboard') {
                    resize();
                }
            });
        }
    };
});
