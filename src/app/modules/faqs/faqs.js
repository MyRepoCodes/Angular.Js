angular.module('app.modules.faqs', [
    'app.modules.faqs.add-faqs',
    'app.modules.faqs.category-manager',
    'app.modules.dashboard.popup',
    'app.modules.faqs.list-faqs'
])

.config(function($stateProvider){
    $stateProvider
        .state('modules.faqs', {
            url: '/faqs',
            views: {
                'main-content': {
                    templateUrl: 'modules/faqs/faqs.tpl.html',
                    controller: 'FaqsController'
                }
            }
        })

        .state('modules.faqsClientUrl', {
            url: '/:clientUrl/faqs',
            views: {
                'main-content': {
                    templateUrl: 'modules/faqs/faqs.tpl.html',
                    controller: 'FaqsController'
                }
            }
        })

        .state('loggedIn.modules.faqs', {
            url: '/faqs',
            views: {
                'main-content': {
                    templateUrl: 'modules/faqs/faqs.tpl.html',
                    controller: 'FaqsController'
                }
            }
        });
})

.controller('FaqsController',
    function($scope, $state, CONFIGS, faqs) {
        // Init model
        $scope.params = {
            q: '',
            page: 1,
            pageSize: 99999,
            sort: 'index',
            embed: 'category'
        };
        $scope.totalCount = 0;

        $scope.faqsList = [];
        $scope.faqsLists = [];

        function setGroupCategory(faqsList) {
            var list = {}, arr = [];
            for(var i = 0; i < faqsList.length; i++) {
                if(list[faqsList[i].categoryId]) {
                    list[faqsList[i].categoryId].push(faqsList[i]);
                } else {
                    list[faqsList[i].categoryId] = [faqsList[i]];
                }
            }

            for(var categoryId in list) {
                arr.push(list[categoryId]);
            }
            return arr;
        }

        function getFaqs() {
            $scope.loading = true;
            faqs.get($scope.params, undefined, false).then(function(data) {
                $scope.loading = false;
                $scope.totalCount = data.totalCount;
                $scope.faqsList = data.faqsList;
                $scope.faqsLists = setGroupCategory(data.faqsList);
            }, function() {
                $scope.loading = false;
            });
        }

        //getFaqs();
        $scope.$watch('params.q', function() {
            getFaqs();
        });

        $scope.pageChanged = function() {
            getFaqs();
        };
    }
)

.filter('filterFaqs',
    function() {
        return function(array, expression) {
            if(expression) {
                var faqsList = [];
                for(var i = 0; i < array.length; i++) {
                    if(array[i].question.toLowerCase().indexOf(expression.toLowerCase().trim()) > -1) {
                        faqsList.push(array[i]);
                    }
                }

                return faqsList;
            } else {
                return array;
            }
        };
    }
);
