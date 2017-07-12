angular.module('app.modules.health-topics.add-health-topics', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.add-health-topics', {
        url: '/add-health-topics',
        views: {
          'main-content': {
            templateUrl: 'modules/health-topics/add-health-topics/add-health-topics.tpl.html',
            controller: 'healthTopicsAddHealthTopicsController'
          }
        }
      });
  })

  .controller('healthTopicsAddHealthTopicsController',
    function ($scope, $filter, $modal, $translate, CONFIGS, utils, ngTableParams, security, healthTopics, healthTopicCategory) {
      $scope.healthTopicList = [];

      // Init model
      $scope.params = {
        question: '',
        answer: '',
        index: 0,
        nameRole: undefined,
        categoryId: undefined
      };
      $scope.params2 = {
        id: undefined,
        question: '',
        answer: '',
        index: 0,
        nameRole: undefined,
        categoryId: undefined
      };

      $scope.categoryName = '';
      $scope.categoryName2 = '';
      $scope.hasCreatedFor = false;

      if (security.isHealthCoachManager()) {
        $scope.hasCreatedFor = false;
      }

      /*$scope.createdForList = [
       {name: 'Agent', userRole: security.roles.agent},
       {name: 'Client', userRole: security.roles.employer}
       ];*/

      $scope.createdForList = [
        {name: 'Agent', userRole: 'Agent'},
        {name: 'Client', userRole: 'Employer'}
      ];

      $scope.createdForListForFilter = [
        {name: 'All created For', userRole: 'all'},
        {name: 'Public', userRole: 'public'},
        {name: 'Agent', userRole: 'Agent'},
        {name: 'Client', userRole: 'Employer'}
      ];

      function getCreatedForName(role) {
        var name = '';
        for (var i = 0; i < $scope.createdForList.length; i++) {
          if ($scope.createdForList[i].userRole === role) {
            name = $scope.createdForList[i].name;
            break;
          }
        }
        return name;
      }

      $scope.NgTableParams = ngTableParams;

      // Filter here
      $scope.filterHealthTopic = {
        question: undefined,
        nameRole: "all",
        categoryId: ""
      };

      // Paging from api
      $scope.loading = true;
      $scope.tableParams = new $scope.NgTableParams({
        page: 1,   // show first page
        count: CONFIGS.countPerPage,  // count per page
        filter: $scope.filterHealthTopic
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
              embed: 'category'
            };

            var headers = null;
            if (filter.categoryId || filter.nameRole) {

              if (filter.nameRole === "all" && filter.categoryId) {
                headers = {
                  'X-Filter': JSON.stringify([
                    {
                      property: "categoryId",
                      operator: "equal",
                      condition: "or",
                      value: filter.categoryId
                    }
                  ])
                };
              }

              if (filter.nameRole !== "all" && filter.categoryId) {

                if (filter.nameRole === "public") {
                  headers = {
                    'X-Filter': JSON.stringify([
                      {
                        property: "categoryId",
                        operator: "equal",
                        condition: "or",
                        value: filter.categoryId
                      },
                      {
                        property: "nameRole",
                        operator: "equal",
                        condition: "and",
                        value: null
                      }
                    ])
                  };
                } else {
                  headers = {
                    'X-Filter': JSON.stringify([
                      {
                        property: "categoryId",
                        operator: "equal",
                        condition: "or",
                        value: filter.categoryId
                      },
                      {
                        property: "nameRole",
                        operator: "equal",
                        condition: "and",
                        value: filter.nameRole
                      }
                    ])
                  };
                }


              }

              if (filter.nameRole !== "all" && !filter.categoryId) {

                if (filter.nameRole === "public") {
                  headers = {
                    'X-Filter': JSON.stringify([
                      {
                        property: "nameRole",
                        operator: "equal",
                        condition: "or",
                        value: null
                      }
                    ])
                  };
                } else {
                  headers = {
                    'X-Filter': JSON.stringify([
                      {
                        property: "nameRole",
                        operator: "equal",
                        condition: "or",
                        value: filter.nameRole
                      }
                    ])
                  };
                }

              }


            }


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
            if (!!filter.question) {
              params2.q = 'question=' + filter.question;
            }

            $scope.loading = true;
            healthTopics.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;

              for (var i = 0; i < data.healthTopicList.length; i++) {
                data.healthTopicList[i].createdForName = getCreatedForName(data.healthTopicList[i].nameRole);
              }

              $scope.healthTopicList = data.healthTopicList;
              $defer.resolve($scope.healthTopicList);
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

      $scope.categoriesList = [];
      // get categories
      function getCategories() {
        healthTopicCategory.get().then(function (response) {
          $scope.categoriesList = response.categoriesList;
        });
      }

      getCategories();

      // Reset add Form
      function resetAddFrom() {
        $scope.showValid = false;
        $scope.params.question = '';
        $scope.params.answer = '';
        $scope.params.index = 0;
        $scope.params.nameRole = undefined;
        $scope.params.categoryId = undefined;
        $scope.categoryName = '';
        if ($scope.faqsAddForm) {
          utils.resetForm($scope.faqsAddForm);
        }
      }

      // Reset edit Form
      function resetEditFrom() {
        $scope.showValid2 = false;
        $scope.params2.id = undefined;
        $scope.params2.question = '';
        $scope.params2.index = 0;
        $scope.params2.answer = '';
        $scope.params2.nameRole = undefined;
        $scope.params2.categoryId = undefined;
        $scope.categoryName2 = '';
        if ($scope.faqsEditForm) {
          utils.resetForm($scope.faqsEditForm);
        }
      }

      // Add
      $scope.add = function (faqsAddForm) {
        $scope.showValid = true;
        $scope.faqsAddForm = faqsAddForm;
        if (faqsAddForm.$valid) {
          healthTopics.post($scope.params).then(function () {
            resetAddFrom();
            $scope.reload();
          }, function (error) {
          });
        }
      };

      // Choice Category
      $scope.choiceCategory = function (category) {
        $scope.categoryName = category.categoryName;
        $scope.params.categoryId = category.id;
      };

      $scope.choiceCategory2 = function (category) {
        $scope.categoryName2 = category.categoryName;
        $scope.params2.categoryId = category.id;
      };

      // Category Manager
      $scope.categoryManager = function () {
        $scope.modal = $modal.open({
          controller: 'HealthTopicsCategoryManagerController',
          templateUrl: 'modules/health-topics/category-manager/category-manager.tpl.html',
          size: 'md'
        });
        $scope.modal.result.then(function (reload) {
          if (reload) {
            getCategories();
            $scope.reload();
          }
        });
      };

      // Change
      $scope.change = function (faqsEditForm) {
        $scope.showValid2 = true;
        $scope.faqsEditForm = faqsEditForm;
        if (faqsEditForm.$valid) {
          healthTopics.patch($scope.params2).then(function () {
            resetEditFrom();
            $scope.reload();
          }, function (error) {
          });
        }
      };

      // Remove
      $scope.remove = function (item) {
        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: $translate.instant('alert.waring.heading'),
                summary: false,
                style: 'yesNo',
                message: $translate.instant('faqs.alert.remove')
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            healthTopics.remove(item.id).then(function () {
              for (var i = 0; i < $scope.healthTopicList.length; i++) {
                if ($scope.healthTopicList[i].id === item.id) {
                  $scope.healthTopicList.splice(i, 1);
                }
              }
              $scope.modal.result.then(function () {
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
                      title: $translate.instant('alert.failure.heading'),
                      summary: false,
                      style: 'ok',
                      message: $translate.instant('faqs.alert.fail')
                    };
                  }
                }
              });
            });
          }
        });
      };

      // Edit
      $scope.edit = function (item) {
        $scope.params2.id = item.id;
        $scope.params2.question = item.question;
        $scope.params2.answer = item.answer;
        $scope.params2.nameRole = item.nameRole;
        $scope.params2.index = item.index;
        $scope.params2.categoryId = item.categoryId;
        $scope.categoryName2 = item.category.categoryName;
      };

      $scope.disableEdit = function () {
        resetEditFrom();
      };

      // Fix Dropdown
      $scope.toggleDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isOpen = !$scope.status.isOpen;
      };

      $scope.toggleDropdown2 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isOpen2 = !$scope.status.isOpen2;
      };


      // Ckeditor
      $scope.editorOptions = {
        language: 'en',
        'skin': 'moono',
        //'extraPlugins': "imagebrowser",
        //filebrowserImageUploadUrl: 'assets/plugins/ckeditor/lib/plugins/imgupload/imgupload.php',
        filebrowserImageUploadUrl: CONFIGS.baseURL() + '/upload/image',
        toolbarLocation: 'top',
        toolbar: 'full',
        toolbar_full: [
          {name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'Underline']},
          {name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote']},
          {
            name: 'editing',
            items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
          },
          {name: 'links', items: ['Link', 'Unlink']},
          {name: 'styles', items: ['Format', 'FontSize', 'TextColor']},
          {name: 'insert', items: ['Image', 'SpecialChar']}, '/'
        ]
      };

      $scope.$on("ckeditor.ready", function (event) {
        $scope.isReady = true;
      });

    }
  );
