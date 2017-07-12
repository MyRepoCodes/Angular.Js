angular.module('app.modules.imp-documents.select-documents', [])

.controller('ImpDocumentsSelectDocumentsController', function($scope, $modalInstance, scope, type, documentList) {
  $scope.type = type;
  $scope.documentList = [];
  $scope.selectedList = [];

  documentList = angular.copy(documentList);
  for (var i = 0; i < documentList.length; i++) {
    documentList[i].orderBy = i;
    $scope.documentList.push(documentList[i]);
  }

  //function render url
  function renderUrl(selectedList) {
    var ids = [];
    for (var i = 0; i < selectedList.length; i++) {
      ids.push(selectedList[i].id);
    }

    if (selectedList.length !== 0) {
      $scope.url = scope.baseURL + '/documents/download?documentIds=' + ids.join(',');
    } else {
      $scope.url = "";
    }
  }

  // Selected document
  $scope.onSelected = function(document) {
    // Add selectedList
    if ($scope.selectedList.indexOf(document) === -1) {
      $scope.selectedList.push(document);
    }
    // Remove documentList
    for (var i = 0; i < $scope.documentList.length; i++) {
      if ($scope.documentList[i] === document) {
        $scope.documentList.splice(i, 1);
      }
    }

    renderUrl($scope.selectedList);

  };

  // Unselected document
  $scope.onUnselected = function(document) {
    // Add documentList
    if ($scope.documentList.indexOf(document) === -1) {
      $scope.documentList.push(document);
      $scope.documentList.sort(function(a, b) {
        if (a['orderBy'] == b['orderBy']) {
          return 0;
        } else if (a['orderBy'] > b['orderBy']) {
          return 1;
        }
        return -1;
      });
    }
    // Remove selectedList
    for (var i = 0; i < $scope.selectedList.length; i++) {
      if ($scope.selectedList[i] === document) {
        $scope.selectedList.splice(i, 1);
      }
    }

    renderUrl($scope.selectedList);
  };

  // Submit
  $scope.submit = function() {
    $scope.showValid = true;
    if ($scope.selectedList.length > 0) {
      $scope.showValid = false;
      $modalInstance.close($scope.selectedList);
    }
  };

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
});
