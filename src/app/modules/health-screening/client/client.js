angular.module('app.modules.health-screening.client', [
  'app.modules.health-screening.create-event',
  'app.modules.health-screening.edit-event'
])

.directive('uiGCalendarClient', function (CONFIGS, GAuthorize, GCalendarService, GDriverService, security, utils) {
  return {
    restrict: 'EA',
    scope: {
      callbackFn: '&'
    },
    templateUrl: 'modules/health-screening/client/client.tpl.html',
    controller: function ($scope, $compile, $modal, uiCalendarConfig, healthScreenings) {
      this.uiCalendarConfig = uiCalendarConfig;

      // Init model
      $scope.listCalendars = [];
      $scope.listEvents = [];
      $scope.calendarId = !!CONFIGS.google.calendarId ? CONFIGS.google.calendarId : security.currentUser.email;
      $scope.gUserProfile = null;
      $scope.loaded = false;
      $scope.isAuthenticated = false;
      $scope.isClickAuthButton = false;
      $scope.isClickAuthButton = false;
      $scope.initUser = false;
      $scope.emails = [];
      $scope.startDate = utils.firstDayOfMonth(new Date());
      $scope.endDate = utils.lastDayOfMonth(new Date());

      // Get emails of Participant, Health Coach, Health Coach manager, Client Manager By Client
      healthScreenings.getAllEmail().then(function (response) {
        $scope.emails = response;
      });

      function getTheUserProfile() {
        GAuthorize.getTheUserProfile().then(function (profileResponse) {
          $scope.gUserProfile = profileResponse;
          $scope.initUser = true;
        }, function () {
          $scope.initUser = true;
        });
      }

      // Init Google API
      $scope.handleClientLoad = function () {
        GAuthorize.handleClientLoad().then(function () {
          getTheUserProfile();
        });
      };

      $scope.$watch(function () {
        return GAuthorize.isAuthenticated();
      }, function () {
        $scope.isAuthenticated = GAuthorize.isAuthenticated();
      });

      // Authorize
      $scope.authorize = function () {
        GAuthorize.handleAuthClick().then(function () {
          $scope.isClickAuthButton = true;
          getTheUserProfile();
        }, function () {
          $scope.isClickAuthButton = true;
        });
      };

      // Check Auth
      $scope.checkAuth = function () {
        var isAuthenticated = $scope.isAuthenticated && ($scope.gUserProfile && $scope.gUserProfile.email === security.currentUser.email);
        if (!isAuthenticated) {
          GAuthorize.logout();
        }
        return isAuthenticated;
      };

      /* Event Click For Edit Event*/
      $scope.eventClick = function (date, jsEvent, view) {
        $scope.editEvent(date.data);
      };

      /* Event day */
      $scope.dayClick = function (date, jsEvent, view) {

      };

      /* Render Tooltip */
      $scope.eventRender = function (event, element, view) {
        element.attr({
          'tooltips': '',
          'tooltip-content': event.title
        });
        $compile(element)($scope);
      };

      /* Config object */
      $scope.uiConfig = {
        calendar: {
          height: 450,
          editable: false,
          header: {
            left: 'title',
            center: '',
            right: 'today prev,next'
          },
          eventClick: $scope.eventClick,
          eventRender: $scope.eventRender,
          dayClick: $scope.dayClick
        }
      };

      /* Event source that calls a function on every view switch */
      $scope.eventViewSwitch = function (start, end, timezone, callback) {
        var startDate = new Date(start);
        var endDate = new Date(end);
        if ($scope.loaded && startDate.toISOString() !== $scope.startDate.toISOString() && endDate.toISOString() !== $scope.endDate.toISOString()) {
          $scope.startDate = startDate;
          $scope.endDate = endDate;
          $scope.loadEvents($scope.calendarId, $scope.startDate, $scope.endDate);
        }
      };

      /* Event sources array */
      $scope.eventSources = [[], $scope.eventViewSwitch];

      /* Add custom event*/
      $scope.addEvent = function (event) {
        $scope.eventSources[0].push(event);
      };

      /* Remove event */
      $scope.removeEvent = function (index) {
        $scope.eventSources[0].splice(index, 1);
      };

      // Load calendar
      $scope.loadCalendars = function () {
        GCalendarService.listCalendars().then(function (response) {
          $scope.listCalendars = response;
          if ($scope.listCalendars.length > 0) {
            $scope.calendar = $scope.listCalendars[0];
            $scope.calendarId = $scope.calendar.id;
            $scope.loadEvents($scope.calendarId, $scope.startDate, $scope.endDate);
          }
        });
      };

      // Load event
      $scope.loadEvents = function (calendarId, timeMin, timeMax) {
        var option = {
          calendarId: calendarId,
          timeMin: (new Date(timeMin)).toISOString(),
          timeMax: (new Date(timeMax)).toISOString(),
          showDeleted: false,
          singleEvents: true,
          //maxResults: 10,
          orderBy: 'startTime'
        };

        if ($scope.loaded) {
          GCalendarService.listEvents(option).then(function (response) {
            for (var i = 0; i < response.length; i++) {
              var start, end;
              start = response[i].start.date || response[i].start.dateTime;
              end = response[i].end.date || response[i].end.dateTime;
              $scope.addEvent({
                data: response[i],
                title: response[i].summary,
                start: new Date(start),
                end: !!end ? new Date(end) : undefined,
                allDay: !!response[i].start.date,
                //url: 'http://google.com/',
                //className: ['openSesame']
              });
            }
            uiCalendarConfig.calendars['myCalendar'].fullCalendar('refetchEvents');
          });
        }
      };

      // Callback parent controller
      function callbackFn() {
        if (typeof $scope.callbackFn === 'function') {
          $scope.callbackFn({arg: 'test'});
        }
      }

      // GCalendar ready
      $scope.$on('GCalendar:loaded', function () {
        $scope.loaded = true;
        init();
      });

      // Init
      function init() {
        $scope.loadEvents($scope.calendarId, $scope.startDate, $scope.endDate);
        callbackFn();
      }

      // Refresh
      $scope.refresh = function () {
        $scope.loadEvents($scope.calendarId, $scope.startDate, $scope.endDate);
      };

      // Open Error
      $scope.openError = function (message) {
        $scope.modal = $modal.open({
          controller: 'ErrorController',
          templateUrl: 'modules/alert/error.tpl.html',
          size: 'sm',
          resolve: {
            message: function () {
              return message;
            }
          }
        });
      };

      // Fn Create Event
      $scope.createEvent = function () {
        $scope.modal = $modal.open({
          controller: 'HealthScreeningCreateEventController',
          templateUrl: 'modules/health-screening/create-event/create-event.tpl.html',
          size: 'md',
          resolve: {
            calendarId: function () {
              return $scope.calendarId;
            },
            emails: function () {
              return $scope.emails;
            }
          }
        });
        $scope.modal.result.then(function (response) {
          if (response) {
            $scope.refresh();
          }
        }, function (error) {
          if (!!error && angular.isObject(error)) {
            if (error.code === 404) {
              $scope.openError('Google account does not match your email. Please log out and log in google account again.');
            } else {
              $scope.openError(error.message);
            }
          }
        });
      };

      // Edit Or Delete Event
      $scope.editEvent = function (eventCalendar) {
        $scope.modal = $modal.open({
          controller: 'HealthScreeningEditEventController',
          templateUrl: 'modules/health-screening/edit-event/edit-event.tpl.html',
          size: 'md',
          resolve: {
            calendarId: function () {
              return $scope.calendarId;
            },
            eventCalendar: function () {
              return eventCalendar;
            },
            emails: function () {
              return $scope.emails;
            },
            eventInfo: function () {
              return healthScreenings.getByEventGoogleCalendarId(eventCalendar.id).then(function (response) {
                return response;
              }, function () {
                return {};
              });
            }
          }
        });
        $scope.modal.result.then(function (response) {
          if (response) {
            $scope.refresh();
          }
        }, function (error) {
          if (!!error && angular.isObject(error)) {
            if (error.code === 404) {
              $scope.openError('Google account does not match your email. Please log out and log in google account again.');
            } else {
              $scope.openError(error.message);
            }
          }
        });
      };
    },
    link: function ($scope, $element) {
      // Init Google Library
      window.handleClientLoad = function () {
        $scope.handleClientLoad();
      };

      // Run calender
      var js = document.createElement('script');
      js.type = 'text/javascript';
      js.src = 'https://apis.google.com/js/client.js?onload=handleClientLoad';

      $element.append(js);
    }
  };
});