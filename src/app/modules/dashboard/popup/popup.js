angular.module('app.modules.dashboard.popup', [])

  .directive('dashboardPopup', function ($templateCache, $compile, $window, $rootScope, $state, $document) {
    return {
      restrict: 'EA',
      scope: {
        info: '=dashboardPopup'
      },
      link: function ($scope, $element) {
        $scope.name = $scope.info.name;
        $scope.passed = $scope.info.passed;
        $scope.data = $scope.info.data;

        $scope.value = parseFloat($scope.data.value);
        $scope.start = parseFloat($scope.data.start);
        $scope.end = parseFloat($scope.data.end);
        $scope.sign = $scope.data.sign ? parseFloat($scope.data.sign) : 0;
        $scope.allow = $scope.data.allow !== undefined ? $scope.data.allow : false;
        $scope.type = $scope.data.type ? $scope.data.type : '';
        $scope.chart = $scope.data.chart ? $scope.data.chart : null;

        $scope.isDanger = function () {
          if ($scope.sign !== 0) {
            if (!(
              ($scope.type === '<' && $scope.value < $scope.sign) ||
              ($scope.type === '<=' && $scope.value <= $scope.sign) ||
              ($scope.type === '>' && $scope.value > $scope.sign) ||
              ($scope.type === '>=' && $scope.value >= $scope.sign)
            )) {
              return true;
            }
          } else if ($scope.allow !== false && ($scope.allow === '<=' || $scope.allow === '<' || $scope.allow === '>=' || $scope.allow === '>')) {
            if (!(
              ($scope.allow === '<=' && $scope.value <= $scope.start) ||
              ($scope.allow === '<' && $scope.value < $scope.start) ||
              ($scope.allow === '>=' && $scope.value >= $scope.start) ||
              ($scope.allow === '>' && $scope.value > $scope.start)
            )) {
              return true;
            }
          } else {
            if ($scope.value < $scope.start || $scope.end < $scope.value) {
              return true;
            }
          }
          return false;
        };

        $scope.rangeDescription = '';
        var range, i;

        // Merging range description
        if ($scope.data.flag === true) {
          for (i = 0; i < $scope.data.ranges.length; i++) {
            range = $scope.data.ranges[i];
            $scope.rangeDescription += range.definition + '<br>';
          }
        } else {
          for (i = 0; i < $scope.data.ranges.length; i++) {
            range = $scope.data.ranges[i];
            if (!!range.type) {
              $scope.rangeDescription += range.type + ' ' + range.value + ' is ' + range.definition + '<br>';
            } else {
              $scope.rangeDescription += range.min + ' - ' + range.max + ' is ' + range.definition + '<br>';
            }
          }
        }

        // Build template
        var template = $templateCache.get('modules/dashboard/popup/popup.tpl.html');
        var html = $compile(template)($scope);
        var popup = angular.element('<div class="dashboard-popup"></div>');
        popup.css({
          position: 'absolute',
          zIndex: '10000000'
        });
        popup.appendTo('body');
        popup.hide();

        var show = false;

        // Hide all
        function hideAll() {
          $('body').find('.dashboard-popup').html('');
        }

        function resize() {
          var offset = $element.offset();
          var parent = $('.panel-dashboard');
          var width = parent.width();
          var top = offset.top + $element.height();
          var left = parent.offset().left;
          popup.css({
            top: top + 'px',
            left: left + 'px',
            width: width + 'px',
            height: 'auto'//height + 'px'
          });
          $scope.position = {
            x: left,
            y: top,
            width: width,
            height: popup.height()
          };
        }

        // Event
        function closePopup() {
          $('.spinner-background').css({
            backgroundColor: '',
            opacity: ''
          });
          $('.spinner-background').hide();
          popup.html('');
          popup.hide();
          show = false;
        }

        function submit() {
          closePopup();
          //$scope.$parent.openHealthCoachForm();
          $scope.$parent.sendMailToHealthCoach();
        }

        $element.bind('click', function () {
          $('.spinner-background').css({
            backgroundColor: '#65b9a6',
            opacity: 0.3,
            zIndex: '1000000'
          });
          $('.spinner-background').show();

          hideAll();

          html.appendTo(popup);

          popup.show();

          setTimeout(function () {
            show = true;
            resize();
          }, 100);

          // Event
          html.find('button').on('click', function (event) {
            submit();
          });

          html.find('.close').on('click', function (event) {
            closePopup();
          });
        });

        // Resize popup
        angular.element($window).bind('resize', function () {
          if ($('.dashboard-popup').length > 0) {
            resize();
          }
        });

        // Check close popup if click out site
        angular.element($document).bind('click', function (event) {
          if (show && $scope.position && popup.css('display') === 'block') {
            // Prevent default dragging of selected content
            event.preventDefault();

            var x = event.clientX + $window.scrollX;
            var y = event.clientY + $window.scrollY;

            if (!(($scope.position.x <= x && x <= ($scope.position.x + $scope.position.width)) &&
              ($scope.position.y <= y && y <= ($scope.position.y + $scope.position.height)))) {
              closePopup();
            }
          }
        });

        // Remove popup if state change
        $rootScope.$on('$stateChangeSuccess', function () {
          if (popup) {
            closePopup();
            popup.remove();
          }
        });
      }
    };
  })

  .directive('faqPopup', function ($templateCache, $compile, $window, $rootScope, $state, $document) {
    return {
      restrict: 'EA',
      scope: {
        info: '=faqPopup'
      },
      link: function ($scope, $element) {
        $scope.data = $scope.info;

        // Build template
        var template = $templateCache.get('modules/dashboard/popup/faqpopup.tpl.html');
        var html = $compile(template)($scope);
        var popup = angular.element('<div class="faq-popup"></div>');
        popup.css({
          position: 'absolute',
          zIndex: '10000000'
        });
        popup.appendTo('body');
        popup.hide();

        var show = false;

        // Hide all
        function hideAll() {
          $('body').find('.faq-popup').html('');
        }

        function resize() {
          var offset = $element.offset();
          var parent = $('.panel-faqs');
          var width = parent.width();
          var top = offset.top + $element.height();
          var left = parent.offset().left;
          popup.css({
            top: top + 'px',
            left: left + 'px',
            width: width + 'px',
            height: 'auto'//height + 'px'
          });
          $scope.position = {
            x: left,
            y: top,
            width: width,
            height: popup.height()
          };
        }

        // Event
        function closePopup() {
          $('.spinner-background').css({
            backgroundColor: '',
            opacity: ''
          });
          $('.spinner-background').hide();
          popup.html('');
          popup.hide();
          show = false;
        }

        function submit() {
          closePopup();
          $scope.$parent.openHealthCoachForm();
        }

        $element.bind('click', function () {
          $('.spinner-background').css({
            backgroundColor: '#65b9a6',
            opacity: 0.3,
            zIndex: '1000000'
          });
          $('.spinner-background').show();

          hideAll();

          html.appendTo(popup);

          popup.show();

          setTimeout(function () {
            show = true;
            resize();
          }, 100);

          // Event
          html.find('button').on('click', function (event) {
            submit();
          });

          html.find('.close').on('click', function (event) {
            closePopup();
          });
        });

        // Resize popup
        angular.element($window).bind('resize', function () {
          if ($('.faq-popup').length > 0) {
            resize();
          }
        });

        // Check close popup if click out site
        angular.element($document).bind('click', function (event) {
          if (show && $scope.position && popup.css('display') === 'block') {
            // Prevent default dragging of selected content
            event.preventDefault();

            var x = event.clientX + $window.scrollX;
            var y = event.clientY + $window.scrollY;

            if (!(($scope.position.x <= x && x <= ($scope.position.x + $scope.position.width)) &&
              ($scope.position.y <= y && y <= ($scope.position.y + $scope.position.height)))) {
              closePopup();
            }
          }
        });

        // Remove popup if state change
        $rootScope.$on('$stateChangeSuccess', function () {
          if (popup) {
            closePopup();
            popup.remove();
          }
        });
      }
    };
  })

  .directive('contactMangerPopup', function ($templateCache, $compile, $window, $rootScope, $state, $document, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        info: '=contactMangerPopup'
      },
      controller: function ($scope) {
        $scope.data = $scope.info;

        function closePopup() {
          if (!!window.popup) {
            $('.spinner-background').css({
              backgroundColor: '',
              opacity: ''
            });
            $('.spinner-background').hide();
            window.popup.remove();

            delete window.popup;
            delete window.html;
            delete window.template;
          }
        }

        // Check close popup if click out site
        angular.element($document).bind('click', function (event) {
          event.preventDefault();
          if (!window.initPopup && !!window.popup && window.popup.position) {
            // Prevent default dragging of selected content

            var x = event.clientX + $window.scrollX;
            var y = event.clientY + $window.scrollY;

            if (!((window.popup.position.x <= x && x <= (window.popup.position.x + window.popup.position.width)) &&
              (window.popup.position.y <= y && y <= (window.popup.position.y + window.popup.position.height)))) {
              // Rempve popup
              closePopup();
            }
          }
        });

        // createPopup
        this.createPopup = function ($element) {
          window.initPopup = true;
          // Build template
          window.template = $templateCache.get('modules/dashboard/popup/contactMangerpopup.tpl.html');
          window.html = $compile(window.template)($scope);
          window.popup = angular.element('<div class="contactManger-Popup"></div>');
          window.popup.css({
            position: 'absolute',
            zIndex: '10000000'
          });
          window.popup.appendTo('body');
          window.html.appendTo(window.popup);
          $('.spinner-background').css({
            backgroundColor: '#65b9a6',
            opacity: 0.3,
            zIndex: '1000000'
          });
          $('.spinner-background').show();
          resize();

          $scope.params = {
            showing: false
          };

          $scope.showForm = function () {
            $scope.params.showing = !$scope.params.showing;

            // Resize Form
            resize();
          };

          $scope.submit = function (isValid, subject, content) {
            if (isValid) {
              $scope.$parent.sendEmail($scope.info, subject, content);
              closePopup();
            }
          };

          $scope.close = function () {
            closePopup();
          };

          // Set Position popup
          function resize() {
            $timeout(function () {
              var offset = $element.offset();
              var parent = $('.panel-contactManger');
              var width = parent.width();
              var top = offset.top + $element.height();
              var left = parent.offset().left;
              window.popup.css({
                top: top + 'px',
                left: left + 'px',
                width: width + 'px',
                height: 'auto'//height + 'px'
              });
              window.popup.position = {
                x: left,
                y: top,
                width: width,
                height: window.popup.outerHeight()
              };
            });

            $timeout(function () {
              window.initPopup = false;
            }, 100);
          }

          // Resize popup
          angular.element($window).bind('resize', function () {
            if ($('.contactManger-Popup').length > 0) {
              resize();
            }
          });
        };
      },

      link: function ($scope, $element, $attrs, $controller) {
        $element.bind('click', function () {
          $controller.createPopup($element);
        });
      }
    };
  })


  .directive('invoiceMangerPopup', function ($templateCache, $compile, $window, $rootScope, $state, $document, $timeout, spoolers, utils) {
    return {
      restrict: 'EA',
      scope: {
        info: '=invoiceMangerPopup'
      },
      controller: function ($scope) {
        $scope.dataReports = [];

        $scope.data = $scope.info;
        $scope.data['selectionDateString'] = utils.dateToString($scope.data.selectionDate);

        //calculate admin fee
        $scope.data['fee'] = parseInt($scope.data.fee);
        var tempAdminFee = $scope.data.divisionPayment * $scope.data.fee/100;
        $scope.data['adminFee'] = parseFloat(tempAdminFee).toFixed(2);
        $scope.data['total'] = parseFloat($scope.data.divisionPayment + tempAdminFee).toFixed(2);


        // Get data for Report
        var params2 = {
          page: 1,
          pageSize: 999999,
          embed: ''
        };

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

        spoolers.getWithClaims($scope.data.id, params2, headers, false)
          .then(function (data) {
            $scope.dataReports = data.data;
          });


        function closePopup() {
          if (!!window.popup) {
            $('.spinner-background').css({
              backgroundColor: '',
              opacity: ''
            });
            $('.spinner-background').hide();
            window.popup.remove();

            delete window.popup;
            delete window.html;
            delete window.template;
          }
        }

        // Check close popup if click out site
        angular.element($document).bind('click', function (event) {
          //event.preventDefault();
          if (!window.initPopup && !!window.popup && window.popup.position) {
            // Prevent default dragging of selected content

            var x = event.clientX + $window.scrollX;
            var y = event.clientY + $window.scrollY;

            if (!((window.popup.position.x <= x && x <= (window.popup.position.x + window.popup.position.width)) &&
              (window.popup.position.y <= y && y <= (window.popup.position.y + window.popup.position.height)))) {
              // Rempve popup
              closePopup();
            }
          }
        });

        // createPopup
        this.createPopup = function ($element) {
          window.initPopup = true;
          // Build template
          window.template = $templateCache.get('modules/accounting/invoice-manager/invoice-manager-popup.tpl.html');
          window.html = $compile(window.template)($scope);
          window.popup = angular.element('<div class="invoice-manager-popup"></div>');
          window.popup.css({
            position: 'absolute',
            zIndex: '10000000'
          });
          window.popup.appendTo('body');
          window.html.appendTo(window.popup);
          $('.spinner-background').css({
            backgroundColor: '#65b9a6',
            opacity: 0.3,
            zIndex: '1000000'
          });
          $('.spinner-background .loading-indicator-class').hide();
          $('.spinner-background').show();

          resize();

          $scope.params = {
            showing: false
          };

          $scope.showForm = function () {
            $scope.params.showing = !$scope.params.showing;

            // Resize Form
            resize();
          };

          $scope.submit = function (isValid, subject, content) {
            if (isValid) {
              $scope.$parent.sendEmail($scope.info, subject, content);
              closePopup();
            }
          };

          $scope.close = function () {
            $('.spinner-background .loading-indicator-class').show();
            closePopup();
          };

          // Set Position popup
          function resize() {
            $timeout(function () {
              var offset = $element.offset();
              var parent = $('.panel-invoice-manager');
              var width = parent.width();
              var top = offset.top + $element.height();
              var left = parent.offset().left;
              window.popup.css({
                top: top + 'px',
                left: left + 'px',
                width: width + 'px',
                height: 'auto'//height + 'px'
              });
              window.popup.position = {
                x: left,
                y: top,
                width: width,
                height: window.popup.outerHeight()
              };
            });

            $timeout(function () {
              window.initPopup = false;
            }, 100);
          }

          // Resize popup
          angular.element($window).bind('resize', function () {
            if ($('.invoice-manager-popup').length > 0) {
              resize();
            }
          });
        };
      },

      link: function ($scope, $element, $attrs, $controller) {
        $element.bind('click', function () {
          $controller.createPopup($element);
        });
      }
    };
  })

  .directive('surveyPopup', function ($templateCache, $compile, $window, $rootScope, $state, $document) {
    return {
      restrict: 'EA',
      scope: {
        info: '=surveyPopup'
      },
      link: function ($scope, $element) {
        $scope.data = $scope.info;

        // Build template
        var template = $templateCache.get('modules/dashboard/popup/surveyPopup.tpl.html');
        var html = $compile(template)($scope);
        var popup = angular.element('<div class="survey-popup"></div>');
        popup.css({
          position: 'absolute',
          zIndex: '10000000'
        });
        popup.appendTo('body');
        popup.hide();

        var show = false;

        // Hide all
        function hideAll() {
          $('body').find('.survey-popup').html('');
        }

        function resize() {
          var offset = $element.offset();
          var parent = $('.panel-survey');
          var width = parent.width();
          var top = offset.top + $element.height();
          var left = parent.offset().left;
          popup.css({
            top: top + 'px',
            left: left + 'px',
            width: width + 'px',
            height: 'auto'//height + 'px'
          });
          $scope.position = {
            x: left,
            y: top,
            width: width,
            height: popup.height()
          };
        }

        // Event
        function closePopup() {
          $('.spinner-background').css({
            backgroundColor: '',
            opacity: ''
          });
          $('.spinner-background').hide();
          popup.html('');
          popup.hide();
          show = false;
        }

        function submit() {
          closePopup();
          $scope.$parent.openHealthCoachForm();
        }

        $element.bind('click', function () {
          $('.spinner-background').css({
            backgroundColor: '#65b9a6',
            opacity: 0.3,
            zIndex: '1000000'
          });
          $('.spinner-background').show();

          hideAll();

          html.appendTo(popup);

          popup.show();

          setTimeout(function () {
            show = true;
            resize();
          }, 100);

          // Event
          html.find('button').on('click', function (event) {
            submit();
          });

          html.find('.close').on('click', function (event) {
            closePopup();
          });
        });

        // Resize popup
        angular.element($window).bind('resize', function () {
          if ($('.survey-popup').length > 0) {
            resize();
          }
        });

        // Check close popup if click out site
        angular.element($document).bind('click', function (event) {
          if (show && $scope.position && popup.css('display') === 'block') {
            // Prevent default dragging of selected content
            event.preventDefault();

            var x = event.clientX + $window.scrollX;
            var y = event.clientY + $window.scrollY;

            if (!(($scope.position.x <= x && x <= ($scope.position.x + $scope.position.width)) &&
              ($scope.position.y <= y && y <= ($scope.position.y + $scope.position.height)))) {
              closePopup();
            }
          }
        });

        // Remove popup if state change
        $rootScope.$on('$stateChangeSuccess', function () {
          if (popup) {
            closePopup();
            popup.remove();
          }
        });
      }
    };
  });
