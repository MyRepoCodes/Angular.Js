angular.module('app.modules.participantsurveys', [
    'app.modules.participantsurveys.list-participantsurveys'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('modules.participantsurveys', {
                url: '/participantsurveys',
                views: {
                    'main-content': {
                        templateUrl: 'modules/participantsurveys/participantsurveys.tpl.html',
                        controller: 'ParticipantSurveysController'
                    }
                }
            });

    })

    .controller('ParticipantSurveysController',
    function ($scope, $state) {

        $state.go('loggedIn.modules.list-participantsurveys');

    }
);

