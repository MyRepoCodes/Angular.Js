angular.module('app.modules.user-manager.spouse.createOrUpdate', [])

  .controller('SpouseCreateOrUpdateController', function ($scope, $modalInstance, utils, spouses, participantId, maritalStatus, spouseInfo) {
    $scope.participantId = participantId;
    $scope.maritalStatus = maritalStatus;
    $scope.spouseInfo = spouseInfo;

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
    };

    $scope.params = {
      firstName: spouseInfo ? spouseInfo.firstName : '',
      middleName: spouseInfo ? spouseInfo.middleName : '',
      lastName: spouseInfo ? spouseInfo.lastName : '',
      dateOfBirth: spouseInfo ? utils.parseDateOfBirthToDatePacker(spouseInfo.dateOfBirth) : null,
      ssn: spouseInfo ? spouseInfo.ssn : '',
      gender: spouseInfo ? spouseInfo.gender : null,
      participantId: participantId,
      email: spouseInfo ? spouseInfo.email : "",
      phoneNumber: spouseInfo ? spouseInfo.phoneNumber : ""
    };

    $scope.cancel = function () {
      $modalInstance.close(false);
    };

    $scope.submit = function (isValid) {
      $scope.env.showValid = true;
      if (isValid) {
        var api;
        var params = _.clone($scope.params);
        params.dateOfBirth = utils.dateToShort(params.dateOfBirth);
        params.ssn = utils.ssnFormatSubmit(params.ssn);

        if (!spouseInfo) {
          api = spouses.post;
        } else {
          params.id = spouseInfo.id;
          api = spouses.patch;
        }
        api(params).then(function (response) {
          $scope.env.showValid = false;
          $modalInstance.close(response);
        }, function () {
          $modalInstance.close(false);
        });
      }
    };
  });
