angular.module('app.modules.contact', [
  'app.modules.contact.list-contact'
])

  .config(function ($stateProvider) {
    var views = {
      'main-content': {
        templateUrl: 'modules/contact/contact.tpl.html',
        controller: 'ContactController'
      }
    };

    $stateProvider
      .state('modules.contact', { url: '/contact', views: views })
      .state('modules.contactClientUrl', { url: '/:clientUrl/contact', views: views });
  })

  .controller('ContactController', function ($scope, $state, $timeout, security, DATECONFIGS, utils, contacts) {
    $scope.dateOptions = DATECONFIGS.dateOptionsDefault;

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      success: false
    };

    $scope.params = {
      firstName: '',
      lastName: '',
      company: '',
      dateOfBirth: "",
      email: '',
      telephone: '',
      reasons: {
        nutritionCoaching: false,
        fitnessCoaching: false,
        healthResultsExplanation: false
      },
      contactType: ($scope.isParticipant || !$scope.isAuthenticated) ? 1 : 2, //0: phone,1: email // 2: portal
      contactTo: 1,   //0: HealthCoach,1: CustomerService, 2:ClientAccountManager
      content: ''
    };

    $scope.paramsDefault = angular.copy($scope.params);


    var reInit = false;

    function initParams(nameForm) {
      reInit = true;
      if ($scope.currentUser) {
        $scope.params.firstName = $scope.currentUser.firstName;
        $scope.params.lastName = $scope.currentUser.lastName;
        if (_.isObject($scope.currentUser.employer) && $scope.currentUser.employer.clientName) {
          $scope.params.company = $scope.currentUser.employer.clientName;
        } else if ($scope.currentUser.clientName) {
          $scope.params.company = $scope.currentUser.clientName;
        } else {
          $scope.params.company = $scope.paramsDefault.company;
        }
        $scope.params.dateOfBirth = utils.parseDateOfBirthToDatePacker($scope.currentUser.dateOfBirth);
        $scope.params.email = $scope.currentUser.email;
        $scope.params.telephone = $scope.currentUser.phoneNumber;
        $scope.params.contactType = $scope.isParticipant ? 1 : $scope.paramsDefault.contactType;
        $scope.params.contactTo = $scope.paramsDefault.contactTo;
        $scope.params.reasons = $scope.paramsDefault.reasons;
        $scope.params.content = $scope.paramsDefault.content;
      } else {
        $scope.params = angular.copy($scope.paramsDefault);
      }

      // Reset form
      $timeout(function () {
        if(nameForm){
           utils.resetForm(nameForm);
        }else{
           utils.resetForm($scope.contactForm);
        }
       

        reInit = false;
      });
    }

    // Reset env
    $scope.$watch('params', function () {
      if (reInit === false) {
        $scope.env.success = null;
      }
    }, true);

    // Update info
    $scope.$watch(function () {
      return security.isAuthenticated();
    }, function () {
      $scope.currentUser = security.currentUser;
      initParams();
    });

    // Get
    function getReasonForRequest() {
      var reasonForRequest = null;
      if ($scope.params.reasons.nutritionCoaching) {
        reasonForRequest |= 1;
      }
      if ($scope.params.reasons.fitnessCoaching) {
        reasonForRequest |= 2;
      }
      if ($scope.params.reasons.healthResultsExplanation) {
        reasonForRequest |= 4;
      }

      return reasonForRequest;
    }

    $scope.validReasonForRequest = function () {
      if (getReasonForRequest() === null) {
        return false;
      }

      return true;
    };

    $scope.submit = function (form) {
      var reasonForRequest = $scope.params.contactTo === 0 ? getReasonForRequest() : true;
      $scope.env.success = false;
      $scope.env.showValid = true;
      $scope.env.row = 0;
      if (form.$valid && reasonForRequest !== null) {
        contacts.post({
          firstName: $scope.params.firstName,
          lastName: $scope.params.lastName,
          company: $scope.params.company,
          dateOfBirth: utils.parseDateOfBirthBeforePush($scope.params.dateOfBirth),
          email: $scope.params.email,
          telephone: utils.phoneNumberFormat(angular.copy($scope.params.telephone)),
          contactType: $scope.params.contactType,
          //contactTo: $scope.params.contactTo,
          reasons: $scope.params.reasons,
          content: $scope.params.content
        }).then(function (response) {
          $scope.env.showValid = false;
          $scope.env.success = true;
          initParams(form);

          //if is admin update count contact
          if ($scope.isAdmin) {
            contacts.countunread();
          }

          // Go to top
          angular.element('html').animate({ scrollTop: 100 }, "slow");
          /* Firefox*/
          angular.element('body').animate({ scrollTop: 100 }, "slow");
          /* Chorme*/

        }, function (error) {
        });
      }
    };
  });
