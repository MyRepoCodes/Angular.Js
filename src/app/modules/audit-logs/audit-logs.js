angular.module('app.modules.audit-logs', [
    'app.modules.audit-logs.all-logs',
    'app.modules.audit-logs.client-manager',
    'app.modules.audit-logs.login-logs'
  ])
  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.audit-logs', {
        url: '/audit-logs',
        views: {
          'main-content': {
            templateUrl: 'modules/audit-logs/audit-logs.tpl.html',
            controller: 'AuditLogsController',
          }
        },
        resolve: {
          init: function ($stateParams,$state, security) {
             security.requestCurrentUser().then(function (user) {            
               if(user && user.roles[0] === 'Admin'){
                 return true;
               } else {
                 $state.go($state.current, {}, {reload: true});
               }              
             });            
          }
        }
      });
  })
  .controller('AuditLogsController', function ($scope, $state, $timeout, security) {
    // $state.go('loggedIn.modules.audit-logs.all-logs');
    function parentState(state) {
      state = state.$current.name;

      if (state.indexOf('all-logs') > -1) {
        return 'all-logs';
      } else if (state.indexOf('client-manager') > -1) {
        return 'client-manager';
      } else if (state.indexOf('audit-logs') > -1) {
        return 'audit-logs';
      } else if (state.indexOf('login-logs') > -1) {
        return 'login-logs';
      }
      return false;
    }

    function childState(state) {
      state = state.$current.name;
      if (state.indexOf('view-logs') > -1) {
        return 'view-logs';
      } else if (state.indexOf('update-logs') > -1) {
        return 'update-logs';
      } else if (state.indexOf('delete-logs') > -1) {
        return 'delete-logs';
      } else {
        return 'all-logs';
      }

    }


    $scope.goStateList = function () {
      var state = parentState($state);
      if (state === 'all-logs') {
        $scope.currentState = 'loggedIn.modules.audit-logs.all-logs';
        $scope.parentState = 'all-logs';
      } else if (state === 'view-logs') {
        $scope.currentState = 'loggedIn.modules.audit-logs.all-logs.view-logs';
        $scope.parentState = 'view-logs';
      } else if (state === 'update-logs') {
        $scope.currentState = 'loggedIn.modules.audit-logs.all-logs.update-logs';
        $scope.parentState = 'update-logs';
      } else if (state === 'delete-logs') {
        $scope.currentState = 'loggedIn.modules.audit-logs.all-logs.delete-logs';
        $scope.parentState = 'delete-logs';
      } else if (state === 'audit-logs') {
        $scope.currentState = 'loggedIn.modules.audit-logs.all-logs';
        $scope.parentState = 'all-logs';
      } else if (state === 'login-logs') {
        $scope.currentState = 'loggedIn.modules.audit-logs.login-logs';
        $scope.parentState = 'login-logs';
      }
      $state.go($scope.currentState);
    };



    $scope.getFilterName = function () {
      var state = childState($state);
      if (state === 'all-logs') {
        return 'All Logs';
      } else if (state === 'view-logs') {
        return 'View Logs';
      } else if (state === 'update-logs') {
        return 'Update Logs';
      } else if (state === 'delete-logs') {
        return 'Delete Logs';
      }
      return 'Filter';
    };

    function init() {
      if ($scope.userManagerRead()) {
        $scope.goStateList();
      } else {
        $state.go('loggedIn.modules.dashboard');
      }
    }

    $scope.goState = function (sref) {
      $scope.resetAllInfoSort();
      $scope.currentState = sref;
      $state.go($scope.currentState);
    };

    function setPageTitle(stateName) {
      $scope.pageTitle = 'All Logs';
      if (stateName === 'loggedIn.modules.audit-logs.all-logs') {
        $scope.pageTitle = 'All Logs';
      } else if (stateName === 'loggedIn.modules.audit-logs.client-manager') {
        $scope.pageTitle = 'Client Manager';
      } else if (stateName === 'loggedIn.modules.audit-logs.login-logs') {
        $scope.pageTitle = 'Login Logs';
      }
    }

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.parentState = parentState($state);
      $scope.childState = childState($state);
      // Fix redirect

      if (toState.name === 'loggedIn.modules.audit-logs') {
        init();
      }
      setPageTitle(toState.name);
    });

  });