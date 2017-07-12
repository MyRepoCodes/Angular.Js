angular.module('app.modules.health-topics.health-topics-participant', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.health-topics-participant', {
        url: '/health-topics-participant',
        views: {
          'main-content': {
            templateUrl: 'modules/health-topics/health-topics-participant/health-topics-participant.tpl.html',
            controller: 'HealthTopicsListParticipantController'
          }
        }
      });
  })

  .controller('HealthTopicsListParticipantController',
    function ($scope, $state, CONFIGS, healthTopics) {
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
        for (var i = 0; i < healthTopicsList.length; i++) {
          if (list[healthTopicsList[i].categoryId]) {
            list[healthTopicsList[i].categoryId].push(healthTopicsList[i]);
          } else {
            list[healthTopicsList[i].categoryId] = [healthTopicsList[i]];
          }
        }

        for (var categoryId in list) {
          arr.push(list[categoryId]);
        }
        return arr;
      }

      function gethealthTopics() {
        $scope.loading = true;
        healthTopics.get($scope.params, undefined, false).then(function (data) {
          $scope.loading = false;
          $scope.totalCount = data.totalCount;
          $scope.healthTopicsList = data.healthTopicsList;
          $scope.healthTopicsLists = setGroupCategory(data.healthTopicList);
        }, function () {
          $scope.loading = false;
        });
      }

      //gethealthTopics();
      $scope.$watch('params.q', function () {
        gethealthTopics();
      });

      $scope.pageChanged = function () {
        gethealthTopics();
      };
    }
  )

  .filter('filterHealthTopics',
    function () {
      return function (array, expression) {
        if (expression) {
          var healthTopicsList = [];
          for (var i = 0; i < array.length; i++) {
            if (array[i].question.toLowerCase().indexOf(expression.toLowerCase().trim()) > -1) {
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
