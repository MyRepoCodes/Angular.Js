angular.module('directive.quick-contact', [])

  /***
   * <quick-contact></quick-contact>
   */
  .directive('quickContact', function (utils, $timeout) {
    return {
      restrict: 'EA',
      scope: {

      },
      templateUrl: 'directives/common/quick-contact/quick-contact.tpl.html',
      controller: function ($scope, $modal, $state) {
        

      },
      link: function ($scope, $element, $attrs) {


      }
    };
  });