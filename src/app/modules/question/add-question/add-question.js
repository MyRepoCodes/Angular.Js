angular.module('app.modules.question.add-question', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.add-question', {
        url: '/add-question',
        views: {
          'main-content': {
            templateUrl: 'modules/question/add-question/add-question.tpl.html',
            controller: 'QuestionAddQuestionController'
          }
        },
        // resolve: {
        //   deps: ['$ocLazyLoad',
        //     function ($ocLazyLoad) {
        //       return $ocLazyLoad.load('ngCkeditor');
        //     }]
        // }
      });
  })

  .controller('QuestionAddQuestionController',
     function ($scope, $filter, $modal, $translate, CONFIGS, utils, ngTableParams, security, faqs, question, faqCategories) {
      //$scope.faqsList = [];
      //$scope.qGroup = [{"groupName":1},{"groupName":2},{"groupName":3}];
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

      if (security.isAdmin() || security.isClientManager()) {
        $scope.hasCreatedFor = true;
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
      $scope.filterFaq = {
        question: undefined,
        nameRole: "all",
        categoryId: ""
      };

      // Paging from api
      $scope.loading = true;
      $scope.tableParams = new $scope.NgTableParams({
        page: 1,   // show first page
        count: CONFIGS.countPerPage,  // count per page
        filter: $scope.filterFaq
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
            question.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;
              // for (var i = 0; i < data.availableSecurityQuestions.length; i++) {
              //   data.availableSecurityQuestions[i].createdForName = getCreatedForName(data.faqsList[i].nameRole);
              // }
              $scope.questionList = data.questionList;
              $defer.resolve($scope.availableSecurityQuestions);
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

      $scope.faqCategoriesList = [];
      // get categories
      // function getFaqCategories() {
      //   faqCategories.get().then(function (response) {
      //     $scope.faqCategoriesList = response.faqCategoriesList;
      //   });
      // }

      //getFaqCategories();

      // Reset add Form
      function resetAddFrom() {
        $scope.showValid = false;
        $scope.params.questionText = '';
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
        if ($scope.questionEditForm) {
          utils.resetForm($scope.questionEditForm);
        }
      }

      // Add
      $scope.add = function (questionAddForm) {
        $scope.params.isDeleted = false;
        $scope.showValid = true;
        $scope.faqsAddForm = questionAddForm;
        if (questionAddForm.$valid) {
            question.post($scope.params,{screenName:'Create Question Screen'}).then(function (response) {
              resetAddFrom();
              $scope.reload();
          }, function (error) {
          });
        }
      };

      // Choice Category
      $scope.choiceCategory = function (category) {
        $scope.groupName = category.groupName;
        //$scope.params.categoryId = category.id;
      };

      $scope.choiceCategory2 = function (category) {
        $scope.categoryName2 = category.categoryName;
        $scope.params2.categoryId = category.id;
      };

      // Category Manager
      // $scope.categoryManager = function () {
      //   $scope.modal = $modal.open({
      //     controller: 'FaqsCategoryManagerController',
      //     templateUrl: 'modules/faqs/category-manager/category-manager.tpl.html',
      //     size: 'md'
      //   });
      //   $scope.modal.result.then(function (reload) {
      //     if (reload) {
      //       getFaqCategories();
      //       $scope.reload();
      //     }
      //   });
      // };

      // Change
      $scope.change = function (questionEditForm) {
        $scope.showValid2 = true;
        $scope.questionEditForm = questionEditForm;
        $scope.params2.isDeleted = false;
        var obj = {
          questionText:$scope.params2.QuestionText,  
          id: $scope.params2.id
        };
        if (questionEditForm.$valid) {         

          question.put(obj,{screenName:'Update Question Screen'}).then(function () {
            $scope.params2.id = "";
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
            question.remove(item.questionID,{screenName:'Delete Question Screen'}).then(function (response) {
              for (var i = 0; i < $scope.questionList.length; i++) {
                if ($scope.questionList[i].questionID === item.questionID) {
                  $scope.questionList.splice(i, 1);
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
        $scope.params2.questionText = "";
        $scope.params2.QuestionText = item.questionText;
        $scope.params2.id = item.questionID;
        $scope.params2.question = item.questionText;  
        var obj = {
          viewActivity:true,  
          id: $scope.params2.id
        };    
        question.get(obj,{screenName:'View Question Screen'}).then(function () {          
          }, function (error) {
          });        
      };

      $scope.disableEdit = function () {
        $scope.params2.id = "";
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
