/***
 * Permission 1. Health Coach Manager 2. Health Coach 3. Client Manager 4. Admin
 */
angular.module('app.modules.mail', [
  'app.modules.mail.list',
  'app.modules.mail.compose',
  'app.modules.mail.detail'
])

.config(function ($stateProvider) {
  $stateProvider
    .state('loggedIn.modules.mail', {
      abstract: true,
      url: '/mail',
      views: {
        'middle-container@loggedIn': {
          templateUrl: 'modules/mail/mail.tpl.html',
          controller: 'MailController'
        }
      }
    });
})

.controller('MailController', function ($scope) {
  $scope.folds = [
    {name: 'Inbox', filter: ''},
    //{name: 'Starred', filter: 'starred'},
    {name: 'Sent', filter: 'sent'},
    //{name: 'Important', filter: 'important'},
    //{name: 'Draft', filter: 'draft'},
    //{name: 'Trash', filter: 'trash'}
  ];

  $scope.labels = [
    {name: 'Angular', filter: 'angular', color: '#23b7e5'},
    {name: 'Bootstrap', filter: 'bootstrap', color: '#7266ba'},
    {name: 'Client', filter: 'client', color: '#fad733'},
    {name: 'Work', filter: 'work', color: '#27c24c'}
  ];

  $scope.addLabel = function () {
    $scope.labels.push(
      {
        name: $scope.newLabel.name,
        filter: angular.lowercase($scope.newLabel.name),
        color: '#ccc'
      }
    );
    $scope.newLabel.name = '';
  };

  $scope.labelClass = function (label) {
    return {
      'b-l-info': angular.lowercase(label) === 'angular',
      'b-l-primary': angular.lowercase(label) === 'bootstrap',
      'b-l-warning': angular.lowercase(label) === 'client',
      'b-l-success': angular.lowercase(label) === 'work'
    };
  };

})

.directive('labelColor', function () {
  return function (scope, $el, attrs) {
    $el.css({'color': attrs.color});
  };
})

/* Filters */
// need load the moment.js to use this filter.

.filter('fromNow', function () {
  return function (date) {
    return moment(new Date(date)).fromNow();
  };
});

