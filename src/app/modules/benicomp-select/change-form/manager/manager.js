angular.module('app.modules.benicomp-select.change-form-manager', [
  'app.modules.benicomp-select.change-form-manager.view-result'
])

  .config(function ($stateProvider) {
    $stateProvider
      .state('loggedIn.modules.change-form-manager', {
        url: '/change-form-manager',
        views: {
          'main-content': {
            templateUrl: 'modules/benicomp-select/change-form/manager/manager.tpl.html',
            controller: 'ChangeFormManagerController'
          }
        }
      });
  })

  .controller('ChangeFormManagerController', function ($scope, $timeout, $state, $q, CONFIGS, security, $modal, $translate, ngTableParams, ObjectChangeForms, users, dependents, spouses, participants, sync, utils) {
    $scope.NgTableParams = ngTableParams;
    $scope.ids = "";
    $scope.checkboxes = { 'checked': false, items: [] };
    $scope.listIDDocuments = "";
    $scope.checkboxesDocuments = { 'checked': false, items: [] };
    $scope.listData = [];
    $scope.domain = CONFIGS.baseURL() + '/documents/download?documentIds=';

    // Action
    $scope.action = {
      download: "Down"
    };

    // Filter here
    $scope.filterSurvey = {
      status: 'active'
    };

    // Paging from api
    $scope.loading = true;
    $scope.tableParams = new $scope.NgTableParams({
      page: 1,   // show first page
      count: CONFIGS.countPerPage,  // count per page
      filter: $scope.filterSurvey
    }, {
        //counts: [], // hide page counts control
        //total: 1,  // value less than count hide pagination
        getData: function ($defer, params) {
          function pagination() {
            var sorting = params.sorting();
            var filter = params.filter();
            var params2 = {
              page: params.page(),
              pageSize: params.count(),
              embed: ''
            };

            var headers = {
              'X-Filter': JSON.stringify([
                {
                  property: "isDeleted",
                  operator: "equal",
                  condition: "or",
                  value: (filter.status === 'active') ? false : true
                }
              ])
            };

            // Sort
            for (var s in sorting) {
              if (sorting[s] === 'asc') {
                params2.sort = s;
              } else if (sorting[s] === 'desc') {
                params2.sort = '-' + s;
              }
              break;
            }

            if (!params2.sort) {
              sorting['createdDate'] = 'desc';
              params2.sort = '-createdDate';
            }

            // Filter
            if (!!filter.answer) {
              params2.customSearch = filter.answer;
            }

            $scope.loading = true;
            ObjectChangeForms.get(params2, headers, false).then(function (data) {
              params.total(data.totalCount);
              $scope.listData = data.data;
              $scope.loading = false;

              //reset
              resetCheckBox();


              $defer.resolve($scope.listData);
            }, function (error) {
              $scope.loading = false;
            });
          }

          params.data = [];
          pagination();
        }
      });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.reload();
    };

    // reset check box
    function resetCheckBox() {
      $scope.ids = "";
      $scope.checkboxes = { 'checked': false, items: [] };
      $scope.listIDDocuments = "";
      $scope.checkboxesDocuments = { 'checked': false, items: [] };
    }

    // update status
    $scope.updateStatus = function (data) {
      var tempData = {
        id: data.id,
        status: data.status
      };
      ObjectChangeForms.put(tempData).then(function (result) {
        $scope.reload();
      }, function (err) {
      });
    };

    $scope.remove = function (claimItem) {
      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function () {
            return {
              title: "Delete Change Form",
              summary: false,
              style: 'yesNo',
              message: "Are you sure you want to delete this Change Form?"
            };
          }
        }
      });
      $scope.modal.result.then(function (result) {
        if (result === true) {
          ObjectChangeForms.remove(claimItem.id).then(function () {
            for (var i = 0; i < $scope.listData.length; i++) {
              if ($scope.listData[i].id === claimItem.id) {
                $scope.listData.splice(i, 1);
              }
            }
            $scope.modal = $modal.open({
              controller: 'AlertController',
              templateUrl: 'modules/alert/alert.tpl.html',
              size: 'sm',
              resolve: {
                data: function () {
                  return {
                    title: 'Success',
                    summary: false,
                    style: 'ok',
                    message: "Change forms successfully deleted."
                  };
                }
              }
            });
            $scope.modal.result.then(function () {
              $scope.reload();
            });
          }, function () {
            $modal.open({
              controller: 'AlertController',
              templateUrl: 'modules/alert/alert.tpl.html',
              size: 'sm',
              resolve: {
                data: function () {
                  return {
                    title: 'Remove Fail',
                    summary: false,
                    style: 'ok',
                    message: "Please try again"
                  };
                }
              }
            });
          });
        }
      });
    };

    // Remove Multiple Users
    $scope.removeMultiple = function (listID) {
      if (listID) {


        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Delete Change Forms",
                summary: false,
                style: 'yesNo',
                message: "Are you sure you want to delete these change Forms?"
              };
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result === true) {
            var object = {
              "Ids": listID.split(",")
            };
            ObjectChangeForms.deleteMulti(object).then(function () {

              $scope.modal = $modal.open({
                controller: 'AlertController',
                templateUrl: 'modules/alert/alert.tpl.html',
                size: 'sm',
                resolve: {
                  data: function () {
                    return {
                      title: 'Success',
                      summary: false,
                      style: 'ok',
                      message: "Change Forms successfully deleted."
                    };
                  }
                }
              });
              $scope.modal.result.then(function () {
                $scope.reload();
              });
            }, function () {
              $modal.open({
                controller: 'AlertController',
                templateUrl: 'modules/alert/alert.tpl.html',
                size: 'sm',
                resolve: {
                  data: function () {
                    return {
                      title: 'Remove Fail',
                      summary: false,
                      style: 'ok',
                      message: "Please try again"
                    };
                  }
                }
              });
            });
          }
        });


      } else {

        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: 'Info',
                summary: false,
                style: 'ok',
                message: "Please select Change Form."
              };
            }
          }
        });

      }
    };

    // view result
    $scope.viewResult = function (data) {

      //set read this item
      security.setReadNotification(ObjectChangeForms, angular.copy(data));

      $scope.modal = $modal.open({
        controller: 'ViewResultCFController',
        templateUrl: 'modules/benicomp-select/change-form/view-result/view-result.tpl.html',
        size: 'lg',
        resolve: {
          data: function () {
            return data;
          },
          scope: function () {
            return $scope;
          }
        }
      });
    };

    function actionDownloadClaims(listID) {

      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: 'sm',
        resolve: {
          data: function () {
            return {
              title: "Download Change Forms",
              summary: false,
              style: 'yesNo',
              message: "Would you like to continue ?"
            };
          }
        }
      });
      $scope.modal.result
        .then(function (result) {
          if (result === true) {
            resetCheckBox();
            window.open($scope.domain + listID, '_blank');
            $timeout(function () {
              $scope.reload();
            }, 2000);
          }
        });


    }


    // function action
    $scope.selectAction = function (actionName, data) {

      if (data) {
        if (actionName === "download") {
          actionDownloadClaims(data);

        } else if (actionName === "accept") {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: "Accept Change Forms",
                  summary: false,
                  style: 'yesNo',
                  message: "Would you like to continue ?"
                };
              }
            }
          });
          $scope.modal.result
            .then(function (result) {
              if (result === true) {
                actionAccept(data);
              }
            });

        } else if (actionName === "sync") {

          $scope.modal = $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: "Sync data",
                  summary: false,
                  style: 'yesNo',
                  message: "Would you like to continue ?"
                };
              }
            }
          });
          $scope.modal.result
            .then(function (result) {
              if (result === true) {
                syncData(data);
              }
            });

        }

      } else {

      }


    };

    /********************************** START: Function SYNC *********************************/
    function syncData(listData) {

      var tmpListId = [];
      angular.forEach(listData, function (params) {
        if (params.selected) {
          tmpListId.push(params.id);
        }
      });

      tmpListId = _.uniq(tmpListId);

      //update status "change form"
      participants.sync({
        "ids": tmpListId,
      }).then(function (result) {

        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: 'Success',
                summary: false,
                style: 'ok',
                message: "Sync successfully"
              };
            }
          }
        });
        $scope.modal.result.then(function () {
          $scope.reload();
        });

      });

      //set read list item
      security.setReadNotification(ObjectChangeForms, angular.copy(tmpListId), 'multiple');

    }

    /********************************** END: Function SYNC **********************************/

    /********************************** START: Function Accept *********************************/
    function actionAccept(listData) {

      var promises = [];
      var promise = "";
      var tmpListId = [];

      angular.forEach(listData, function (params) {
        if (params.selected || params.fromViewResult) { //select item selected or accept from view result

          // For function set isRead data
          if (!params.isRead) {
            tmpListId.push(params.id);
          }

          var data = parseData(params);


          //For Full Change Form
          if (!data.objectChangeFormType) {

            // For group insuredAndDependentInformation
            if (data.typeOfChange.insuredAndDependentInformation) {

              // select nameChange
              if (data.changesToBeMade.nameChange) {
                if (data.nameChange.insured) {
                  actionAcceptUpdatingParticipantName(promises, promise, data);
                }
                if (data.nameChange.dependent) {
                  actionAcceptUpdatingDependentName(promises, promise, data);
                }
              }

              // select contactInformation
              if (data.changesToBeMade.contactInformation) {
                actionAcceptUpdatingContactInformation(promises, promise, data);
              }

              // select participantMarital
              if (data.changesToBeMade.participantMaritalStatus) {
                actionAcceptUpdatingMaritalStatus(promises, promise, data);
              }

              // select addTerminateDependent
              if (data.changesToBeMade.addTerminateDependent) {
                actionAcceptUpdatingAddTerminateDependent(promises, promise, data);
              }


              // select AD&D Beneficiary
              if (data.changesToBeMade.addBeneficiary) {
                actionAcceptUpdatingADDBeneficiary(promises, promise, data);
              }

            }

          } else { //For individual Change Form

            // For Add Term Dependent
            if (data.addTerminateDependentCount && data.addTerminateDependentCount > 0) {
              actionAcceptUpdatingAddTerminateDependent(promises, promise, data);
            } else {

              if (data.objectChangeFormType === 3) {
                updateDependentInfo(promises, promise, data);
              } else if (data.objectChangeFormType === 2) {
                updateSpouseInfo(promises, promise, data);
              } else {

                actionAcceptUpdatingParticipantName(promises, promise, data);
                actionAcceptUpdatingContactInformation(promises, promise, data);
                updatingMaritalStatus(promises, promise, data);
                updatingADDBeneficiary(promises, promise, data);

              }
            }




          }


          //update status "change form"
          ObjectChangeForms.patch({
            "id": data.id,
            "status": 1
          }).then(function () {

          });

        }
      });



      //set read list item
      tmpListId = _.uniq(tmpListId);
      security.setReadNotification(ObjectChangeForms, angular.copy(tmpListId), 'multiple');

      //return promise
      $q.all(promises).then(function (result) {

        var listError = "";
        angular.forEach(result, function (item) {
          if (item !== true) {
            angular.forEach(item, function (error) {
              listError += "<p>- " + error.errorMessage + "</p>";
            });
          }
        });

        if (listError) { //have some error
          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Accept Error',
                  summary: false,
                  style: 'ok',
                  message: "<p>Most of the data has been updated, but some error: </p>" + listError
                };
              }
            }
          });

          $timeout(function () {
            $scope.reload();
          }, 1000);

        } else { //all sucess

          $timeout(function () {
            $scope.reload();
          }, 1000);

          $modal.open({
            controller: 'AlertController',
            templateUrl: 'modules/alert/alert.tpl.html',
            size: 'sm',
            resolve: {
              data: function () {
                return {
                  title: 'Accept Success',
                  summary: false,
                  style: 'ok',
                  message: "The data has been updated"
                };
              }
            }
          });
        }


      }, function (errors) {

        var listError = "";
        angular.forEach(errors, function (item) {
          angular.forEach(item, function (err) {
            listError += "<p>" + err.errorMessage + "</p>";
          });
        });

        $timeout(function () {
          $scope.reload();
        }, 1000);

        $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: 'Accept Error',
                summary: false,
                style: 'ok',
                message: listError
              };
            }
          }
        });


      });
    }

    function parseData(data) {
      var result = angular.copy(data);

      /*-------------- convert string to array --------------*/
      result.nameChangeDependentsList = JSON.parse(result.nameChangeDependentsList);
      result.addTerminateDependentList = JSON.parse(result.addTerminateDependentList);
      result.fileUploadSPD = JSON.parse(result.fileUploadSpd);

      /*-------------- convert string to object --------------*/
      result.typeOfChange = JSON.parse(result.typeOfChange);
      result.changesToBeMade = JSON.parse(result.changesToBeMade);
      result.nameChange = JSON.parse(result.nameChange);
      result.nameChangeInsuredName = JSON.parse(result.nameChangeInsuredName);
      result.addbChangesToBeMade = JSON.parse(result.addbChangesToBeMade);

      return result;
    }

    // Action Updating Participant Name
    function actionAcceptUpdatingParticipantName(promises, promise, data) {

      var objectUpdate = {
        id: data.participantId,
        firstName: data.nameChangeInsuredName.firstName,
        middleName: data.nameChangeInsuredName.middleName,
        lastName: data.nameChangeInsuredName.lastName
      };
      promise = participants.updateInfo(objectUpdate)
        .then(function (response) {
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);
    }

    // Action Updating Dependent Name
    function actionAcceptUpdatingDependentName(promises, promise, data) {

      angular.forEach(data.nameChangeDependentsList, function (item) {

        var objectUpdate = {
          id: item.id,
          firstName: item.name.firstName,
          middleName: item.name.middleName,
          lastName: item.name.lastName
        };
        promise = dependents.updateInfo(objectUpdate)
          .then(function (response) {
            return true;
          }, function (error) {
            return error.errors;
          });
        promises.push(promise);

      });

    }

    // Action AcceptUpdatingAddTerminateDependent
    function actionAcceptUpdatingAddTerminateDependent(promises, promise, data) {

      angular.forEach(data.addTerminateDependentList, function (item, index) {
        // add dependent
        if (item.target === 'add') {


          var objectPost = {
            dateOfBirth: utils.getDateStringToNumber(item.dependentDob),
            participantId: data.participantId,
            gender: (item.dependentSex === 1) ? "M" : ((item.dependentSex === "M") ? "M" : "F"),
            ssn: "",
            email: "",
            firstName: item.dependentName.firstName,
            middleName: item.dependentName.middleName,
            lastName: item.dependentName.lastName
          };

          if (item.relationshipToInsured === 'spouse') { //add new spouse
            promise = spouses.post(objectPost)
              .then(function (response) {
                return true;
              }, function (error) {
                return error.errors;
              });
          } else { //add new dependent
            promise = dependents.post(objectPost)
              .then(function (response) {
                return true;
              }, function (error) {
                return error.errors;
              });
          }

          promises.push(promise);

        } else { // term the dependent

          if (item.relationshipToInsured === 'spouse') { //term a spouse
            promise = spouses.delete(item.id)
              .then(function () {
                return true;
              }, function (err) {
                return err.errors;
              });

          } else { //term a dependent
            promise = dependents.delete(item.id)
              .then(function () {
                return true;
              }, function (err) {
                return err.errors;
              });
          }

          promises.push(promise);
        }

      });

    }

    // Action Updating AD&D Beneficiary
    function actionAcceptUpdatingADDBeneficiary(promises, promise, data) {

      var objectUpdate = {};
      if (data.addbChangesToBeMade.primaryBeneficiary) {
        objectUpdate['primaryBeneficiaryForAdd'] = data.addbNewPrimaryBeneficiary;
      }

      if (data.addbChangesToBeMade.contingentBeneficiary) {
        objectUpdate['contingentBeneficiaryForAdd'] = data.addbNewContingentBeneficiaryName;
      }

      if (objectUpdate !== {}) {

        objectUpdate['id'] = data.participantId;

        promise = participants.updateInfo(objectUpdate)
          .then(function (response) {
            return true;
          }, function (error) {
            return error.errors;
          });
        promises.push(promise);

      }

    }

    // Action Updating Marital Status
    function actionAcceptUpdatingMaritalStatus(promises, promise, data) {

      promise = participants.updateInfo({
        id: data.participantId,
        maritalStatus: utils.getIDOfMaritalStatusFromName(data.maritalStatus)
      }).then(function (response) {
        return true;
      }, function (error) {
        return error.errors;
      });
      promises.push(promise);

    }

    // Action Updating Contact Information
    function actionAcceptUpdatingContactInformation(promises, promise, data) {

      var objectSecurity = {
        userId: data.userId,
        newPhone: data.phoneNumber
      };

      if (data.email) {
        objectSecurity['newEmail'] = data.email;
      }

      promise = users.patchUserSecurity(objectSecurity)
        .then(function () {
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);

      promise = participants.updateInfo({
        id: data.participantId,
        streetAddress: data.streetAddress,
        addressLine2: data.addressLine2,
        city: data.city,
        postalCode: data.postalCode,
        state: data.state,
        country: "USA"
      }).then(function (response) {
        return true;
      }, function (err) {
        return err.errors;
      });
      promises.push(promise);

    }

    // Action Updating AD&D Beneficiary
    function updatingADDBeneficiary(promises, promise, data) {

      var objectUpdate = {};
      objectUpdate['primaryBeneficiaryForAdd'] = data.addbCurrentPrimaryBeneficiary;
      objectUpdate['contingentBeneficiaryForAdd'] = data.addbCurrentContingentBeneficiaryName;
      objectUpdate['id'] = data.participantId;

      promise = participants.updateInfo(objectUpdate)
        .then(function (response) {
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);


    }


    //------------- For individual Change Form

    // updateDependentInfo
    function updateDependentInfo(promises, promise, data) {

      var objectUpdate = {
        id: data.submissionForId,
        firstName: data.nameChangeInsuredName.firstName,
        middleName: data.nameChangeInsuredName.middleName,
        lastName: data.nameChangeInsuredName.lastName
      };
      promise = dependents.updateInfo(objectUpdate)
        .then(function (response) {
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);
    }

    // Action Updating Marital Status
    function updatingMaritalStatus(promises, promise, data) {

      promise = participants.updateInfo({
        id: data.participantId,
        maritalStatus: (data.maritalStatus === 'other') ? "O" : data.maritalStatus
      }).then(function (response) {
        return true;
      }, function (error) {
        return error.errors;
      });
      promises.push(promise);

    }

    //updateSpouseInfo
    function updateSpouseInfo(promises, promise, data) {

      var objectUpdate = {
        id: data.submissionForId,
        firstName: data.nameChangeInsuredName.firstName,
        middleName: data.nameChangeInsuredName.middleName,
        lastName: data.nameChangeInsuredName.lastName,
        phoneNumber: data.phoneNumber
      };

      if (data.email) {
        objectUpdate['email'] = data.email;
      }
      promise = spouses.updateInfo(objectUpdate)
        .then(function (response) {
          return true;
        }, function (error) {
          return error.errors;
        });
      promises.push(promise);
    }



    /********************************** END: Function Accept **********************************/

    /********************************** START: Check all **********************************/

    $scope.itemChecked = function (data) {
      var _id = data.id;
      var _documentId = data.documentId;
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        $scope.checkboxesDocuments.items.push(_documentId);

        if ($scope.checkboxes.items.length == $scope.listData.length) {
          $scope.checkboxes.checked = true;
        }
      } else {
        $scope.checkboxes.checked = false;
        var index = $scope.checkboxes.items.indexOf(_id);
        $scope.checkboxes.items.splice(index, 1);
        $scope.checkboxesDocuments.items.splice(index, 1);
      }

    };

    $scope.selectedAll = function () {
      $scope.checkboxes.items = [];
      $scope.checkboxesDocuments.items = [];

      if ($scope.checkboxes.checked) {
        $scope.checkboxes.checked = true;
        for (var i = 0; i < $scope.listData.length; i++) {
          $scope.checkboxes.items.push($scope.listData[i].id);
          $scope.checkboxesDocuments.items.push($scope.listData[i].documentId);
        }
      }
      else {
        $scope.checkboxes.checked = false;
      }
      angular.forEach($scope.listData, function (item) {
        item.selected = $scope.checkboxes.checked;
      });
    };

    $scope.$watch('checkboxes.items', function (value) {

      if (value && value.length !== 0) {
        $scope.ids = $scope.checkboxes.items.toString();
        $scope.listIDDocuments = $scope.checkboxesDocuments.items.toString();

      } else {
        $scope.ids = "";
        $scope.listIDDocuments = "";
      }

      if ($scope.listData) {
        var total = $scope.listData.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

    }, true);

    /********************************** END: Check all **********************************/


    /*********************************** START: LABEL FORM ***********************************/
    //Define value label
    $scope.listLabel = [
      { id: 1, name: "createdDate", label: "Created Date", active: true },
      { id: 2, name: "firstName", label: "Insured's First Name", active: true },
      { id: 3, name: "lastName", label: "Insured's Last Name", active: true },
      { id: 4, name: "status", label: "Status", active: true }
    ];

    /*********************************** END: LABEL FORM ***********************************/
  });
