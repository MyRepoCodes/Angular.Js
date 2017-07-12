angular.module("app.modules.reports", [
  'app.modules.reports.client',
  'app.modules.reports.admin',
  'app.modules.reports.page'
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.reports', {
        url: '/reports/:type',
        views: {
          'main-content': {
            templateUrl: 'modules/reports/reports.tpl.html',
            controller: 'ReportsController'
          }
        },
        resolve: {
          deps: ['uiLoad', 'JQ_CONFIG', '$ocLazyLoad',
            function (uiLoad, JQ_CONFIG, $ocLazyLoad) {
              return uiLoad.load([]).then(
                function () {
                  return $ocLazyLoad.load([]);
                }
              );
            }]
        }
      });
  })

  .controller('ReportsController',
    function ($rootScope, $scope, $state, $timeout, security) {


    }
  );