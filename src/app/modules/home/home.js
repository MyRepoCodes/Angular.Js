angular.module("app.modules.home", [])

.config(function($stateProvider){
    $stateProvider
        .state('modules.home', {
            url: '/home',
            views: {
                'main-content': {
                    templateUrl: 'modules/home/home.tpl.html',
                    controller: 'HomeController'
                }
            }
        });
})

.controller('HomeController',
    function($scope, $state) {

    }
);