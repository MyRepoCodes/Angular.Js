angular.module('app.modules.registration.bcs.participant.breadcrumb', [])

.directive('bcsParticipantBreadcrumb', function() {
  return {
    restrict: 'EA',
    scope: {
      step: '='
    },
    templateUrl: 'modules/registration/bcs/participant/breadcrumb/breadcrumb.tpl.html',
    link: function(scope, element, attrs) {
    }
  };
});