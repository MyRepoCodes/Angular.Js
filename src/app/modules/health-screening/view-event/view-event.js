angular.module('app.modules.health-screening.view-event', [])

.controller('HealthScreeningViewEventController', function ($scope, $modalInstance, CONFIGS, eventInfo) {
  $scope.eventInfo = eventInfo;
  $scope.fileNames = JSON.parse(eventInfo.fileNames);
  $scope.attachments = [];
  _.each($scope.fileNames, function (file) {
    file.downloadUrl = CONFIGS.baseURL() + '/healthscreenings/download?fileName=' + file.documentFilename + '&clientId=' + eventInfo.employerId;
    $scope.attachments.push(file);
  });

  var startTime = new Date(eventInfo.startTime);
  var endTime = new Date(eventInfo.endTime);
  $scope.params = {
    summary: eventInfo.summary,
    startDate: startTime.format('mm-dd-yyyy'),
    endDate: endTime.format('mm-dd-yyyy'),
    startTime: startTime.format('hh:MM TT'),
    endTime: endTime.format('hh:MM TT'),
    location: eventInfo.location,
    description: eventInfo.description
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  /* Date packer */
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
});
