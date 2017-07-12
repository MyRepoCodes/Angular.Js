angular.module('app.modules.health-topics.category-manager', [])

.controller('HealthTopicsCategoryManagerController',
    function($scope, $modalInstance, CONFIGS, ngTableParams, utils, healthTopicCategory) {
        $scope.categoriesList = [];

        // Init model
        $scope.NgTableParams = ngTableParams;

        // Filter here
        $scope.filter = {
            q: undefined
        };

        $scope.hasChanged = false;

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
                        params2.q = filter.q;
                    }

                    $scope.loading = true;
                  healthTopicCategory.get(params2, false).then(function(data) {
                        params.total(data.totalCount);
                        $scope.loading = false;
                        $scope.categoriesList = data.categoriesList;
                        $defer.resolve($scope.categoriesList);
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
            $scope.hasChanged = true;
            $scope.tableParams.reload();
        };

        // Init Model
        $scope.params =  {
            categoryName : ''
        };

        $scope.params2 = {
            id: undefined,
            categoryName: ''
        };

        // Reset add Form
        function resetAddFrom() {
            $scope.showValid = false;
            $scope.params.categoryName = '';
            if($scope.addCategoryForm) {
                utils.resetForm($scope.addCategoryForm);
            }
        }

        // Reset edit Form
        function resetEditFrom() {
            $scope.showValid2 = false;
            $scope.params2.id = undefined;
            $scope.params2.categoryName = '';
            if($scope.editCategoryForm) {
                utils.resetForm($scope.editCategoryForm);
            }
        }

        // Add Category
        $scope.addCategory = function(addCategoryForm) {
            $scope.showValid = true;
            $scope.addCategoryForm = addCategoryForm;
            if(addCategoryForm.$valid) {
              healthTopicCategory.post($scope.params).then(function() {
                    resetAddFrom();
                    $scope.reload();
                }, function(error) {
                });
            }
        };

        // Edit Category
        $scope.editCategory = function(category) {
            $scope.params2.id = category.id;
            $scope.params2.categoryName = category.categoryName;
        };

        $scope.disableEdit = function() {
            resetEditFrom();
        };

        // Change
        $scope.changeCategory = function(editCategoryForm) {
            $scope.showValid2 = true;
            $scope.editCategoryForm = editCategoryForm;
            if(editCategoryForm.$valid) {
              healthTopicCategory.put($scope.params2).then(function() {
                    resetEditFrom();
                    $scope.reload();
                }, function(error) {
                });
            }
        };

        // Remove Category
        $scope.removeCategory = function(category) {
          healthTopicCategory.remove(category.id).then(function() {
                $scope.reload();
            });
        };

        // Close Modal
        $scope.cancel = function() {
            $modalInstance.close($scope.hasChanged);
        };

        // Choice Category
        $scope.choiceCategory = function(category) {
            //$modalInstance.close(category);
        };
    }
);
