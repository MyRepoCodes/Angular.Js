angular.module('directive.client-location-input', [])

.filter('clientLocationLabel', function (utils) {
  return function (userInfo) {
    if(userInfo.locationName) {
      return userInfo.locationName;
    }
    return utils.getFullName(userInfo);
  };
})

/***
 * View client location detail
 * <client-location-input client-location="clientLocation"></client-location-input>
 */
.directive('clientLocationInput', function (STATES) {
  return {
    restrict: 'EA',
    scope: {
      clientLocation: '=clientLocation'
    },
    templateUrl: 'directives/form-input/client-location-input/client-location-input.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.statesList = STATES.list;
      $scope.countries = STATES.countries;
    }
  };
});