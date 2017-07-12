angular.module('app.modules.accounting', [
    'app.modules.accounting.invoice-manager'
])

    .config(function ($stateProvider) {
        var views = {
            'main-content': {
                templateUrl: 'modules/accounting/accounting.tpl.html',
                controller: 'AccountingController'
            }
        };

        $stateProvider
            .state('modules.accounting', { url: '/accounting', views: views });
    })

    .controller('AccountingController', function ($scope, $state, $timeout, security, utils) {

    });