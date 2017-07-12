angular.module('app.modules.health-results.clinical-director', [])

.controller('HealthClinicalDirectorController', function ($scope, $state, $translate, $filter, $modal, $timeout, CONFIGS, ngTableParams, utils, security, participants, employers) {

  function variableDefinitions() {
    $scope.filterBio = {
      'namebiomarker': "",
      'compareBiomarker': "",
      'valueBiomarker': ""
    };

    $scope.isClickFilder = false;
  }

  $scope.loading = true;
  $scope.isfilterMetabolic = false;
  $scope.dataAllParticipants = [];
  $scope.dataAllParticipantsFilter = [];


  // Permission
  $scope.isFullControl = function () {
    if (security.isAdmin() || security.isClientManager() || security.isAgentTheAgent()) {
      return true;
    } else { //isClinicalDirector || isHealthCoachManager
      return false;
    }
  };


  $scope.alertLevels = [
    {
      'name': 'Moderate',
      'value': 'moderate'
    },
    {
      'name': 'High',
      'value': 'high'
    },
    {
      'name': 'Critical',
      'value': 'critical'
    }
  ];

  $scope.participantList = [];
  $scope.employerList = [];


  // function filter follow alertLevel
  function filterAlertLevel(data) {

    var moderate = [];
    var high = [];
    var critical = [];

    angular.forEach(data, function (item) {


      if (item && item.healthResult) {
        var healthResult = item.healthResult;
        //Total Cholesterol
        if (healthResult.hasOwnProperty("totChol") === true) {
          if (item.healthResult.totChol > 240) {
            high.push(item);
          } else if (item.healthResult.totChol && item.healthResult.totChol >= 201 && item.healthResult.totChol <= 240) {
            moderate.push(item);
          }
        }

        //HDL  (males)
        if (item.healthResult.hdl && item.healthResult.hdl < 40 && (item.gender === 'M')) {
          high.push(item);
        }
        if (item.healthResult.hdl && item.healthResult.hdl < 50 && (item.gender === 'F')) {
          high.push(item);
        }

        //LDL
        if (item.healthResult.ldl && item.healthResult.ldl > 190) {
          critical.push(item);
        } else if (item.healthResult.ldl && item.healthResult.ldl >= 160 && item.healthResult.ldl <= 189) {
          high.push(item);
        } else if (item.healthResult.ldl && item.healthResult.ldl >= 131 && item.healthResult.ldl <= 159) {
          moderate.push(item);
        }


        //TRIGLYCERIDE
        if (item.healthResult.triglycerides && item.healthResult.triglycerides > 500) {
          critical.push(item);
        } else if (item.healthResult.triglycerides && item.healthResult.triglycerides >= 200 && item.healthResult.triglycerides <= 499) {
          high.push(item);
        } else if (item.healthResult.triglycerides && item.healthResult.triglycerides >= 150 && item.healthResult.triglycerides <= 199) {
          moderate.push(item);
        }


        //Albumin
        if (item.healthResult.albumin && item.healthResult.albumin < 2 || item.healthResult.albumin > 8) {
          high.push(item);
        }

        //ALT
        if (item.healthResult.alt > 100) {
          critical.push(item);
        } else if (item.healthResult.alt > 50) {
          high.push(item);
        }


        //AST
        if (item.healthResult.ast > 100) {
          critical.push(item);
        } else if (item.healthResult.ast > 50) {
          high.push(item);
        }


        //Alkaline Phosphatase
        if (item.healthResult.alkaline > 175) {
          critical.push(item);
        } else if (item.healthResult.alkaline > 120) {
          high.push(item);
        }


        //GGT
        if (item.healthResult.ggt > 125) {
          critical.push(item);
        } else if (item.healthResult.ggt > 65) {
          high.push(item);
        }


        //Total Bilirubin
        if (item.healthResult.bilirubin > 4) {
          critical.push(item);
        } else if (item.healthResult.bilirubin > 2) {
          high.push(item);
        }

        //Globulin
        if (item.healthResult.globulin > 5) {
          critical.push(item);
        } else if (item.healthResult.globulin > 3.7) {
          high.push(item);
        }

        //Total Protein
        if (item.healthResult.protein > 9 || item.healthResult.protein < 4) {
          high.push(item);
        }

        //Creatinine
        if (item.healthResult.creatinine > 3) {
          critical.push(item);
        } else if (item.healthResult.creatinine > 1.4) {
          high.push(item);
        }

        //BUN
        if (item.healthResult.bun > 40) {
          critical.push(item);
        } else if (item.healthResult.bun > 25) {
          high.push(item);
        }


        //Glucose
        if (item.healthResult.glucose > 200) {
          critical.push(item);
        } else if (item.healthResult.glucose >= 126 && item.healthResult.glucose <= 199) {
          high.push(item);
        } else if (item.healthResult.glucose >= 101 && item.healthResult.glucose <= 125) {
          moderate.push(item);
        }

        //GSP
        if (item.healthResult.gsp > 350) {
          critical.push(item);
        } else if (item.healthResult.gsp > 270) {
          high.push(item);
        }
      }


    });


    var result = {
      'moderate': utils.removeSameItem(moderate),
      'high': utils.removeSameItem(high),
      'critical': utils.removeSameItem(critical)
    };
    return result;

  }


  // Init model
  $scope.NgTableParams = ngTableParams;
  $scope.currEmployer = null;
  $scope.currAlertLevel = null;

  // Filter here
  $scope.filter = {
    lastName: undefined,
    clientName: undefined,
    alertLevel: undefined
  };
  $scope.filterAlertLevel = undefined;

  $scope.loading = true;
  $scope.tableParams = new $scope.NgTableParams({
    page: 1,   // show first page
    count: 25,  // count per page
    filter: $scope.filter,
    sorting: {
      lastName: 'asc'     // initial sorting
    }
  }, {
    getData: function ($defer, params) {

      $scope.loading = false;
      function pagination() {


        $scope.loading = true;
        if (params.filter().lastName || params.filter().clientName || params.filter().alertLevel || params.sorting().lastName !== 'asc') {

          var data = $scope.dataAllParticipantsFilter;
          var filter = angular.copy(params.filter());

          if (params.filter().alertLevel) {
            data = filterAlertLevel($scope.dataAllParticipantsFilter)[params.filter().alertLevel];

            delete filter.alertLevel;
          }


          $scope.loading = false;
          // use build-in angular sort
          var orderedData = filter ?
            $filter('filter')(data, filter) :
            data;

          orderedData = params.sorting() ?
            $filter('orderBy')(orderedData, params.orderBy()) :
            orderedData;


          $scope.datas = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve($scope.datas);


        }
        else {
          if ($scope.dataAllParticipants.length === 0) {
            participants.getall().then(function (data) {
              $scope.dataAllParticipants = data.participantList;

              $scope.dataAllParticipantsFilter = data.participantList;

              params.total($scope.dataAllParticipantsFilter.length);
              $scope.datas = $scope.dataAllParticipantsFilter.slice((params.page() - 1) * params.count(), params.page() * params.count());
              $defer.resolve($scope.datas);

              $scope.loading = false;
            }, function (error) {
              $scope.loading = false;
            });
          } else {
            params.total($scope.dataAllParticipantsFilter.length);

            if ($scope.isClickFilder) {
              params.page(1);
              $scope.isClickFilder = false;
            }

            $scope.datas = $scope.dataAllParticipantsFilter.slice((params.page() - 1) * params.count(), params.page() * params.count());
            $defer.resolve($scope.datas);

            $scope.loading = false;
          }


        }
      }

      params.data = [];
      pagination();

    }
  });


  // Reload current page
  $scope.reload = function () {
    $scope.tableParams.reload();
  };

  // Init
  function getEmployers() {
    employers.all(undefined, false).then(function (data) {
      $scope.employerList = data.employerList;
    });
  }


  function init() {
    getEmployers();
    variableDefinitions();
  }

  init();


  $scope.choiceEmployer = function (employer) {
    $scope.currEmployer = employer;
    $scope.filter.clientName = employer.clientName;
  };

  $scope.choiceAlertLevel = function (value) {
    $scope.currAlertLevel = value;
    $scope.filterAlertLevel = value;

    var tempDate = [];
    if (value) {
      tempDate = filterAlertLevel($scope.dataAllParticipantsFilter)[value];
    } else {
      tempDate = $scope.dataAllParticipantsFilter;
    }
    $scope.dataAllParticipantsFilter = tempDate;
    $scope.reload();
  };

  $scope.filterEmployerClear = function () {
    $scope.currEmployer = null;
    $scope.currAlertLevel = null;
    $scope.filter.clientName = undefined;
    $scope.filterAlertLevel = undefined;
  };


  /***************Filter Biomarker ****************/

  // Data Health Results
  $scope.biomarkers = [
    {
      'name': 'Weight',
      'value': 'weight'
    },
    {
      'name': 'Height',
      'value': 'height'
    },
    /*{
     'name': 'SmokerResponse',
     'value': 'smokerResponse'
     },*/
    {
      'name': 'BMIValue',
      'value': 'bmiValue'
    },
    {
      'name': 'CalcBMI',
      'value': 'calcBmi'
    },
    {
      'name': 'BodyFat',
      'value': 'bodyFat'
    },
    {
      'name': 'Waist',
      'value': 'waist'
    },
    {
      'name': 'Hip',
      'value': 'hip'
    },
    {
      'name': 'BPDValue1',
      'value': 'bpdValue1'
    },
    {
      'name': 'BPSValue1',
      'value': 'bpsValue1'
    },
    {
      'name': 'BPDValue1',
      'value': 'bpdValue1'
    },
    {
      'name': 'BPSValue2',
      'value': 'bpdValue2'
    },
    {
      'name': 'HDL',
      'value': 'hdl'
    },
    {
      'name': 'LDL',
      'value': 'ldl'
    },
    {
      'name': 'TotCholesterol',
      'value': 'totChol'
    },
    {
      'name': 'SerumContine',
      'value': 'serumContine'
    },
    {
      'name': 'A1C',
      'value': 'a1c'
    },
    {
      'name': 'Glucose',
      'value': 'glucose'
    },
    {
      'name': 'Fructosamine',
      'value': 'fructosamine'
    },
    {
      'name': 'BUN',
      'value': 'bun'
    },
    {
      'name': 'Creatinine',
      'value': 'creatinine'
    },
    {
      'name': 'Alkaline',
      'value': 'alkaline'
    },
    {
      'name': 'Bilirubin',
      'value': 'bilirubin'
    },
    {
      'name': 'AST',
      'value': 'ast'
    },
    {
      'name': 'ALT',
      'value': 'alt'
    },
    {
      'name': 'GGT',
      'value': 'ggt'
    },
    {
      'name': 'Protein',
      'value': 'protein'
    },
    {
      'name': 'Albumin',
      'value': 'albumin'
    },
    {
      'name': 'Globulin',
      'value': 'globulin'
    },
    {
      'name': 'ALB',
      'value': 'alb'
    },
    {
      'name': 'Triglycerides',
      'value': 'triglycerides'
    },
    {
      'name': 'PSA',
      'value': 'psa'
    },
    {
      'name': 'WhiteBlood',
      'value': 'whiteBlood'
    },
    {
      'name': 'RedBlood',
      'value': 'redBlood'
    },
    {
      'name': 'Hemoglobin',
      'value': 'hemoglobin'
    },
    {
      'name': 'Hematocrit',
      'value': 'hematocrit'
    },
    {
      'name': 'MeanCorpVol',
      'value': 'meanCorpVol'
    },
    {
      'name': 'MeanCorpHem',
      'value': 'meanCorpHem'
    },
    {
      'name': 'MeanCorpHemCo',
      'value': 'meanCorpHemCo'
    },
    {
      'name': 'RedCellDistr',
      'value': 'redCellDistr'
    },
    {
      'name': 'Platelets',
      'value': 'platelets'
    },
    {
      'name': 'GSP',
      'value': 'gsp'
    },
    {
      'name': 'T4',
      'value': 't4'
    },
    {
      'name': 'HsCRP',
      'value': 'hscrp'
    },
    {
      'name': 'NTproBNP',
      'value': 'nTproBNP'
    },
    {
      'name': 'TSH',
      'value': 'tsh'
    },
    {
      'name': 'Homocysteine',
      'value': 'homocysteine'
    },
    {
      'name': 'Lipoprotein',
      'value': 'lipoprotein'
    }

  ];

  $scope.compareBiomarkers = [
    {
      "name": "<",
      "value": "<"
    },
    {
      "name": "<=",
      "value": "<="
    },
    {
      "name": "=",
      "value": "="
    },
    {
      "name": ">",
      "value": ">"
    },

    {
      "name": ">=",
      "value": ">="
    }
  ];

  $scope.filterMetabolic = function () {
    $scope.isClickFilder = true;
    $scope.isfilterMetabolic = true;
    $scope.clearFilterBiomarker();
    participants.getallMetabolic().then(function (data) {

      var tempData = [];
      angular.forEach(data.participantList, function (item) {
        item.healthResult = item.healthresults[0];
        item.clientName = item.employer.clientName;
        delete item.healthresults;
        delete item.employer.clientName;
        tempData.push(item);
      });

      $scope.dataAllParticipantsFilter = tempData;
      $scope.isClickFilder = false;
      $scope.reload();
    }, function (error) {
      $scope.isClickFilder = false;
    });
  };

  $scope.filterBiomarker = function (data) {

    $scope.isClickFilder = true;

    if ($scope.isfilterMetabolic) {
      $scope.clearFilterBiomarker();
    }

    if (data.alertLevel) {
      $scope.dataAllParticipantsFilter = filterAlertLevel($scope.dataAllParticipantsFilter)[data.alertLevel];
    }

    if (data.namebiomarker && data.compareBiomarker && data.valueBiomarker) {
      var tempDataAllParticipants = [];
      angular.forEach($scope.dataAllParticipantsFilter, function (item) {
        if (item.healthResult && item.healthResult[data.namebiomarker]) {
          var value1 = item.healthResult[data.namebiomarker];
          var value2 = data.valueBiomarker;
          if (utils.compareItems(value1, data.compareBiomarker, value2)) {
            tempDataAllParticipants.push(item);
          }
        }

      });
      $scope.dataAllParticipantsFilter = tempDataAllParticipants;
    }

    $scope.reload();

    $scope.isfilterMetabolic = false;
  };

  $scope.clearFilterBiomarker = function () {
    variableDefinitions();
    $scope.dataAllParticipantsFilter = $scope.dataAllParticipants;
    $scope.reload();
  };

});
