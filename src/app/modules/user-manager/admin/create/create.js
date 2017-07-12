angular.module("app.modules.user-manager.admin.create", [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.admin.create', {
      url: '/create',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/admin/create/create.tpl.html',
          controller: 'UserManagerAdminCreateController',
          resolve: {
            portfoliosList: function($stateParams, portfolios) {
              var headers = {
                'X-Filter': JSON.stringify([
                  {
                    property: "isDeleted",
                    operator: "equal",
                    condition: "or",
                    value: false
                  }
                ])
              };
              return portfolios.getAllActive(null, headers, false).then(function(data) {
                return data.portfoliosList;
              }, function() {
                return {};
              });
            }
          }
        }
      }
    });
})

.controller('UserManagerAdminCreateController', function($scope, $state, $translate, IMAGECONFIGS, ERRORCODES, utils, security, STATES, portfoliosList, portfolios, admins) {
  $scope.statesList = STATES.list;
  $scope.portfoliosList = portfoliosList;
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
    portfolioId: '',
    //portfolio: '',
    state: '',
    country: security.currentUser.country ? security.currentUser.country : $scope.countries[0],
    username: '',
    password: '',
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
      admins.post({
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        phoneNumber: $scope.params.phoneNumber,
        email: $scope.params.email,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        portfolioId: $scope.params.portfolioId,
        //portfolio: $scope.params.portfolio,
        state: $scope.params.state,
        isipAllowed:$scope.params.isipAllowed,
        country: "USA",
        //country: $scope.params.country,
        username: $scope.params.username,
        password: $scope.params.password
      }).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.error = null;

        $scope.goStateList();

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
