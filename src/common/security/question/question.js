angular.module('security.question', [])

    .config(function ($stateProvider) {
        //console.log('#########',$localStorage);
        $stateProvider
            .state('questionFrom', {
                parent: 'blank-default',
                url: '/question',
                params: {
                    securityQuestions: null,
                    error:null
                },                
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html',
                        controller: 'HeaderController'
                    },
                    'middle-container': {
                        templateUrl: 'security/question/question.tpl.html',
                        params: {
                            obj: null
                        },
                        controller: 'questionController',
                        resolve:{
                            isValid: function($stateParams,$state,$cookieStore){                             
                            var authToken = $cookieStore.get('authToken');  
                             if(!authToken){ $state.go('loginForm');}                             
                            }
                        }
                    },
                    'footer': {
                        templateUrl: 'footer/footer.tpl.html'
                    }
                }
            })
            .state('questionFromClientUrl', {
                parent: 'blank-default',
                url: '/:clientUrl/question',
                views: {
                    'header': {
                        templateUrl: 'header/header.tpl.html',
                        controller: 'HeaderController'
                    },
                    'middle-container': {
                        templateUrl: 'security/question/question.tpl.html',
                        controller: 'questionController',
                        resolve: {
                            init: function ($stateParams, security) {
                                security.getBrandByClientUrl($stateParams.clientUrl);
                            }
                        }
                    },
                    'footer': {
                        templateUrl: 'footer/footer.tpl.html'
                    }
                }
            });  
    })    
    .controller('questionController',
        function ($scope, $state, $cookieStore,$stateParams,$localStorage, QUESTIONS, $translate, utils, security) {  
             $scope.$storage = $localStorage;                     
             var i = (Math.floor(Math.random()*$scope.$storage.question.length));
             $scope.question = $scope.$storage.question[i].question;        
             $scope.questiont = $scope.$storage.question[i].questionId;                  
             $scope.error = $stateParams.error;

            $scope.submit = function () {   
            var j = (Math.floor(Math.random()*$scope.$storage.question.length));
            var authToken = $cookieStore.get('authToken');
            $scope.answertext = $scope.user.answer; 
            if(!$scope.answertext){
                return $scope.error = 'Please enter your answer';
            }         
            // hit api to validate question answer
         
            security.validateQuestion(authToken,$scope.answertext, $scope.questiont,false).then(function(response){   

                 $scope.isCookies = $cookieStore.put('userId_'+response.data.data.userId,{questionId:response.data.data.questionId,answertext:response.data.data.answertext});
                 $state.go('loggedIn.modules.dashboard');
            },function(error){  
                     $scope.user.answer = null;
                     $scope.error = error.data.errors[0].errorMessage;
                     $scope.question = $scope.$storage.question[j].question; 
                     $scope.questiont = $scope.$storage.question[j].questionId;
                     $state.go('questionFrom',{error:error.data.errors[0].errorMessage},{});
                   });              
            };
         });