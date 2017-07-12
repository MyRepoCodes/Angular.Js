angular.module('app.header', [
  'app.header.top-menu'
])

  .controller('HeaderController',
  function ($rootScope, $scope, $timeout, $state, $stateParams, security) {
    $scope.menuList = [];
    $scope.user = security.currentUser;
    $scope.isParticipant = security.isParticipant();

    // Update info
    $scope.$watch(function () {
      $scope.isCookies = security.isCookies();
      return security.isAuthenticated();
     
    }, function () {
      $scope.isParticipant = security.isParticipant();
    });

    function init() {
      $scope.menuList = [
        //{title: 'Home', sref: 'modules.home', state: 'home'},
        { title: 'About Pulse', sref: 'pageAbout', state: 'about' },
        { title: 'FAQs', sref: 'modules.faqs', state: 'faqs' },
        {title: 'Question', sref: 'modules.question', state: 'question'},
        { title: 'Contact', sref: 'modules.contact', state: 'contact' }
      ];
    }

    init();

    // Avatar
    $scope.avatar = security.avatar;
    $scope.$on('security:avatar:update', function () {
      $scope.avatar = security.avatar;
    });
  }
  );
