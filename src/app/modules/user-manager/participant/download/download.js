angular.module('app.modules.user-manager.participant.download', [])

  .config(function ($stateProvider) {
      $stateProvider
        .state('loggedIn.modules.user-manager.participant.download', {
          url: '/download',
          views: {
            'manager-content@loggedIn.modules.user-manager': {
              templateUrl: 'modules/user-manager/participant/download/download.tpl.html',
              controller: 'UserManagerParticipantDownloadController'
            }
          }
        })
        .state('loggedIn.modules.user-manager.participantClient.download', {
          url: '/download',
          views: {
            'manager-content@loggedIn.modules.user-manager': {
              templateUrl: 'modules/user-manager/participant/download/download.tpl.html',
              controller: 'UserManagerParticipantDownloadController'
            }
          }
        });
    }
  )

  .controller('UserManagerParticipantDownloadController', function ($scope, $state, $translate, $filter, $modal, $timeout, utils, CONFIGS, ngTableParams, security, participants, employers) {
    $scope.participantList = [];
    $scope.employerList = [];
    $scope.registeredList = [
      {value: true, label: 'Registered'},
      {value: false, label: 'Not registered'}
    ];
    $scope.healthResultList = [
      {value: true, label: 'Health Results'},
      {value: false, label: 'No Health Results'}
    ];
    $scope.coverageLevelList = [
      {value: 0, label: 'Single'},
      {value: 1, label: 'Married w/ no Children'},
      {value: 2, label: 'Single + Child'},
      {value: 3, label: 'Single + Children'},
      {value: 4, label: 'Married with Children'}
    ];
    $scope.fileFormatList = [
      {value: 1, label: 'Hooper Holmes'},
      {value: 2, label: 'BeniComp'}
    ];

    $scope.env = {
      isOpenSelectClient: false
    };

    // Init model
    $scope.NgTableParams = ngTableParams;

    // Filter here
    $scope.filter = {
      search: undefined,
      lastName: undefined,
      firstName: undefined,
      username: undefined,
      email: undefined,
      clientId: undefined,
      isRegistered: undefined,
      isHealthResult: undefined,
      coverageLevel: undefined,
      fileFormat: undefined,
      incentiveSelected: undefined,
    };

    $scope.labels = {
      clientName: 'Client',
      registered: 'Registered',
      healthResult: 'Health Results',
      coverageLevel: 'Enrollment Level',
      fileFormat: 'File Format',
    };

    $scope.labelDefaults = angular.copy($scope.labels);

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
          if (!!filter.search) {
            params2.search = filter.search;
          }

          if (filter.clientId) {
            params2.clientId = filter.clientId;
          }

          params2.isRegistered = filter.isRegistered;
          params2.isHealthResult = filter.isHealthResult;
          params2.coverageLevel = filter.coverageLevel;

          // incentive
          if (!!filter.incentiveSelected) {
            params2.incentiveId = filter.incentiveSelected.id;
          }

          $scope.loading = true;

          participants.get(params2, undefined, false).then(function (data) {
            params.total(data.totalCount);
            $scope.loading = false;
            $scope.participantList = [];
            for (var i = 0; i < data.participantList.length; i++) {
              $scope.participantList.push(data.participantList[i]);
            }
            // use build-in angular sort
            $scope.participantList = params.sorting() ? $filter('orderBy')($scope.participantList, params.orderBy()) : $scope.participantList;
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

    // Init employer list
    function getEmployers() {
      employers.all(undefined, false).then(function (data) {
        $scope.employerList = data.employerList;
      });
    }

    //getEmployers();

    $scope.changeCurrentIncentive = function (data) {

      $scope.filter.incentiveSelected = data;
    };

    $scope.choiceEmployer = function (employer) {
      if (employer) {

        //reset current benefit year
        $scope.filter.incentiveSelected = undefined;

        //get Benefit Year
        employers.getEmployerWithIncentive({id: employer.id})
          .then(function (result) {
            result['id']= employer.id; //build data same with object

            $scope.currEmployer = result;
            $scope.labels.clientName = result.clientName;
            $scope.filter.clientId = result.id;

          });

      } else {
        $scope.currEmployer = null;
        $scope.labels.clientName = null;
        $scope.filter.clientId = null;
      }

    };

    $scope.choiceRegistered = function (registered) {
      $scope.currRegistered = registered;
      $scope.labels.registered = registered.label;
      $scope.filter.isRegistered = registered.value;
    };

    $scope.choiceHealthResult = function (healthResult) {
      $scope.currHealthResult = healthResult;
      $scope.labels.healthResult = healthResult.label;
      $scope.filter.isHealthResult = healthResult.value;
    };

    $scope.choiceCoverageLevel = function (coverageLevel) {
      $scope.currCoverageLevel = coverageLevel;
      $scope.labels.coverageLevel = coverageLevel.label;
      $scope.filter.coverageLevel = coverageLevel.value;
    };

    $scope.choiceFileFormat = function (fileFormat) {
      $scope.currFileFormat = fileFormat;
      $scope.labels.fileFormat = fileFormat.label;
      $scope.filter.fileFormat = fileFormat.value;
    };

    // Clear filter
    $scope.filterClear = function () {
      $scope.currEmployer = null;
      $scope.labels.clientName = $scope.labelDefaults.clientName;
      $scope.filter.clientId = undefined;

      $scope.currRegistered = null;
      $scope.labels.registered = $scope.labelDefaults.registered;
      $scope.filter.isRegistered = undefined;

      $scope.currHealthResult = null;
      $scope.labels.healthResult = $scope.labelDefaults.healthResult;
      $scope.filter.isHealthResult = undefined;

      $scope.currCoverageLevel = null;
      $scope.labels.coverageLevel = $scope.labelDefaults.coverageLevel;
      $scope.filter.coverageLevel = undefined;

      $scope.currFileFormat = null;
      $scope.labels.fileFormat = $scope.labelDefaults.fileFormat;
      $scope.filter.fileFormat = undefined;

      $scope.filter.incentiveSelected = undefined;
      $scope.paramsAutoComplete.employer = null;
    };

    // Download all user
    $scope.downloadUsers = function () {
      var params = _.clone($scope.filter);
      if (_.isEmpty(params.search)) {
        delete params.search;
      }

      if (!_.isEmpty(params.incentiveSelected)) {
        params['incentiveId'] = params.incentiveSelected.id;

        delete params.incentiveSelected;
      }
      participants.downloadAllUserV2(params);
    };

    // Download single user
    $scope.downloadUser = function (user) {
      participants.downloadUsers(user.userId);
    };


    //START: For Auto-complete
    $scope.paramsAutoComplete = {
      employer: null
    };
    $scope.$watch('paramsAutoComplete.employer', function (value) {
      if (!value || !value.id) {
        $scope.employerList = [];
        //$scope.changeEmployer(0);

        //reset select client
        $scope.choiceEmployer(null);
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

    function init() {

    }

    init();
  });
