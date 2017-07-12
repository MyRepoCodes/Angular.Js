angular.module('app.modules.audit-logs.all-logs', [
    'app.modules.audit-logs.all-logs.view-logs',
    'app.modules.audit-logs.all-logs.popup-log'
  ])
  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.audit-logs.all-logs', {
        url: '/all-logs',
        params: {
          userId: null,
          name: null
        },
        views: {
          'manager-content': {
            templateUrl: 'modules/audit-logs/all-logs/all-logs.tpl.html',
            controller: 'AuditAllLogsController'
          }
        }
      });
  })

  .controller('AuditAllLogsController', function ($window, $scope, $stateParams, $state, $modal, security, ngTableParams, auditLogs) {
    // Permission
    $scope.isFullControl = function () {
      return true;
    };

    // Filter here
    $scope.filter = {
      keyword: $scope.infoSort ? $scope.infoSort.keyword : null,      
      operationType: undefined,
      tableName: undefined,
      primaryKey: undefined,
      fieldName: undefined,
      newValue: undefined,
      oldValue: undefined,
      operationDate: undefined,
      userName: undefined,
      fromDate: undefined,
      toDate: undefined,
      tableId: undefined,
      userId: undefined,
      userIPAddress: undefined,
      column: {}
    };

    // Paging from api
    var history = {
      keyword: null,
      page: null,
      pageSize: null,
      refresh: false,
      date: null
    };
    $scope.filter.name = $state.params.name;
    $scope.filter.userId = $state.params.userId;
    $scope.filter.activity = 0;

    // Init model

    $scope.NgTableParams = ngTableParams;
    $scope.tableParams = new $scope.NgTableParams({
      page: $scope.infoSortClient ? $scope.infoSortClient.page : 1, // show first page
      page_return: $scope.infoSortClient ? $scope.infoSortClient.page : null,
      count: $scope.infoSortClient ? $scope.infoSortClient.pageSize : 25, // count per page
      filter: $scope.filter
    }, {
      //counts: [], // hide page counts control
      //total: 1,  // value less than count hide pagination
      getData: function ($defer, params) {
        function pagination() {
          var sorting = params.sorting();
          if (!Object.keys(sorting).length) {
            if ($scope.infoSort && $scope.infoSort.sort) {
              if ($scope.infoSort.sort[0] === '-') {
                sorting[$scope.infoSort.sort.substr(1)] = 'desc';
              } else if ($scope.infoSort.sort[0] === '+') {
                sorting[$scope.infoSort.sort.substr(1)] = 'asc';
              } else {
                sorting[$scope.infoSort.sort] = 'asc';
              }
            }
          }
          var filter = params.filter();
          var tmpPage = $scope.tableParams.$params.page_return;
          if (tmpPage && params.page() === 1) {
            params.page(tmpPage);
          }

          if ($scope.infoSort && $scope.infoSort.pageSize !== params.count()) {
            resetTable();
            params.page(1);
          }
          // if ($scope.filter.fromDate && $scope.filter.toDate) {
          //   console.log(" Working");
          //   resetTable();
          //   params.page(1);
          // }

          var params2 = {
            fromDate: $scope.filter.fromDate,
            toDate: $scope.filter.toDate,
            activityType: $scope.filter.activity ? $scope.filter.activity : 0,
            page: params.page(),
            pageSize: params.count(),
            tableId: $scope.filter.tableId,
            userId: $scope.filter.userId
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

       
          // Filter for username
          if (!!filter.keyword) {           
            params2.keyword = 'userName,screenName=' + filter.keyword;
          }    

          // fix when user select date
          $scope.keySearch = function(){     
              filter.keyword = $scope.filter.keyword; 
              $scope.tableParams.reload();
            };
        

     
          $scope.loading = true;
          auditLogs.getAllAuditLogs(params2, undefined, false).then(function (result) {
            params.total(result.data.data.auditLogsTotalCount);
            $scope.loading = false;
            $scope.activityTypes = result.data.data.activityTypes;
            $scope.allTables = result.data.data.auditableTables;
            $scope.logs = result.data.data.auditLogsResult;
            $defer.resolve($scope.logs);
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

    $scope.dateRange = {
      startDate: null,
      endDate: null
    };

    //Watch for date changes
    $scope.$watch('dateRange', function (newDate) {}, false);
 


    $scope.dateRangeOptions = {
      opens: "left",
      locale: {
        applyLabel: "Apply",
        fromLabel: "From",
        format: "MM-DD-YYYY", //will give you 2017-01-06
        //format: "D-MMM-YY", //will give you 6-Jan-17
        //format: "D-MMMM-YY", //will give you 6-January-17
        toLabel: "To",
        cancelLabel: 'Cancel',
        customRangeLabel: 'Custom range'
      },
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      },
      eventHandlers: {
        'apply.daterangepicker': function () {       
          if (!$scope.dateRange.startDate && !$scope.dateRange.endDate) {
            $scope.dateRange.startDate = moment();
            $scope.dateRange.endDate = moment();
            $scope.dateRange = {
              startDate: $scope.dateRange.startDate,
              endDate: $scope.dateRange.endDate
            };
          }
          $scope.filter = {
            fromDate: new Date($scope.dateRange.startDate).format('mmddyyyy'),
            toDate: new Date($scope.dateRange.endDate).format('mmddyyyy'),
            activity: $scope.filter.activity,
            tableId: $scope.filter.tableId, 
            keyword: $scope.filter.keyword,
            column: $scope.filter.column,
            page: 1,
            pageSize: 25,
          };
          $scope.reload();
        },
        'cancel.daterangepicker': function () {
          $scope.filter = {
            fromDate: null,
            toDate: null,
            column: $scope.filter.column,
            activity: $scope.filter.activity,
            tableId: $scope.filter.tableId,
            keyword: $scope.filter.keyword,
            page: 1,
            pageSize: 25,
          };
          $scope.reload();
        }
      }
    };

    // dynamic activity 
    $scope.activity = function (val) {
      $scope.activityTypes.map(function (v, i) {
        if (v.value === val) {
          $scope.filter.activity = val;
        }
      });
      //reset store sort
      $scope.resetInfoSort();
      $scope.reload();
    };

    // // dynamic add column 
    // $scope.addColumn = function (val) {
    //   //reset store sort
    //   if (val === 'primaryKey') {
    //     Object.assign($scope.filter.column, {
    //       primaryKey: true
    //     });
    //   } else {
    //     Object.assign($scope.filter.column, {
    //       tableName: true
    //     });
    //   }
    //   $scope.resetInfoSort();
    //   $scope.reload();
    // };

    // $scope.crossColumn = function (val) {
    //   if (val === 'primaryKey') {
    //     Object.assign($scope.filter.column, {
    //       primaryKey: false
    //     });
    //   } else {
    //     Object.assign($scope.filter.column, {
    //       tableName: false
    //     });
    //   }
    // };


    $scope.clearUser = function () {
      $scope.filter.userId = undefined;
      $scope.resetInfoSort();
      resetTable();
      $scope.reload();
    };

    //tableMapping
    // dynamic Tables 
    $scope.tableMapping = function (val) {
      $scope.allTables.map(function (v, i) {
        if (v.value === val) {
          $scope.filter.tableId = val;
        } else if (!val) {
          $scope.filter.tableId = undefined;
        }
      });
      //reset store sort
      $scope.resetInfoSort();
      $scope.reload();
    };

    // function GetScreenCordinates(obj) {
    //   var p = {};
    //   p.left = obj.offsetLeft;
    //   p.top = obj.offsetTop;
    //   while (obj.offsetParent) {
    //     p.left = p.left + obj.offsetParent.offsetLeft;
    //     p.top = p.top + obj.offsetParent.offsetTop;
    //     if (obj == document.getElementsByTagName("body")[0]) {
    //       break;
    //     } else {
    //       obj = obj.offsetParent;
    //     }
    //   }
    //   return p;
    // }

    function GetElementOffset(element) {
      var de = document.documentElement;
      var box = element.getBoundingClientRect();
      var top = box.top + window.pageYOffset - de.clientTop;
      var left = box.left + window.pageXOffset - de.clientLeft;
      return {
        top: top,
        left: left
      };
    }

    $scope.showContent = function (item, id) {
      // /this.clicked = true;  
      if (item.operationTypeID === 2 || item.operationTypeID === 3) {
        var txt = document.getElementById(id);
        var left = document.getElementById('top-hack');
        var p = new GetElementOffset(txt);
        var l = new GetElementOffset(left);
        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';       
  
        $scope.tableCSS = {
          "top": p.top - window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
          "left": isFirefox ? l.left + 7 : l.left + 1.5,
          "position": "absolute"
        };
        var parameter = {
          'operationDate': item.operationDateISO,
          'userID': item.userID,
          'userIPAddress': item.userIPAddress,
          'screenName': item.screenName,
          'operationTypeID': item.operationTypeID,
          'tableName': item.tableName,
          'primaryKey': item.primaryKey
        };


        $scope.modal = $modal.open({
          controller: 'PopupLog',
          templateUrl: 'modules/audit-logs/all-logs/popup-log/popup-log.tpl.html',
          scope: $scope,
          windowClass: 'audit-popup',
          backdropClass: 'green-overlay',
          resolve: {
            data: function (auditLogs) {
              auditLogs.auditDetails(parameter, undefined, false).then(function (result) {
                $scope.error = null;
                $scope.auditLogDetail = result.data.data;
              }, function (error) {
                $scope.auditLogDetail = null;
                return $scope.error = error;
              });
            }
          }
        });
        $scope.modal.result.then(function () {
          //process your logic for DOM element
          console.info(document.getElementById('table-popup'));
        });
      }
    };

    $scope.columnModel = [];
    $scope.columnNames = [{
      id: 1,
      label: "Primary Key"
    }, {
      id: 2,
      label: "Table Name"
    }];

    $scope.customSettings = {
      styleActive: true,
      showCheckAll: false,
      showUncheckAll: false,
      dynamicTitle: false 
    };




    $scope.customEvents = {
      onItemSelect: function (item) {
        if (item.id === 1) {          
          Object.assign($scope.filter.column, {
            primaryKey: true
          });
        } else {
          Object.assign($scope.filter.column, {
            tableName: true
          });
        }
      },
      onItemDeselect: function (item) {
        if (item.id === 1) {
          Object.assign($scope.filter.column, {
            primaryKey: false
          });
        } else {
          Object.assign($scope.filter.column, {
            tableName: false
          });
        }
      },
      // onSelectAll: function (item) {
      //   Object.assign($scope.filter.column, { primaryKey: true,tableName: true});
      // },
      // onDeselectAll: function (item) {
      //  Object.assign($scope.filter.column, { primaryKey: false,tableName: false});
      // }
    };


    $scope.close = function () {
      this.clicked = false;
    };
    $scope.customTexts = {
      buttonDefaultText: 'Columns'
    };

    function resetTable() {
      $scope.tableParams.$params.page_return = 1;
    }
  });