angular.module('app.modules.benicomp-select.direct-deposit-manager.view-result', [])

  .controller('ViewResultDDController', function ($scope, $state, $modalInstance, $translate, data, CONFIGS, utils) {

    $scope.tableData = [];

    $scope.generateTable = function (data) {
      $scope.tableData = [
        {label: 'Group Name', value: data.groupName},
        {label: 'Group #', value: data.groupNumber},
        {label: 'Insured Name', value: utils.getFullName(data)},
        {label: 'Insured Last 4 Digits of SS#', value: data.ssn},
        {label: 'Insured Email', value: data.email},
        {label: 'Home Phone Number', value: data.homePhoneNumber},
        {label: 'Daytime Phone Number', value: data.daytimePhoneNumber},
        {label: 'Type', value: utils.getTypeOfDirectDeposit(data.choiceType)}
      ];

      if (data.choiceType === 2) {
        $scope.tableData.push(
          {label: 'Change Effective Date', value: data.changeEffectiveDate}
        );
      }

      if (data.choiceType === 3) {
        $scope.tableData.push(
          {label: 'Cancel Effective Date', value: data.cancelEffectiveDate}
        );
      }

      $scope.tableData.push(
        {label: 'Bank Name', value: data.bankName},
        {label: 'Account Type', value: utils.getAccountTypeOfDirectDeposit(data.accountType)},
        {label: 'Routing/ABA Number', value: data.routing},
        {label: 'Account Number', value: data.accountNumber}
      );

      //Create list file
      angular.forEach(JSON.parse(data.fileUploadVoidedChecks), function (item, index) {
        if (item.listFiles && item.listFiles.length > 0) {

          var tmpIndex = index + 1;
          var fileHtml = '';
          angular.forEach(item.listFiles, function (file, key) {
            var urlFile = CONFIGS.baseURL() + '/documents/downloadClientDocumentFile?fileNames=' + file.respondAPI.documentFilename.toString();
            fileHtml += '<img src="assets/images/185.png"><a target="_blank" href="' + urlFile + '">&nbsp;' + file.filename + ' (' + file.filesize + ')</a><br>';
          });

          $scope.tableData.push({
            label: (tmpIndex === 1) ? 'Please attach a voided check (for checking account deposits).For savings account deposits, a routing number and account number need to be obtained from the bank.This must be included to process. Incomplete forms will be returned.' : 'Upload a ' + tmpIndex + 'rd set of files',
            value: fileHtml
          });

        }
      });


      $scope.tableData.push({
        label: '<p>Employee Authorization</p><p>I authorize BeniComp and its financial institution to initiate credit electronically or otherwise to my checking or savings account.This authorization will remain in effect until BeniComp has received written notification.</p>',
        value: null
      });

      $scope.tableData.push({
        label: 'Signed Date',
        value: data.signedDate,
        class: 'row-white'
      });

      $scope.tableData.push({
        label: '<p>Administered by BeniComp, Inc. <br>8310 Clinton Park Drive <br>Fort Wayne, IN 46825 <br>Phone (866) 797-3343<br>Fax (260) 482-8991<br><br>The promoters of this product make no representation concerning the tax advantages of this program and recommend that policyholders consult their tax advisor.</p>',
        value: null
      });


    };

    function init() {
      $scope.generateTable(data);
    }

    init();
  });