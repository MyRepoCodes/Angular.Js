angular.module('app.modules', [ 
  'app.alert',  
  'app.sidebar',
  'app.modules.popup',
  'app.modules.home', 
  'app.modules.contact',
  'app.modules.faqs',
  'app.modules.question',
  'app.modules.audit-logs',
  //'app.modules.health-topics', /* Remove #563 */
  'app.modules.participantsurveys',
  'app.modules.imp-documents',
  'app.modules.profile',
  'app.modules.settings',
  'app.modules.claims',
  'app.modules.dashboard',
  'app.modules.reports',
  'app.modules.user-manager',
  'app.modules.participant',
  'app.modules.registration',
  'app.modules.health-results',
  'app.modules.health-coaching',
  'app.modules.health-coach-request-manager',
  'app.modules.health-coach-request',
  'app.modules.health-coach-manager',
  'app.modules.benicomp-select',
  //'app.modules.health-screening', /* Remove #562 */
  'app.modules.server',  
  'app.modules.accounting',  
  'app.modules.mail',
  ])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules', {
      url: '',
      abstract: true,
      views: {
        'header': {
          templateUrl: 'header/header.tpl.html',
          controller: 'HeaderController'
        },
        'middle-container': {
          templateUrl: 'layouts/layout-middle-content.tpl.html',
          controller: 'ModulesController'
        },
        'footer': {
          templateUrl: 'footer/footer.tpl.html'
        }
      }
    })
    .state('modules', {
      parent: 'blank-views',
      url: '',
      views: {
        '': {
          templateUrl: 'layouts/layout-forms.tpl.html',
          controller: 'ModulesController'
        }
      }
    });
})

  .controller('ModulesController', function ($scope, $state, $cookieStore, security) {      
    security.requestCurrentUser().then(function (user) {   
      authToken = $cookieStore.get('userId_' + user.userId);
      if (user && (user.roles[0] === 'Participant')) {
        if (!authToken) {
           $state.go('questionFrom');
        } 
      } 
    });
  });
