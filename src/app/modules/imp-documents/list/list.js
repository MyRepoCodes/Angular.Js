angular.module('app.modules.imp-documents.list', [])

.config(function($stateProvider) {
    $stateProvider
      // Client Manager
      .state('loggedIn.modules.imp-documents.client.list', {
        url: '/:id/:name',
        views: {
          'manager-content@loggedIn.modules.imp-documents': {
            templateUrl: 'modules/imp-documents/list/list_by_clientmanager_for_user.tpl.html',
            controller: 'ImpDocumentsListController'
          }
        }
      })

      // Client Manager
      .state('loggedIn.modules.imp-documents.healthcoach.list', {
        url: '/:id/:name',
        views: {
          'manager-content@loggedIn.modules.imp-documents': {
            templateUrl: 'modules/imp-documents/list/list_by_clientmanager_for_user.tpl.html',
            controller: 'ImpDocumentsListController'
          }
        }
      })

      // Client Manager - Client - HealthCoach
      .state('loggedIn.modules.imp-documents.participant.list', {
        url: '/:id/:name',
        views: {
          'manager-content@loggedIn.modules.imp-documents': {
            templateUrl: 'modules/imp-documents/list/list_by_user_for_participant.tpl.html',
            controller: 'ImpDocumentsListController'
          }
        }
      })

      // Client
      .state('loggedIn.modules.imp-documents.clientDocumentList', {
        url: '/list',
        views: {
          'manager-content@loggedIn.modules.imp-documents': {
            templateUrl: 'modules/imp-documents/list/list_for_user.tpl.html',
            controller: 'ImpDocumentsListForUserController'
          }
        }
      })

      // Health Coach
      .state('loggedIn.modules.imp-documents.healthCoachDocumentList', {
        url: '/list',
        views: {
          'manager-content@loggedIn.modules.imp-documents': {
            templateUrl: 'modules/imp-documents/list/list_for_user.tpl.html',
            controller: 'ImpDocumentsListForUserController'
          }
        }
      })

      // Participant
      .state('loggedIn.modules.imp-documents.list', {
        url: '/list-participant',
        views: {
          'manager-content@loggedIn.modules.imp-documents': {
            templateUrl: 'modules/imp-documents/list/list_for_participant.tpl.html',
            controller: 'ImpDocumentsListForParticipantController',
          }
        }
      })

      // Participant
      .state('loggedIn.modules.imp-documentsClientUrl.list', {
        url: '/list',
        views: {
          'manager-content@loggedIn.modules.imp-documentsClientUrl': {
            templateUrl: 'modules/imp-documents/list/list_for_participant.tpl.html',
            controller: 'ImpDocumentsListForParticipantController',
          }
        }
      });
  }
)

