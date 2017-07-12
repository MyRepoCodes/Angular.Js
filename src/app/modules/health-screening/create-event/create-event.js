/**
 * Reference
 * https://developers.google.com/google-apps/calendar/v3/reference/events/insert
 */
/**
 // Date variables
 var now = new Date();
 today = now.toISOString();

 var twoHoursLater = new Date(now.getTime() + (2 * 1000 * 60 * 60));
 twoHoursLater = twoHoursLater.toISOString();

 var resource = {
    'summary': 'Test Create Calender',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': today,
      'timeZone': 'Asia/Saigon'
    },
    'end': {
      'dateTime': twoHoursLater,
      'timeZone': 'Asia/Saigon'
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
      {'email': 'lpage@example.com'},
      {'email': 'sbrin@example.com'}
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    },
    'visibility': 'private'
  };
 */
angular.module('app.modules.health-screening.create-event', [])

.controller('HealthScreeningCreateEventController', function ($scope, $modalInstance, CONFIGS, GCalendarService, GDriverService, calendarId, emails, utils, security, healthScreenings) {
  $scope.uploadUrl = CONFIGS.baseURL() + '/healthscreenings/upload';

  // Init model
  $scope.params = {
    summary: '',
    location: '',
    description: '',
    dateStart: new Date().format('mm/dd/yyyy'),
    dateEnd: new Date().format('mm/dd/yyyy'),
    timeStart: '12:00 AM',
    timeEnd: '1:00 AM',
    // recurrence: [
    //   'RRULE:FREQ=DAILY;COUNT=2'
    // ],
    attendees: [
      {'email': 'huydang1920@gmail.com'}
    ],
    reminders: {
      useDefault: false,
      overrides: [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    },
    attachments:[
      {fileUrl:'https://drive.google.com/a/beesightsoft.com/file/d/0BxZQufYIL_1yUGttWWtHa0hTT2M/view?usp=sharing'}
    ],
    visibility: 'private',
    files: []
  };

  $scope.newValues = {
    place: $scope.params.location
  };

  // Update location
  $scope.$watch('newValues.place', function(newVal) {
    if(angular.isObject(newVal) && angular.isObject(newVal.geometry)) {
      $scope.params.location = newVal.formatted_address;
      //$scope.params.latitude = newVal.geometry.location.lat();
      //$scope.params.longitude = newVal.geometry.location.lng();
    } else if (typeof newVal === 'string') {
      $scope.params.location = newVal;
    } else if (newVal !== $scope.params.location) {
      $scope.params.location = '';
    }
  });

  // Insert file to google drive
  // Share file to emails
  // Create event to google calender
  // Save to database
  $scope.attachments = [];
  $scope.fileNames = [];
  function handleFiles(files, emails, resource) {
    if (files[0]) {
      var fileInfo = files[0];
      files.splice(0, 1);

      // Upload file to google driver by File Url
      var xhr = new XMLHttpRequest();
      xhr.open('GET', fileInfo.fileUrl);
      xhr.responseType = 'blob'; //force the HTTP response, response-type header to be blob
      xhr.onload = function () {
        var fileData = xhr.response; //xhr.response is now a blob object
        fileData.fileName = fileInfo.filename;
        GDriverService.insertAndSharing(fileData, emails).then(function (file) {
          $scope.attachments.push({'fileId': file.id, 'fileUrl': file.alternateLink, 'iconLink': file.iconLink, 'mimeType': file.mimeType, 'title': file.title});
          $scope.fileNames.push({
            'documentFilename': fileInfo.documentFilename,
            'fileId': file.id,
            'fileUrl': file.alternateLink,
            'iconLink': file.iconLink,
            'mimeType': file.mimeType,
            'title': file.title
          });
          handleFiles(files, emails, resource);
        }, function () {
          handleFiles(files, emails, resource);
        });
      };
      xhr.send();
    } else {
      // End loop and return
      // Create event to google calender
      // Save to database
      resource.attachments = $scope.attachments;

      GCalendarService.createEvent({
        calendarId: calendarId,
        sendNotifications: true,
        supportsAttachments: true,
        resource: resource
      }).then(function (response) {
        // Post to database
        healthScreenings.postEvent({
          summary: resource.summary,
          location: resource.location,
          description: resource.description,
          fileNames: JSON.stringify($scope.fileNames),
          startTime: resource.start.dateTime,
          endTime: resource.end.dateTime,
          employerId: security.currentUser.id,
          eventGoogleCalendarId: response.id
        }).then(function () {
          $modalInstance.close(response);
        }, function (error) {
          $modalInstance.dismiss(error);
        });
      }, function (error) {
        $modalInstance.dismiss(error);
      });
    }
  }

  // Create event
  $scope.addEvent = function (isValid) {
    $scope.showValid = true;
    if (isValid) {
      var resource = angular.copy($scope.params);
      resource.start = {
        dateTime: new Date(new Date(resource.dateStart).format('mm/dd/yyyy') + ' ' + utils.convertTo24Hour(resource.timeStart)).toISOString()
      };
      resource.end = {
        dateTime: new Date(new Date(resource.dateEnd).format('mm/dd/yyyy') + ' ' + utils.convertTo24Hour(resource.timeEnd)).toISOString()
      };

      var files = [];
      for (var i = 0; i < $scope.params.files.length; i++) {
        $scope.params.files[i].fileUrl = CONFIGS.baseURL() + '/healthscreenings/download?fileName=' + $scope.params.files[i].documentFilename + '&clientId=' + security.currentUser.id;
        files.push($scope.params.files[i]);
      }

      delete resource.dateStart;
      delete resource.dateEnd;
      delete resource.timeStart;
      delete resource.timeEnd;
      delete resource.files;

      handleFiles(files, emails, resource);
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

  /* Date packer */
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.format = 'MM/dd/yyyy';

  $scope.openStart = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.openedStart = true;
  };

  $scope.openEnd = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.openedEnd = true;
  };
});
