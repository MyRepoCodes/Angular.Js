angular.module('app.pages.about', [])

.config(function($stateProvider){
    $stateProvider
        .state('public.pagesAbout', {
            url: '/about',
            views: {
                'header': {
                    templateUrl: 'header/header.tpl.html'
                },
                'middle-container': {
                    templateUrl: 'pages/about/about.tpl.html',
                    controller: 'PagesAboutController'
                },
                'footer': {
                    templateUrl: 'footer/footer.tpl.html'
                }
            }
        });
})

.controller('PagesAboutController',
    function($scope, $state) {

    }
);