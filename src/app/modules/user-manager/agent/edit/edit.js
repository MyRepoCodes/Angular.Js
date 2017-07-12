angular.module("app.modules.user-manager.agent.edit", [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.agent.edit', {
      url: '/edit/:id',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/agent/edit/edit.tpl.html',
          controller: 'UserManagerAgentEditController',
          resolve: {
            data: function($stateParams, agents) {
              return agents.find($stateParams.id,{screenName: 'Edit an Agent'}).then(function(response) {
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

.controller('UserManagerAgentEditController', function($scope, $state, $stateParams, $translate, IMAGECONFIGS, STATES, ERRORCODES, utils, security, agents, users, data) {
  $scope.statesList = STATES.list;
  //$scope.countries = ['United States'];

  // Environments
  $scope.env = {
    row: 0,
    showValid: false,
    emailExist: false,
    usernameExist: false,
    error: null,
    confirm: '',
    successMessage: ''
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
    country: data.country,
    username: data.username,
    //isipAllowed: data.isipAllowed,
    password: ''
  };

  // Clear validation
  $scope.$watch('params', function() {
    $scope.env.emailExist = false;
    $scope.env.usernameExist = false;

    $scope.env.error = null;
  }, true);

  // Check email valid
  $scope.validEmail = function() {
    return utils.validEmail($scope.params.email);
  };

  // Update
  $scope.update = function(isValid, nameAction) {
    $scope.env.showValid = true;
    if (isValid && $scope.validEmail()) {
      agents.patch({
        id: $stateParams.id,
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        //phoneNumber: $scope.params.phoneNumber,
        isipAllowed: $scope.params.isipAllowed,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        state: $scope.params.state,
        country: "USA"
        //country: $scope.params.country
      },{screenName: $translate.instant('auditLogs.screenName.editAgent')}).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.error = null;

        users.patchUserSecurity(utils.formatDataUserSecurity(data, $scope.params))
          .then(function() {

            if (nameAction === 'close') {
              //$scope.goStateList();
              $state.go('loggedIn.modules.user-manager.agent');
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
      }, function(error) {
        $scope.env.error = error.error;
        error['errorCode'] = error.errors[0].errorCode;
        if (error.errorCode === ERRORCODES.conflict.email) {
          $scope.env.emailExist = true;
          $scope.env.error = $translate.instant('server.error.409.email');
        } else if (error.errorCode === ERRORCODES.conflict.username) {
          $scope.env.usernameExist = true;
          $scope.env.error = $translate.instant('server.error.409.username');
        }
      });
    }
  };

  // Cancel
  $scope.cancel = function() {
    $state.go('loggedIn.modules.user-manager.agent');
  };
});
