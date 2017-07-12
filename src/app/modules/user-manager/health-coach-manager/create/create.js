angular.module("app.modules.user-manager.health-coach-manager.create", [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.health-coach-manager.create', {
      url: '/create',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/health-coach-manager/create/create.tpl.html',
          controller: 'UserManagerHealthCoachManagerCreateController'
        }
      }
    });
})

.controller('UserManagerHealthCoachManagerCreateController', function($scope, $state, $translate, IMAGECONFIGS, STATES, ERRORCODES, utils, security, healthCoachManagers) {
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
  };

  // Init Model
  $scope.params = {
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
    country: security.currentUser.country ? security.currentUser.country : $scope.countries[0],
    username: '',
    password: ''
  };

  // Clear validation
  $scope.$watch('params', function() {
    $scope.env.emailExist = false;
    $scope.env.usernameExist = false;

    $scope.env.error = null;
  }, true);

  // Create
  $scope.create = function(isValid) {
    $scope.env.showValid = true;
    if (isValid) {
      healthCoachManagers.post({
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        phoneNumber: $scope.params.phoneNumber,
        email: $scope.params.email,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        state: $scope.params.state,
        isipAllowed:$scope.params.isipAllowed,
        //country: $scope.params.country,
        country: "USA",
        username: $scope.params.username,
        password: $scope.params.password
      },{screenName: $translate.instant('auditLogs.screenName.addHealthCoachManager')}).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.error = null;
        $scope.goStateList();
        /*$state.go('loggedIn.modules.user-manager.client-manager');*/
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
    $state.go('loggedIn.modules.user-manager.client-manager');
  };
});
