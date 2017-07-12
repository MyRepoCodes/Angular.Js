angular.module('app.modules.faqs.list-faqs', [])

.config(function($stateProvider){
    $stateProvider
        .state('loggedIn.modules.list-faqs', {
            url: '/list-faqs',
            views: {
                'main-content': {
                    templateUrl: 'modules/faqs/list-faqs/list-faqs.tpl.html',
                    controller: 'FaqsListFaqsController'
                }
            }
        });
})

.controller('FaqsListFaqsController',
    function($scope, $state, CONFIGS, security, faqs) {
        // Check permission
        if(!(security.isEmployer() || security.isAgentTheAgent())) {
            $state.go('init');
        }

        var createdFor = security.currentUser.roles[0];
        $scope.headers = {
            'X-Filter': JSON.stringify([
                {
                    property: "nameRole",
                    operator: "equal",
                    condition: "or",
                    value: createdFor
                }
            ])
        };

        // Init model
        $scope.params = {
            q: '',
            page: 1,
            pageSize: CONFIGS.countPerPage,
            sort: '',
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
            faqs.get($scope.params, $scope.headers, false).then(function(data) {
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
);
