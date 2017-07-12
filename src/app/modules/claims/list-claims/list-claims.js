angular.module('app.modules.claims.list-claims', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.list-claims', {
        url: '/list-claims',
        views: {
          'main-content': {
            templateUrl: 'modules/claims/list-claims/list-claims.tpl.html',
            controller: 'listClaimsController'
          }
        }
      });
  })

  .controller('listClaimsController',
    function ($scope, $state, CONFIGS, security, healthTopics) {
      // Check permission
      if (!(security.isEmployer() || security.isAgentTheAgent())) {
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

      function getHealthTopics() {
        $scope.loading = true;
        healthTopics.get($scope.params, $scope.headers, false).then(function (data) {
          $scope.loading = false;
          $scope.totalCount = data.totalCount;
          $scope.healthTopicsList = data.healthTopicsList;
          $scope.healthTopicsLists = setGroupCategory(data.healthTopicsList);
        }, function () {
          $scope.loading = false;
        });
      }


      $scope.$watch('params.q', function () {
        getHealthTopics();
      });

      $scope.pageChanged = function () {
        getHealthTopics();
      };
    }
  );
