angular.module('app.modules.health-results.participant.metabolic-syndrome', [])

    .config(function ($stateProvider) {
        $stateProvider
            .state('loggedIn.modules.health-results.metabolic-syndrome', {
                url: '/metabolic-syndrome',
                views: {
                    'main-content@loggedIn.modules': {
                        templateUrl: 'modules/health-results/participant/metabolic-syndrome/metabolic-syndrome.tpl.html',
                        controller: 'HealthResultsMetabolicSyndromeController'
                    }
                }
            });
    })

    .controller('HealthResultsMetabolicSyndromeController',
    function ($scope, participants, LABVALUES) {

        $scope.options = {
            percent: 0,
            lineWidth: 10,
            trackColor: '#65b9a6',
            barColor: '#e94f4f',
            scaleColor: false,
            size: 115,
            rotate: -90,
            lineCap: 'butt',
            animate: {duration: 1000, enabled: false}
        };

        //function create tableList
        function createTableList(data) {

            var tableList = [];

            // Waist Passed
            tableList.push({
                classes: 'ldl-cholesterol',
                passed: data.isWaistPassed,
                name: 'Waist',
                result: data.waist,
                target: 'Waist Circumference: Less than or equal to 40 inches.',
                mean: 'This is also called "abdominal obesity" or "having an apple shape." Central obesity is determined by measuring waist circumference.'
            });

            // Check  Blood Pressure
            tableList.push({
                classes: 'blood-pressure',
                passed: data.isBloodPressurePassed,
                name: 'Blood Pressure',
                result: data.bloodPressure,
                target: 'Blood Pressure: Less than 130 systolic and Less than 85 diastolic mmHg',
                mean: 'Blood pressure is the force of blood pushing against the artery walls as the heart pumps blood. High blood pressure can damage the heart and lead to other health problems such as heart disease and stroke.'
            });

            // Check Blood Sugar
            tableList.push({
                classes: 'blood-sugar',
                passed: data.isBloodGlucosePassed,
                name: 'Blood Sugar',
                result: data.bloodGlucose,
                target: 'Blood Glucose: Less than 100 mg/dL',
                mean: 'Glucose, also called blood sugar, is what the body uses for energy. High glucose may be a sign of diabetes and affects kidney functions.'
            });

            // Check Triglycerides
            tableList.push({
                classes: 'blood-sugar',
                passed: data.isTriglyceridesPassed,
                name: 'Triglycerides',
                result: data.triglycerides,
                target: 'Triglycerides: Less than 150 mg/dL',
                mean: 'Triglycerides are a type of fat found in the blood. High triglycerides increase the chance of developing heart disease.'
            });

            // Check hdl Cholesterol
            tableList.push({
                classes: 'blood-sugar',
                passed: data.isHdlPassed,
                name: 'hdl Cholesterol',
                result: data.hdlCholesterol,
                target: 'HDL Cholesterol: Greater than or equal to 40 mg/dL',
                mean: 'A high level of HDL is good because HDL is the type of cholesterol that helps to remove cholesterol from the arteries. A low HDL cholesterol level can lead to the development of heart disease.'
            });

            return tableList;
        }

        // GetMyRewards
        function getMyRewards() {
            $scope.isGettingMyReward = true;
            participants.getMyRewards().then(function (rs) {
                $scope.totalReward = rs.totalRewardsEarned;
                $scope.totalReal = rs.totalPossibleRewards;
                $scope.totalPassed = rs.metabolicSyndromePassed;
                $scope.totalCount = 5;

                $scope.tableList = createTableList(rs);

                $scope.isGettingMyReward = false;

                // Chart
                $scope.percent = (rs.metabolicSyndromePassed / $scope.totalCount) * 100;
                $scope.options.percent = $scope.percent;


            }, function (err) {

            });
        }


        function int() {
            getMyRewards();
        }

        int();
    }
)
;