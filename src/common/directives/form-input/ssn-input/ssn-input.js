angular.module('directive.ssn-input', [])

  .value('ssnInputId', 0)

  /***
   * <ssn-input data-form="form" data-ng-model="model" data-input-id="100" is-show-full="false" data-control-label="Social Security Number" data-env="env" data-row="row" data-tabindex="tabindex" required readonly data-is-show-full="true"></ssn-input>
   * element total: 1
   * tabindex total: 1
   */
  .directive('ssnInput', function (PATTERNREGEXS, utils, $timeout, ssnInputId) {
    return {
      require: 'ngModel',
      restrict: 'EA',
      scope: {
        form: '=form',
        ngModel: '=ngModel',
        env: '=env'
      },
      templateUrl: 'directives/form-input/ssn-input/ssn-input.tpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.patternRegexs = PATTERNREGEXS;
        $scope.inputId =  ssnInputId++;
        $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
        $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
        $scope.controlLabel = $attrs.controlLabel;
        $scope.isShowFull = $attrs.isShowFull ? $attrs.isShowFull : "false";

        $scope.row = 'ssn_' + $scope.inputId;
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

        $timeout(function () {
          utils.resetForm($scope.form);
        });
      }
    };
  })

  /***
   * <ssn-short-input data-form="form" data-ng-model="model" data-control-label="Insured's Last 4 digits of SS#" data-env="env" data-row="row" data-tabindex="tabindex" required></ssn-short-input>
   * element total: 1
   * tabindex total: 1
   */
  .directive('ssnShortInput', function (PATTERNREGEXS, utils, $timeout, ssnInputId) {
    return {
      require: 'ngModel',
      restrict: 'EA',
      scope: {
        form: '=form',
        ngModel: '=ngModel',
        env: '=env'
      },
      templateUrl: 'directives/form-input/ssn-input/ssn-short-input.tpl.html',
      controller: function ($scope) {
        $scope.currentLength = function (input) {
          var length = (parseInt(input.$viewValue)).toString().length;

          return length.toString();
        };
      },
      link: function ($scope, $element, $attrs) {
        $scope.patternRegexs = PATTERNREGEXS;
        $scope.inputId = ssnInputId++;
        $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
        $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
        $scope.controlLabel = $attrs.controlLabel;

        $scope.row = 'ssnShort_' + $scope.inputId;
        if ($attrs.hasOwnProperty('row')) {
          $scope.row = $attrs.row;
          $attrs.$observe('row', function (newVal) {
            $scope.row = newVal;
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
        
        $scope.tabindex = 0;
        if ($attrs.hasOwnProperty('tabindex')) {
          $scope.tabindex = parseInt($attrs.tabindex);
          $attrs.$observe('tabindex', function (newVal) {
            $scope.tabindex = parseInt(newVal);
          });
        }

        $timeout(function () {
          utils.resetForm($scope.form);
        });
      }
    };
  });
