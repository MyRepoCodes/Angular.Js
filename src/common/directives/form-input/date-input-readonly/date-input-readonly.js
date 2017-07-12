angular.module('directive.date-input-readonly', [])

.value('dateInputReadonlyId', 0)

/***
 * <date-input-readonly data-form="form" data-ng-model="model" data-control-label="name" data-env="env" data-row="row" data-tabindex="tabindex"></date-input-readonly>
 * element total: 1
 */
.directive('dateInputReadonly', function(PATTERNREGEXS, DATECONFIGS, utils, dateInputReadonlyId) {
  return {
    require: 'ngModel',
    restrict: 'EA',
    scope: {
      form: '=form',
      ngModel: '=ngModel',
      env: '=env',
    },
    templateUrl: 'directives/form-input/date-input-readonly/date-input-readonly.tpl.html',
    link: function($scope, $element, $attrs) {
      $scope.patternRegexs = PATTERNREGEXS;
      $scope.inputId = dateInputReadonlyId++;
      $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
      $scope.controlLabel = $attrs.controlLabel;

      $scope.row = $attrs.row;
      $attrs.$observe('row', function(newVal) {
        $scope.row = newVal;
      });

      $scope.tabindex = 0;
      if ($attrs.hasOwnProperty('tabindex')) {
        $scope.tabindex = parseInt($attrs.tabindex);
        $attrs.$observe('tabindex', function(newVal) {
          $scope.tabindex = parseInt(newVal);
        });
      }

      $scope.dateElement = {
        month: '',
        date: '',
        year: ''
      };

      // Init Date Element
      function setDateElementInput(date) {
        date = new Date(date);

        $scope.dateElement.month = (date.getMonth() + 1).toString();
        $scope.dateElement.date = (date.getDate()).toString();
        $scope.dateElement.year = date.getFullYear();

        if ($scope.dateElement.month.length === 1) {
          $scope.dateElement.month = '0' + $scope.dateElement.month;
        }

        if ($scope.dateElement.date.length === 1) {
          $scope.dateElement.date = '0' + $scope.dateElement.date;
        }
      }

      // Update date input (month - date - year) by ngModel
      $scope.$watch('ngModel', function(newVal) {
        if (_.isDate(newVal)) {
          setDateElementInput(newVal);
          $scope.dirtyDateElementMonth = true;
          $scope.dirtyDateElementDate = true;
          $scope.dirtyDateElementYear = true;
        } else {
          $scope.dateElement.month = '';
          $scope.dateElement.date = '';
          $scope.dateElement.year = '';
        }
      });

      // Update params by date input (month - date - year)
      $scope.$watch('dateElement', function(newVal, oldVal) {
        if (newVal.date !== oldVal.date || newVal.month !== oldVal.month || newVal.year !== oldVal.year) {
          var month = $scope.dateElement.month;
          var date = $scope.dateElement.date;
          var year = $scope.dateElement.year;
          if (month && date && year) {
            var dayString = month.toString() + '/' + date.toString() + '/' + year.toString();
            var day = new Date(dayString);
            if (utils.isDate(dayString) && day !== $scope.ngModel) {
              $scope.ngModel = day;
            }
          }
        }
      }, true);
    }
  };
});