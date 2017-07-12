angular.module('app.modules.benicomp-select.privacy-authorization-form.view-result', [])

  .controller('ViewResultPAFController', function ($scope, $state, $modalInstance, $translate, data, CONFIGS, utils) {

    $scope.tableData = [];

    $scope.generateTable = function (data) {
      $scope.tableData = [
        {label: 'Group Name', value: data.groupName},
        {label: 'Group #', value: data.groupNumber},
        {label: 'Insured Name', value: utils.getFullName(data)},
        {label: 'Insured Date of Birth', value: data.dateOfBirth},
        {label: 'Insured Last 4 Digits of SS#', value: data.ssn},
        {label: 'Insured Email', value: data.email},
        {
          label: '<p>Authorization</p><p>If you sign this document, you give permission to the below named individual(s) to:<br/></p><p>Submit your personal health information (PHI) to BeniComp Select and sign on your behalf in the form of a claim;<br>Discuss your personal health information submitted to BeniComp Select as a claim;<br>Access this information using our web-based portal.<br/></p><p>The PHI that the authorized individual(s) will be discussing with BeniComp Select includes:<br/></p><p>Type of Service<br>Providers of Service<br>Dates of Service<br>Service Expenses</p>',
          value: null,
          class: 'row-white'
        },
        {
          label: "The PHI listed above may be discussed and/or disclosed (released) to:",
          value: null
        }
      ];


      var indexData = 1;
      angular.forEach(JSON.parse(data.individualsData), function (item, key) {
        if (item) {
          if (item.firstName !== "" || item.middleName !== "" || item.lastName !== "") {
            $scope.tableData.push({
              label: 'Authorized Individual ' + indexData + ' Name',
              value: item.firstName + " " + (item.middleName ? item.middleName + " " : "") +
              item.lastName
            });
            indexData++;
          }
        }

      });



      $scope.tableData.push({
        label: '<p>The above named individual(s) is required by law to protect your health information.By signing this document, you authorize the individual(s) named above to discuss and/or disclose (release) your health information with BeniComp Select.Those persons who receive your health information may not be required by Federal privacy laws (such as the Privacy Rule) to protect it and may share your information with others without yourpermission, if permitted by laws governing them.This Authorization does not have an expiration date.</p><p>Please note, you may change your mind and revoke (take back) this Authorization at any time. To revoke this Authorization, you must notify BeniComp Select in writing.</p>',
        value: null
      });

      $scope.tableData.push({
        label: 'Insured Signature',
        value: '<div class="img-signature"><img src="' + data.signature + '" height="130" width="309"/></div>',
        class: 'row-green'
      });

      $scope.tableData.push({
        label: 'Signed Date',
        value: data.signedDate,
        class: 'row-white'
      });
    };

    function init() {
      $scope.generateTable(data);
    }

    init();
  });