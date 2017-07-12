angular.module('app.modules.health-topics', [
    'app.modules.health-topics.add-health-topics',
    'app.modules.health-topics.category-manager',
    'app.modules.health-topics.health-topics-participant',
    'app.modules.dashboard.popup',
    'app.modules.health-topics.list-health-topics'
])

.config(function($stateProvider){
    $stateProvider
        .state('modules.health-topics', {
            url: '/health-topics',
            views: {
                'main-content': {
                    templateUrl: 'modules/health-topics/health-topics.tpl.html',
                    controller: 'HealthTopicsController'
                }
            }
        })

        .state('modules.healthTopicsClientUrl', {
            url: '/:clientUrl/health-topics',
            views: {
                'main-content': {
                    templateUrl: 'modules/health-topics/health-topics.tpl.html',
                    controller: 'HealthTopicsController'
                }
            }
        })

        .state('loggedIn.modules.health-topics', {
            url: '/health-topics',
            views: {
                'main-content': {
                    templateUrl: 'modules/health-topics/health-topics.tpl.html',
                    controller: 'HealthTopicsController'
                }
            }
        });
})

.controller('HealthTopicsController',
    function($scope, $state, CONFIGS, healthTopics) {
        // Init model
        $scope.params = {
            q: '',
            page: 1,
            pageSize: 99999,
            sort: 'index',
            embed: 'category'
        };
        $scope.totalCount = 0;

        $scope.healthTopicsList = [];
        $scope.healthTopicsLists = [];

        function setGroupCategory(healthTopicsList) {
            var list = {}, arr = [];
            for(var i = 0; i < healthTopicsList.length; i++) {
                if(list[healthTopicsList[i].categoryId]) {
                    list[healthTopicsList[i].categoryId].push(healthTopicsList[i]);
                } else {
                    list[healthTopicsList[i].categoryId] = [healthTopicsList[i]];
                }
            }

            for(var categoryId in list) {
                arr.push(list[categoryId]);
            }
            return arr;
        }

        function gethealthTopics() {
            $scope.loading = true;
          healthTopics.get($scope.params, undefined, false).then(function(data) {
                $scope.loading = false;
                $scope.totalCount = data.totalCount;
                $scope.healthTopicsList = data.healthTopicsList;
                $scope.healthTopicsLists = setGroupCategory(data.healthTopicsList);
            }, function() {
                $scope.loading = false;
            });
        }

        $scope.$watch('params.q', function() {
          gethealthTopics();
        });

        $scope.pageChanged = function() {
          gethealthTopics();
        };
    }
)

.filter('filterHeathTopics',
    function() {
        return function(array, expression) {
            if(expression) {
                var healthTopicsList = [];
                for(var i = 0; i < array.length; i++) {
                    if(array[i].question.toLowerCase().indexOf(expression.toLowerCase().trim()) > -1) {
                      healthTopicsList.push(array[i]);
                    }
                }

                return healthTopicsList;
            } else {
                return array;
            }
        };
    }
);
