angular.module('app.modules.health-screening.participant', [
  'app.modules.health-screening.view-event'
])

.directive('uiGCalendarParticipant', function () {
  return {
    restrict: 'EA',
    scope: true,
    templateUrl: 'modules/health-screening/participant/participant.tpl.html',
    controller: function ($scope, $compile, $modal, uiCalendarConfig, healthScreenings, utils ) {
      this.uiCalendarConfig = uiCalendarConfig;

      // Init model
      $scope.startDate = utils.firstDayOfMonth(new Date());
      $scope.endDate = utils.lastDayOfMonth(new Date());

      /* Render Tooltip */
      $scope.eventRender = function (event, element, view) {
        element.attr({
          'tooltips': '',
          'tooltip-content': event.title
        });
        $compile(element)($scope);
      };

      /* Event Click For View Event */
      $scope.eventClick = function (date, jsEvent, view) {
        $scope.viewEvent(date.data);
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
          eventRender: $scope.eventRender,
          eventClick: $scope.eventClick
        }
      };

      /* Event source that calls a function on every view switch */
      $scope.eventViewSwitch = function (start, end, timezone, callback) {
        var startDate = new Date(start);
        var endDate = new Date(end);
        if (startDate.toISOString() !== $scope.startDate.toISOString() && endDate.toISOString() !== $scope.endDate.toISOString()) {
          $scope.startDate = startDate;
          $scope.endDate = endDate;
          $scope.loadEvents($scope.startDate, $scope.endDate);
        }
      };

      /* Event sources array */
      $scope.eventSources = [[], $scope.eventViewSwitch];

      /* Add custom event*/
      $scope.addEvent = function (event) {
        $scope.eventSources[0].push(event);
      };

      // Load event
      $scope.loadEvents = function (timeMin, timeMax) {
        healthScreenings.getEvents({
          startTime: new Date(timeMin).format('yyyy-mm-dd'),
          endTime: new Date(timeMax).format('yyyy-mm-dd')
        }).then(function (response) {
          for (var i = 0; i < response.length; i++) {
            $scope.addEvent({
              data: response[i],
              title: response[i].summary,
              start: new Date(response[i].startTime),
              end: new Date(response[i].endTime),
              allDay: false
            });
          }
          uiCalendarConfig.calendars['myCalendar'].fullCalendar('refetchEvents');
        });
      };

      // View Event
      $scope.viewEvent = function (eventInfo) {
        $scope.modal = $modal.open({
          controller: 'HealthScreeningViewEventController',
          templateUrl: 'modules/health-screening/view-event/view-event.tpl.html',
          size: 'md',
          resolve: {
            eventInfo: function () {
              return eventInfo;
            }
          }
        });
      };

      // Refresh
      $scope.refresh = function () {
        $scope.loadEvents($scope.startDate, $scope.endDate);
      };

      // Init
      function init() {
        $scope.loadEvents($scope.startDate, $scope.endDate);
      }

      init();
    },
    link: function ($scope, $element) {

    }
  };
});