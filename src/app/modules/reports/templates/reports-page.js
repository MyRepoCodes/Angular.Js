angular.module("app.modules.reports.page", [])

  .controller('ReportPageController',
    function ($scope,$state, security, utils, $modal) {

      //Define Value
      var listProduct = [
        {id: 1, name: "bca", label: "BeniComp Advantage"},
        {id: 2, name: "bcs", label: "BeniComp Select"}
      ];

      var listBCAListOfReports = [
        {id: 1, name: "preventiveHealthManagement", label: "Preventive Health Management", defaultValue: false},
        {id: 2, name: "claimsDataReport", label: "Claims Data Report", defaultValue: false}
      ];

      //Preventive Health Management
      var listPreventiveHealthManagement = [
        {id: 1, name: "planDesign", label: "Plan Design", defaultValue: false},
        {id: 2, name: "healthScreeningData", label: "Health Screening Data", defaultValue: false},
        {id: 3, name: "healthCoaching", label: "Health Coaching", defaultValue: false},
        {id: 4, name: "trendReport", label: "Trend Report", defaultValue: false},
        {id: 5, name: "trendCharts", label: "Trend Charts", defaultValue: false},
        {id: 6, name: "metabolicSyndrome", label: "Metabolic Syndrome", defaultValue: false},
      ];

      //Plan Design Reports
      var listPlanDesignReports = {
        planDesignReport: [
          {id: 1, name: "BMI", label: "Body Mass Index (BMI)", defaultValue: true},
          {id: 2, name: "bloodPressure", label: "Blood Pressure", defaultValue: true},
          {id: 3, name: "bloodGlucose", label: "Blood Glucose", defaultValue: true},
          {id: 4, name: "ldlCholesterol", label: "LDL Cholesterol", defaultValue: true},
          {id: 5, name: "nicotineEmployee", label: "Nicotine (Employee)", defaultValue: true},
          {id: 6, name: "nicotineAffidavitSpouse", label: "Nicotine Affidavit (Spouse)", defaultValue: false},
          {id: 7, name: "participation", label: "Participation", defaultValue: false},
        ],
        planDesignReportAdditions: [
          {id: 1, name: "improvementCriteria", label: "Improvement Criteria", defaultValue: true},
          {id: 2, name: "totalRewards", label: "Total Rewards", defaultValue: true},
          {id: 3, name: "incentiveStatistics", label: "Incentive Statistics", defaultValue: true},
        ]
      };

      //Annual Trend Report
      var listAnnualTrendReport = {
        yearsToInclude: [
          {id: 1, name: "allYears", label: "All years", defaultValue: true},
          {id: 2, name: "currentYear", label: "Current Year", defaultValue: false},
          {id: 3, name: "1YearAgo", label: "1 Year ago", defaultValue: false},
          {id: 4, name: "2YearsAgo", label: "2 years ago", defaultValue: false},
          {id: 5, name: "3YearsAgo", label: "3 years ago", defaultValue: false},
          {id: 6, name: "4YearsAgo", label: "4 years ago", defaultValue: false},
        ],
        trendReportValues: [
          {id: 1, name: "BMI", label: "Body Mass Index (BMI)", defaultValue: true},
          {id: 2, name: "bloodPressure", label: "Blood Pressure", defaultValue: true},
          {id: 3, name: "bloodGlucose", label: "Blood Glucose", defaultValue: true},
          {id: 4, name: "ldlCholesterol", label: "LDL Cholesterol", defaultValue: true},
          {id: 5, name: "nicotineEmployee", label: "Nicotine (Employee)", defaultValue: true},
          {id: 6, name: "nicotineAffidavitSpouse", label: "Nicotine Affidavit (Spouse)", defaultValue: false},
          {id: 7, name: "participation", label: "Participation", defaultValue: false},
          {id: 8, name: "metabolicSyndrome", label: "Metabolic Syndrome", defaultValue: false},
        ]
      };


      var listMetabolicSyndromeReport = [
        {id: 1, name: "metabolicSyndrome", label: "Metabolic Syndrome (MetS)", defaultValue: true},
      ];

      //Population Health Risk Assessment
      var listPopulationHealthRiskAssessment = [
        {id: 1, name: "riskOverview", label: "Risk Overview", defaultValue: true},
        {id: 2, name: "noRisk", label: "No Risk", defaultValue: true},
        {id: 3, name: "moderateRisk", label: "Moderate Risk", defaultValue: true},
        {id: 4, name: "highRisk", label: "High Risk", defaultValue: true},
      ];

      // Participation Reports
      var listParticipationReports = [
        {id: 1, name: "healthScreening", label: "Health Screening", defaultValue: false},
        {id: 2, name: "healthCoaching", label: "Health Coaching", defaultValue: false},
        {id: 3, name: "smokingCessation", label: "Smoking Cessation", defaultValue: false},
      ];


      // Health Screening Reports
      var listHealthScreeningReports = [
        {id: 1, name: "BMI", label: "Body Mass Index (BMI)", defaultValue: true},
        {id: 2, name: "bloodPressure", label: "Blood Pressure", defaultValue: true},
        {id: 3, name: "bloodGlucose", label: "Blood Glucose", defaultValue: true},
        {id: 4, name: "ldlCholesterol", label: "LDL Cholesterol", defaultValue: true},
        {id: 5, name: "nicotineEmployee", label: "Nicotine (Employee)", defaultValue: true},
        {id: 6, name: "ageDistribution", label: "Age Distribution", defaultValue: false},
        {id: 7, name: "genderDistribution", label: "Gender Distribution", defaultValue: false},
      ];


      $scope.env = {
        row: 0,
        step: 1,
        showValid: false,
        listProducts: listProduct,
        listBCAListOfReports: listBCAListOfReports,
        listPreventiveHealthManagement: listPreventiveHealthManagement,
        listPlanDesignReports: listPlanDesignReports,
        listAnnualTrendReport: listAnnualTrendReport,
        listMetabolicSyndromeReport: listMetabolicSyndromeReport,
        listPopulationHealthRiskAssessment: listPopulationHealthRiskAssessment,
        listParticipationReports: listParticipationReports,
        listHealthScreeningReports: listHealthScreeningReports,
      };


      // Define params
      $scope.params = {
        selectProduct: "",
        bcaListOfReports: {},
        planDesignReports: {
          planDesignReport: {},
          planDesignReportAdditions: {},
        },
        preventiveHealthManagement: {},
        populationHealthRiskAssessment: {},
        metabolicSyndromeReport: {},
        annualTrendReport: {
          yearsToInclude: {},
          trendReportValues: {}
        },
        participationReports: {},
        healthScreeningReports: {},

      };

      function createInitParmas() {

        //For BCA List Of Reports
        angular.forEach(listBCAListOfReports, function (item) {
          $scope.params.bcaListOfReports[item.name] = item.defaultValue;
        });

        //For Preventive Health Management
        angular.forEach(listPreventiveHealthManagement, function (item) {
          $scope.params.preventiveHealthManagement[item.name] = item.defaultValue;
        });

        //For Plan Design Reports
        angular.forEach(listPlanDesignReports.planDesignReport, function (item) {
          $scope.params.planDesignReports['planDesignReport'][item.name] = item.defaultValue;
        });
        angular.forEach(listPlanDesignReports.planDesignReportAdditions, function (item) {
          $scope.params.planDesignReports['planDesignReportAdditions'][item.name] = item.defaultValue;
        });

        //For Population Health Risk Assessment
        angular.forEach(listPopulationHealthRiskAssessment, function (item) {
          $scope.params.populationHealthRiskAssessment[item.name] = item.defaultValue;
        });

        //For Metabolic Syndrome Report
        angular.forEach(listMetabolicSyndromeReport, function (item) {
          $scope.params.metabolicSyndromeReport[item.name] = item.defaultValue;
        });

        //For Participation Reports
        angular.forEach(listParticipationReports, function (item) {
          $scope.params.participationReports[item.name] = item.defaultValue;
        });

        //For Annual Trend Report
        angular.forEach(listAnnualTrendReport.yearsToInclude, function (item) {
          $scope.params.annualTrendReport['yearsToInclude'][item.name] = item.defaultValue;
        });
        angular.forEach(listAnnualTrendReport.trendReportValues, function (item) {
          $scope.params.annualTrendReport['trendReportValues'][item.name] = item.defaultValue;
        });


        //For Health Screening Reports
        angular.forEach(listHealthScreeningReports, function (item) {
          $scope.params.healthScreeningReports[item.name] = item.defaultValue;
        });
      }


      //Function run report
      $scope.runReport = function (isValid) {

        $scope.env.step = 2;
        $scope.$parent.env.isHiddenTab = true;

        //$scope.env.showValid = true;
        $scope.env.row = 0;
        if (isValid) {
          //$scope.env.showValid = false;

        }
      };


      //Publish report
      $scope.publishReport = function () {

      };

      //save PDF report
      $scope.savePDF = function () {

      };

      //Edit report
      $scope.editReport = function () {
        $scope.env.step = 1;
        $scope.$parent.env.isHiddenTab = false;
      };

      //Cancel report
      $scope.cancelReport = function () {
        $scope.$parent.env.isHiddenTab = false;
        $state.go("loggedIn.modules.reports");
      };

      function init() {
        createInitParmas();
      }

      init();

    }
  );
