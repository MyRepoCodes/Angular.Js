angular.module('app.modules.registration.bcs.participant.privacy-authorization-form', [])

  .controller('EnrollmentPrivacyAuthorizationFormController', function ($rootScope, $scope, security, utils, $modal, PrivacyAuthorizationForms) {
    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      signature: null,
    };

    // Init model
    $scope.params = $scope.globalParams.pa;

    //Fix email
    if (!$scope.params.email) {
      $scope.params.email = $scope.globalParams.ec.email;
    }

    //create data for Post to server
    function createDataPost(data) {

      data['dateOfBirth'] = utils.dateToShort(data.dateOfBirth);
      data['signedDate'] = utils.dateToShort(data.signedDate);

      // create the first info of individuals
      data['firstNameIndividuals'] = data.name1.firstName;
      data['lastNameIndividuals'] = data.name1.lastName;
      data['middleNameIndividuals'] = data.name1.middleName ? data.name1.middleName : null;

      //create individuals Data
      data['IndividualsData'] = [];
      if (!_.isEmpty(data.name1)) {
        data.IndividualsData.push(data.name1);
      }

      if (!_.isEmpty(data.name2)) {
        data.IndividualsData.push(data.name2);
      }

      if (!_.isEmpty(data.name3)) {
        data.IndividualsData.push(data.name3);
      }

      data['IndividualsData'] = JSON.stringify(data['IndividualsData']);

      delete data.name1;
      delete data.name2;
      delete data.name3;

      return data;

    }

    $scope.submit = function (isValid) {
      $scope.env.showValid = true;
      $scope.env.row = 0;
      if (isValid && typeof $scope.env.signature === 'function' && !$scope.env.signature().isEmpty) {
        $scope.params.signature = $scope.env.signature().dataUrl;

        $scope.env.showValid = false;

        var objectPost = createDataPost(angular.copy($scope.params));
        PrivacyAuthorizationForms.post(objectPost).then(function (result) {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: '',
                  summary: false,
                  style: 'ok',
                  message: "<p>Thank you for your submission. If you have any questions, please call Customer Service at <span class='color-blue-light'>866-797-3343</span>.</p>"
                };
              }
            }
          });
          $scope.modal.result.then(function () {
          });

        }, function (error) {

          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Submit Fail',
                  summary: false,
                  style: 'ok',
                  message: utils.formatErrors(error.errors)
                };
              }
            }
          });

        });
      }
    };

    // Previous Direct Deposit
    $scope.previous = function () {
      if (typeof $scope.env.signature === 'function' && !$scope.env.signature().isEmpty) {
        $scope.params.signature = $scope.env.signature().dataUrl;
      }
      $scope.env.row = 0;
      $scope.env.showValid = false;
      $rootScope.$broadcast('enrollment:step:next', 1);
    };
  });
