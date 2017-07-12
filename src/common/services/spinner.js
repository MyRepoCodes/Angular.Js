angular.module('app.spinner', [])

.factory('loadingSpinnerService', function($rootScope) {

    var service = {

        spin: function(key) {
            $rootScope.$broadcast('loading-spinner:spin', key);
        },

        stop: function(key) {
            $rootScope.$broadcast('loading-spinner:stop', key);
        }

    };

    return service;
})

.directive('loadingSpinner', function($window) {
    return {
        scope: true,
        link: function(scope, element, attr) {
            scope.spinner = null;
            var options = {};

            scope.key = angular.isDefined(attr.spinnerKey) ? attr.spinnerKey : false;

            scope.startActive = angular.isDefined(attr.spinnerStartActive) ?
                attr.spinnerStartActive : scope.key ?
                false: true;

            scope.spin = function() {
                if (scope.spinner) {
                    $('.spinner-background').show();
                    scope.spinner.spin(element[0]);
                }
            };

            scope.stop = function() {
                if (scope.spinner) {
                    $('.spinner-background').hide();
                    scope.spinner.stop();
                }
            };

            scope.$watch(attr.loadingSpinner, function(options) {
                scope.stop();
                options = {
                    lines: 12,
                    length: 8,
                    width: 3,
                    radius: 15,
                    corners: 1,
                    rotate: 0,
                    direction: 1,
                    color: '#ffffff',
                    speed: 1.5,
                    trail: 50,
                    shadow: false,
                    hwaccel: true,
                    top: '50%',
                    left: '50%'
                };
                scope.spinner = new $window.Spinner(options);
                if (!scope.key || scope.startActive) {
                    scope.spinner.spin(element[0]);
                }
            }, true);

            scope.$on('loading-spinner:spin', function(event, key) {
                if (key === scope.key) {
                    scope.spin();
                }
            });

            scope.$on('loading-spinner:stop', function(event, key) {
                if (key === scope.key) {
                    scope.stop();
                }
            });

            scope.$on('$destroy', function() {
                scope.stop();
                scope.spinner = null;
            });
        }
    };
});
