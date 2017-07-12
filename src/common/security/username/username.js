angular.module('security.username', [])

  .config(function ($stateProvider) {

    $stateProvider
      .state('usernameForm', {
        parent: 'blank-default',
        url: '/username',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html',
            controller: 'HeaderController'
          },
          'middle-container': {
            templateUrl: 'security/username/username.tpl.html',
            controller: 'UsernameController'
          },
          'footer': {
            templateUrl: 'footer/footer.tpl.html'
          }
        }

      })

      .state('usernameFormClientUrl', {
        parent: 'blank-default',
        url: '/:clientUrl/username',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html',
            controller: 'HeaderController'
          },
          'middle-container': {
            templateUrl: 'security/username/username.tpl.html',
            controller: 'UsernameController'
          },
          'footer': {
            templateUrl: 'footer/footer.tpl.html'
          }
        }
      });

  })

  .controller('UsernameController',
  function ($scope, $state, $cookieStore, $stateParams,$localStorage,$translate, $stickies, security, users, localizedMessages, participants, QUESTIONS) {

    // Check account existing
    if (!security.currentAccount) {
      if ($stateParams.clientUrl) {
        $state.go('findAccountFormClientUrl', { clientUrl: $stateParams.clientUrl });
      } else {
        $state.go('findAccountForm');
      }
    }

      $scope.$storage = $localStorage;

    $scope.env = {
      isEmailExists: false
    };

    $scope.currentClient = security.currentClient;
    $scope.user = security.currentAccount;
    $scope.oldUsernam = $scope.user.username;
    $scope.isHaveEmail = ($scope.user.email === "noemail@benicomp.com" || !$scope.user.email) ? false : true;

     $scope.questions1 =  $scope.$storage.one;
     $scope.questions2 =  $scope.$storage.two;

    // The model for this form
    $scope.params = {
      username: $scope.user.isAlreadyCreated ? $scope.user.username : "",
      password: '',
      confirm: '',
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      email: ''
    };
        $scope.change = function(group){
                if(group == 1) {
                     $scope.questions2 = $scope.$storage.one.filter(function(v,i){ return $scope.params.question1 !==  v.id; });
                } else {
                     $scope.questions1 = $scope.$storage.two.filter(function(v,i){ return $scope.params.question2 !==  v.id; });
                }
            };

    function createUserById(dataPost) {

      security.createUserById($scope.user.id, dataPost).then(function (res) {
        $scope.showValid = false;
        $stickies.set('login', $translate.instant('username.success'), 'success');

        if ($stateParams.clientUrl) {
          $state.go('loginFormClientUrl', { clientUrl: $stateParams.clientUrl });
        } else {
          $state.go('loginForm');
        }

      }, function (error) {
        switch (error.status) {
          case 500: {
            $scope.error = localizedMessages.get('crud.server.error');
            $scope.error = $translate.instant('server.error.500.' + error.errors[0].errorCode);
            break;
          }
          case 409: {
            $scope.error = error.error;
            break;
          }
          default: {
            $scope.error = localizedMessages.get('crud.users.notupdate');
            break;
          }
        }
        //$scope.error = localizedMessages.get('login.error.serverError', {exception: x});
      });

    }

    // Save
    $scope.submit = function (isValid) {
      $scope.showValid = true;
      if (isValid) {

        var dataPost = "";
        if ($scope.params.username !== $scope.oldUsernam) {
          dataPost = {
            UserName: $scope.params.username,
            Password: $scope.params.password,
            SecurityQuestions: ([
              { QuestionId: $scope.params.question1, Answer: $scope.params.answer1.toString() },
              { QuestionId: $scope.params.question2, Answer: $scope.params.answer2.toString() }
            ])
          };
        } else {
          dataPost = {
            Password: $scope.params.password,
            SecurityQuestions: ([
              { QuestionId: $scope.params.question1, Answer: $scope.params.answer1.toString() },
              { QuestionId: $scope.params.question2, Answer: $scope.params.answer2.toString() }
            ])
          };
        }

        //Check email exist
        if (!$scope.isHaveEmail) {
          users.checkEmailExist({ 'email': $scope.params.email })
            .then(function (response) {
              $scope.env.isEmailExists = response;
              if (!response) {
                dataPost['email'] = $scope.params.email;
                createUserById(dataPost);
              }

            });

        } else {
          createUserById(dataPost);
        }

      }
    };

    $scope.$on('security:brand:updated', function (event, brand) {
      $scope.brand = brand;
    });
  }
  );
