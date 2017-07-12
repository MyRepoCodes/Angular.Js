angular.module('app.modules.contact.list-contact', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.list-contact', {
        url: '/list-contact',
        views: {
          'main-content': {
            templateUrl: 'modules/contact/list-contact/list-contact.tpl.html',
            controller: 'ContactListController'
          }
        }
      });
  })

  .controller('ContactListController',
    function ($scope, $state, CONFIGS, security, $modal, $translate, ngTableParams, contacts, utils) {

      $scope.NgTableParams = ngTableParams;
      $scope.ids = "";
      $scope.domain = CONFIGS.baseURL();
      $scope.checkboxes = {'checked': false, items: []};
      $scope.contactList = [];

      // Filter here
      $scope.filterSurvey = {
        answer: undefined,
        status: 'active'
      };

      // Paging from api
      $scope.loading = true;
      $scope.tableParams = new $scope.NgTableParams({
        page: 1,   // show first page
        count: CONFIGS.countPerPage,  // count per page
        filter: $scope.filterSurvey,
        sorting: {'createdDate': 'desc'}
      }, {
        counts: [], // hide page counts control
        total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
          function pagination() {
            var sorting = params.sorting();
            var filter = params.filter();
            var params2 = {
              page: params.page(),
              pageSize: params.count(),
              embed: ''
            };

            var headers = {
              'X-Filter': JSON.stringify([
                {
                  property: "isDeleted",
                  operator: "equal",
                  condition: "or",
                  value: (filter.status === 'active') ? false : true
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
            if (!!filter.answer) {
              params2.q = 'firstName,lastName,email,company,content=' + filter.answer;
            }

            $scope.loading = true;
            contacts.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;

              $scope.contactList = data.contactList;

              // Format data
              angular.forEach($scope.contactList, function (item) {
                item.dateOfBirth = utils.parseDateOfBirthToDatePacker(item.dateOfBirth);
                item.createdDate = utils.dateToShort(item.createdDate);
              });

              $defer.resolve($scope.contactList);
            }, function (error) {
              $scope.loading = false;
            });
          }

          params.data = [];
          pagination();
          resetCheckBox();
        }
      });

      // Reload current page
      $scope.reload = function () {
        $scope.tableParams.reload();
      };

      // select Status Archive
      $scope.selectStatusArchive = function (data) {
        $scope.filterSurvey.status = data;
        $scope.reload();
      };

      // Remove
      $scope.remove = function (item) {
        // Open Warning
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Delete Contact Form",
                summary: false,
                style: 'yesNo',
                message: "Are you sure you want to delete this Contact Form?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            contacts.remove(item.id).then(function () {
              for (var i = 0; i < $scope.contactList.length; i++) {
                if ($scope.contactList[i].id === item.id) {
                  $scope.contactList.splice(i, 1);
                }
              }

              //update count contact unread
              contacts.countunread();

              $scope.reload();
            }, function (error) {

            });
          }
        });
      };

      // Remove Multiple
      $scope.removeMultiple = function (listID) {
        if (listID) {
          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: "Delete Contact Forms",
                  summary: false,
                  style: 'yesNo',
                  message: "Are you sure you want to delete these Contact Forms?"
                };
              }
            }
          });
          $scope.modal.result.then(function (result) {
            if (result === true) {
              var object = {
                "Ids": listID.split(",")
              };
              contacts.deleteMultiContact(object).then(function () {

                $scope.modal = $modal.open({
                  controller: 'AlertController',
                  templateUrl: 'modules/alert/alert.tpl.html',
                  size: 'sm',
                  resolve: {
                    data: function () {
                      return {
                        title: 'Success',
                        summary: false,
                        style: 'ok',
                        message: "Contact Forms Successfully Deleted"
                      };
                    }
                  }
                });
                $scope.modal.result.then(function () {
                  //update count contact unread
                  contacts.countunread();

                  $scope.reload();
                });
              }, function () {
                $modal.open({
                  controller: 'AlertController',
                  templateUrl: 'modules/alert/alert.tpl.html',
                  size: 'sm',
                  resolve: {
                    data: function () {
                      return {
                        title: 'Remove Fail',
                        summary: false,
                        style: 'ok',
                        message: "Please try again"
                      };
                    }
                  }
                });
              });
            }
          });


        } else {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Info',
                  summary: false,
                  style: 'ok',
                  message: "Please select item."
                };
              }
            }
          });

        }
      };

      // Open content
      $scope.openContent = function (data) {

        //set read this item
        security.setReadNotification(contacts, angular.copy(data));


        // open modal
        $scope.modal = $modal.open({
          controller: 'PopupShowContentController',
          templateUrl: 'modules/popup/show-content/show-content.tpl.html',
          size: 'md',
          resolve: {
            DATA: function () {
              return data;
            },
            API: function () {
              return contacts;
            },
            TYPE: function () {
              return 'contact';
            }
          }
        });
        $scope.modal.result.then(function (value) {
          $scope.reload();
        });
      };

      //********************************** START: Check all **********************************//

      $scope.itemChecked = function (data) {
        var _id = data.id;
        if (data.selected) {
          $scope.checkboxes.items.push(_id);
          if ($scope.checkboxes.items.length == $scope.contactList.length) {
            $scope.checkboxes.checked = true;
          }
        } else {
          $scope.checkboxes.checked = false;
          var index = $scope.checkboxes.items.indexOf(_id);
          $scope.checkboxes.items.splice(index, 1);
        }

      };

      $scope.selectedAll = function () {
        $scope.checkboxes.items = [];
        if ($scope.checkboxes.checked) {
          $scope.checkboxes.checked = true;
          for (var i = 0; i < $scope.contactList.length; i++) {
            $scope.checkboxes.items.push($scope.contactList[i].id);
          }
        }
        else {
          $scope.checkboxes.checked = false;
        }
        angular.forEach($scope.contactList, function (item) {
          item.selected = $scope.checkboxes.checked;
        });
      };

      $scope.$watch('checkboxes.items', function (value) {

        if (value && value.length !== 0) {
          $scope.ids = $scope.checkboxes.items.toString();

        } else {
          $scope.ids = "";
        }

        if ($scope.contactList) {
          var total = $scope.contactList.length;
          var checked = $scope.checkboxes.items.length;
          var unchecked = total - checked;
          // grayed checkbox
          angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
        }

      }, true);

      function resetCheckBox() {
        $scope.checkboxes = {'checked': false, items: []};
      }

      //********************************** END: Check all **********************************//
    }
  )

  .controller('ModalContactListController',
    function ($scope, $state, CONFIGS, security, $modal, $translate, ngTableParams, contacts, utils) {

    });
