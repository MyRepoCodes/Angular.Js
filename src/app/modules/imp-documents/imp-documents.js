/***
 * The Document Manager is where the Client Manager will be able to upload documents for both "Clients" and for "Participants of Clients"
 * For example, a Client Manager will upload a "health plan document" and a "participant guide document" that will go to every Participant under that Client.
 * The Health Coach Manager and Health Coaches will be able to upload documents for individual Participants (health and fitness guides based on their biomarker results)
 * Also, the Client (and their Agent) will be able to upload the documents needed by the Client Manager to be able to quote their health insurance plan.
 */

angular.module('app.modules.imp-documents', [
    'app.modules.imp-documents.select-documents',
    'app.modules.imp-documents.confirm',
    'app.modules.imp-documents.client',
    'app.modules.imp-documents.healthcoach',
    'app.modules.imp-documents.participant',
    'app.modules.imp-documents.list'
  ])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.imp-documents', {
        url: '/document-manager',
        views: {
          'main-content': {
            templateUrl: 'modules/imp-documents/imp-documents.tpl.html',
            controller: 'ImpDocumentsController'
          }
        }
      })

      .state('loggedIn.modules.imp-documentsClientUrl', {
        url: '/:clientUrl/document-manager',
        views: {
          'main-content': {
            templateUrl: 'modules/imp-documents/imp-documents.tpl.html',
            controller: 'ImpDocumentsController'
          }
        }
      });
  })

  .controller('ImpDocumentsController',
    function ($scope, $state, $modal, $stateParams, utils, security, documents, $location, $timeout) {

      if (security.isParticipant() && $stateParams.clientUrl) {
        $state.go('loggedIn.modules.imp-documentsClientUrl', {clientUrl: $stateParams.clientUrl});
      } else {
        if (security.isAdmin()) {
          $state.go('loggedIn.modules.imp-documents.client');
        }
      }

      var rootStateName = 'loggedIn.modules.imp-documents';
      if ($stateParams.clientUrl) {
        rootStateName = 'loggedIn.modules.imp-documentsClientUrl';
      }

      $scope.currentState = 'loggedIn.modules.imp-documents.list';
      $scope.parentState = 'list';

      /*$scope.currentState = 'loggedIn.modules.imp-documents.participant';
       $scope.parentState = 'participant';*/

      if (security.isParticipant()) {
        $scope.currentState = rootStateName + '.list';
        $scope.parentState = 'list';
      } else if (security.isEmployer()) {
        $scope.currentState = rootStateName + '.clientDocumentList';
        $scope.parentState = 'list';
      } else if (security.isHealthCoach()) {
        $scope.currentState = rootStateName + '.healthCoachDocumentList';
        $scope.parentState = 'list';
      } else if (security.isClientManager() || security.isAdmin()) {
        $scope.currentState = 'loggedIn.modules.imp-documents.client';
        $scope.parentState = 'client';
      }


      var stateInit = $scope.currentState;
      var stateNameInit = $scope.parentState;

      function parentState(state) {
        state = state.$current.name;

        if (state.indexOf('client') > -1) {
          return 'client';
        } else if (state.indexOf('healthcoach') > -1) {
          return 'healthcoach';
        } else if (state.indexOf('participant') > -1) {
          return 'participant';
        }

        return false;
      }

      $scope.getFilterName = function () {
        var state = parentState($state);

        if (state === 'client') {
          return 'Client';
        } else if (state === 'healthcoach') {
          return 'Health Coach';
        } else if (state === 'participant') {
          return 'Participant';
        }

        return 'Filter';
      };

      $scope.goStateList = function () {
        var state = parentState($state);

        if (security.isParticipant()) {
          $scope.currentState = rootStateName + '.list';
          $scope.parentState = 'list';
        } else if (security.isEmployer()) {
          $scope.currentState = rootStateName + '.clientDocumentList';
          $scope.parentState = 'list';
        } else if (security.isEmployer()) {
          $scope.currentState = rootStateName + '.healthCoachDocumentList';
          $scope.parentState = 'list';
        } else if (security.isClientManager() || security.isAdmin() && state === 'client') {
          $scope.currentState = 'loggedIn.modules.imp-documents.client';
          $scope.parentState = 'client';
        } else if (security.isClientManager() || security.isAdmin() && state === 'healthcoach') {
          $scope.currentState = 'loggedIn.modules.imp-documents.healthcoach';
          $scope.parentState = 'healthcoach';
        } else if (state === 'participant') {
          $scope.currentState = 'loggedIn.modules.imp-documents.participant';
          $scope.parentState = 'participant';
        } else {
          $scope.currentState = stateInit;
          $scope.parentState = stateNameInit;
        }

        $state.go($scope.currentState);
      };

      $scope.goState = function (sref) {
        $scope.currentState = sref;
        $state.go($scope.currentState);
      };

      /*$scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {

       $timeout(function () {
       $scope.parentState = parentState($state);

       $scope.goStateList();
       // Fix redirect
       /!*if (toState.name === 'loggedIn.modules.imp-documents' || toState.name === 'loggedIn.modules.imp-documentsClientUrl') {
       $scope.goStateList();
       } else if (security.isParticipant() && toState.name !== rootStateName + '.list') {
       $scope.goStateList();
       }*!/
       }, 1000);

       });*/
      $scope.goStateList();

      //*** Global function

      // Download
      $scope.download = function (documentData, name) {
        documents.download(documentData.id).then(function (response) {
          var filename = name + '_' + response.filename;
          filename = filename.replace(/ +(?= )/g, '').replace(/ /g, '-').toLowerCase();
          utils.saveAs(response.fileContent, filename, response.contentType);
        }, function (error) {
          
        });
      };

      // Download multiple documents
      $scope.downloadMultipleDocuments = function (documentList, name) {
        $scope.modal = $modal.open({
          controller: 'ImpDocumentsSelectDocumentsController',
          templateUrl: 'modules/imp-documents/select-documents/select-documents.tpl.html',
          size: 'lg',
          resolve: {
            type: function () {
              return 'download';
            },
            scope: function () {
              return $scope;
            },
            documentList: function () {
              return documentList;
            }
          }
        });
        $scope.modal.result.then(function (documentList) {
          if (!!documentList && documentList.length > 0) {
            var ids = [];
            for (var i = 0; i < documentList.length; i++) {
              ids.push(documentList[i].id);
            }

            //$location.path($scope.baseURL + '/download?documentIds=' + ids.join(','));

            /*documents.download(ids.join(',')).then(function (response) {
             var filename = name + '_' + response.filename;
             filename = filename.replace(/ +(?= )/g, '').replace(/ /g, '-').toLowerCase();
             utils.saveAs(response.fileContent, filename, response.contentType);
             }, function (error) {
             console.error(error);
             });*/
          }
        });
      };

      // Check new Document
      $scope.isNewDocument = function (id) {
        var arr = [];
        if (security.notifications) {
          for (var i = 0; i < security.notifications.length; i++) {
            arr = arr.concat(security.notifications[i].documents);
          }
        }

        if (arr.indexOf(id) > -1) {
          return true;
        }

        //if(documents.newDocuments && angular.isArray(documents.newDocuments)) {
        //    return false;
        //}

        return false;
      };

      $scope.goListForUser = function () {
        if (security.isEmployer()) {
          $state.go('loggedIn.modules.imp-documents.clientDocumentList');
        } else if (security.isHealthCoach()) {
          $state.go('loggedIn.modules.imp-documents.healthCoachDocumentList');
        }
      };
    }
  );
