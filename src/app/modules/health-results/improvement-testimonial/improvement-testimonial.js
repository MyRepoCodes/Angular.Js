angular.module('app.modules.health-results.improvement-testimonial', [])

  .controller('ImprovementTestimonialController',
  function ($scope, $modalInstance, $timeout, security, utils, participantSurveys) {
    $scope.step = 1;

    $scope.params = {
      surveyName: '',
      line1: '',
      line2: '',
      line3: '',
      line4: '',
      line5: ''
    };



    // Submit
    $scope.submit = function () {

      participantSurveys.post({
        surveyName: $scope.params.surveyName,
        line1: $scope.params.line1,
        line2: $scope.params.line2,
        line3: $scope.params.line3,
        line4: $scope.params.line4,
        line5: $scope.params.line5
      }).then(function (response) {

        // Next form
        $scope.step = 2;
        $timeout(function () {
          $modalInstance.close(true);
        }, 3000);

      }, function (error) {
      });
    };


    $scope.cancel = function () {
      $modalInstance.close(false);
    };
  }
);
