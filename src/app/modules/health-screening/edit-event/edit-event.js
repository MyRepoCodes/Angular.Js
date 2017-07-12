/**
 * Reference
 * https://developers.google.com/google-apps/calendar/v3/reference/events/patch
 */
angular.module('app.modules.health-screening.edit-event', [])

.controller('HealthScreeningEditEventController', function ($scope, $modalInstance, CONFIGS, GCalendarService, GDriverService, calendarId, emails, eventCalendar, eventInfo, utils, security, healthScreenings) {
  $scope.uploadUrl = CONFIGS.baseURL() + '/healthscreenings/upload';
  $scope.eventCalendar = eventCalendar;

  $scope.allDay = false;
  if (!!eventCalendar.start.date) {
    $scope.allDay = true;
  }

  var start = eventCalendar.start.date || eventCalendar.start.dateTime;
  var end = eventCalendar.end.date || eventCalendar.end.dateTime || start;

  var attendees = [];
  if (eventCalendar.attendees) {
    for (var i = 0; i < eventCalendar.attendees.length; i++) {
      if (!eventCalendar.attendees[i].organizer) {
        attendees.push({
          'email': eventCalendar.attendees[i].email
        });
      }
    }
  }

  $scope.attachments = angular.copy(eventCalendar.attachments);

  if (eventInfo && eventInfo.fileNames) {
    $scope.fileNames = JSON.parse(eventInfo.fileNames);
  } else {
    $scope.fileNames = [];
  }

  // Init model
  $scope.params = {
    summary: eventCalendar.summary || '',
    location: eventCalendar.location || '',
    description: eventCalendar.description || '',
    dateStart: new Date(start).format('mm/dd/yyyy'),
    dateEnd: new Date(end).format('mm/dd/yyyy'),
    timeStart: new Date(start).format('shortTime'),
    timeEnd: new Date(end).format('shortTime'),
    attendees: attendees,
    files: []
  };

  $scope.newValues = {
    place: $scope.params.location
  };

  // Update Location
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
  function handleFiles(files, emails, resource) {
    if (files[0]) {
      var fileInfo = files[0];
      files.splice(0, 1);

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
      // Update Event to google calender
      // Save to database
      resource.attachments = $scope.attachments;

      GCalendarService.patchEvent({
        calendarId: calendarId,
        eventId: eventCalendar.id,
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

  // Update Event
  $scope.editEvent = function (isValid) {
    $scope.showValid = true;
    if (isValid) {
      var resource = angular.copy($scope.params);
      if ($scope.allDay) {
        resource.start = {
          date: new Date(resource.dateStart).format('yyyy-mm-dd')
        };
        resource.end = {
          date: new Date(resource.dateEnd).format('yyyy-mm-dd')
        };
      } else {
        resource.start = {
          dateTime: new Date(new Date(resource.dateStart).format('mm/dd/yyyy') + ' ' + utils.convertTo24Hour(resource.timeStart)).toISOString()
        };
        resource.end = {
          dateTime: new Date(new Date(resource.dateEnd).format('mm/dd/yyyy') + ' ' + utils.convertTo24Hour(resource.timeEnd)).toISOString()
        };
      }

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

  // Delete event
  $scope.deleteEvent = function () {
    // Remove from database
    healthScreenings.removeByEventGoogleCalendarId(eventCalendar.id);
    
    // Remove from google calender
    GCalendarService.deleteEvent({
      calendarId: calendarId,
      eventId: eventCalendar.id,
      sendNotifications: true
    }).then(function (response) {
      $modalInstance.close(response);
    }, function (error) {
      $modalInstance.dismiss(error);
    });
  };

  // Delete Attachment File
  $scope.deleteAttachment = function (attachment) {
    $scope.attachments = _.without($scope.attachments, attachment);
    $scope.fileNames = _.without($scope.fileNames, _.findWhere($scope.fileNames, {'fileId': attachment.fileId}));
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