//*** Get getDocuments By User Id
.controller('ImpDocumentsListController', function($scope, $state, $stateParams, $filter, $translate, $modal, CONFIGS, ngTableParams, security, documents, users) {
    $scope.currentName = $stateParams.name;
    $scope.documentList = [];
    var documentList;

    // Init model
    $scope.NgTableParams = ngTableParams;

    // Filter here
    $scope.filter = {
      displayName: undefined
    };

    $scope.uploadedForRole = null;

    // Filter By uploadedForRole
    function documentFilterByUploadFor() {
      documentList = angular.copy($scope.documentList);
      if (angular.isNumber($scope.uploadedForRole)) {
        for (var i = 0; i < documentList.length; i++) {
          if (documentList[i].uploadedForRole !== $scope.uploadedForRole) {
            documentList.splice(i, 1);
            i--;
          }
        }
      }

      return documentList;
    }

    // Paging from api
    var history = {
      q: null,
      page: null,
      pageSize: null,
      refresh: false
    };
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: 1,   // show first page
      count: CONFIGS.countPerPage,  // count per page
      filter: $scope.filter,
      sorting: {
          uploadDate: 'desc'     // initial sorting
        }
    }, {
      //counts: [], // hide page counts control
      //total: 1,  // value less than count hide pagination
      getData: function($defer, params) {
        function pagination() {
          var sorting = params.sorting();
          var filter = params.filter();
          var params2 = {
            page: params.page(),
            pageSize: params.count()
          };

          // Sort
          for (var s in sorting) {
            if (sorting[s] === 'asc') {
              params2.sort = s;
            } else if (sorting[s] === 'desc') {
              params2.sort = '-' + s;
            }
            break;
          }

          // Filter
          if (!!filter.displayName) {
            params2.q = 'displayName=' + filter.displayName;
          }

          $scope.loading = true;
          params2.id = $stateParams.id;
            params2.embed = 'uploadedBy.username,uploadedBy.roleName,uploadedFor.username,uploadedFor.roleName,uploadedFor.entity.firstName,uploadedFor.entity.lastName';
            users.getDocuments(params2, false).then(function(data) {
              var i;

              //**** Hack Code
              if (security.isEmployer() || security.isHealthCoach()) {
                documentList = [];
                var notMe = 0;
                for (i = 0; i < data.documentList.length; i++) {
                  if (data.documentList[i].uploadedById === security.currentUser.userId) {
                    documentList.push(data.documentList[i]);
                  } else {
                    notMe++;
                  }
                }
                data.documentList = documentList;
                data.totalCount = data.totalCount - notMe;
              }
              //*** End Hack Code

              params.total(data.totalCount);
              $scope.loading = false;
              $scope.documentList = [];
              for (i = 0; i < data.documentList.length; i++) {
                data.documentList[i].uploadedByName = security.getUploadedByName(data.documentList[i].uploadedBy);

                if (angular.isObject(data.documentList[i].uploadedFor)) {
                  data.documentList[i].uploadedForRole = data.documentList[i].uploadedFor.roleName;
                }

                $scope.documentList.push(data.documentList[i]);
              }

              documentList = documentFilterByUploadFor();
              $defer.resolve(documentList);
            }, function(error) {
              $scope.loading = false;
            });
        }

        params.data = [];
        pagination();
      }
    });

    // Reload current page
    $scope.reload = function() {
      $scope.tableParams.reload();
    };

    // Upload
    $scope.uploadFiles = function($element) {
      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'AlertUploadConfirmController',
          templateUrl: 'modules/alert/upload-confirm.tpl.html',
          //controller: 'ImpDocumentsConfirmController',
          //templateUrl: 'modules/imp-documents/confirm/confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function() {
              return $element.files;
            },
            data: function() {
              return {
                title: $translate.instant('document.alert.titleUpload'),
                summary: $translate.instant('document.alert.summaryUpload')
              };
            }
          }
        });
        $scope.modal.result.then(function(confirm) {
          if (confirm) {
            documents.upload($element.files).then(function(response) {
              documents.post({
                documentFilename: response.documentFilename,
                uploadedForId: $stateParams.id
              }).then(function(response) {
                $scope.newDocumentId = response.id;
                // Refresh
                history.refresh = true;
                $scope.reload();
              }, function(error) {
                var message = error.errors[0].errorMessage;
                $scope.openError(message);
              });
            }, function(error) {
              var message = error.errors[0].errorMessage;
              $scope.openError(message);
            });
          }
        });
      }
    };

    // Remove document
    $scope.remove = function(document) {
      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function() {
            return {
              title: $translate.instant('alert.waring.heading'),
              summary: false,
              style: 'yesNo',
              message: $translate.instant('document.alert.removeDocument')
            };
          }
        }
      });
      $scope.modal.result.then(function(result) {
        if (result === true) {
          documents.remove(document.id).then(function() {
            for (var i = 0; i < $scope.documentList.length; i++) {
              if ($scope.documentList[i].id === document.id) {
                $scope.documentList.splice(i, 1);
              }
            }

            // Refresh
            $scope.reload();
          }, function(error) {

          });
        }
      });
    };

    // Delete multiple documents
    $scope.removeMultipleDocuments = function() {
      $scope.modal = $modal.open({
        controller: 'ImpDocumentsSelectDocumentsController',
        templateUrl: 'modules/imp-documents/select-documents/select-documents.tpl.html',
        size: 'lg',
        resolve: {
          type: function() {
            return 'delete';
          },
          scope: function () {
            return $scope;
          },
          documentList: function() {
            return $scope.documentList;
          }
        }
      });
      $scope.modal.result.then(function(documentList) {
        if (!!documentList) {
          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function() {
                return {
                  title: $translate.instant('alert.waring.heading'),
                  summary: false,
                  style: 'yesNo',
                  message: $translate.instant('document.alert.removeMultipleDocuments', {n: documentList.length})
                };
              }
            }
          });
          $scope.modal.result.then(function(ok) {
            function removeDocument(documentList) {
              if (!!documentList[0]) {
                documents.remove(documentList[0].id).then(function() {
                  documentList.splice(0, 1);
                  removeDocument(documentList);
                }, function() {
                  documentList.splice(0, 1);
                  removeDocument(documentList);
                });
              } else {
                // Refresh
                history.refresh = true;
                $scope.reload();
              }
            }

            if (ok === true) {
              removeDocument(documentList);
            }
          });
        }
      });
    };

    $scope.currentFilter = 'Filter';
    $scope.currentFilterKey = 'allDocuments';
    $scope.choiceFilter = function(filter) {
      if (filter === 'clientDocuments') {
        $scope.uploadedForRole = security.roles.employer;
        $scope.currentFilter = 'Client Documents';
      } else if (filter === 'heathCoachDocuments') {
        $scope.uploadedForRole = security.roles.healthCoach;
        $scope.currentFilter = 'Health Coach Documents';
      } else if (filter === 'participantDocuments') {
        $scope.uploadedForRole = security.roles.participant;
        $scope.currentFilter = 'Participant Documents';
      } else {
        $scope.uploadedForRole = undefined;
        $scope.currentFilter = 'Filter';
      }
      $scope.currentFilterKey = filter;

      // Refresh table
      $scope.reload();
    };

    // Go parent state
    $scope.goParent = function() {
      if ($state.$current.name.indexOf('loggedIn.modules.imp-documents.client') === 0) {
        $state.go('loggedIn.modules.imp-documents.client');
      } else {
        $state.go('loggedIn.modules.imp-documents.healthcoach');
      }
    };

    // Remove notification
    documents.putNotifications();
  }
)

