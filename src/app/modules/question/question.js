angular.module('app.modules.question', [
    'app.modules.question.add-question',
    'app.modules.question.category-manager',
    'app.modules.dashboard.popup',
    'app.modules.question.list-question'
]) 

.config(function($stateProvider){
    $stateProvider
        .state('modules.question', {
            url: '/question',
            views: {
                'main-content': {
                    templateUrl: 'modules/question/question.tpl.html',
                    controller: 'QuestionController'
                }
            }
        })
        .state('modules.questionClientUrl', {
            url: '/:clientUrl/question',
            views: {
                'main-content': {
                    templateUrl: 'modules/question/question.tpl.html',
                    controller: 'QuestionController'
                }
            }
        })

        .state('loggedIn.modules.question', {
            url: '/question',
            views: {
                'main-content': {
                    templateUrl: 'modules/question/question.tpl.html',
                    controller: 'QuestionController'
                }
            }
        });
})

.controller('QuestionController',
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
