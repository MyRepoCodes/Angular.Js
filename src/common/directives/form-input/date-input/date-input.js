angular.module('directive.date-input', [])

  .value('dateInputId', 0)

  /***
   * <date-input data-form="form" data-is-show-calendar="true" data-ng-model="model" data-control-label="name" data-param-type="birthday" data-values="env" data-date-options="dateOptions"  data-has-error="{{ hasError }}" data-row="row" data-tabindex="tabindex" required readonly></date-input>
   * element total: 3
   * tabindex total: 1
   */

  .directive('dateInput', function (PATTERNREGEXS, DATECONFIGS, utils, dateInputId, $timeout) {
    return {
      require: 'ngModel',
      restrict: 'EA',
      scope: {
        form: '=form',
        ngModel: '=ngModel',
        env: '=values',
        dateOptions: '@',
        paramType: '@',
      },
      templateUrl: 'directives/form-input/date-input/date-input.tpl.html',
      controller: function ($scope) {
        var dateOptions = $scope.$parent.$eval($scope.dateOptions);
        var lastDate = new Date(utils.getBeforeDate(new Date(), 1));

        if (!dateOptions) {
          $scope.dateOptions = _.clone(DATECONFIGS.dateOptions);
        } else {
          $scope.dateOptions = _.clone(dateOptions);
        }
        if ($scope.paramType === 'birthday') {
          $scope.dateOptions = _.clone(DATECONFIGS.dateOptions);
          $scope.dateOptions['max-date'] = "'" + lastDate.format('yyyy-mm-dd') + "'";

          if (!$scope.ngModel) {
            $scope.ngModel = DATECONFIGS.dateStart;
          }
        } else if ($scope.paramType === 'signedDate') {
          if (!$scope.ngModel) {
            $scope.ngModel = utils.parseDateOfBirthToDatePacker(utils.getCurrentDateString());
          }
        }



        $scope.isError = function () {
          if ($scope.paramType === 'birthday' && _.isDate($scope.ngModel)) {
            var l = new Date(lastDate.format('yyyy-mm-dd'));
            var d = new Date($scope.ngModel.format('yyyy-mm-dd'));

            if (d.getTime() > l.getTime()) {
              return true;
            }
          }

          return false;
        };
      },
      link: function ($scope, $element, $attrs) {
        $scope.patternRegexs = PATTERNREGEXS;
        $scope.inputId = dateInputId++;
        //$scope.required = $attrs.required;
        $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
        $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
        $scope.isShowCalendar = $attrs.isShowCalendar ? $attrs.isShowCalendar : "true";
        $scope.controlLabel = $attrs.controlLabel;


        $scope.row = 'dateInput_' + $scope.inputId;
        if ($attrs.hasOwnProperty('row')) {
          $scope.row = $attrs.row;
          $attrs.$observe('row', function (newVal) {
            $scope.row = newVal;
          });
        }

        $scope.tabindex = 0;
        if ($attrs.hasOwnProperty('tabindex')) {
          $scope.tabindex = parseInt($attrs.tabindex);
          $attrs.$observe('tabindex', function (newVal) {
            $scope.tabindex = parseInt(newVal);
          });
        }

        if ($scope.readonly) {
          $attrs.$observe('readonly', function (newVal) {
            if (newVal === 'true') {
              $scope.readonly = true;
            } else if (newVal === 'false') {
              $scope.readonly = false;
            }
          });
        }

        $scope.maxDate = $scope.dateOptions["max-date"];
        $scope.minDate = $scope.dateOptions["min-date"];

        $scope.hasError = false;
        if ($attrs.hasOwnProperty('hasError')) {
          $scope.hasError = $scope.$eval($attrs.hasError);
          $attrs.$observe('hasError', function (hasError) {
            $scope.hasError = $scope.$eval(hasError);
          });
        }

        $timeout(function () {
          utils.resetForm($scope.form);
        });

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

        function setDateDefault() {
          $scope.dateElement.year = '';
        }

        // Validate
        function validation() {
          var year = parseInt($scope.dateElement.year);
          var month = parseInt($scope.dateElement.month);
          var date = parseInt($scope.dateElement.date);
          if (!_.isNaN(year) && !_.isNaN(month) && !_.isNaN(date)) {
            var dayString = year.toString() + '-' + month.toString() + '-' + date.toString();
            if (utils.isDate(dayString)) {
              var currentDate = new Date(dayString);
              if ($scope.minDate) {
                var minDate = new Date($scope.minDate);
                if (currentDate < minDate) {
                  setDateElementInput(minDate);
                }
              }
              if ($scope.maxDate) {
                var maxDate = new Date($scope.maxDate);
                if (currentDate > maxDate) {
                  setDateDefault();
                }
              }
              if ($scope.paramType == 'birthday') {

              }
            }
          }
        }

        // Update date input (month - date - year) by ngModel
        $scope.$watch('ngModel', function (newVal) {
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
        $scope.$watch('dateElement', function (newVal, oldVal) {
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

        $scope.changeDateElementMonth = function (month) {
          $scope.dirtyDateElementMonth = false;

          if (month && month.indexOf('_') === -1) {
            month = parseInt(month);
            if (!month || (month && month < 1)) {
              $scope.dateElement.month = '01';
            } else if (month && month > 12) {
              $scope.dateElement.month = '12';
            }
            validation();
            var year = parseInt($scope.dateElement.year);
            var date = parseInt($scope.dateElement.date);
            if (year && date && date > 28) {
              while (!utils.validateDate($scope.dateElement.month, $scope.dateElement.date, $scope.dateElement.year)) {
                date = (parseInt($scope.dateElement.date) - 1).toString();
                $scope.dateElement.date = date;
              }
            }

            $scope.dirtyDateElementMonth = true;
          }
        };

        $scope.changeDateElementDate = function (date) {
          $scope.dirtyDateElementDate = false;

          if (date && date.indexOf('_') === -1) {
            date = parseInt(date);
            if (!date || (date && date < 1)) {
              $scope.dateElement.date = '01';
            } else if (date && date > 31) {
              $scope.dateElement.date = '31';
            }
            validation();
            var year = parseInt($scope.dateElement.year);
            var month = parseInt($scope.dateElement.month);
            if (year && month && date > 28) {
              while (!utils.validateDate($scope.dateElement.month, $scope.dateElement.date, $scope.dateElement.year)) {
                date = (parseInt($scope.dateElement.date) - 1).toString();
                $scope.dateElement.date = date;
              }
            }

            $scope.dirtyDateElementDate = true;
          }
        };

        $scope.changeDateElementYear = function (year) {
          $scope.dirtyDateElementYear = false;

          if (year && year.indexOf('_') === -1) {
            validation();

            var month = parseInt($scope.dateElement.month);
            var date = parseInt($scope.dateElement.date);
            if (month && date && date > 28) {
              while (!utils.validateDate($scope.dateElement.month, $scope.dateElement.date, $scope.dateElement.year)) {
                date = (parseInt($scope.dateElement.date) - 1).toString();
                $scope.dateElement.date = date;
              }
            }
            $scope.dirtyDateElementYear = true;
          }
        };

        // Date picker option
        $scope.dateElementOptions = {
          opened: false,
        };

        $scope.dateElementOpen = function ($event) {

          //Set position
          if ((window.innerHeight - $event.clientY) < 300) {
            $element.addClass("datepicker-box-on-bottom");
          }

          if ($scope.readonly) {
            $scope.dateElementOptions.opened = false;
            return false;
          }

          var month = $scope.dateElement.month;
          var date = $scope.dateElement.date;
          var year = $scope.dateElement.year;
          if (month && date && year) {
            var dayString = month.toString() + '/' + date.toString() + '/' + year.toString();
            if (utils.isDate(dayString)) {
              $scope.ngModel = new Date(dayString);
            }
          }

          if (!!$scope.ngModel && utils.isDate($scope.ngModel)) {
            setDateElementInput($scope.ngModel);
          }

          // Set date default if ngModel is valid
          if (_.isString($scope.ngModel) && utils.isDate($scope.ngModel)) {
            if ($scope.paramType == 'birthday') {
              $scope.ngModel = utils.dateServerToLocalTime($scope.ngModel);
            } else {
              $scope.ngModel = new Date($scope.ngModel);
            }
          }

          $event.preventDefault();
          $event.stopPropagation();

          $scope.dateElementOptions.opened = true;
        };

        var $month = $($('input', $element)[0]);
        var $date = $($('input', $element)[1]);
        var $year = $($('input', $element)[2]);

        $month.bind('input', function () {
          if ($scope.dateElement.month) {
            $date.focus();
          }
        });

        $date.bind('input', function () {
          if ($scope.dateElement.date) {
            $year.focus();
          }
        });

        $year.bind('input', function () {

        });
      }
    };
  });