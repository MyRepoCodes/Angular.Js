angular.module("app.modules.user-manager.admin.edit", [])

.config(function($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.user-manager.admin.edit', {
      url: '/edit/:id',
      views: {
        'manager-content@loggedIn.modules.user-manager': {
          templateUrl: 'modules/user-manager/admin/edit/edit.tpl.html',
          controller: 'UserManagerAdminEditController',
          resolve: {
            data: function($stateParams, admins) {
              return admins.find($stateParams.id).then(function(response) {
                return response;
              }, function() {
                return {};
              });
            },
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

.controller('UserManagerAdminEditController', function($scope, $state, $stateParams, $translate, IMAGECONFIGS, STATES, ERRORCODES, utils, security, admins, data, portfoliosList, portfolios, users) {
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
    portfolioId: data.portfolioId,
    city: data.city,
    postalCode: data.postalCode,
    isipAllowed: data.isipAllowed,
    state: data.state,
    country: data.country,
    username: data.username,
    password: '',
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
    console.log(isValid,'~~~~~~~~');
    if (isValid) {
      admins.patch({
        id: $stateParams.id,
        firstName: $scope.params.firstName,
        middleName: $scope.params.middleName,
        lastName: $scope.params.lastName,
        streetAddress: $scope.params.streetAddress,
        addressLine2: $scope.params.addressLine2,
        city: $scope.params.city,
        postalCode: $scope.params.postalCode,
        portfolioId: $scope.params.portfolioId,
        state: $scope.params.state,
        isipAllowed: $scope.params.isipAllowed,
        country: "USA"
      }).then(function(response) {
        $scope.env.showValid = false;
        $scope.env.error = null;

        users.patchUserSecurity(utils.formatDataUserSecurity(data, $scope.params))
          .then(function() {

            if (nameAction === 'close') {
              //$scope.goStateList();
              $state.go('loggedIn.modules.user-manager.admin');
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
    $state.go('loggedIn.modules.user-manager.admin');
  };
});
