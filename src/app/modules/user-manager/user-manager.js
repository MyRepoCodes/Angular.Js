angular.module('app.modules.user-manager', [
  'app.modules.user-manager.select-users',
  'app.modules.user-manager.participant',
  'app.modules.user-manager.client',
  'app.modules.user-manager.agent',
  'app.modules.user-manager.health-coach',
  'app.modules.user-manager.health-coach-manager',
  'app.modules.user-manager.client-manager',
  'app.modules.user-manager.client-manager',
  'app.modules.user-manager.clinical-director',
  'app.modules.user-manager.admin',
  'app.modules.user-manager.superadmins',
  'app.modules.user-manager.portfolio',
  'app.modules.user-manager.import',
  'app.modules.user-manager.spouse',
  'app.modules.user-manager.spouse-list',
  'app.modules.user-manager.dependent',
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.user-manager', {
        url: '/user-manager',
        views: {
          'main-content': {
            templateUrl: 'modules/user-manager/user-manager.tpl.html',
            controller: 'UserManagerController'
          }
        }
      });
  })

  .controller('UserManagerController', function ($scope, $state, security) {  
    $scope.currentState = 'loggedIn.modules.user-manager.participant';
    $scope.parentState = 'participant';

    function childState(state) {
      state = state.$current.name;

      if (state.indexOf('create') > -1) {
        return 'create';
      } else if (state.indexOf('edit') > -1) {
        return 'edit';
      } else if (state.indexOf('download') > -1) {
        return 'download';
      } else if (state.indexOf('import') > -1) {
        return 'add-multiple';
      } else {
        return 'manager';
      }

      return false;
    }

    function parentState(state) {      
      state = state.$current.name;

      if (state.indexOf('superadmins') > -1) {
        return 'superadmins';
      } else if (state.indexOf('admin') > -1) {
        return 'admin';
      } else if (state.indexOf('portfolio') > -1) {
        return 'portfolio';
      } else if (state.indexOf('clinical-director') > -1) {
        return 'clinical-director';
      } else if (state.indexOf('client-manager') > -1) {
        return 'client-manager';
      } else if (state.indexOf('health-coach-manager') > -1) {
        return 'health-coach-manager';
      } else if (state.indexOf('health-coach') > -1) {
        return 'health-coach';
      } else if (state.indexOf('client') > -1) {
        return 'client';
      } else if (state.indexOf('agent') > -1) {
        return 'agent';
      } else if ((state.indexOf('spouse') > -1) ) {
        return 'spouse';
      } else if (state.indexOf('participant') > -1) {
        return 'participant';
      }

      return false;
    }

    $scope.goStateList = function () {
      var state = parentState($state);   

      if (state === 'admin') {
        $scope.currentState = 'loggedIn.modules.user-manager.admin';
        $scope.parentState = 'admin';
      } else if (state === 'superadmins') {
        $scope.currentState = 'loggedIn.modules.user-manager.superadmins';
        $scope.parentState = 'superadmins';
      } else if (state === 'portfolio') {
        $scope.currentState = 'loggedIn.modules.user-manager.portfolio';
        $scope.parentState = 'portfolio';
      } else if (state === 'clinical-director') {
        $scope.currentState = 'loggedIn.modules.user-manager.clinical-director';
        $scope.parentState = 'clinical-director';
      } else if (state === 'client-manager') {
        $scope.currentState = 'loggedIn.modules.user-manager.client-manager';
        $scope.parentState = 'client-manager';
      } else if (state === 'health-coach-manager') {
        $scope.currentState = 'loggedIn.modules.user-manager.health-coach-manager';
        $scope.parentState = 'health-coach-manager';
      } else if (state === 'health-coach') {
        $scope.currentState = 'loggedIn.modules.user-manager.health-coach';
        $scope.parentState = 'health-coach';
      } else if (state === 'client') {
        $scope.currentState = 'loggedIn.modules.user-manager.client';
        $scope.parentState = 'client';
      } else if (state === 'agent') {
        $scope.currentState = 'loggedIn.modules.user-manager.agent';
        $scope.parentState = 'agent';
      } else if (state === 'participant') {
        $scope.currentState = 'loggedIn.modules.user-manager.participant';
        $scope.parentState = 'participant';
      } else if (state === 'spouse') {
        $scope.currentState = 'loggedIn.modules.user-manager.spouse-list';
        $scope.parentState = 'spouse';
      }

      // Fix issues If Client Manager then go to list client
      if (security.isSuperAdmin()) {
        $scope.currentState = 'loggedIn.modules.user-manager.admin';
        $scope.parentState = 'admin';

      } else if (security.isHealthCoachManager()) {
        $scope.currentState = 'loggedIn.modules.user-manager.health-coach';
        $scope.parentState = 'health-coach';

      } else if (security.isClientManager() || security.isAdmin() || security.isHealthCoach()) {
        $scope.currentState = 'loggedIn.modules.user-manager.client';
        $scope.parentState = 'client';
      }
      $state.go($scope.currentState);

    };

    $scope.getFilterName = function () {
      var state = parentState($state);

      if (state === 'admin') {
        return 'Admin';
      } else if (state === 'superadmins') {
        return 'Super Admin';
      } else if (state === 'portfolio') {
        return 'Portfolios';
      } else if (state === 'clinical-director') {
        return 'Clinical Director';
      } else if (state === 'client-manager') {
        return 'Client Manager';
      } else if (state === 'health-coach-manager') {
        return 'Health Coach Manager';
      } else if (state === 'health-coach') {
        return 'Health Coach';
      } else if (state === 'client') {
        return 'Client';
      } else if (state === 'agent') {
        return 'Agent';
      } else if (state === 'participant') {
        return 'Participant';
      } else if (state === 'spouse') {
        return 'Spouse';
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

    function setPageTitle(stateName) {
      $scope.pageTitle = 'User Manager';
      if (stateName === 'loggedIn.modules.user-manager.participant.download' || stateName === 'loggedIn.modules.user-manager.participantClient.download') {
        $scope.pageTitle = 'Download Users';
      } else if (stateName === 'loggedIn.modules.user-manager.client.download') {
        $scope.pageTitle = 'Download Users';
      } else if (stateName === 'loggedIn.modules.user-manager.agent.download') {
        $scope.pageTitle = 'Download Users';
      } else if (stateName === 'loggedIn.modules.user-manager.health-coach.download') {
        $scope.pageTitle = 'Download Users';
      } else if (stateName === 'loggedIn.modules.user-manager.health-coach-manager.download') {
        $scope.pageTitle = 'Download Users';
      } else if (stateName === 'loggedIn.modules.user-manager.client-manager.download') {
        $scope.pageTitle = 'Download Users';
      }
    }

    init();

    $scope.goState = function (sref) {
      $scope.resetAllInfoSort();
      $scope.currentState = sref;
      $state.go($scope.currentState);
    };

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {    
      $scope.childState = childState($state);
      $scope.parentState = parentState($state);

      // Fix redirect
      if (toState.name === 'loggedIn.modules.user-manager') {
        init();
      }

      setPageTitle(toState.name);
    });
  });