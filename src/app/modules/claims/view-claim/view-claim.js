angular.module('app.modules.claims.view-claim', [])

  .controller('ViewClaimController', function ($scope, $state, $modalInstance, $translate, data, CONFIGS, utils) {
    $scope.typeOfClaimItemList = {
      1: 'Dental',
      2: 'Vision',
      3: 'Pharmacy',
      4: 'Medical'
    };

    $scope.relationshipList = {
      1: 'Self',
      2: 'Spouse',
      3: 'Child',
      4: 'Other'
    };

    $scope.claimInfoFull = data;
    $scope.claimsData = data.claimData;
    $scope.tableData = [];
    $scope.generateTable = function (data) {
      $scope.tableData = [
        { label: 'Group Name', value: data.groupName },
        { label: 'Group #', value: data.groupNumber },
        { label: 'Insured\'s Name', value: utils.getFullName(data) },
        { label: 'Insured\'s Birthdate', value: new Date(utils.dateServerToLocalTime(data.insuredBirthdate)).format('mmm dd, yyyy') },
        { label: 'Insured\'s Email', value: data.email },
        { label: 'Insured\'s Last 4 digits of SS#', value: data.ssn },
        { label: 'Claimant\'s Name', value: data.claimantName.firstName + " " + (data.claimantName.middleName ? data.claimantName.middleName + " " : "") + data.claimantName.lastName },
        { label: 'Relationship to Insured', value: $scope.relationshipList[data.relationship] },
        { label: 'Claimant\'s Birthdate', value: new Date(utils.dateServerToLocalTime(data.claimantBirthdate)).format('mmm dd, yyyy') },
        { label: 'Number of Claim Items', value: data.numberOfClaimItems }
      ];

      angular.forEach(data.claimItems, function (claim, key) {

        if (claim) {
          var idClaim = parseInt(key) + 1;
          $scope.tableData.push({ label: 'Claim Item ' + idClaim, value: '' });
          $scope.tableData.push({
            label: 'Type of Claim Item',
            value: utils.getTypeOfClaimItem(claim.typeOfClaimItem)
          });
          $scope.tableData.push({
            label: 'Provider of Services',
            value: claim.providerOfServices
          });
          $scope.tableData.push({
            label: 'Date Incurred',
            value: new Date(utils.dateServerToLocalTime(claim.dateIncurred)).format('mmm dd, yyyy')
          });
          $scope.tableData.push({
            label: 'Amount of Expense',
            value: '$' + claim.amountOfExpenseDollars + '.' + claim.amountOfExpenseCents
          });
          $scope.tableData.push({
            label: 'Amount Eligible for Reimbursement by BeniComp Select',
            value: '$' + claim.amountEligibleDollars + '.' + claim.amountEligibleCents
          });
        }

      });

      //Supporting Documentation Upload
      $scope.tableData.push({
        label: '<div class="mf_section_title">Supporting Documentation Upload</div><br/><div class="mf_section_content">NOTE: If the receipts and bills are all on one supporting document then please only upload the document once. You can choose or take a photo with your smartphone or tablet or upload files from your computer.</div>',
        value: null
      });

      //Create list file
      angular.forEach(data.fileUploadReceipts, function (item, index) {
        if (item.listFiles && item.listFiles.length > 0) {

          var tmpIndex = index + 1;
          var fileHtml = '';
          angular.forEach(item.listFiles, function (file, key) {
            var urlFile = CONFIGS.baseURL() + '/benicompclaimfiles/download?filenames=' + file.respondAPI.toString();
            fileHtml += '<img src="assets/images/185.png"><a target="_blank" href="' + urlFile + '">&nbsp;' + file.filename + ' (' + file.filesize + ')</a><br>';
          });

          $scope.tableData.push({
            label: (tmpIndex === 1) ? 'Upload receipts and bills including supporting documentation with each claim item.' : 'Upload a ' + tmpIndex + 'rd set of files',
            value: fileHtml
          });

        }
      });

      //WARNING
      $scope.tableData.push({
        label: '<div class="mf_section_content">I certify that the above statements are true and hereby authorize any physician, hospital, employer, union, HMO, insurance company or prepayment organization to give the claims administrator any additional information required in connection with this Claim for Medical Reimbursement Insurance Benefits. A photocopy of this authorization shall be as valid as the original.<br><br>WARNING: FOR YOUR PROTECTION CALIFORNIA LAW REQUIRES THE FOLLOWING TO APPEAR ON THIS FORM. ANY PERSON WHO KNOWINGLY PRESENTS A FALSE OR FRAUDULENT CLAIM FOR THE PAYMENT OF A LOSS IS GUILTY OF A CRIME AND MAY BE SUBJECT TO FINES AND CONFINEMENT IN STATE PRISON.</div>',
        value: null,
        class: 'row-white'
      });

      $scope.tableData.push({
        label: 'Date',
        value: new Date(data.date).format('mmm dd, yyyy'),
        class: 'row-white'
      });

      $scope.tableData.push({
        label: '<div>I understand that checking this box constitutes as my legal signature.</div>',
        value: null
      });

      $scope.tableData.push({
        label: 'Administered by: BeniComp, Inc., 8310 Clinton Park Drive, Fort Wayne, IN 46825 - Phone: (260) 482-7400 Fax: (260) 483-6255',
        value: null,
        class: 'row-white'
      });


    };


    function init() {
      $scope.generateTable($scope.claimsData);
    }

    init();
  });