angular.module('directive.result-category', [])

  .value('result', '')

  /***
   * <result-category data-ng-params="params"></result-category>
   */
  .directive('resultCategory', function($timeout, STATES, utils, result) {
    return {
      restrict: 'EA',
      scope: {
        data: '=ngParams'
      },
      templateUrl: 'directives/health-result/result-category/result-category.tpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.statesList = STATES.list;

      }
    };
  });