//*** getMeDocuments for User (Client and HealthCoach)
.controller('ImpDocumentsListForUserController', function($scope, $state, $stateParams, $filter, $translate, $modal, CONFIGS, ngTableParams, security, users, documents) {
  $scope.currentUser = security.currentUser;
  $scope.currentName = '';
  $scope.documentList = [];
  $scope.filterPageName = '';
  $scope.controller = 'ImpDocumentsListForUserController';
  var documentList;

  // Check permission
  if (security.isEmployer()) {
    $scope.currentName = security.currentUser.clientName;
    $scope.filterPageName = 'Client Documents';
  } else if (security.isHealthCoach()) {
    $scope.currentName = security.currentUser.firstName + ' ' + security.currentUser.lastName;
    $scope.filterPageName = 'Health Coach Documents';
  } else {
    $state.go('loggedIn.modules.imp-documents.participant');
  }

  // Init model
  $scope.NgTableParams = ngTableParams;

  // Filter here
  $scope.filter = {
    displayName: undefined,
    uploadedForId: undefined,
  };

  // Paging from api
  $scope.tableParams = new $scope.NgTableParams({
    page: 1,   // show first page
    count: CONFIGS.countPerPage,  // count per page
    filter: $scope.filter
  }, {
    //counts: [], // hide page counts control
    //total: 1,  // value less than count hide pagination
    getData: function($defer, params) {
      function pagination() {
        $scope.loading = true;

        var sorting = params.sorting();
        var filter = params.filter();

        var params2 = {
          embed: 'uploadedBy.roleName',
          page: params.page(),
          pageSize: params.count(),
        };

        // Sort
        for (var s in sorting) {
          if (sorting[s] === 'asc') {
            params2.sort = s;
          } else if (sorting[s] === 'desc') {
            params2.sort = '-' + s;
          }
          break;
        }

        // Filter
        if (!!filter.displayName) {
          params2.q = 'displayName=' + filter.displayName;
        }

        users.getMeDocuments(params2).then(function(data) {
          params.total(data.totalCount);
          $scope.loading = false;
          $scope.documentList = [];

          documentList = [];
          if (data.documentList) {
            for (var i = 0; i < data.documentList.length; i++) {
              data.documentList[i].uploadedByName = security.getUploadedByName(data.documentList[i].uploadedBy);
              documentList.push(data.documentList[i]);
            }
            $scope.documentList = documentList;
          }

          // use build-in angular sort
          var orderedData = params.sorting() ? $filter('orderBy')($scope.documentList, params.orderBy()) : $scope.documentList;
          $defer.resolve(orderedData);
        }, function(error) {
          $scope.loading = false;
        });
      }

      params.data = [];
      pagination();
    }
  });

  // Reload current page
  $scope.reload = function() {
    $scope.tableParams.reload();
  };

  // Remove document
  $scope.remove = function(document) {
    if (document.uploadedById === $scope.currentUser.userId) {
      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function() {
            return {
              title: $translate.instant('alert.waring.heading'),
              summary: false,
              style: 'yesNo',
              message: $translate.instant('document.alert.removeDocument')
            };
          }
        }
      });
      $scope.modal.result.then(function(result) {
        if (result === true) {
          documents.remove(document.id).then(function() {
            for (var i = 0; i < $scope.documentList.length; i++) {
              if ($scope.documentList[i].id === document.id) {
                $scope.documentList.splice(i, 1);
              }
            }

            // Refresh
            $scope.reload();
          }, function(error) {

          });
        }
      });
    }
  };

  // Delete multiple documents
  $scope.removeMultipleDocuments = function() {
    return false;
  };

  $scope.currentFilter = $scope.filterPageName;
  $scope.currentFilterKey = 'myDocuments';
  $scope.choiceFilter = function(filter) {
    if (filter === 'participantDocuments') {
      //$scope.filter.uploadedForId = false;
      $scope.currentFilter = 'Participant Documents';
      $scope.currentFilterKey = filter;
    } else {
      //$scope.filter.uploadedForId = true;
      $scope.currentFilter = $scope.filterPageName;
      $scope.currentFilterKey = filter;
    }

    // Refresh
    $scope.reload();
  };

  $scope.goParticipantList = function() {
    $state.go('loggedIn.modules.imp-documents.participantForUser');
  };

  // Remove notification
  documents.putNotifications();
})

