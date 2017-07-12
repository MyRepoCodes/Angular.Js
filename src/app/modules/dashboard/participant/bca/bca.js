angular.module('app.modules.dashboard.participant.bca', [
  'app.modules.health-results.coach',
  'app.modules.health-results.improvement-testimonial'
])

.controller('DashboardParticipantBCAController', function($scope, $state, $stateParams, $modal, security, utils, participants, LABVALUES) {

  if (!security.currentUser.healthResult) {
    if (security.isParticipant() && $stateParams.clientUrl) {
      $state.go('loggedIn.modules.registrationClientUrl', {clientUrl: $stateParams.clientUrl});
    } else {
      $state.go('loggedIn.modules.registration');
    }
  }

  $scope.rewardInfo = security.rewardInfo;
  $scope.tableList = security.rewardInfo.tableList;
  $scope.totalReal = security.rewardInfo.totalReal;
  $scope.totalReward = security.rewardInfo.totalReward;
  $scope.totalCount = security.rewardInfo.totalCount;
  $scope.totalPassed = security.rewardInfo.totalPassed;
  $scope.totalPassedReward = 0;

  $scope.options = {
    percent: 0,
    lineWidth: 10,
    trackColor: '#e94f4f',
    barColor: '#65b9a6',
    scaleColor: false,
    size: 115,
    rotate: -90,
    lineCap: 'butt',
    animate: {duration: 1000, enabled: false}
  };

  $scope.optionsSyndrome = {
    percent: 0,
    lineWidth: 10,
    trackColor: '#e94f4f',
    barColor: '#65b9a6',
    scaleColor: false,
    size: 115,
    rotate: -90,
    lineCap: 'butt',
    animate: {duration: 1000, enabled: false}
  };

  $scope.optionsChartSyndrome = {
    chart: {
      type: 'pieChart',
      height: 120,
      width: 150,
      margin: {
        top: -10,
        right: 0,
        bottom: 0,
        left: 0
      },
      x: function(d) {
        return d.key;
      },
      y: function(d) {
        return d.y;
      },
      showLabels: false,
      labelThreshold: 0.1,
      labelSunbeamLayout: false,
      donut: "Syndrome",
      showLegend: false,
      legend: {
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      color: function(d, i) {
        return d.color;
      }
    }
  };

  $scope.dataChartSyndrome = [
    {key: "Passes", y: 0, color: "#06ad5f"},
    {key: "N/A", y: 0, color: "gray"},
    {key: "Fails", y: 0, color: "red"}
  ];

  // Youtube ID
  $scope.theBestVideo = 'w0UiND_5CqA';

  // Brand
  $scope.brand = security.brand;
  $scope.$on('security:brand:updated', function() {
    $scope.brand = security.brand;
  });

  $scope.openHealthCoachForm = function() {
    $scope.modal = $modal.open({
      controller: 'HealthCoachController',
      templateUrl: 'modules/health-results/coach/coach.tpl.html',
      backdrop: 'static'
    });
  };

  $scope.sendMailToHealthCoach = function() {
    participants.sendMailToHealthCoach()
      .then(function(data) {

        $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function() {
              return {
                title: "Success",
                summary: false,
                style: 'ok',
                message: data
              };
            }
          }
        });

      }, function(err) {
        $modal.open({
          controller: 'AlertController',
          templateUrl: 'modules/alert/alert.tpl.html',
          size: 'sm',
          resolve: {
            data: function() {
              return {
                title: "Error",
                summary: false,
                style: 'ok',
                message: err.errors[0].errorMessage
              };
            }
          }
        });

      });
  };

  $scope.openImprovementTestimonialForm = function() {
    $scope.modal = $modal.open({
      controller: 'ImprovementTestimonialController',
      templateUrl: 'modules/health-results/improvement-testimonial/improvement-testimonial.tpl.html',
      backdrop: 'static'
    });
  };


  // function is Reward Passed
  function isRewardPassed(reward) {
    if (reward <= 0) {
      return false;
    } else {
      return true;
    }
  }

  //function create tableList
  function createTableList(data) {

    var tableList = [];
    var totalReward = 0, totalReal = 0, totalPassed = 0, passed = false,
      reward, rewardEmployer, goal, result;
    var bodyMassIndex = data.bodyMassIndexReward !== null,
      bloodSugar = data.bloodSugarReward !== null,
      nicotinUse = data.nicotinReward !== null,
      healthCoaching = true,
      bloodPressure = data.bloodPressureReward !== null,
      ldlCholesterol = data.ldlReward !== null,
      participation = data.participationReward !== null,
      waistCircumference = data.waistCircumferenceReward !== null,
      a1c = data.a1cReward !== null;


    // Check  Body Mass index
    if (bodyMassIndex) {
      result = data.bodyMassIndexResult;
      reward = parseInt(data.bodyMassIndexReward) ? parseInt(data.bodyMassIndexReward) : 0;
      rewardEmployer = parseInt(data.incentiveBmiReward) ? parseInt(data.incentiveBmiReward) : 0;
      goal = data.bodyMassIndexGoal ? data.bodyMassIndexGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());

      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'body-mass-index',
        passed: passed,
        name: 'Body Mass Index',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.bmiValue
      });
    }

    // Check  Blood Pressure
    if (bloodPressure) {
      result = data.bloodPressureResult;
      reward = parseInt(data.bloodPressureReward) ? parseInt(data.bloodPressureReward) : 0;
      rewardEmployer = parseInt(data.incentiveBloodPressureReward) ? parseInt(data.incentiveBloodPressureReward) : 0;
      goal = data.bloodPressureIndexGoal ? data.bloodPressureIndexGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());
      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'blood-pressure',
        passed: passed,
        name: 'Blood Pressure',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.bloodPressure
      });
    }

    // Check Blood Sugar
    if (bloodSugar) {
      result = data.bloodSugarResult;
      reward = parseInt(data.bloodSugarReward) ? parseInt(data.bloodSugarReward) : 0;
      rewardEmployer = parseInt(data.incentiveBloodSugarReward) ? parseInt(data.incentiveBloodSugarReward) : 0;
      goal = data.bloodSugarGoal ? data.bloodSugarGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());
      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'blood-sugar',
        passed: passed,
        name: 'Blood Glucose',
        goal: goal,
        result: result,
        rewardEmployer: rewardEmployer,
        reward: reward,
        data: LABVALUES.glucose
      });
    }

    // Check the LDL Cholesterol
    if (ldlCholesterol) {
      result = data.ldlResult;
      reward = parseInt(data.ldlReward) ? parseInt(data.ldlReward) : 0;
      rewardEmployer = parseInt(data.incentiveLdlReward) ? parseInt(data.incentiveLdlReward) : 0;
      goal = data.ldlGoal ? data.ldlGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());
      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'ldl-cholesterol',
        passed: passed,
        name: 'LDL Cholesterol',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.ldl
      });
    }

    // Check use nicotine
    if (nicotinUse) {
      if (data.nicotinResult === true || data.nicotinResult === 'Yes') {
        result = 'Yes';
      } else {
        result = 'No';
      }
      reward = parseInt(data.nicotinReward) ? parseInt(data.nicotinReward) : 0;
      rewardEmployer = parseInt(data.incentiveNicotinReward) ? parseInt(data.incentiveNicotinReward) : 0;
      goal = data.nicotinGoal ? data.nicotinGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());
      totalReal += reward;

      if (isRewardPassed(reward) && result === 'No') {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'nicotine-use',
        passed: passed,
        name: 'Nicotine Use',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.smokerResponse
      });
    }

    // Check use participation
    if (participation) {
      result = data.participationResult ? 'Yes' : 'No';
      reward = parseInt(data.participationReward) ? parseInt(data.participationReward) : 0;
      rewardEmployer = data.incentiveParticipationReward;
      goal = data.participationGoal ? data.participationGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());
      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'participation-have',
        passed: passed,
        name: 'Participation',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.participation
      });
    }

    // Check use waistCircumference && employer[beniCompAdvantage] = true
    if (waistCircumference && security.currentUser.employer.products.beniCompAdvantage) {
      result = data.waistCircumferenceResult;
      reward = parseInt(data.waistCircumferenceReward) ? parseInt(data.waistCircumferenceReward) : 0;
      rewardEmployer = parseInt(data.incentiveWaistCircumferenceReward) ? parseInt(data.incentiveWaistCircumferenceReward) : 0;
      goal = data.waistCircumferenceGoal ? data.waistCircumferenceGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());

      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;
      } else {
        passed = false;
        reward = 0;
      }

      tableList.push({
        classes: 'body-mass-index',
        passed: passed,
        name: 'Waist Circumference',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.waistValue
      });
    }
    // Check use a1c && employer[beniCompAdvantage] = true
    if (a1c && security.currentUser.employer.products.beniCompAdvantage) {
      result = data.a1cResult;
      reward = parseInt(data.a1cReward) ? parseInt(data.a1cReward) : 0;
      rewardEmployer = parseInt(data.incentiveA1CReward) ? parseInt(data.incentiveA1CReward) : 0;
      goal = data.a1cGoal ? data.a1cGoal : '';
      goal = utils.convertOperatorsToString(goal.trim());

      totalReal += reward;

      if (isRewardPassed(reward)) {
        $scope.totalPassedReward += 1;
        passed = true;
        totalReward += reward;
        totalPassed++;

      } else {
        passed = false;
        reward = 0;


      }

      tableList.push({
        classes: 'blood-sugar',
        passed: passed,
        name: 'A1C',
        goal: goal,
        result: result,
        reward: reward,
        rewardEmployer: rewardEmployer,
        data: LABVALUES.a1c
      });
    }

    return tableList;
  }

  function createDataChart(data) {

    //isWaistPassed
    if (data.isWaistPassed) {
      $scope.dataChartSyndrome[0].y += 1;
    } else {
      if (data.waist) {
        $scope.dataChartSyndrome[2].y += 1;
      } else {
        $scope.dataChartSyndrome[1].y += 1;
      }
    }

    //isBloodPressurePassed
    if (data.isBloodPressurePassed) {
      $scope.dataChartSyndrome[0].y += 1;
    } else {
      if (data.bloodPressure !== "0 / 0") {
        $scope.dataChartSyndrome[2].y += 1;
      } else {
        $scope.dataChartSyndrome[1].y += 1;
      }
    }

    //isBloodGlucosePassed
    if (data.isBloodGlucosePassed) {
      $scope.dataChartSyndrome[0].y += 1;
    } else {
      if (data.bloodGlucose) {
        $scope.dataChartSyndrome[2].y += 1;
      } else {
        $scope.dataChartSyndrome[1].y += 1;
      }
    }

    //isTriglyceridesPassed
    if (data.isTriglyceridesPassed) {
      $scope.dataChartSyndrome[0].y += 1;
    } else {
      if (data.triglycerides) {
        $scope.dataChartSyndrome[2].y += 1;
      } else {
        $scope.dataChartSyndrome[1].y += 1;
      }
    }

    //isHdlPassed
    if (data.isHdlPassed) {
      $scope.dataChartSyndrome[0].y += 1;
    } else {
      if (data.hdlCholesterol) {
        $scope.dataChartSyndrome[2].y += 1;
      } else {
        $scope.dataChartSyndrome[1].y += 1;
      }
    }

  }

  //function create tableList
  function createTableListMeam(data) {

    var tableList = [];

    // Waist Passed
    tableList.push({
      classes: 'ldl-cholesterol',
      passed: data.isWaistPassed,
      name: 'Waist',
      result: data.waist,
      target: 'Waist Circumference: Less than or equal to 40 inches.',
      mean: 'This is also called abdominal obesity. Excess fat in the stomach area is a greater risk factor for heart disease than excess fat in other parts of the body, such as on the hips.'
    });

    // Check  Blood Pressure
    tableList.push({
      classes: 'blood-pressure',
      passed: data.isBloodPressurePassed,
      name: 'Blood Pressure',
      result: (data.bloodPressure !== "0 / 0") ? data.bloodPressure : 'N/A',
      target: 'Blood Pressure: Less than 130 systolic and Less than 85 diastolic mmHg',
      mean: 'Blood pressure is the force of blood pushing against the walls of your arteries as your heart pumps blood. If this pressure rises and stays elevated over time, it can cause damage to your heart and lead to plaque buildup.'
    });

    // Check Blood Sugar
    tableList.push({
      classes: 'blood-sugar',
      passed: data.isBloodGlucosePassed,
      name: 'Blood Sugar',
      result: data.bloodGlucose,
      target: 'Blood Glucose: Less than 100 mg/dL',
      mean: 'High blood sugar may be an early sign of diabetes.'
    });

    // Check Triglycerides
    tableList.push({
      classes: 'blood-sugar',
      passed: data.isTriglyceridesPassed,
      name: 'Triglycerides',
      result: data.triglycerides,
      target: 'Triglycerides: Less than 150 mg/dL',
      mean: 'Triglycerides are a type of fat found in the blood. Having high triglycerides increases your chance of developing heart disease.'
    });

    // Check hdl Cholesterol
    tableList.push({
      classes: 'blood-sugar',
      passed: data.isHdlPassed,
      name: 'hdl Cholesterol',
      result: data.hdlCholesterol,
      target: 'HDL Cholesterol: Greater than or equal to ' + ((security.currentUser.gender === "M") ? '40' : '50') + ' mg/dL',
      mean: 'HDL, more commonly understood as "good" cholesterol, because it helps remove cholesterol form your arteries. A low HDL cholesterol level raises your risk for heart disease.'
    });

    // Check waist circumference
    tableList.push({
      classes: 'blood-sugar',
      passed: data.isWaistPassed,
      name: 'waist circumference',
      result: data.waist,
      target: '',
      mean: 'Measuring waist circumference helps screen for possible health risks that come with overweight and obesity. If most of your fat is around your waist rather than at your hips, you’re at a higher risk for heart disease and type 2 diabetes. This risk goes up with a waist size that is greater than 35 inches for women or greater than 40 inches for men.'
    });

    return tableList;
  }

  // GetMyRewards
  function getMyRewards() {
    $scope.isGettingMyReward = true;
    participants.getMyRewards("",false).then(function(rs) {
      $scope.totalReward = security.rewardInfo.totalReward = rs.totalRewardsEarned;
      $scope.totalReal = security.rewardInfo.totalReal = rs.totalPossibleRewards;
      $scope.totalPassed = security.rewardInfo.totalPassed = rs.metabolicSyndromePassed;

      $scope.tableList = createTableList(rs);
      $scope.tableListMean = createTableListMeam(rs);
      createDataChart(rs);

      $scope.isGettingMyReward = false;


      // Chart
      $scope.percent = ($scope.totalPassedReward / 5) * 100;
      $scope.options.percent = $scope.percent;

      $scope.percentSyndrome = (rs.metabolicSyndromePassed / 5) * 100;
      $scope.optionsSyndrome.percentSyndrome = $scope.percentSyndrome;


    }, function(err) {

    });
  }


  function int() {
    getMyRewards();
  }

  int();
});
