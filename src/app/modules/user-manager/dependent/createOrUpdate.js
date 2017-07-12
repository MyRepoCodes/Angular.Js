angular.module('app.modules.user-manager.dependent.createOrUpdate', [])

  .controller('DependentCreateOrUpdateController', function ($scope, $modalInstance, utils, dependents, participantId, dependentList) {
    $scope.participantId = participantId;
    $scope.dependentList = _.clone(dependentList);

    $scope.dependentInfo = false;

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      status: 0, // 0-list, 1-create, 2-edit
    };

    $scope.params = {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: null,
      ssn: "",
      gender: null,
      participantId: participantId,
    };

    $scope.cancel = function () {
      $modalInstance.close($scope.dependentList);
    };

    $scope.submit = function (isValid) {
      $scope.env.showValid = true;
      if (isValid) {
        var params = _.clone($scope.params);
        params.dateOfBirth = utils.dateToShort(params.dateOfBirth);
        params.ssn = utils.ssnFormatSubmit(params.ssn);

        if ($scope.env.status == 1) { // Create
          dependents.post(params).then(function (response) {
            $scope.env.showValid = false;
            $scope.dependentList.push(response);
            $scope.goList();
          }, function () {
            $scope.goList();
          });
        } else { // Update
          params.id = $scope.dependentInfo.id;
          dependents.patch(params).then(function (response) {
            $scope.env.showValid = false;
            $scope.dependentInfo.firstName = response.firstName;
            $scope.dependentInfo.lastName = response.lastName;
            $scope.dependentInfo.middleName = response.middleName;
            $scope.dependentInfo.ssn = response.ssn;
            $scope.dependentInfo.dateOfBirth = response.dateOfBirth;
            $scope.dependentInfo.gender = response.gender;
            $scope.dependentInfo.relationToParticipant = response.relationToParticipant;
            $scope.goList();
          }, function () {
            $scope.goList();
          });
        }
      }
    };

    $scope.remove = function (item) {
      dependents.delete(item.id).then(function () {
        if ($scope.dependentList.indexOf(item) > -1) {
          $scope.dependentList.splice($scope.dependentList.indexOf(item), 1);
        }
      }, function () {
        $scope.goList();
      });
    };

    $scope.edit = function (item) {
      $scope.dependentInfo = item;

      $scope.params.firstName = item.firstName;
      $scope.params.lastName = item.lastName;
      $scope.params.middleName = item.middleName;
      $scope.params.dateOfBirth = item.dateOfBirth;
      $scope.params.ssn= item.ssn;
      $scope.params.gender = item.gender;
      $scope.params.relationToParticipant = item.relationToParticipant;

      $scope.env.status = 2;
    };

    $scope.openCreateDependent = function () {
      $scope.params.firstName = '';
      $scope.params.lastName = '';
      $scope.params.middleName = '';
      $scope.params.dateOfBirth = null;
      $scope.params.ssn = "";
      $scope.params.gender = null;
      $scope.params.relationToParticipant = null;

      $scope.env.status = 1;
    };

    $scope.goList = function () {
      $scope.env.status = 0;
    };



  });
