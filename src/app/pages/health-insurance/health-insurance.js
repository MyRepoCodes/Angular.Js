angular.module('app.pages.health-insurance', [])

.config(function($stateProvider) {
    $stateProvider
        .state('blank-views.health-insurance', {
            url: '/health-insurance',
            templateUrl: 'pages/health-insurance/health-insurance.tpl.html',
            controller: 'HealthInsuranceController'
        });
})

.controller('HealthInsuranceController',
    function($scope) {
    }
);
