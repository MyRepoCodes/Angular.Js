angular.module('directive.breadcrumb-tabs', [])

.directive('breadcrumbTabs', function($timeout) {
    return {
        restrict: 'EA',
        scope: {
            step: '='
        },
        templateUrl: 'directives/breadcrumb-tabs/breadcrumb-tabs.tpl.html',
        link: function (scope, element, attrs) {
        }
    };
});