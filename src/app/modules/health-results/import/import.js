angular.module('app.modules.health-results.import', [
  'app.modules.health-results.import.confirm',
])

  .config(function ($stateProvider) {
      $stateProvider
        .state('loggedIn.modules.health-results.import', {
          url: '/import',
          views: {
            'manager-content': {
              templateUrl: 'modules/health-results/import/import.tpl.html',
              controller: 'HealthResultsImportController'
            }
          }
        });
    }
  )

  .controller('HealthResultsImportController', function ($scope, $state, $translate, $filter, $modal, CONFIGS, participants, employers) {
    $scope.templateMultipleUrl = CONFIGS.baseURL() + '/participants/healthresult/import/templateForClientsv2';
    $scope.templateMultipleUrlParkview = CONFIGS.baseURL() + '/participants/healthresult/import/parkviewTemplateForClients';

    $scope.templateSingleUrl = CONFIGS.baseURL() + '/participants/healthresult/import/templatev2';
    $scope.templateSingleUrlParkview = CONFIGS.baseURL() + '/participants/healthresult/import/parkviewTemplate';

    $scope.employerList = [];
    $scope.incentiveList = [];

    $scope.fileFormatList = [
      {id: 1, label: "Hooper Holmes", value: "hooperHolmes"},
      {id: 2, label: "Parkview", value: "parkview"}
    ];


    $scope.env = {
      currentClient: null,
      currentIncentive: [],
      errorForSingle: null,
      errorForMultiple: null,
      successForSingle: null,
      successForMultiple: null,
      errorSingleList: [],
      errorMultipleList: [],
      duplicateSingleList: [],
      duplicateMultipleList: [],
      isGoHealthResults: false,
      fileFormatMultiple : "hooperHolmes",
      fileFormatIndividual : "hooperHolmes"
    };

    //update view on parent
    $scope.$parent.env.currentPage = 1;

    // employers.all({
    //   'X-Filter': JSON.stringify([{
    //     property: "isDeleted",
    //     operator: "equal",
    //     condition: "or",
    //     value: false
    //   }])
    // }, false).then(function(data) {
    //   $scope.employerList = data.employerList;
    // });

    // Get benefit year by client
    function getIncentives(client) {
      $scope.incentiveList = [];
      $scope.env.currentIncentive = null;
      return employers.getEmployerWithIncentive({
        id: client.id
      }).then(function (response) {
        $scope.incentiveList = response.incentives;
      });
    }

    // Change current client
    $scope.changeCurrentClient = function (client) {
      $scope.env.currentClient = client;
      getIncentives($scope.env.currentClient);
      resetEnvironments();
    };

    $scope.importMultipleHealthResults = function ($element) {
      resetEnvironments();

      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'HealthResultsImportConfirmController',
          templateUrl: 'modules/health-results/import/confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {
            participants.importHealthResultForClients($element.files, $scope.env.fileFormatMultiple).then(function (response) {
              $element.value = "";
              $scope.env.successForMultiple = response.totalSuccess + ' out of ' + response.total + ' results were loaded successfully.';
              $scope.env.isGoHealthResults = true;
              var n = 0;
              if (_.isArray(response.duplicates)) {
                if (response.duplicates.length > 0) {
                  $scope.env.successForMultiple += '<br>' + response.duplicates.length + ' out of ' + response.total + ' results were updated successfully.';
                }

                _.forEach(response.duplicates, function (message) {
                  $scope.env.duplicateMultipleList.push(++n + '. ' + message);
                });
              }
              n = 0;
              if (_.isArray(response.conflicts)) {
                _.forEach(response.conflicts, function (message) {
                  $scope.env.errorMultipleList.push(++n + '. ' + message);
                });
              }
              if (_.isArray(response.errors)) {
                _.forEach(response.errors, function (message) {
                  $scope.env.errorMultipleList.push(++n + '. ' + message);
                });
              }
            }, function (error) {
              $element.value = "";
              if (!_.isEmpty(error.errors) && _.isArray(error.errors)) {
                $scope.env.errorForMultiple = error.errors[0].errorMessage;
              } else {
                $scope.env.errorForMultiple = 'Error. The file is invalid.';
              }
            });
          } else {
            $element.value = "";
          }
        });
      } else {
        $element.value = "";
      }
    };

    $scope.importIndividualHealthResults = function ($element) {
      if (!$scope.env.currentClient || !$scope.env.currentIncentive) {
        $scope.env.errorForSingle = 'Error. Please select a client and benefit year.';
        $element.value = "";
        return false;
      }
      resetEnvironments();

      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'HealthResultsImportConfirmController',
          templateUrl: 'modules/health-results/import/confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {
            participants.importHealthResultByIncentive($element.files, $scope.env.currentIncentive, $scope.env.fileFormatIndividual).then(function (response) {
              $element.value = "";
              $scope.env.successForSingle = response.totalSuccess + ' out of ' + response.total + ' results were loaded successfully.';
              var n = 0;
              if (_.isArray(response.duplicates)) {
                if (response.duplicates.length > 0) {
                  $scope.env.successForSingle += '<br>' + response.duplicates.length + ' out of ' + response.total + ' results were updated successfully.';
                }

                _.forEach(response.duplicates, function (message) {
                  $scope.env.duplicateSingleList.push(++n + '. ' + message);
                });
              }
              n = 0;
              if (_.isArray(response.conflicts)) {
                _.forEach(response.conflicts, function (message) {
                  $scope.env.errorSingleList.push(++n + '. ' + message);
                });
              }
              if (_.isArray(response.errors)) {
                _.forEach(response.errors, function (message) {
                  $scope.env.errorSingleList.push(++n + '. ' + message);
                });
              }
            }, function (error) {
              $element.value = "";
              if (!_.isEmpty(error.errors) && _.isArray(error.errors)) {
                $scope.env.errorForSingle = error.errors[0].errorMessage;
              } else {
                $scope.env.errorForSingle = 'Error. The file is invalid.';
              }
            });
          } else {
            $element.value = "";
          }
        });
      } else {
        $element.value = "";
      }
    };

    // Go to health results page with first employer
    $scope.goHealthResults = function () {
      if ($scope.employerList.length > 0) {
        $state.go('public.healthresultadmin', {IdClient: $scope.employerList[0].id});
      }
    };

    //START: For Auto-complete
    $scope.$watch('env.currentClient', function (value) {
      if (!value || !value.id) {
        $scope.incentiveList = [];
      }
    });
    $scope.findClient = function (keyword) {
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

      var params = {
        fields: 'id,clientName,products',
        q: 'clientName=' + keyword
      };

      return employers.getAutoComplete(params, headers, false)
        .then(function (data) {
          $scope.employerList = data.employerList;
          return data.employerList;
        });
    };
    //END: For Auto-complete

    // Reset Environments
    function resetEnvironments() {
      $scope.env.errorForSingle = null;
      $scope.env.errorForMultiple = null;
      $scope.env.successForSingle = null;
      $scope.env.successForMultiple = null;
      $scope.env.errorSingleList = [];
      $scope.env.errorMultipleList = [];
      $scope.env.duplicateSingleList = [];
      $scope.env.duplicateMultipleList = [];
    }
  });
