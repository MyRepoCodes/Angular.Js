angular.module('app.pages.listFaqs', [])

    .config(function ($stateProvider) {
        $stateProvider
            .state('public.listFaqs', {
                url: '/listFaqs',
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html'
                    },
                    'middle-container': {
                        templateUrl: 'pages/listFaqs/listFaqs.tpl.html',
                        controller: 'PageslistFaqsController'
                    },
                    'footer': {
                        templateUrl: 'footer/footer.tpl.html'
                    }
                }
            });
    })

    .controller('PageslistFaqsController',
    function ($scope, $state, CONFIGS, faqs, $location) {

        //Link share
        $scope.linkShare = "";
        $scope.baseURL = $location.$$absUrl.split("?search=")[0];
        $scope.keyword = $location.$$absUrl.split("?search=")[1];

        // Sort
        $scope.sort = {
            category: 'asc',
            dataCategorySort: null
        };

        // Init model
        $scope.params = {
            q: '',
            page: 1,
            //pageSize: CONFIGS.countPerPage,
            pageSize: 999999,
            sort: '-index',
            embed: 'category'
        };

        if ($scope.keyword) {
            $scope.params.q = decodeURIComponent($scope.keyword);
        }

        $scope.totalCount = 0;

        $scope.faqsList = [];
        $scope.faqsLists = [];

        function setGroupCategory(faqsList) {
            var list = {}, arr = [];
            for (var i = 0; i < faqsList.length; i++) {
                if (list[faqsList[i].categoryId]) {
                    list[faqsList[i].categoryId].push(faqsList[i]);
                } else {
                    list[faqsList[i].categoryId] = [faqsList[i]];
                }
            }

            for (var categoryId in list) {
                arr.push(list[categoryId]);
            }
            return arr;
        }

        function getFaqs() {
            $scope.loading = true;
            faqs.get($scope.params, null, false).then(function (data) {
                $scope.loading = false;
                $scope.totalCount = data.totalCount;
                $scope.faqsList = data.faqsList;
                $scope.faqsLists = setGroupCategory(data.faqsList);

                //render parameter for sort
                angular.forEach($scope.faqsLists, function (item, key) {
                    $scope.sort['category' + key] = 'asc';

                });

            }, function () {
                $scope.loading = false;
            });
        }

        function getFaqsCategory(categoryId, sort) {
            //$scope.loading = true;
            var headers = {
                'X-Filter': JSON.stringify([
                    {
                        property: "categoryId",
                        operator: "equal",
                        condition: "or",
                        value: categoryId
                    }
                ])
            };

            if (sort === 'asc') {
                $scope.params.sort = 'index';
            } else {
                $scope.params.sort = '-index';
            }

            faqs.get($scope.params, headers, false)
                .then(function (data) {

                    $scope.sort.dataCategorySort = data.faqsList;

                    angular.forEach($scope.faqsLists, function (item, key) {
                        if (item[0].categoryId === categoryId) {
                            $scope.faqsLists[key] = $scope.sort.dataCategorySort;
                        }
                    });
                    $scope.loading = false;
                }, function () {
                    $scope.loading = false;
                });
        }

        //getFaqs();
        $scope.$watch('params.q', function (value) {
            $scope.linkShare = $scope.baseURL + '?search=' + value;
            getFaqs();
        });

        $scope.pageChanged = function () {
            getFaqs();
        };

        // sort function
        $scope.sortQuestion = function (name, categoryId) {

            if ($scope.sort[name] === 'asc') {
                getFaqsCategory(categoryId, 'desc');
                $scope.sort[name] = 'desc';
            } else {
                $scope.sort[name] = 'asc';
                getFaqsCategory(categoryId, 'asc');
            }


        };
    }
);