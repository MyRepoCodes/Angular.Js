angular.module('app.modules.user-manager.client.location-item', [])

.value('locationItemId', 0)

/***
 * <location-item data-form="form" data-params="params" data-index="{{ $index+1 }}" data-tabindex="tabindex" data-env="env"></location-item>
 * element total: 12
 * tabindex total: 1
 */

.directive('locationItem', function (PATTERNREGEXS, STATES, locationItemId) {
  return {
    restrict: 'EA',
    scope: {
      parentParams: '=params',
      env: '=env',
      form: '=form',
      elementIndex: '@index',
    },
    templateUrl: 'modules/user-manager/client/location-item/location-item.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.patternRegexs = PATTERNREGEXS;
      $scope.statesList = STATES.list;
      $scope.countries = STATES.countries;
      $scope.inputId = locationItemId++;
      $scope.elementIndex = parseInt($scope.elementIndex);
      $scope.prefix = 'location_item_' + $scope.inputId + '_';

      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';

      $scope.tabindex = 0;
      if ($attrs.hasOwnProperty('tabindex')) {
        $scope.tabindex = parseInt($attrs.tabindex);
        $attrs.$observe('tabindex', function(newVal) {
          $scope.tabindex = parseInt(newVal);
        });
      }

      // Init model
      if(_.isObject($scope.parentParams.employerLocations[$scope.elementIndex - 1])) {
        $scope.params = $scope.parentParams.employerLocations[$scope.elementIndex - 1];
      } else {
        if ($scope.elementIndex === 1) {
          $scope.params = {
            locationName: '',
            firstName: $scope.parentParams.firstName,
            middleName: $scope.parentParams.middleName,
            lastName: $scope.parentParams.lastName,
            phoneNumber: $scope.parentParams.phoneNumber,
            email: $scope.parentParams.email,
            streetAddress: $scope.parentParams.streetAddress,
            addressLine2: $scope.parentParams.addressLine2,
            city: $scope.parentParams.city,
            postalCode: $scope.parentParams.postalCode,
            state: $scope.parentParams.state,
            country: $scope.parentParams.country,
          };
        } else {
          $scope.params = {
            locationName: '',
            firstName: '',
            middleName: '',
            lastName: '',
            phoneNumber: '',
            email: '',
            streetAddress: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            state: '',
            country: 'USA',
          };
        }
      }

      $scope.parentParams.employerLocations[$scope.elementIndex - 1] = $scope.params;
    }
  };
});