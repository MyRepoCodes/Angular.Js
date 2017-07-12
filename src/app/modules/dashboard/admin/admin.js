angular.module('app.modules.dashboard.admin', [])

    .controller('DashboardAdminController',
        function ($scope, $state) {
            // redirect dashboard to UserManger
            $state.go('loggedIn.modules.user-manager.client');
        }
    );
