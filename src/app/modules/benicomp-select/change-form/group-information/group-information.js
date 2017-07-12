angular.module('app.modules.benicomp-select.change-form-all.group-information', [])

  .controller('BcsCfGiController', function ($rootScope, $scope) {
    $scope.env = {
      row: 0,
      showValid: false
    };


    $scope.typeOfChangeIsValid = function (data) {

      var result = false;
      if (data.typeOfChange.insuredAndDependentInformation ||
        data.typeOfChange.baseHealthInsuranceSpd) {
        result = true;
      }

      return result;
    };

    $scope.continue = function (isValid) {
      $scope.env.showValid = true;
      if (isValid && $scope.typeOfChangeIsValid($scope.params)) {
        $scope.env.showValid = false;


        $rootScope.$broadcast('bcs:cf:step:next', 1);

      }
    };
  });
