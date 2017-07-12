angular.module('directive.spouse-list', [])

/***
 * <spouse-list data-form="form" data-participant-info="participantInfo"  data-status="status" data-list-spouse="spouseList" data-callback="callback" data-env="env"></spouse-list>
 */
.directive('spouseList', function() {
  return {
    restrict: 'EA',
    scope: {
      form: '=',
      participantInfo: '=',
      listSpouse: '=',
      status: '=',
      env: '=',
      callback: '&'
    },
    templateUrl: 'directives/form-input/spouse-list/spouse-list.tpl.html',
    controller: function($scope, $modal, $state, dependents) {

      $scope.scopeParent = $scope.$parent;
      $scope.participantId = $scope.participantInfo.id;

      $scope.createOrUpdateSpouse = function() {
        $scope.modal = $modal.open({
          controller: 'ManageSpouseController',
          templateUrl: 'modules/user-manager/spouse/manage-spouse/manage-spouse.tpl.html',
          size: 'md',
          resolve: {
            participantInfo: function() {
              return $scope.participantInfo;
            },
            spouseList: function() {
              return $scope.listSpouse;
            }
          }
        });
        $scope.modal.result.then(function(listSpouse) {
          $scope.listSpouse = listSpouse;
          $scope.callback()(listSpouse);
        }, function() {
          participants.getListSpouse($scope.participantId).then(function(listSpouse) {
            $scope.listSpouse = listSpouse;
            $scope.callback()(listSpouse);
          });
        });
      };

    },
    link: function($scope, $element, $attrs) {
      $scope.readonly = $attrs.hasOwnProperty('readonly') && $attrs.readonly !== 'false';
    }
  };
});