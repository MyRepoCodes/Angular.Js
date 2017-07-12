angular.module('app.modules.popup.select-user', [])

.controller('PopupSelectUserController',
    function($scope, $modalInstance, ngTableParams, CONFIGS, API) {
        $scope.userList = [];

        // Init model
        $scope.NgTableParams = ngTableParams;

        // Filter here
        $scope.filter = {
            q: undefined
        };

        // Paging from api
        $scope.loading = true;
        $scope.tableParams = new $scope.NgTableParams({
            page: 1,   // show first page
            count: CONFIGS.countPerPage,  // count per page
            filter: $scope.filter
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
                    for(var s in sorting) {
                        if(sorting[s] === 'asc') {
                            params2.sort = s;
                        } else if(sorting[s] === 'desc') {
                            params2.sort = '-' + s;
                        }
                        break;
                    }

                    // Filter
                    if(!!filter.q) {
                        params2.q = 'firstName,lastName,email=' + filter.q;
                    }

                    $scope.loading = true;
                    API.get(params2, false).then(function(data) {
                        params.total(data.totalCount);
                        $scope.loading = false;
                        $scope.userList = data.userList;
                        $defer.resolve($scope.userList);
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

        // Choice user
        $scope.choiceUser = function(user) {
            $modalInstance.close(user);
        };

        $scope.cancel = function() {
            $modalInstance.close(false);
        };
    }
);
