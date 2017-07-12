angular.module('directive.password', [])

  .factory('checkPassword', function () {

    var service = {
      /**
       * @type {Array}
       * @description The collection of regex checks and how much they affect the scoring
       */
      checks: [
        /* alphaLower */
        {
          re: /[a-z]/,
          score: 1
        },
        /* alphaUpper */
        {
          re: /[A-Z]/,
          score: 5
        },
        /* mixture of upper and lowercase */
        {
          re: /([a-z].*[A-Z])|([A-Z].*[a-z])/,
          score: 2
        },
        /* threeNumbers */
        {
          re: /(.*[0-9].*[0-9].*[0-9])/,
          score: 7
        },
        /* special chars */
        {
          re: /.[!@#$%^&*?_~]/,
          score: 5
        },
        /* multiple special chars */
        {
          re: /(.*[!@#$%^&*?_~].*[!@#$%^&*?_~])/,
          score: 7
        },
        /* all together now, does it look nice? */
        {
          re: /([a-zA-Z0-9].*[!@#$%^&*?_~])|([!@#$%^&*?_~].*[a-zA-Z0-9])/,
          score: 3
        },
        /* password of a single char sucks */
        {
          re: /(.)\1+$/,
          score: 2
        }
      ],
      score: function (password, minLength) {
        var score = 0,
          len = password.length,
          diff = len - minLength;

        if (diff < 0) {
          score -= 100;
        }
        if (diff >= 5) {
          score += 18;
        }
        if (diff >= 3) {
          score += 12;
        }
        if (diff === 2) {
          score += 6;
        }

        angular.forEach(service.checks, function (check) {
          if (password.match(check.re)) {
            score += check.score;
          }
        });

        // bonus for length per char
        if (score) {
          score += len;
        }
        return score;
      },

      /***
       * a) Lowercase letters: a, b, c,...
       * b) Uppercase letters: A, B, C,...
       * c) Numbers: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
       * d) Symbols found on the keyboard (Special Characters): ` ~ ! @ # $ % ^ & * ( ) _ - + = { } [ ] \ | : ; " ' < > , . ? /
       */
      meter: function (password, minLength) {
        var a = /[a-z]/,
          b = /[A-Z]/,
          c = /[0-9]/,
          d = /[`~!@#$%^&*()_\-+={}\[\]\|:;"'<>,.?\/]/;
        var level = 0;

        if (!password || typeof password !== 'string' || password.length < minLength) {
          return level;
        }
        if (a.test(password) && b.test(password) && c.test(password) && d.test(password)) {
          level = 4;
        } else if ((a.test(password) && b.test(password) && c.test(password)) ||
          (a.test(password) && b.test(password) && d.test(password)) ||
          (a.test(password) && c.test(password) && d.test(password)) ||
          (b.test(password) && c.test(password) && d.test(password))) {
          level = 3;
        } else if ((a.test(password) && b.test(password)) ||
          (a.test(password) && c.test(password)) ||
          (a.test(password) && d.test(password)) ||
          (b.test(password) && c.test(password)) ||
          (b.test(password) && d.test(password)) ||
          (c.test(password) && d.test(password))) {
          level = 2;
        } else if (a.test(password) || b.test(password) || c.test(password) || d.test(password)) {
          level = 1;
        }

        return level;
      }
    };

    return service;
  })

  .directive('meterPassword', function (checkPassword) {
    return {
      restrict: 'AE',
      scope: {
        password: '=',
        option: '='
      },
      templateUrl: 'directives/password/meter-password.tpl.html',
      link: function ($scope, $element, $attr, $ctrl) {
        var option = {
          minLength: 8 // too short while less than this
        };

        var STATUS = {
          init: 'init',
          weak: 'weak',
          acceptable: 'acceptable',
          good: 'good',
          great: 'great'
        };

        if (typeof $scope.option === 'object') {
          for (var attr in $scope.option) {
            if (option[attr] !== undefined && typeof option[attr] === typeof $scope.option[attr]) {
              option[attr] = $scope.option[attr];
            }
          }
        }

        $scope.status = STATUS.init;
        $scope.minLength = option.minLength;

        function meter(password) {
          // Tweak scores here
          //var scores = checkPassword.score(password, option.minLength);
          //if(scores <= 10) {
          //    $scope.status = STATUS.init;
          //} else if(10 < scores && scores <= 15) {
          //    $scope.status = STATUS.weak;
          //} else if(15 < scores && scores <= 25) {
          //    $scope.status = STATUS.acceptable;
          //} else if(25 < scores && scores <= 45) {
          //    $scope.status = STATUS.good;
          //} else if(45 < scores) {
          //    $scope.status = STATUS.great;
          //}

          var scores = checkPassword.meter(password, option.minLength);
          if (scores === 0) {
            $scope.status = STATUS.init;
          } else if (scores === 1) {
            $scope.status = STATUS.weak;
          } else if (scores === 2) {
            $scope.status = STATUS.acceptable;
          } else if (scores === 3) {
            $scope.status = STATUS.good;
          } else if (scores > 3) {
            $scope.status = STATUS.great;
          }
        }

        // Watch password
        $scope.$watch(function () {
          return $scope.password ? $scope.password.$viewValue : null;
        }, function (viewValue) {
          meter(viewValue);
        });
      }
    };
  })

  // Equal
  .directive('passwordEqual', function () {
    return {
      require: 'ngModel',
      scope: {
        passwordEqual: '='
      },
      link: function ($scope, $element, $attr, $ctrl) {
        $ctrl.$equals = $scope.passwordEqual;

        var validate = function (viewValue) {
          var isValid = true;
          for (var i = 0; i < $scope.passwordEqual.length; i++) {
            if ($scope.passwordEqual[i]) {
              if (viewValue.toString().toLowerCase().indexOf($scope.passwordEqual[i].toLowerCase()) > -1) {
                isValid = false;
                break;
              }
            }
          }

          if (isValid === false) {
            $ctrl.$setValidity('passwordEqual', false);
            return undefined;
          } else {
            $ctrl.$setValidity('passwordEqual', true);
            return viewValue;
          }
        };

        // Watch own value and re-validate on change
        $scope.$watch(function () {
          return $ctrl.$viewValue;
        }, function (viewValue) {
          if (viewValue) {
            return validate(viewValue);
          }
        });
      }
    };
  })

  .directive('tooltipPassword', function ($compile, $parse, $timeout) {
    return {
      restrict: 'AE',
      transclude: false,
      link: function ($scope, $element, $attrs) {
        var scope = $element.isolateScope();

        var htmlTemplate = "<div class=\"title\">A strong password</div>";
        htmlTemplate += "<ul>";
        htmlTemplate += "  <li>Is at least eight characters long. <i data-ng-if='tooltipErrors.isShow && !tooltipErrors.passLength' class='fa fa-check-circle'></i><i data-ng-if='tooltipErrors.isShow && tooltipErrors.passLength' class='fa fa-times-circle'></i></li>";
        htmlTemplate += "  <li>Not contain your user name, real name, or company name. <i data-ng-if='tooltipErrors.isShow && !tooltipErrors.passContent' class='fa fa-check-circle'></i><i data-ng-if='tooltipErrors.isShow && tooltipErrors.passContent' class='fa fa-times-circle'></i></li>";
        htmlTemplate += "  <li>Contain 1 capital letter. <i data-ng-if='tooltipErrors.isShow && !tooltipErrors.passCapitalLetter' class='fa fa-check-circle'></i><i data-ng-if='tooltipErrors.isShow && tooltipErrors.passCapitalLetter' class='fa fa-times-circle'></i></li>";
        htmlTemplate += "  <li>Contain 1 number. <i data-ng-if='tooltipErrors.isShow && !tooltipErrors.passNumber' class='fa fa-check-circle'></i><i data-ng-if='tooltipErrors.isShow && tooltipErrors.passNumber' class='fa fa-times-circle'></i></li>";
        htmlTemplate += "  <li>Contain 1 special character. <i data-ng-if='tooltipErrors.isShow && !tooltipErrors.passSpecialCharacter' class='fa fa-check-circle'></i><i data-ng-if='tooltipErrors.isShow && tooltipErrors.passSpecialCharacter' class='fa fa-times-circle'></i></li>";
        htmlTemplate += "  <li>Passwords match. <i data-ng-if='tooltipErrors.isShow && !tooltipErrors.passPasswordsMatch' class='fa fa-check-circle'></i><i data-ng-if='tooltipErrors.isShow && tooltipErrors.passPasswordsMatch' class='fa fa-times-circle'></i></li>";
        htmlTemplate += "</ul>";

        $scope.tooltipErrors = {
          passLength: false,
          passContent: false,
          passCapitalLetter: false,
          passNumber: false,
          passSpecialCharacter: false,
          passPasswordsMatch: false,
          isShow: false
        };

        $scope.tooltipPassword = $parse($attrs.tooltipPassword)($scope);

        var theTooltip = $compile(htmlTemplate)($scope);

        scope.setTooltipContent(theTooltip);

        function validation() {
          var newPassword = $scope.tooltipPassword.$viewValue;

          // Is showing
          $scope.tooltipErrors.isShow = !!$scope.tooltipPassword.$viewValue;

          // Is at least eight characters long
          $scope.tooltipErrors.passLength = !!$scope.tooltipPassword.$error.minlength;

          // Not contain your user name, real name, or company name
          $scope.tooltipErrors.passContent = !!$scope.tooltipPassword.$error.passwordEqual;

          // Contain 1 capital letter
          if (/[A-Z]/.test(newPassword)) {
            $scope.tooltipErrors.passCapitalLetter = false;
          } else {
            $scope.tooltipErrors.passCapitalLetter = true;
          }

          // Contain 1 number
          if (/[0-9]/.test(newPassword)) {
            $scope.tooltipErrors.passNumber = false;
          } else {
            $scope.tooltipErrors.passNumber = true;
          }

          // Contain 1 special character
          if (/[~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/.test(newPassword)) {
            $scope.tooltipErrors.passSpecialCharacter = false;
          } else {
            $scope.tooltipErrors.passSpecialCharacter = true;
          }

          // Passwords match
          $scope.tooltipErrors.passPasswordsMatch = !!$scope.tooltipPassword.$error.pattern;
        }

        $scope.$watch(function () {
          return $scope.tooltipPassword.$viewValue;
        }, function () {
          $timeout(function () {
            validation();
          });
        });

        $attrs.$observe('tooltipShowBox', function (showBox) {
          if (showBox === 'true') {
            scope.setShowing(true);
          } else {
            scope.setShowing(false);
          }
        });

        $scope.$on('$stateChangeStart', function () {
          scope.destroy();
        });
      }
    };
  });
