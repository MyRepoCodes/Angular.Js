angular.module('directive.loading-indicator', [])

  /***
   * <div class='loading-indicator' data-name-class="className"  data-content="Something" data-title="'Title'"></div>
   */
  .directive('loadingIndicator', function (utils, $timeout, IMAGECONFIGS) {
    return {
      restrict: 'C',
      scope: {
        nameClass: '=',
        content: '=',
        title: '='
      },
      templateUrl: 'directives/loading/loading-indicator/loading-indicator.tpl.html',
      controller: function ($scope) {
       
      },
      link: function ($scope, $element, $attrs) {

      }
    };
  });