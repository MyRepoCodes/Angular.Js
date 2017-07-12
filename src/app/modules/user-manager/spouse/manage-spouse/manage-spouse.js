angular.module('app.modules.user-manager.spouse.manage-spouse', [])

  .controller('ManageSpouseController', function ($scope, security, $modalInstance, ngTableParams, utils, users, spouses, participants, participantInfo) {
    $scope.participantId = participantInfo.id;
    $scope.spouseInfo = false;
    $scope.isHaveSpouseActive = true;
    $scope.userList = [];
    $scope.spouseActive = "";

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
      email: null,
      phoneNumber: "",
      gender: null,
      participantId: $scope.participantId
    };

    // Get ONE spouse active
    function getASpouseActive() {
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

      participants.getListSpouse(object, headers, false).then(function (res) {
        if (res.totalCount > 0) {
          $scope.spouseActive = [res.data[0]];

          $modalInstance.close($scope.spouseActive);
        } else {
          $scope.spouseActive = null;
          $modalInstance.close($scope.spouseActive);
        }
      }, function (error) {
        $scope.spouseActive = null;

        $modalInstance.close($scope.spouseActive);
      });

    }

    $scope.cancel = function () {
      getASpouseActive();
    };

    $scope.submit = function (isValid, data) {
      $scope.env.showValid = true;
      if (isValid) {
        var params = _.clone(data);
        params.dateOfBirth = utils.dateToShort(params.dateOfBirth);
        params.ssn = utils.ssnFormatSubmit(params.ssn);

        if ($scope.env.status == 1) { // Create
          spouses.post(params).then(function (response) {
            $scope.env.showValid = false;
            $scope.reload();
            $scope.goList();
          }, function () {
            $scope.goList();
          });
        } else { // Update
          params.id = data.id;
          var objectPatch = angular.copy(params);
          delete objectPatch['email'];
          delete objectPatch['phoneNumber'];

          spouses.patch(objectPatch).then(function (response) {
            $scope.env.showValid = false;

            users.patchUserSecurity(utils.formatDataUserSecurity($scope.spouseInfo, params))
              .then(function (res) {
                console.log(res);

                $scope.reload();
                $scope.goList();

              });


          }, function () {
            $scope.goList();
          });
        }
      }
    };

    $scope.permanentlyDelete = function (item) {
      spouses.delete(item.id).then(function () {
        $scope.reload();
      }, function () {
        $scope.goList();
      });
    };

    $scope.inactive = function (item) {
      spouses.remove(item.id).then(function () {
        $scope.isHaveSpouseActive = false;
        $scope.reload();
      }, function () {
        $scope.goList();
      });
    };

    $scope.restore = function (item) {
      spouses.restore(item).then(function () {
        $scope.isHaveSpouseActive = true;
        $scope.reload();
      }, function () {
        $scope.goList();
      });

    };

    $scope.edit = function (item) {
      $scope.spouseInfo = angular.copy(item);
      $scope.spouseInfo['userId'] = item.applicationUserId;


      $scope.params.id = item.id;
      $scope.params.firstName = item.firstName;
      $scope.params.lastName = item.lastName;
      $scope.params.middleName = item.middleName;
      $scope.params.dateOfBirth = item.dateOfBirth;
      $scope.params.ssn = item.ssn;
      $scope.params.gender = item.gender;
      $scope.params.email = item.email;
      $scope.params.phoneNumber = item.phoneNumber;

      $scope.env.status = 2;
    };

    $scope.openCreateDependent = function () {
      $scope.params.firstName = '';
      $scope.params.lastName = '';
      $scope.params.middleName = '';
      $scope.params.dateOfBirth = null;
      $scope.params.ssn = "";
      $scope.params.gender = null;
      $scope.params.email = null;
      $scope.params.phoneNumber = "";

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
              params2.q = 'firstName,lastName,email=' + filter.q;
            }
            params2['id_participant'] = $scope.participantId;

            $scope.loading = true;

            participants.getListSpouse(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              $scope.userList = data.data;

              if (filter.status === false) {
                if (data.totalCount === 0) {
                  $scope.isHaveSpouseActive = false;
                } else {
                  $scope.isHaveSpouseActive = true;
                }
              }

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
