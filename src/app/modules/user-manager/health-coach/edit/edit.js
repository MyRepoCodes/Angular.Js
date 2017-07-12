angular.module("app.modules.user-manager.health-coach.edit", [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.health-coach.edit', {
      url: '/edit/:id',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/health-coach/edit/edit.tpl.html',
          controller: 'UserManagerHealthCoachEditController',
          resolve: {
            data: function($stateParams, healthCoachs) {
              return healthCoachs.find($stateParams.id).then(function(response) {
                return response;
              }, function() {
                return {};
              });
            }
          }
        }
      }
    });
})

.controller('UserManagerHealthCoachEditController', function($scope, $state, $stateParams, $translate, IMAGECONFIGS, STATES, ROLES, ERRORCODES, utils, security, healthCoachs, data, users) {
  $scope.statesList = STATES.list;
  $scope.rolesHealthCoach = ROLES.health_coach;
  //$scope.countries = ['United States'];

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    emailExist: false,
    usernameExist: false,
    error: null,
    confirm: '',
    successMessage: ""
  };

  // Init Model
  $scope.dataClone = angular.copy(data);
  $scope.params = {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    email: data.email,
    streetAddress: data.streetAddress,
    addressLine2: data.addressLine2,
    city: data.city,
    postalCode: data.postalCode,
    state: data.state,
    roles: data.role,
    country: data.country,
    username: data.username,
    password: '',
    isipAllowed: data.isipAllowed,
    screenName: 'EDIT_HEALTH_COACH'
  };

  // Clear validation
  $scope.$watch('params', function() {
    $scope.env.emailExist = false;
    $scope.env.usernameExist = false;

    $scope.env.error = null;
  }, true);

  // Update
  $scope.update = function(isValid, nameAction) {
    $scope.env.showValid = true;
    if (isValid) {
      healthCoachs.patch({
        id: $stateParams.id,
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        isipAllowed: $scope.params.isipAllowed,
        //phoneNumber: $scope.params.phoneNumber,
        //email: $scope.params.email,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        state: $scope.params.state,
        country: "USA"
        //country: $scope.params.country
      },{screenName: $translate.instant('auditLogs.screenName.editHealthCoach')}).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.error = null;

        users.patchUserSecurity(utils.formatDataUserSecurity(data, $scope.params))
          .then(function() {

            /*users.assignroles(utils.formatDataUserChangeRoles(data, $scope.params))
              .then(function() {

                $scope.goStateList();
              }, function(err) {

              });*/

            if (nameAction === 'close') {
              //$scope.goStateList();
              $state.go('loggedIn.modules.user-manager.health-coach');
            }else{
              $scope.env.successMessage = "Update success";
            }

          }, function(err) {

            angular.forEach(err.errors, function(error) {
              if (error.errorCode === ERRORCODES.conflict.email) {
                $scope.env.emailExist = true;
                $scope.env.error = $translate.instant('server.error.409.email');
              } else if (error.errorCode === ERRORCODES.conflict.username) {
                $scope.env.usernameExist = true;
                $scope.env.error = $translate.instant('server.error.409.username');
              }
            });

          });

      }, function(err) {
        angular.forEach(err.errors, function(error) {
          if (error.errorCode === ERRORCODES.conflict.email) {
            $scope.env.emailExist = true;
            $scope.env.error = $translate.instant('server.error.409.email');
          } else if (error.errorCode === ERRORCODES.conflict.username) {
            $scope.env.usernameExist = true;
            $scope.env.error = $translate.instant('server.error.409.username');
          }
        });
      });
    }
  };

  // Cancel
  $scope.cancel = function() {
    $state.go('loggedIn.modules.user-manager.health-coach');
  };
});
