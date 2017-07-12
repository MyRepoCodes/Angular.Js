angular.module('app.modules.faqs.add-faqs', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.add-faqs', {
        url: '/add-faqs',
        views: {
          'main-content': {
            templateUrl: 'modules/faqs/add-faqs/add-faqs.tpl.html',
            controller: 'FaqsAddFaqsController'
          }
        },
        resolve: {
          deps: ['$ocLazyLoad',
            function ($ocLazyLoad) {
              return $ocLazyLoad.load('ngCkeditor');
            }]
        }
      });
  })

  .controller('FaqsAddFaqsController',
  function ($scope, $filter, $modal, $translate, CONFIGS, utils, ngTableParams, security, faqs, faqCategories) {
    $scope.faqsList = [];
    $scope.ids = "";
    $scope.checkboxes = { 'checked': false, items: [] };

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
      { name: 'Client', userRole: 'Employer' },
      { name: 'Participant', userRole: 'Participant' },
      { name: 'Agent', userRole: 'Agent' },
      { name: 'Health Coach Manager', userRole: 'HealthCoachManager' },
      { name: 'Health Coach', userRole: 'HealthCoach' },
    ];

    $scope.createdForListForFilter = [
      { name: 'All created For', userRole: 'all' },
      { name: 'Public', userRole: 'public' },
      { name: 'Client', userRole: 'Employer' },
      { name: 'Participant', userRole: 'Participant' },
      { name: 'Agent', userRole: 'Agent' },
      { name: 'Health Coach Manager', userRole: 'HealthCoachManager' },
      { name: 'Health Coach', userRole: 'HealthCoach' },
    ];

    $scope.createdForListForEditMultiRoles = [
      { name: 'Public', userRole: null },
      { name: 'Client', userRole: 'Employer' },
      { name: 'Participant', userRole: 'Participant' },
      { name: 'Agent', userRole: 'Agent' },
      { name: 'Health Coach Manager', userRole: 'HealthCoachManager' },
      { name: 'Health Coach', userRole: 'HealthCoach' },
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
        //counts: [], // hide page counts control
        //total: 1,  // value less than count hide pagination
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
            faqs.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.loading = false;

              for (var i = 0; i < data.faqsList.length; i++) {
                data.faqsList[i].createdForName = getCreatedForName(data.faqsList[i].nameRole);
              }

              $scope.faqsList = data.faqsList;
              $defer.resolve($scope.faqsList);
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

    $scope.faqCategoriesList = [];
    // get categories
    function getFaqCategories() {
      faqCategories.get().then(function (response) {
        $scope.faqCategoriesList = response.faqCategoriesList;
      });
    }

    getFaqCategories();

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
        faqs.post($scope.params,{screenName:$translate.instant('auditLogs.screenName.faq')}).then(function () {
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
        controller: 'FaqsCategoryManagerController',
        templateUrl: 'modules/faqs/category-manager/category-manager.tpl.html',
        size: 'md'
      });
      $scope.modal.result.then(function (reload) {
        if (reload) {
          getFaqCategories();
          $scope.reload();
        }
      });
    };

    // Change
    $scope.change = function (faqsEditForm) {
      $scope.showValid2 = true;
      $scope.faqsEditForm = faqsEditForm;
      if (faqsEditForm.$valid) {       
        faqs.patch($scope.params2,{screenName:'Update FAQ Screen'}).then(function () {
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
          faqs.remove(item.id,{screenName:$translate.instant('auditLogs.screenName.faq')}).then(function () {
            for (var i = 0; i < $scope.faqsList.length; i++) {
              if ($scope.faqsList[i].id === item.id) {
                $scope.faqsList.splice(i, 1);
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
      var obj = {
          viewActivity:true,  
          id: $scope.params2.id
        };  
       faqs.get(obj,{screenName:'View FAQ Screen'}).then(function () {},    function (error) {});    
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
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'Underline'] },
        { name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] },
        {
          name: 'editing',
          items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
        },
        { name: 'links', items: ['Link', 'Unlink'] },
        { name: 'styles', items: ['Format', 'FontSize', 'TextColor'] },
        { name: 'insert', items: ['Image', 'SpecialChar'] }, '/'
      ]
    };

    $scope.$on("ckeditor.ready", function (event) {
      $scope.isReady = true;
    });




    //********************************** START: Check all **********************************//

    $scope.itemChecked = function (data) {
      var _id = data.id;
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        if ($scope.checkboxes.items.length == $scope.faqsList.length) {
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
        for (var i = 0; i < $scope.faqsList.length; i++) {
          $scope.checkboxes.items.push($scope.faqsList[i].id);
        }
      }
      else {
        $scope.checkboxes.checked = false;
      }
      angular.forEach($scope.faqsList, function (item) {
        item.selected = $scope.checkboxes.checked;
      });
    };

    $scope.$watch('checkboxes.items', function (value) {

      if (value && value.length !== 0) {
        $scope.ids = $scope.checkboxes.items;
      } else {
        $scope.ids = "";
      }

      if ($scope.faqsList) {
        var total = $scope.faqsList.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

    }, true);

    function resetCheckBox() {
      $scope.ids = "";
      $scope.checkboxes = { 'checked': false, items: [] };
    }

    //********************************** END: Check all **********************************//


    //********************************** START: Edit multiple FAQs **********************************//
    $scope.paramsMultiple = {
      nameRole: null,
      categoryId: null,
      ids: []
    };

    $scope.updateListContent = function (data, ids) {
      data.ids = ids ? ids : [];     

      faqs.updateMutipleFaq(data).then(function () {
        $scope.reload();
      }, function (error) {
        console.log(error);
      });

    };


    //********************************** END: Edit multiple FAQs **********************************//

  }
  );
