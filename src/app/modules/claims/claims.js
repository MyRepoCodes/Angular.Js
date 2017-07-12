angular.module('app.modules.claims', [
    'app.modules.claims.list-claims',
    'app.modules.claims.status-claims',
    'app.modules.claims.submit-claims',
    'app.modules.claims.manager-claims',
    'app.modules.claims.history-claims',
    'app.modules.claims.bcs-par-claims',
    'app.modules.claims.view-claim',
  ])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.claims', {
        url: '/claims',
        views: {
          'main-content': {
            templateUrl: 'modules/claims/claims.tpl.html',
            controller: 'ClaimsController'
          }
        }
      });
  })

  .controller('ClaimsController', function ($scope, $state, CONFIGS, healthTopics) {
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
        $scope.healthTopicsLists = setGroupCategory(data.healthTopicsList);
      }, function () {
        $scope.loading = false;
      });
    }

    $scope.$watch('params.q', function () {
      gethealthTopics();
    });

    $scope.pageChanged = function () {
      gethealthTopics();
    };
  })

  .filter('filterHeathTopics', function () {
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
  })

  .filter('claimStatus', function (utils) {
    return function (status, item, isHaveDate) {
      var output = '';
      var date = item.modifiedDate;

      if (status === 4) {
        output = 'Submitted';
      } else if (status === 5) {
        output = 'Received';
      } else if (status === 6) {
        output = 'Pending';
      } else if (status === 7) {
        output = 'Processed and Invoiced';
      } else if (status === 8) {
        output = 'Paid';
      }

      if (isHaveDate && date) {
        output += ' on ' + new Date(utils.dateServerToLocalTime(date)).format('mm-dd-yyyy');
      }

      return output;
    };
  });
