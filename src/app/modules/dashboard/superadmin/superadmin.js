angular.module('app.modules.dashboard.superadmin', [])

    .controller('DashboardSuperAdminController',
        function ($scope, $state) {
            // redirect dashboard to UserManger
            $state.go('loggedIn.modules.user-manager.client');
        }
    );
