angular.module('directive.relation-to-participant', [])

  .value('relationToParticipantId', 0)

  /***
   * <relation-to-participant  data-form="form" data-ng-model="model" data-control-label="Relation To Participant " data-env="env" data-row="row" data-tabindex="tabindex" required></relation-to-participant>
   * element total: 1
   * tabindex total: 1
   */
  .directive('relationToParticipant', function (relationToParticipantId) {
    return {
      require: 'ngModel',
      restrict: 'EA',
      scope: {
        form: '=form',
        ngModel: '=ngModel',
        env: '=env'
      },
      templateUrl: 'directives/form-input/relation-to-participant/relation-to-participant.tpl.html',
      controller: function ($scope) {
        if (_.isNumber($scope.ngModel)) {
          $scope.ngModel = $scope.ngModel.toString();
        }
      },
      link: function ($scope, $element, $attrs) {
        $scope.inputId = relationToParticipantId++;
        $scope.required = $attrs.hasOwnProperty('required') && $attrs.required !== 'false';
        $scope.isReadonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
        $scope.controlLabel = $attrs.controlLabel;

        $scope.relationToParticipantList = {
          'A': 'Adopted Child',
          'B': 'Life Insurance Benefeficary',
          'C': 'Child',
          'D': 'SameSex Domestic Partner',
          'F': 'Foster Child',
          'G': 'Grandchild',
          'L': 'Common Law Spouse',
          'O': 'Other',
          'S': 'Spouse',
          'T': 'Step Child',
          'X': 'Ex-spouse',
        };

        $scope.row = $attrs.row;
        $attrs.$observe('row', function (newVal) {
          $scope.row = newVal;
        });

        $scope.tabindex = 0;
        if ($attrs.hasOwnProperty('tabindex')) {
          $scope.tabindex = parseInt($attrs.tabindex);
          $attrs.$observe('tabindex', function (newVal) {
            $scope.tabindex = parseInt(newVal);
          });
        }
      }
    };
  });