//*** getMeDocuments for Participant
.controller('ImpDocumentsListForParticipantController', function($scope, $state, $stateParams, $filter, $translate, $modal, CONFIGS, ngTableParams, security, documents, users) {
  $scope.currentUser = security.currentUser;
  $scope.currentName = security.currentUser.firstName + ' ' + security.currentUser.lastName;

  // Init model
  $scope.NgTableParams = ngTableParams;

  // Filter here
  $scope.filter = {
    displayName: undefined,
    uploadedForId: undefined
  };

  // Paging from api
  $scope.tableParams = new $scope.NgTableParams({
    page: 1,   // show first page
    count: CONFIGS.countPerPage,  // count per page
    filter: $scope.filter,
    sorting: {
          uploadDate: 'desc'     // initial sorting
        }
  }, {
    // counts: [], // hide page counts control
    // total: 1,  // value less than count hide pagination
    getData: function($defer, params) {
      function pagination() {
        $scope.loading = true;

        var sorting = params.sorting();
        var filter = params.filter();

        var params2 = {
          embed: 'uploadedBy.roleName',
          page: params.page(),
          pageSize: params.count(),
        };

        // Sort
        for (var s in sorting) {
          if (sorting[s] === 'asc') {
            params2.sort = s;
          } else if (sorting[s] === 'desc') {
            params2.sort = '-' + s;
          }
          break;
        }

        // Filter
        if (!!filter.displayName) {
          params2.q = 'displayName=' + filter.displayName;
        }

        users.getMeDocuments(params2).then(function(data) {
          params.total(data.totalCount);
          $scope.loading = false;
          $scope.documentList = [];

          var documentList = [];
          if (data.documentList) {
            for (var i = 0; i < data.documentList.length; i++) {
              data.documentList[i].uploadedByName = security.getUploadedByName(data.documentList[i].uploadedBy);
              documentList.push(data.documentList[i]);
            }
            $scope.documentList = documentList;
          }

          // use build-in angular sort
          var orderedData = params.sorting() ? $filter('orderBy')($scope.documentList, params.orderBy()) : $scope.documentList;
          $defer.resolve(orderedData);
        }, function(error) {
          $scope.loading = false;
        });
      }

      params.data = [];
      pagination();
    }
  });

  // Reload current page
  $scope.reload = function() {
    $scope.tableParams.reload();
  };

  $scope.currentFilter = 'Filter';
  $scope.currentFilterKey = 'allDocuments';
  $scope.choiceFilter = function(filter) {
    if (filter === 'clientDocuments') {
      $scope.filter.uploadedForId = $scope.currentUser.employerId;
      $scope.currentFilter = 'Client Documents';
      $scope.currentFilterKey = filter;
    } else if (filter === 'heathCoachDocuments') {
      $scope.filter.uploadedForId = $scope.currentUser.healthCoachId;
      $scope.currentFilter = 'Health Coach Documents';
      $scope.currentFilterKey = filter;
    } else if (filter === 'myDocuments') {
      $scope.filter.uploadedForId = $scope.currentUser.userId;
      $scope.currentFilter = 'My Documents';
      $scope.currentFilterKey = filter;
    } else {
      $scope.filter.uploadedForId = undefined;
      $scope.currentFilter = 'Filter';
      $scope.currentFilterKey = 'allDocuments';
    }
  };

  // Remove notification
  documents.putNotifications();
});
