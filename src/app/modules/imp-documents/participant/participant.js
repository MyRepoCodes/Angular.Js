angular.module('app.modules.imp-documents.participant', [])

  .config(function ($stateProvider) {
    $stateProvider
      // Client Manager
      .state('loggedIn.modules.imp-documents.participant', {
        url: '/manager-participant',
        views: {
          'manager-content': {
            templateUrl: 'modules/imp-documents/participant/participant.tpl.html',
            controller: 'ImpDocumentsParticipantController'
          }
        }
      })

      // Client - HealthCoach
      .state('loggedIn.modules.imp-documents.participantForUser', {
        url: '/list-of-participant',
        views: {
          'manager-content': {
            templateUrl: 'modules/imp-documents/participant/participant_for_user.tpl.html',
            controller: 'ImpDocumentsParticipantController'
          }
        }
      });
  }
  )

  .controller('ImpDocumentsParticipantController', function ($scope, $state, $filter, $translate, $modal, employers, CONFIGS, utils, ngTableParams, security, documents) {
    //*** Hack Code
    $scope.goParticipantDocument = function () {
      $state.go('loggedIn.modules.imp-documents.list');
    };

    //START: For Auto-complete
    $scope.paramsAutoComplete = {
      employer: null
    };
    $scope.$watch('paramsAutoComplete.employer', function (value) {
      if (!value || !value.id) {
        $scope.employerList = [];
        //$scope.changeEmployer(0);
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
        fields: 'id,clientName,firstName,lastName,employerLocations,products,groupNumber,effectiveDateOfInsurance,enrollmentDate,annualMaximum',
        q: 'clientName=' + keyword
      };

      return employers.get(params, headers, true)
        .then(function (data) {
          $scope.employerList = data.employerList;
          return data.employerList;
        });
    };
    //END: For Auto-complete

    if (security.isParticipant()) {

      $scope.goParticipantDocument();

    } else if (security.isEmployer() || security.isHealthCoach()) {
      if ($state.$current.name !== 'loggedIn.modules.imp-documents.participantForUser') {
        $state.go('loggedIn.modules.imp-documents.participantForUser');
      }
    }


    //*** End Hack Code

    $scope.goParticipantDetail = function (participant) {
      $state.go('loggedIn.modules.imp-documents.participant.list', {
        id: participant.userId,
        name: participant.name
      });
    };
    $scope.participantList = [];
    $scope.employerList = [];

    // Init
    function getEmployers() {
      employers.all(undefined, false).then(function (data) {
        $scope.employerList = data.employerList;
      });
    }

    function init() {
      getEmployers();
    }

    init();


    // Init model
    $scope.NgTableParams = ngTableParams;

    // Filter here
    $scope.filter = {
      keyword: undefined,
      clientName: undefined,
      employerId: undefined
    };

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
      count: 25,  // count per page
      filter: $scope.filter
    }, {
        //counts: [], // hide page counts control
        //total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
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
            if (!!filter.keyword) {
              params2.q = 'firstName,lastName=' + filter.keyword;
            }

            $scope.loading = true;
            documents.getParticipants(params2, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.participantList = data.participantList;
              $defer.resolve($scope.participantList);

            }, function (error) {
              $scope.loading = false;
            });
          }

          params.data = [];
          pagination();
        }
      });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
    };

    $scope.choiceEmployer = function (employer) {
      $scope.currEmployer = employer;
      $scope.filter.clientName = employer.clientName;
      $scope.filter.employerId = employer.id;
    };

    $scope.filterEmployerClear = function () {
      $scope.currEmployer = null;
      $scope.filter.clientName = undefined;
      $scope.filter.employerId = null;
    };
  });
