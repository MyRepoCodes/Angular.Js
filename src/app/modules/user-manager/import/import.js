angular.module('app.modules.user-manager.import', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager.import', {
        url: '/import',
        views: {
          'manager-content': {
            templateUrl: 'modules/user-manager/import/import.tpl.html',
            controller: 'UserManagerImportController'
          }
        },
        resolve: {
          deps: ['uiLoad', 'JQ_CONFIG', '$ocLazyLoad',
            function (uiLoad, JQ_CONFIG, $ocLazyLoad) {
              return uiLoad.load([]).then(
                function () {
                  return $ocLazyLoad.load([]);
                }
              );
            }]
        }
      });
  }
  )

  .controller('UserManagerImportController', function ($scope, $state, $translate, $filter, $modal, CONFIGS, agents, participants, healthCoachs, employers) {

    $scope.templateUrlImportIndividual = CONFIGS.baseURL();
    $scope.templateUrlImportMultiple = CONFIGS.baseURL() + '/participants/import/templateForClients';

    $scope.resultUploadFileClient = [];
    $scope.resultUploadFileParForMultClients = [];
    $scope.resultUploadFile = [];

    $scope.employerList = [];
    $scope.incentiveList = [];

    //Data of UserType 
    var _listUserTypes_ = {
      'participants': 'Participants',
      'clients': 'Clients',
      'agents': 'Agents',
      'healthCoachs': 'Health Coaches',
    };

    $scope.env = {
      currentClient: null,
      currentIncentive: [],

      userTypeSelected: null,
      listUserTypes: _listUserTypes_,

      listClientSelected: [],
      listClientName: "",
      listIdsClient: "",
    };




    function getEmployers() {
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
      employers.all(headers, true).then(function (data) {
        $scope.employerList = data.employerList;
      });
    }

    //getEmployers();

    // Get benefit year by client
    function getIncentives() {
      $scope.incentiveList = [];
      $scope.env.currentIncentive = null;

      // BeniComp Select
      if ($scope.env.currentClient.products.beniCompSelect) {
        // employers.getBenefitYearBcs($scope.env.currentClient.id).then(function(response) {
        //   $scope.incentiveList = response;
        //   if ($scope.incentiveList.length > 0) {
        //     $scope.env.currentIncentive = $scope.incentiveList[0];
        //   }
        // });
      } else {
        // BeniComp Advantage
      }

      return employers.getEmployerWithIncentive({
        id: $scope.env.currentClient.id
      }, false).then(function (response) {
        $scope.incentiveList = response.incentives;
        if ($scope.incentiveList.length > 0) {
          $scope.env.currentIncentive = $scope.incentiveList[0];
        }
      });
    }

    // select client for Multiple import Participants
    $scope.selectMultiClient = function (client, model, label) {
      if (client && client.id) {
        $scope.env.listClientSelected.push({
          clientName: client.clientName,
          id: client.id
        });
      }


      $scope.env.listClientSelected = _.uniq($scope.env.listClientSelected, function (item, key, id) {
        return item.id;
      });

      if ($scope.env.listClientSelected.length > 0) {
        var tmpName = [];
        var tmpIDs = [];

        angular.forEach($scope.env.listClientSelected, function (item) {
          tmpName.push(item.clientName);
          tmpIDs.push(item.id);
        });

        $scope.env.listClientName = tmpName.toString();
        $scope.env.listIdsClient = tmpIDs.toString();

      } else {
        $scope.env.listClientName = "";
        $scope.env.listIdsClient = "";
      }

    };


    // Change current client
    $scope.changeCurrentClient = function (client, model, label) {
      if (client && client.id) {
        //$scope.env.currentClient = client;
        getIncentives();
        resetEnvironments();
      }

    };

    $scope.importFilesParticipant = function ($element) {
      if ($scope.env.currentClient) {
        if ($element.files.length > 0) {
          $scope.modal = $modal.open({
            controller: 'UserManagerParticipantUploadConfirmController',
            templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
            size: 'md',
            resolve: {
              files: function () {
                return $element.files;
              },
              type: function () {
                return "";
              }
            }
          });
          $scope.modal.result.then(function (confirm) {
            if (confirm) {
              // BeniComp Select
              if ($scope.env.currentClient.products.beniCompSelect) {

              } else {
                // BeniComp Advantage
              }
              var incentiveId = null;
              if ($scope.env.currentIncentive) {
                incentiveId = $scope.env.currentIncentive.id;
              }
              participants.importParticipantForClientId($element.files, $scope.env.currentClient.id, incentiveId).then(function (data) {
                $scope.resultUploadFileClient = data;
                //$state.go('loggedIn.modules.user-manager.participant');
                $element.value = "";
              }, function (error) {
                var message = error.errors[0].errorMessage;
                $element.value = "";
                $scope.openError(message);
              });
            } else {
              $element.value = "";
            }
          });
        }
      } else {
        $element.value = "";
      }
    };

    $scope.importFilesParticipantForClients = function ($element) {
      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'UserManagerParticipantUploadConfirmController',
          templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            },
            type: function () {
              return "";
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {

            var headers = {
              'X-Filter': JSON.stringify([
                {
                  ids: $scope.env.listIdsClient
                }
              ])
            };

            participants.importParticipantForClients($element.files, headers).then(function (data) {
              $scope.resultUploadFileParForMultClients = data;
              //$state.go('loggedIn.modules.user-manager.participant');
              $element.value = "";
            }, function (error) {
              var message = error.errors[0].errorMessage;
              $element.value = "";
              $scope.openError(message);
            });
          } else {
            $element.value = "";
          }
        });
      }
    };


    $scope.importFilesExcel = function ($element, type) {
      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'UserManagerParticipantUploadConfirmController',
          templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            },
            type: function () {
              return type;
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {

            var API = participants;

            if (type === 'agents') {
              API = agents;
            } else if (type === 'healthCoachs') {
              API = healthCoachs;
            } else if (type === 'clients') {
              API = employers;
            }


            API.importMultipe($element.files).then(function (data) {
              $scope.resultUploadFileClient = data;
              //$state.go('loggedIn.modules.user-manager.participant');
              $element.value = "";
            }, function (error) {
              var message = error.errors[0].errorMessage;
              $element.value = "";
              $scope.openError(message);
            });


          } else {
            $element.value = "";
          }
        });
      }

    };

    // Import file
    $scope.importFiles = function ($element) {
      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'UserManagerParticipantUploadConfirmController',
          templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            },
            type: function () {
              return "";
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {
            participants.import($element.files).then(function (data) {
              $scope.resultUploadFile = data;
              //$state.go('loggedIn.modules.user-manager.participant');
            }, function (error) {
              var message = error.errors[0].errorMessage;
              /*if(error.status === 500) {
               message = $translate.instant('participant.create.import.error500');
               } else {
               message = $translate.instant('participant.create.import.error');
               }*/
              $scope.openError(message);
            });
          } else {
            $element.files = null;
          }
        });
      } else {
        $element.files = null;
      }
    };

    // click go to home
    $scope.clickHome = function (currentClient) {

      if (currentClient) {
        $state.go('loggedIn.modules.user-manager.participantClient', { 'idClient': currentClient.id });
      } else {
        $state.go('loggedIn.modules.user-manager.participant');
      }
    };

    $scope.selectUserType = function (userType) {

      //reset
      resetEnvironments();
      $scope.templateUrlImportIndividual = CONFIGS.baseURL();

      if (userType === 'participants') {
        $scope.templateUrlImportIndividual += '/participants/import/templatev5';
      }
      else if (userType === 'agents') {
        $scope.templateUrlImportIndividual += '/agents/import/template';
      }
      else if (userType === 'healthCoachs') {
        $scope.templateUrlImportIndividual += '/healthCoaches/import/template';
      }
      else if (userType === 'clients') {
        $scope.templateUrlImportIndividual += '/employers/import/template';
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
      $scope.resultUploadFileClient = [];
      $scope.resultUploadFileParForMultClients = [];
      $scope.resultUploadFile = [];
    }
  });
