angular.module('app.pages.healthResultAdmin', [])

  .config(function ($stateProvider) {
    $stateProvider
      .state('public.healthresultadmin', {
        url: '/health-results/:IdClient',
        views: {
          'header': {
            templateUrl: 'header/header.tpl.html'
          },
          'middle-container': {
            templateUrl: 'pages/health-results-admin/admin.tpl.html',
            controller: 'HealthResultAdminController'
          },
          'footer': {
            templateUrl: 'footer/footer.tpl.html'
          }
        },
        resolve: {
          INFOEMPLOYER: function ($stateParams, employers) {
            return employers.getEmployerWithIncentive({ id: $stateParams.IdClient })
              .then(function (data) {
                return data;
              });
          }
        }
      });
  })

  .controller('HealthResultAdminController',
  function ($rootScope, $scope, $state, $translate, $filter, $modal, $timeout, CONFIGS, LABVALUES, BIOMARKERS, ngTableParams, loadingSpinnerService, utils, security, employers, healthCoachs, healthresults, participants, INFOEMPLOYER) {

    $scope.env = {
      isOpenSelectClient: false
    };

    //int parameter
    $scope.widthGroupTwo = 500;
    $scope.widthGroupOne = 716;
    $scope.isSmartScreen = false;
    $scope.dataTable = [];
    $scope.employerList = [];
    $scope.healthCoachList = [];
    $scope.benefitYear = {
      incentiveList: [],
      currentIncentive: null
    };
    $scope.bloodPressureSort = 'diastolic1';
    $scope.currentIDClientSelected = $state.params.IdClient;
    $scope.action = {
      coachingOpen: true,
      participantOpen: true,
      incentivesOpen: true,
      metabolicSyndromeOpen: true,
      isLoaded: false
    };
    $scope.loading = true;
    $scope.rowSelected = "";

    $scope.filters = {
      riskLevels: {
        showTable: true,
        select_all: false,
        moderate_risk: false,
        high_risk: false,
        critical_risk: false,
        results: ""
      },
      incentives: {
        showTable: true,
        select_all: false,
        bodyMassIndex: false,
        bloodPressure: false,
        bloodSugar: false,
        nicotinUse: false,
        ldlCholesterol: false,
        results: ""
        /*participation: true,
         healthCoaching: true,
         healthRiskAssessment: true*/
      },
      metabolic: {
        showTable: true,
        select_all: false,
        metapolicSyndromeMinFail: false,
        metapolicSyndromeBloodPressure: false,
        metapolicSyndromeBloodSugar: false,
        metapolicSyndromeHdl: false,
        metapolicSyndromeTriglycerides: false,
        metapolicSyndromeWaist: false,
        results: ""
      },
      metabolicSyndrome: {
        showTable: true,
        select_all: true
      },
      biomarkers: {
        showTable: true,
        select_all: true
      },
      results: {
        showTable: true,
        show_without_results: false
      },
      coach: {
        select_all: true,
        list: null,
        listSelected: null
      },
      flag: {
        flagged_participants: false
      }
    };

    $scope.showSelect = {
      riskLevels: false,
      incentives: false,
      metabolic: false,
      biomarkers: false,
      selectAction: false
    };

    $scope.clientIncentiveParams = {
      bodyMassIndex: false,
      bloodSugar: false,
      nicotinUse: false,
      healthCoaching: false,
      bloodPressure: false,
      ldlCholesterol: false,
      participation: false,
      healthRiskAssessment: false
    };

    // Data Health Results
    $scope.metabolicSyndrome = BIOMARKERS.metabolicSyndrome;

    // Data Health Results
    $scope.biomarkers = BIOMARKERS.healthResults;

    // function calculator blood Pressure Result
    function calBloodPressureResult(itemData) {
      //systolic
      var systolic = 0;

      if (itemData.systolic2 <= 0 || itemData.diastolic2 <= 0) {
        systolic = itemData.systolic1;
      } else if (itemData.systolic1 <= 0 || itemData.diastolic1 <= 0) {
        systolic = itemData.systolic2;
      } else {
        systolic = itemData.systolic1 + itemData.diastolic1 < itemData.systolic2 + itemData.diastolic2 ? itemData.systolic1 : itemData.systolic2;
      }

      //Diastolic
      var diastolic = 0;

      if (itemData.systolic2 <= 0 || itemData.diastolic2 <= 0) {
        diastolic = itemData.diastolic1;
        $scope.bloodPressureSort = 'diastolic1';
      } else if (itemData.systolic1 <= 0 || itemData.diastolic1 <= 0) {
        diastolic = itemData.diastolic2;
        $scope.bloodPressureSort = 'diastolic2';
      } else {
        diastolic = itemData.systolic1 + itemData.diastolic1 < itemData.systolic2 + itemData.diastolic2 ? itemData.diastolic1 : itemData.diastolic2;
        $scope.bloodPressureSort = itemData.systolic1 + itemData.diastolic1 < itemData.systolic2 + itemData.diastolic2 ? 'diastolic1' : 'diastolic2';
      }

      if (systolic === 0 || diastolic === 0) {
        return null;
      } else {
        return systolic + "/" + diastolic;
      }

    }

    //function check client Incentive
    function initClientIncentiveParams(data) {
      $scope.clientIncentiveParams.bodyMassIndex = (data.clientIncentive & 1) === 1;
      $scope.clientIncentiveParams.bloodSugar = (data.clientIncentive & 2) === 2;
      $scope.clientIncentiveParams.nicotinUse = (data.clientIncentive & 4) === 4;
      $scope.clientIncentiveParams.healthCoaching = (data.clientIncentive & 8) === 8;
      $scope.clientIncentiveParams.bloodPressure = (data.clientIncentive & 16) === 16;
      $scope.clientIncentiveParams.ldlCholesterol = (data.clientIncentive & 32) === 32;
      $scope.clientIncentiveParams.participation = (data.clientIncentive & 64) === 64;
      $scope.clientIncentiveParams.healthRiskAssessment = (data.clientIncentive & 128) === 128;
    }

    // get all employers
    function getEmployers() {
      if (security.isAdmin() || security.isHealthCoachManager()) {
        employers.all(undefined, false).then(function (data) {
          $scope.employerList = data.employerList;
        });
      } else if (security.isHealthCoach()) {
        healthCoachs.employers(undefined, undefined, false).then(function (data) {
          $scope.employerList = data.employerList;
        });
      }
    }

    // Get info employer
    $scope.infoEmployer = INFOEMPLOYER;
    function getInfoEmployer(id) {
      $scope.benefitYear.incentiveList = [];
      $scope.benefitYear.currentIncentive = null;

      // select other client
      if (id) {
        employers.getEmployerWithIncentive({ 'id': id }).then(function (data) {
          $scope.infoEmployer = data;
          if ($scope.infoEmployer.incentives.length > 0) {
            // Update benefit year list
            $scope.benefitYear.incentiveList = $scope.infoEmployer.incentives;
            $scope.benefitYear.currentIncentive = $scope.benefitYear.incentiveList[0];

            initClientIncentiveParams($scope.benefitYear.currentIncentive);
          }

          // check all checkbox filter
          $scope.biomarkersSelect('select_all');

        });
      } else { //load first
        $scope.infoEmployer = INFOEMPLOYER;
        if ($scope.infoEmployer.incentives.length > 0) {
          // Update benefit year list
          $scope.benefitYear.incentiveList = $scope.infoEmployer.incentives;
          $scope.benefitYear.currentIncentive = $scope.benefitYear.incentiveList[0];

          initClientIncentiveParams($scope.benefitYear.currentIncentive);
        }

        // check all checkbox filter
        $scope.biomarkersSelect('select_all');
      }
    }

    //function format Data
    function formatData(data) {
      var result = [];
      angular.forEach(data, function (item) {

        // create age
        item['current_age'] = utils.calculateAge(utils.formatDateString(item.dateOfBirth));
        item['phoneNumber'] = utils.phoneNumberFormat(item['phoneNumber']);

        // calculator blood Pressure Result
        item['bloodPressure'] = calBloodPressureResult(item);

        //check enrLevel
        if (!item.enrLevel) {
          if (item.coverageLevel === 0) {
            item.enrLevel = "P00";
          } else if (item.coverageLevel === 1) {
            item.enrLevel = "F00";
          } else if (item.coverageLevel === 2) {
            item.enrLevel = "P01";
          } else if (item.coverageLevel === 3) {
            item.enrLevel = "P99";
          } else if (item.coverageLevel === 4) {
            item.enrLevel = "F99";
          }
        }

        result.push(item);
      });

      return result;

    }

    // Init model
    $scope.NgTableParams = ngTableParams;

    // Participant List
    $scope.participantList = [];

    // Filter here
    $scope.filter = {
      lastName: undefined
    };

    $scope.tableParams = new $scope.NgTableParams({
      page: 1,   // show first page
      count: 10,  // count per page
      filter: $scope.filter,
      sorting: {
        lastName: 'asc'     // initial sorting
      }
    }, {
        getData: function ($defer, params) {

          function pagination() {


            var sorting = params.sorting();
            var filter = params.filter();
            var params2 = {
              page: params.page(),
              pageSize: params.count()
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

            // Filter Health Results
            params2.showWithoutHealthResults = $scope.filters.results.show_without_results;

            if ($scope.filters.riskLevels.results) {
              params2.rishLevels = $scope.filters.riskLevels.results;
            }

            params2.healthcoachFlag = $scope.filters.flag.flagged_participants;

            params2.healthcoachIds = $scope.filters.coach.list;

            if ($scope.filters.incentives.results || $scope.filters.incentives.results === "0") {
              params2.clientIncentives = $scope.filters.incentives.results;
            }

            if ($scope.filters.metabolic.results || $scope.filters.metabolic.results === "0") {
              params2.metapolicSyndrome = $scope.filters.metabolic.results;
            }


            // Search
            if (!!filter.keyword) {
              params2.search = filter.keyword;
            }

            if (!$scope.benefitYear.currentIncentive) {
              params.total(0);
              $defer.resolve([]);

              $scope.loading = false;

            } else {

              $scope.loading = true;

              employers.getHealthResultByIDClientBenefitYear($scope.currentIDClientSelected, params2, $scope.benefitYear.currentIncentive.id, null, false)
                .then(function (data) {
                  $scope.participantList = formatData(data.participantList);
                  params.total(data.totalCount);
                  $defer.resolve($scope.participantList);


                  // add fixed header
                  /*angular.element('.tableScroll').fixedHeaderTable({
                   altClass: 'oddltr',
                   height: 500,
                   footer: false,
                   cloneHeadToFoot: false,
                   fixedColumn: false
                   });*/

                  //cal width for group
                  getWidthGroup();

                  $scope.loading = false;

                }, function (error) {
                  $scope.loading = false;
                });

            }


            // reset
            reset();

          }

          params.data = [];
          pagination();
        }
      });

    // Reload current page
    $scope.reload = function () {
      $scope.tableParams.page(1);
      $scope.tableParams.reload();
    };

    $scope.showHideSelect = function (name) {

      $scope.showSelect = {
        riskLevels: (name === 'risk') ? !$scope.showSelect.riskLevels : false,
        incentives: (name === 'incentives') ? !$scope.showSelect.incentives : false,
        metabolic: (name === 'metabolic') ? !$scope.showSelect.metabolic : false,
        biomarkers: (name === 'biomarkers') ? !$scope.showSelect.biomarkers : false,
        results: (name === 'results') ? !$scope.showSelect.results : false,
        coach: (name === 'coach') ? !$scope.showSelect.coach : false,
        flag: (name === 'flag') ? !$scope.showSelect.flag : false,
        selectAction: (name === 'selectAction') ? !$scope.showSelect.selectAction : false
      };
    };

    $scope.actionParticipant = function (name) {
      if (name === 'close') {
        $scope.action.participantOpen = false;
      } else {
        $scope.action.participantOpen = true;
      }

      //cal width for group
      getWidthGroup();

    };

    $scope.actionCoaching = function (name) {
      if (name === 'close') {
        $scope.action.coachingOpen = false;
      } else {
        $scope.action.coachingOpen = true;
      }

      //cal width for group
      getWidthGroup();
    };

    $scope.actionIncentives = function (name) {
      if (name === 'close') {
        $scope.action.incentivesOpen = false;
      } else {
        $scope.action.incentivesOpen = true;
      }
    };

    $scope.actionMetabolicSyndrome = function (name) {
      if (name === 'close') {
        $scope.action.metabolicSyndromeOpen = false;
      } else {
        $scope.action.metabolicSyndromeOpen = true;
      }
    };

    // Filter
    $scope.riskLevelsSelect = function (name) {
      if (name === 'select_all') {
        $scope.filters.riskLevels = {
          select_all: $scope.filters.riskLevels.select_all,
          moderate_risk: $scope.filters.riskLevels.select_all,
          high_risk: $scope.filters.riskLevels.select_all,
          critical_risk: $scope.filters.riskLevels.select_all
        };
      }

      //check checkAll
      if ($scope.filters.riskLevels.moderate_risk &&
        $scope.filters.riskLevels.high_risk &&
        $scope.filters.riskLevels.critical_risk
      ) {
        $scope.filters.riskLevels.select_all = true;
      } else {
        $scope.filters.riskLevels.select_all = false;
      }

      var tempResultRiskLevels = [];
      if ($scope.filters.riskLevels.moderate_risk) {
        tempResultRiskLevels.push(1);
      }
      if ($scope.filters.riskLevels.high_risk) {
        tempResultRiskLevels.push(2);
      }
      if ($scope.filters.riskLevels.critical_risk) {
        tempResultRiskLevels.push(3);
      }
      $scope.filters.riskLevels.results = tempResultRiskLevels.toString();

      $scope.reload();

    };

    $scope.incentivesSelect = function (name) {
      if (name === 'select_all') {
        $scope.filters.incentives = {
          select_all: $scope.filters.incentives.select_all,
          bodyMassIndex: $scope.filters.incentives.select_all,
          bloodPressure: $scope.filters.incentives.select_all,
          bloodSugar: $scope.filters.incentives.select_all,
          nicotinUse: $scope.filters.incentives.select_all,
          ldlCholesterol: $scope.filters.incentives.select_all
        };
      }

      //Check Un/Check All
      if (
        $scope.filters.incentives.bodyMassIndex === true &&
        $scope.filters.incentives.bloodPressure === true &&
        $scope.filters.incentives.bloodSugar === true &&
        $scope.filters.incentives.nicotinUse === true &&
        $scope.filters.incentives.ldlCholesterol === true
      ) {
        $scope.filters.incentives.select_all = true;
      } else {
        $scope.filters.incentives.select_all = false;
      }


      var tempResultIncentives = [];
      if ($scope.filters.incentives.bodyMassIndex) {
        tempResultIncentives.push(0);
      }
      if ($scope.filters.incentives.bloodPressure) {
        tempResultIncentives.push(1);
      }
      if ($scope.filters.incentives.bloodSugar) {
        tempResultIncentives.push(2);
      }
      if ($scope.filters.incentives.nicotinUse) {
        tempResultIncentives.push(3);
      }
      if ($scope.filters.incentives.ldlCholesterol) {
        tempResultIncentives.push(4);
      }
      $scope.filters.incentives.results = tempResultIncentives.toString();

      $scope.reload();
    };

    $scope.metabolicSelect = function (name) {

      if (name === 'select_all') {
        $scope.filters.metabolic = {
          select_all: $scope.filters.metabolic.select_all,
          metapolicSyndromeMinFail: $scope.filters.metabolic.select_all,
          metapolicSyndromeBloodPressure: $scope.filters.metabolic.select_all,
          metapolicSyndromeBloodSugar: $scope.filters.metabolic.select_all,
          metapolicSyndromeHdl: $scope.filters.metabolic.select_all,
          metapolicSyndromeTriglycerides: $scope.filters.metabolic.select_all,
          metapolicSyndromeWaist: $scope.filters.metabolic.select_all
        };
      }

      //Check Un/Check All
      if (
        $scope.filters.metabolic.metapolicSyndromeMinFail === true &&
        $scope.filters.metabolic.metapolicSyndromeBloodPressure === true &&
        $scope.filters.metabolic.metapolicSyndromeBloodSugar === true &&
        $scope.filters.metabolic.metapolicSyndromeHdl === true &&
        $scope.filters.metabolic.metapolicSyndromeTriglycerides === true &&
        $scope.filters.metabolic.metapolicSyndromeWaist === true
      ) {
        $scope.filters.metabolic.select_all = true;
      } else {
        $scope.filters.metabolic.select_all = false;
      }


      var tempResultMetabolic = [];
      if ($scope.filters.metabolic.metapolicSyndromeMinFail) {
        tempResultMetabolic.push(0);
      }
      if ($scope.filters.metabolic.metapolicSyndromeWaist) {
        tempResultMetabolic.push(1);
      }
      if ($scope.filters.metabolic.metapolicSyndromeBloodPressure) {
        tempResultMetabolic.push(2);
      }
      if ($scope.filters.metabolic.metapolicSyndromeBloodSugar) {
        tempResultMetabolic.push(3);
      }
      if ($scope.filters.metabolic.metapolicSyndromeTriglycerides) {
        tempResultMetabolic.push(4);
      }
      if ($scope.filters.metabolic.metapolicSyndromeHdl) {
        tempResultMetabolic.push(5);
      }
      $scope.filters.metabolic.results = tempResultMetabolic.toString();

      $scope.reload();
    };

    $scope.biomarkersSelect = function (name) {
      if (name === 'select_all') {
        angular.forEach($scope.biomarkers, function (item) {
          $scope.filters.biomarkers[item.value] = $scope.filters.biomarkers.select_all;
        });
      }

      //Check Un/Check All
      var countCheck = 0;
      angular.forEach($scope.biomarkers, function (item) {
        if ($scope.filters.biomarkers[item.value]) {
          countCheck++;
        }
      });
      if (countCheck === $scope.biomarkers.length) {
        $scope.filters.biomarkers.select_all = true;
      } else {
        $scope.filters.biomarkers.select_all = false;
      }

      //show hide table
      if (countCheck === 0) {
        $scope.filters.biomarkers.showTable = false;
      } else {
        $scope.filters.biomarkers.showTable = true;
      }

      if (!$scope.loading) {
        $scope.reload();

        //cal width for group
        getWidthGroup();
      }

      //reset
      $scope.env.isOpenSelectClient = false;

    };

    $scope.resultsSelect = function () {
      $scope.reload();
    };


    // Select client
    $scope.choiceEmployer = function (employer) {


      if (security.isAdmin() || security.isHealthCoachManager()) {
        $scope.currentIDClientSelected = employer.id;
      } else if (security.isHealthCoach()) {
        $scope.currentIDClientSelected = employer.employerId;
      }

      $scope.infoEmployer = employer;

      getInfoEmployer($scope.currentIDClientSelected);
      $scope.reload();


    };


    /***************************** START: COACHING *****************************/

    //for filter
    function getListHealthCoach() {
      var headers = {
        'X-Filter': JSON.stringify([
          {
            property: "isDeleted",
            operator: "equal",
            condition: "or",
            value: false
          }
        ])
      };


      healthCoachs.getAllWithFilter("", headers, false).then(function (data) {
        $scope.healthCoachList = data.userList;
        if ($scope.healthCoachList) {
          $scope.healthCoachList.unshift({
            id: -1,
            firstName: "Not assign"
          });
          $scope.selectedAllCoach(); //load first select all health coach
        }
      });
    }

    $scope.selectedAllCoach = function () {
      $scope.filters.coach.listSelected = [];
      if ($scope.filters.coach.select_all) {
        $scope.filters.coach.select_all = true;
        for (var i = 0; i < $scope.healthCoachList.length; i++) {
          $scope.filters.coach.listSelected.push($scope.healthCoachList[i].id);
        }
      }
      else {
        $scope.filters.coach.select_all = false;
      }
      angular.forEach($scope.healthCoachList, function (item) {
        item.selected = $scope.filters.coach.select_all;
      });
    };
    $scope.itemCoachChecked = function (data) {
      var _id = data.id;
      if (data.selected) {
        $scope.filters.coach.listSelected.push(_id);
        if ($scope.filters.coach.listSelected.length == $scope.healthCoachList.length) {
          $scope.filters.coach.select_all = true;
        }
      } else {
        $scope.filters.coach.select_all = false;
        var index = $scope.filters.coach.listSelected.indexOf(_id);
        $scope.filters.coach.listSelected.splice(index, 1);
      }

    };

    $scope.$watch('filters.coach.listSelected', function (value) {

      if (value) {
        if (value.length !== 0) {
          $scope.filters.coach.list = $scope.filters.coach.listSelected.toString();
        } else {
          $scope.filters.coach.list = null;
        }
        if (!$scope.loading) {
          $scope.reload();
        }
      }


    }, true);


    //for table
    $scope.checkboxes = { 'checked': false, items: [], listHeathresultID: [] };
    $scope.itemChecked = function (data) {
      var _id = data.participantId;
      var _idHealthResult = data.healthResultId;
      if (data.selected) {
        $scope.checkboxes.items.push(_id);
        $scope.checkboxes.listHeathresultID.push(_idHealthResult);
        if ($scope.checkboxes.items.length == $scope.participantList.length) {
          $scope.checkboxes.checked = true;
        }
      } else {
        $scope.checkboxes.checked = false;
        var index = $scope.checkboxes.items.indexOf(_id);
        $scope.checkboxes.items.splice(index, 1);
        $scope.checkboxes.listHeathresultID.splice(index, 1);
      }

    };

    $scope.selectedAll = function () {
      $scope.checkboxes.items = [];
      $scope.checkboxes.listHeathresultID = [];
      if ($scope.checkboxes.checked) {
        $scope.checkboxes.checked = true;
        for (var i = 0; i < $scope.participantList.length; i++) {
          $scope.checkboxes.items.push($scope.participantList[i].participantId);
          $scope.checkboxes.listHeathresultID.push($scope.participantList[i].healthResultId);
        }
      }
      else {
        $scope.checkboxes.checked = false;
      }
      angular.forEach($scope.participantList, function (item) {
        item.selected = $scope.checkboxes.checked;
      });
    };

    $scope.$watch('checkboxes.items', function (value) {

      if (value && value.length !== 0) {
        $scope.ids = $scope.checkboxes.items.toString();
        $scope.idsHealthResult = $scope.checkboxes.listHeathresultID.toString();

      } else {
        $scope.ids = "";
        $scope.idsHealthResult = "";
      }

      if ($scope.participantList) {
        var total = $scope.participantList.length;
        var checked = $scope.checkboxes.items.length;
        var unchecked = total - checked;
        // grayed checkbox
        //angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
      }

      $scope.getListNameParticipant($scope.ids);

    }, true);


    // Function get list name Participant
    $scope.getListNameParticipant = function (data) {

      $scope.listNameParticipant = "";

      var listNameAcceptHealthResult = [];
      var listParAcceptHealthResult = [];
      var listNameNonAcceptHealthResult = [];
      var listParNonAcceptHealthResult = [];
      angular.forEach(data.split(','), function (value, key) {
        var tempObjectParticiapnt = utils.findObjectByElement($scope.participantList, 'participantId', value);

        if (tempObjectParticiapnt) {

          //For acceptHealthResult
          if (tempObjectParticiapnt.acceptHealthResult) {
            listNameAcceptHealthResult.push(tempObjectParticiapnt.firstName + " " + tempObjectParticiapnt.lastName + " ");
            listParAcceptHealthResult.push(tempObjectParticiapnt);
          } else {
            listNameNonAcceptHealthResult.push(tempObjectParticiapnt.firstName + " " + tempObjectParticiapnt.lastName + " ");
            listParNonAcceptHealthResult.push(tempObjectParticiapnt);
          }

        }
      });

      $scope.listNameParticipant = {
        'acceptHealthResult': listNameAcceptHealthResult.toString(),
        'parAcceptHealthResult': listParAcceptHealthResult,
        'parNonAcceptHealthResult': listParNonAcceptHealthResult,
        'nonAcceptHealthResult': listNameNonAcceptHealthResult.toString()
      };

    };

    /***************************** END:COACHING *****************************/

    // Assign To
    function assignTo(idParticipant, userInfo) {
      participants.patch({
        id: idParticipant,
        healthCoachId: userInfo.id
      }).then(function (response) {

        //update data for list Participant
        $scope.checkboxes.items = [];

        if (!$scope.loading) {
          $scope.reload();
        }

      }, function () {

        if (!$scope.loading) {
          $scope.reload();
        }
      });
    }

    $scope.assignTo = function (request) {

      if (request) {
        // check new item
        if ($scope.checkboxes.items.indexOf(request.participantId) === -1) {
          $scope.checkboxes.items.push(request.participantId);
          request.selected = true; //checked
          if ($scope.ids) {
            $scope.ids += ',' + request.participantId;
          } else {
            $scope.ids = request.participantId;
          }
          $scope.getListNameParticipant($scope.ids);
        }
      } else {
        $scope.getListNameParticipant($scope.ids);
      }

      if ($scope.ids) {
        $scope.modal = $modal.open({
          controller: 'PopupSelectHealthCoachController',
          templateUrl: 'modules/popup/select-healthCoach/select-healthCoach.tpl.html',
          size: 'md',
          resolve: {
            API: function () {
              return healthCoachs;
            },
            LIST_PARTICIAPNT: function () {
              return $scope.listNameParticipant;
            }
          }
        });
        $scope.modal.result.then(function (result) {
          if (result.infoHealthCoach) {
            angular.forEach(result.listParticiapnts.parAcceptHealthResult, function (value, key) {
              assignTo(value.participantId, result.infoHealthCoach);
            });

          }
        });
      } else {

        $scope.modal = $modal.open({
          controller: 'ErrorController',
          templateUrl: 'modules/alert/error.tpl.html',
          size: 'sm',
          resolve: {
            message: function () {
              return "Please select Participant";
            }
          }
        });

      }


    };

    function funcUpdateHealthResult(data, mesageReponse) {

      healthresults.updateMulti(data).then(function () {

        $scope.modal = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Success",
                summary: false,
                style: 'ok',
                message: mesageReponse ? mesageReponse : "Update Health Result success"
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
                title: "Error",
                summary: false,
                style: 'ok',
                message: "Please try again"
              };
            }
          }
        });
      });
    }

    $scope.notify = function (request) {
      if ($scope.checkboxes.items.indexOf(request.participantId) === -1) {
        $scope.checkboxes.items.push(request.participantId);
        request.selected = true; //checked
        if ($scope.ids) {
          $scope.ids += ',' + request.participantId;
        } else {
          $scope.ids = request.id;
        }
        $scope.getListNameParticipant($scope.ids);
      }


      $scope.modal = $modal.open({
        controller: 'PopupSendmailController',
        templateUrl: 'modules/popup/sendmail/sendmail.tpl.html',
        size: 'md',
        resolve: {
          API: function () {
            return participants;
          },
          LIST_IDS: function () {
            return $scope.ids;
          },
          LIST_PARTICIAPNT: function () {
            return $scope.listNameParticipant;
          }
        }
      });
      $scope.modal.result.then(function (value) {

      });
    };

    //Action for multi participant
    $scope.acceptHealthResult = function () {
      if ($scope.idsHealthResult) {

        var data = {
          ids: $scope.idsHealthResult.split(','),
          acceptHealthResult: true
        };
        var mesageReponse = "Accepted - Health results have been accepted and saved";
        funcUpdateHealthResult(data, mesageReponse);

      } else {

        $scope.modal = $modal.open({
          controller: 'ErrorController',
          templateUrl: 'modules/alert/error.tpl.html',
          size: 'sm',
          resolve: {
            message: function () {
              return "Please select Health Result or Participant";
            }
          }
        });

      }

    };

    $scope.flagHealthResult = function (valueFlag) {
      if ($scope.idsHealthResult) {

        var data = {
          ids: $scope.idsHealthResult.split(','),
          flag: valueFlag
        };
        funcUpdateHealthResult(data);


      } else {

        $scope.modal = $modal.open({
          controller: 'ErrorController',
          templateUrl: 'modules/alert/error.tpl.html',
          size: 'sm',
          resolve: {
            message: function () {
              return "Please select Health Result or Participant";
            }
          }
        });

      }
    };

    $scope.deleteHealthResult = function () {
      if ($scope.idsHealthResult) {

        var modalDelete = $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function () {
              return {
                title: "Delete these health results",
                summary: false,
                style: 'deleteCancel',
                message: "Are you sure you want to delete these health results?"
              };
            }
          }
        });

        modalDelete.result.then(function (result) {
          if (result === true) {

            var data = {
              ids: $scope.idsHealthResult.split(',')
            };

            healthresults.deleteMulti(data).then(function () {

              var modalAlertDelete = $modal.open({
                controller: 'AlertController',
                templateUrl: 'modules/alert/alert.tpl.html',
                size: 'sm',
                resolve: {
                  data: function () {
                    return {
                      title: "Success",
                      summary: false,
                      style: 'ok',
                      message: "Delete Health Result success"
                    };
                  }
                }
              });
              modalAlertDelete.result.then(function () {
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
                      title: "Error",
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

        $modal.open({
          controller: 'ErrorController',
          templateUrl: 'modules/alert/error.tpl.html',
          size: 'sm',
          resolve: {
            message: function () {
              return "Please select Health Result or Participant";
            }
          }
        });

      }


    };


    /***************************** START: MULTI HEATH RESULT FOR A PARTICIPANT ****************************/
    //controller hide/show
    $scope.multiHeathResult = {
      hideRows: {
        value: true,
        participant: null
      }
    };
    $scope.dataAllHealthResultSpecialPar = [];
    $scope.actionHideShowMultiHeathResult = function (data) {
      $scope.dataAllHealthResultSpecialPar = [];

      //Note: NOT really optimal performance
      var tempData = {
        participantID: data.participantId,
        incentiveID: $scope.benefitYear.currentIncentive.id
      };

      participants.getAllHealthResultForOneParticipants(tempData).then(function (result) {
        $scope.dataAllHealthResultSpecialPar = result.participantList.healthResults;

        if ($scope.multiHeathResult.hideRows.participant === data.participantId) {
          $scope.multiHeathResult.hideRows.value = !$scope.multiHeathResult.hideRows.value;
        } else {
          $scope.multiHeathResult.hideRows.value = false;
        }
        $scope.multiHeathResult.hideRows.participant = data.participantId;

        //update width of group
        getWidthGroup();

      }, function () {

        //update width of group
        getWidthGroup();
      });


    };

    /***************************** END: MULTI HEATH RESULT FOR A PARTICIPANT *****************************/

    /***************************** START UPLOAD FILE *****************************/
    //upload
    $scope.templateUrl = CONFIGS.baseURL() + '/participants/healthresult/import/templatev2';
    // Import file
    $scope.importFiles = function ($element) {
      if ($element.files.length > 0) {
        $scope.modal = $modal.open({
          controller: 'UserManagerParticipantUploadConfirmController',
          templateUrl: 'modules/user-manager/participant/upload/upload-confirm.tpl.html',
          size: 'md',
          resolve: {
            files: function () {
              return $element.files;
            },
            type: function () {
              return "";
            }
          }
        });
        $scope.modal.result.then(function (confirm) {
          if (confirm) {
            participants.importHealthresult($element.files, $scope.currentIDClientSelected).then(function (data) {
              $scope.reload();
              $scope.showAlert(data);
              $element.files = null;
              resetInputFile();
            }, function (error) {
              var message = error.errors[0].errorMessage;
              $scope.openError(message);

              $element.files = null;
              resetInputFile();

            });
          } else {
            $element.files = null;
            resetInputFile();
          }
        });
      } else {
        $element.files = null;
        resetInputFile();
      }
    };
    // function reset input file
    function resetInputFile() {
      var control = $("#fileInput");
      control.replaceWith(control = control.clone(true));
    }

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

    $scope.showAlert = function (data) {

      //build message
      var message = "<div class='alert-status-uploaded'>";

      if (data.conflicts.length > 0 || data.errors.length > 0) {

        // for Success
        message += "<div class='alert-status-uploaded-success'>Success: <br/>&nbsp;&nbsp;" + data.totalSuccess + " of " + data.total + " Health Results have been uploaded.<br/></div>";


        // for Conflicts
        if (data.conflicts.length > 0) {
          var messageConflicts = "<br/>Conflicts: <br/>";
          messageConflicts += "<div class='alert-conflicts'>";
          angular.forEach(data.conflicts, function (item, key) {
            messageConflicts += "&nbsp;&nbsp;" + (key + 1) + ".&nbsp;" + item + "<br/>";
          });
          messageConflicts += "</div>";
          message += messageConflicts;
        }

        // for errors
        if (data.errors.length > 0) {
          var messageErrors = "<br/>Errors: <br/>";
          messageErrors += "<div class='alert-conflicts'>";
          angular.forEach(data.errors, function (item, key) {
            messageErrors += "&nbsp;&nbsp;" + (key + 1) + ".&nbsp;" + item + "<br/>";
          });
          messageErrors += "</div>";
          message += messageErrors;
        }


      } else {
        message += data.totalSuccess + " of " + data.total + " Health Results have been uploaded.";
      }

      message += "</div>";


      // open modal
      $scope.modal = $modal.open({
        controller: 'AlertController',
        templateUrl: 'modules/alert/alert.tpl.html',
        size: data.conflicts.length > 0 || data.errors.length > 0 ? 'md' : 'sm',
        resolve: {
          data: function () {
            return {
              title: data.conflicts.length > 0 || data.errors.length > 0 ? "Status" : 'Success!',
              summary: false,
              style: 'ok',
              message: message
            };
          }
        }
      });
    };

    /***************************** END: UPLOAD FILE *****************************/

    /************************************************** START: ACTION SELECT **************************************************/
    $scope.pulseIDSelected = "";
    $scope.selectedPULSEID = function (item) {
      $scope.pulseIDSelected = item.pulseId;
    };


    /************************************************** END: ACTION SELECT **************************************************/


    /************************************************** START: FILTER YEAR **************************************************/
    // Select year
    $scope.changeCurrentIncentive = function (incentive) {
      $scope.benefitYear.currentIncentive = incentive;

      //update incentive for UI
      initClientIncentiveParams($scope.benefitYear.currentIncentive);

      if (!$scope.loading) {
        $scope.reload();
      }
    };

    /************************************************** END: FILTER YEAR **************************************************/

    $scope.selectedRow = function (numeber) {
      $scope.rowSelected = numeber;
    };

    // START: Add/modify style of table
    $(window).resize(function () {

      $scope.$apply(function () {
        getWidthGroup();
      });
    });

    function getWidthGroup() {
      //check smart screen
      if (parseInt(window.innerWidth) < 990) {
        $scope.isSmartScreen = true;
      } else {
        $scope.isSmartScreen = false;
      }
      $timeout(function () {
        if (!$scope.isSmartScreen) {
          $scope.widthGroupOne = $(".group-one").width();

          if ($rootScope.nameBrowser === 'browser-chrome') {
            $scope.widthGroupTwo = parseInt(window.innerWidth) - parseInt($scope.widthGroupOne) - 30; //30: padding;
          } else {
            $scope.widthGroupTwo = parseInt(window.innerWidth) - parseInt($scope.widthGroupOne) - 40; //40: padding;
          }

        } else {
          $scope.widthGroupTwo = 0;
        }

      }, 100);
    }

    //function reset
    function reset() {
      $scope.rowSelected = "";
      $scope.showSelect = {
        riskLevels: false,
        incentives: false,
        metabolic: false,
        biomarkers: false,
        selectAction: false
      };

      $scope.multiHeathResult = {
        hideRows: {
          value: true,
          participant: null
        }
      };

      //reset checkbox
      $scope.checkboxes.checked = false;
      angular.element(document.getElementById("select_all")).prop("unchecked", true);
      $scope.checkboxes.items = [];
      $scope.checkboxes.listHeathresultID = [];

    }

    //START: For Auto-complete
    function findInfoClient(id) {
      employers.find(id)
        .then(function (result) {
          $scope.employerList.push(result);
          $scope.paramsAutoComplete.employer = result;
          $scope.changeEmployer(result.id);
        });
    }


    $scope.paramsAutoComplete = {
      employer: null
    };
    $scope.$watch('paramsAutoComplete.employer', function (value) {
      if (!value || !value.id) {
        $scope.employerList = [];
        $scope.changeEmployer(0);
      }
    });

    $scope.findClient = function (keyword) {
      var headers = {
        'X-Filter': JSON.stringify([
          {
            property: "isDeleted",
            operator: "equal",
            condition: "or",
            value: false
          }
        ])
      };

      var params = {
        fields: 'id,clientName,firstName,lastName,employerLocations,products,groupNumber,effectiveDateOfInsurance,enrollmentDate,annualMaximum',
        q: 'clientName=' + keyword
      };

      if (security.isAdmin() || security.isHealthCoachManager()) {

        return employers.get(params, headers, true)
          .then(function (data) {
            $scope.employerList = data.employerList;
            return data.employerList;
          });

      } else if (security.isHealthCoach()) {
        return healthCoachs.employers(params, headers, false)
          .then(function (data) {
            $scope.employerList = data.employerList;
            return data.employerList;
          });
      }


    };
    //END: For Auto-complete

    // END: Add/modify style of table
    function init() {
      getInfoEmployer();
      //getEmployers();
      getListHealthCoach();

      $timeout(function () {
        getWidthGroup();
      }, 200);
    }

    init();
  });
