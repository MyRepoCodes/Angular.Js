angular.module('app.modules.user-manager.dependent.manage', [])

  .controller('ManageDependentController', function ($scope, $timeout, security, $modalInstance, ngTableParams, utils, users, dependents, participants, participantInfo) {
    $scope.participantId = participantInfo.id;
    $scope.dependentInfo = false;
    $scope.userList = [];
    $scope.listDependentsActive = [];

    // Environments
    $scope.env = {
      row: 0,
      showValid: false,
      status: 0, // 0-list, 1-create, 2-edit
    };

    $scope.params = {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: null,
      ssn: "",
      gender: null,
      relationToParticipant: null,
      participantId: $scope.participantId,
    };

    // Get list dependents active
    function getDependentsActive() {
      var object = {
        id_participant: $scope.participantId
      };
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

      participants.getListDependents(object, headers, false).then(function (res) {
        $modalInstance.close(res.data);
      }, function (error) {
        $modalInstance.close([]);
      });

    }

    $scope.cancel = function () {
      getDependentsActive();
    };

    // Function submit data
    function submitData(data) {
      var params = _.clone(data);
      params.dateOfBirth = utils.dateToShort(params.dateOfBirth);
      params.ssn = utils.ssnFormatSubmit(params.ssn);

      if ($scope.env.status == 1) { // Create
        dependents.post(params).then(function (response) {
          $scope.env.showValid = false;
          $scope.reload();
          $scope.goList();
        }, function () {
          $scope.goList();
        });
      } else { // Update
        params.id = data.id;
        var objectPatch = angular.copy(params);

        dependents.updateInfo(objectPatch).then(function (response) {
          $scope.env.showValid = false;

          $scope.reload();
          $scope.goList();


        }, function () {
          $scope.goList();
        });
      }
    }
    $scope.submit = function (form, data) {
      $scope.env.showValid = true;

      if (form.$valid) {
        submitData(data);
      }

    };

    $scope.permanentlyDelete = function (item) {
      dependents.delete(item.id).then(function () {
        $scope.reload();
      }, function () {
        $scope.goList();
      });
    };

    $scope.inactive = function (item) {
      dependents.remove(item.id).then(function () {
        $scope.reload();
      }, function () {
        $scope.goList();
      });
    };

    $scope.restore = function (item) {
      dependents.restore(item.id).then(function () {
        $scope.reload();
      }, function () {
        $scope.goList();
      });
    };

    $scope.edit = function (form, item) {

      $scope.dependentInfo = angular.copy(item);

      $scope.dependentInfo['userId'] = item.applicationUserId;

      $scope.params.id = item.id;
      $scope.params.firstName = item.firstName;
      $scope.params.lastName = item.lastName;
      $scope.params.middleName = item.middleName;
      $scope.params.dateOfBirth = item.dateOfBirth;
      $scope.params.ssn = item.ssn;
      $scope.params.gender = item.gender;
      $scope.params.relationToParticipant = item.relationToParticipant;

      $scope.env.status = 2;

      //Fix SSN Validation;

      // $timeout(function () {

      //   console.log($scope.form);
      //   $scope.form.ssn_1000.$setPristine(true);
      // }, 1000);

    };

    $scope.openCreateDependent = function () {
      $scope.params.firstName = '';
      $scope.params.lastName = '';
      $scope.params.middleName = '';
      $scope.params.dateOfBirth = null;
      $scope.params.ssn = "";
      $scope.params.gender = null;
      $scope.params.relationToParticipant = null;

      $scope.env.status = 1;
    };

    $scope.goList = function () {
      $scope.env.status = 0;
    };



    // Permission
    $scope.isFullControl = function () {
      if (security.isAdmin() || security.isClientManager() || security.isAgentTheAgent() || security.isHealthCoachManager()) {
        return true;
      } else {
        return false;
      }
    };

    // Init model
    $scope.NgTableParams = ngTableParams;

    // select Status Archive
    $scope.selectStatusArchive = function (data) {
      $scope.filter.status = data;
    };


    // Filter here
    $scope.filter = {
      q: undefined,
      status: false
    };

    // Paging from api
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: 1,   // show first page
      count: 10,  // count per page
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

            var headers = {
              'X-Filter': JSON.stringify([
                {
                  property: "isDeleted",
                  operator: "equal",
                  condition: "or",
                  value: filter.status
                }
              ])
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
            if (!!filter.q) {
              params2.q = 'firstName,lastName=' + filter.q;
            }
            params2['id_participant'] = $scope.participantId;

            $scope.loading = true;

            participants.getListDependents(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.userList = data.data;

              $defer.resolve($scope.userList);
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

  });
