angular.module('app.modules.health-results.progress-bar', [])

  .directive('progressBar', function ($rootScope, security, $window, $templateCache, $compile, utils, $document, $timeout) {
    //var counter = 0;
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        start: '&',
        startForMale: '&',
        end: '&',
        endForMale: '&',
        value: '&',
        data: '='
      },
      templateUrl: 'modules/health-results/progress-bar/progress-bar.tpl.html',
      link: function ($scope, $element, $attrs, $controller) {
        //$scope.animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : true;
        //$element.attr('id', 'progress-bar-' + counter.toString());
        //$('.progress-modal').attr('id', 'progress-modal-' + counter.toString());
        //counter += 1;

        $scope.title = $scope.data.biomarker;
        $scope.name = $scope.data.name;
        $scope.value = parseFloat($scope.data.value);
        $scope.start = ($scope.data.isHasMultiRanges && (security.currentUser.gender === "M")) ? parseFloat($scope.data.startForMale) : parseFloat($scope.data.start);
        $scope.end = ($scope.data.isHasMultiRanges && (security.currentUser.gender === "M")) ? parseFloat($scope.data.endForMale) : parseFloat($scope.data.end);
        $scope.sign = $scope.data.sign ? parseFloat($scope.data.sign) : 0;
        $scope.allow = $scope.data.allow !== undefined ? $scope.data.allow : false;
        $scope.type = $scope.data.type ? $scope.data.type : '';

        $scope.description = $scope.data.description;
        $scope.alert = $scope.data.alert;
        $scope.alert2 = $scope.data.alert2 ? $scope.data.alert2 : "";
        $scope.rangeDescription = '';
        $scope.chart = $scope.data.chart ? $scope.data.chart : null;
        $scope.definition = '';
        $scope.data.ranges = ($scope.data.isHasMultiRanges && (security.currentUser.gender === "M")) ? $scope.data.rangesForMale : $scope.data.ranges;

        var range, i;

        // Merging range description
        for (i = 0; i < $scope.data.ranges.length; i++) {
          range = $scope.data.ranges[i];
          if (!!range.type) {
            if ($scope.data.biomarker === 'Blood Glucose') {
              $scope.rangeDescription += range.type + ' ' + range.value + ': ' + range.definition + '<br>';
            } else {
              $scope.rangeDescription += range.type + ' ' + range.value + ' is ' + range.definition + '<br>';
            }

          } else {

            if ($scope.data.biomarker == 'HDL Cholesterol') {

              $scope.rangeDescription += range.min + ' - ' + range.max + ' ' + range.definition + '<br>';

            } else if ($scope.data.biomarker === 'Blood Glucose') {

              $scope.rangeDescription += range.min + ' - ' + range.max + ': ' + range.definition + '<br>';

            } else {
              $scope.rangeDescription += range.min + ' - ' + range.max + ' is ' + range.definition + '<br>';
            }


          }
        }

        $scope.rangeDescription = $scope.rangeDescription.toLowerCase();

        // Search definition
        for (i = 0; i < $scope.data.ranges.length; i++) {
          range = $scope.data.ranges[i];
          if (!!range.type) {
            if (range.type === '<' && $scope.value < range.value) {
              $scope.definition = range.definition;
              break;
            } else if (range.type === '>' && $scope.value > range.value) {
              $scope.definition = range.definition;
              break;
            } else if (range.type === '>=' && $scope.value >= range.value) {
              $scope.definition = range.definition;
              break;
            }
          } else {
            if (range.min <= $scope.value && $scope.value <= range.max) {
              $scope.definition = range.definition;
              break;
            }
          }
        }

        // is value
        if ($scope.value < 0) {
          $scope.value = 0;
        }

        var offset = 50;
        if (angular.isDefined($attrs.type) && $attrs.type === 'percent') {
          offset = 10;
        }

        // Min in progress bar
        $scope.min = $scope.data.min ? parseFloat($scope.data.min) : 0; // $scope.start - offset;
        //if($scope.min > $scope.start) {
        //    $scope.min = $scope.start - offset;
        //}
        //if($scope.min > $scope.value) {
        //    $scope.min = $scope.value - offset;
        //}

        // Max in progress bar
        $scope.max = $scope.data.max ? parseFloat($scope.data.max) : $scope.end + offset;
        if ($scope.max < $scope.end) {
          $scope.max = $scope.end + offset;
        }
        if ($scope.max < $scope.value) {
          $scope.max = $scope.value + offset;
        }

        $scope.styleBar = {};
        $scope.styleValue = {};
        $scope.styleStart = {};
        $scope.styleEnd = {};
        $scope.styleIndicator = {};
        var styleValueLeft = 0;

        if ($scope.sign !== 0) { // 0->sign->sign*2
          if ($scope.type === '<' || $scope.type === '<=') {
            $scope.styleBar.left = +(100 * $scope.start / ($scope.sign * 2)).toFixed(2) + '%';
            $scope.styleBar.width = 'calc(50% - ' + $scope.styleBar.left + ')';
          } else {
            $scope.styleBar.left = '50%';
            $scope.styleBar.width = '50%';
          }

          styleValueLeft = +(100 * $scope.value / ($scope.sign * 2)).toFixed(2);
          $scope.styleValue.left = styleValueLeft + '%';

          if ($scope.value > $scope.sign * 2) {
            styleValueLeft = 100;
            $scope.styleValue.left = '100%';
          }

          $scope.styleStart.left = +(100 * $scope.start / ($scope.sign * 2)).toFixed(2) + '%';
          $scope.styleEnd.left = +(100 * $scope.end / ($scope.sign * 2)).toFixed(2) + '%';
        } else {
          if ($scope.min > 0) {
            $scope.styleBar.left = +(100 * ($scope.start) / ($scope.max)).toFixed(2) + '%';
            $scope.styleBar.width = +(100 * ($scope.end - $scope.start) / ($scope.max)).toFixed(2) + '%';

            styleValueLeft = +(100 * ($scope.value) / ($scope.max)).toFixed(2);
            $scope.styleValue.left = styleValueLeft + '%';

            $scope.styleStart.left = +(100 * ($scope.start) / ($scope.max)).toFixed(2) + '%';
            $scope.styleEnd.left = +(100 * ($scope.end) / ($scope.max)).toFixed(2) + '%';

          } else {
            $scope.styleBar.left = +(100 * $scope.start / $scope.max).toFixed(2) + '%';
            $scope.styleBar.width = +(100 * ($scope.end - $scope.start) / $scope.max).toFixed(2) + '%';

            styleValueLeft = +(100 * $scope.value / $scope.max).toFixed(2);
            $scope.styleValue.left = styleValueLeft + '%';

            $scope.styleStart.left = +(100 * $scope.start / $scope.max).toFixed(2) + '%';
            $scope.styleEnd.left = +(100 * $scope.end / $scope.max).toFixed(2) + '%';
          }
        }

        function setPosition() {
          var maxWidth = $element.find('.progress-item').width();
          var realValue = $scope.value * maxWidth / (!!$scope.sign ? $scope.sign * 2 : $scope.max);

          if (realValue < 20) {
            $scope.styleValue.left = '20px';
            $scope.styleIndicator.left = '20px';
          } else if (maxWidth - 20 < realValue) {
            $scope.styleValue.left = 'calc(100% - 20px)';
            $scope.styleIndicator.left = '45px';
          }
        }

        $timeout(function () {
          setPosition();
        }, 200);

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

        /********** Popup *******************************/
        var template = $templateCache.get('modules/health-results/progress-bar/popup.tpl.html');
        var html = $compile(template)($scope);
        var popup = angular.element('<div class="health-popup"></div>');
        popup.css({
          position: 'absolute',
          zIndex: '10000000'
        });
        popup.appendTo('body');
        popup.hide();

        var show = false;
        $scope.position = null;

        // Check sign
        $scope.rangeText = '';
        if ($scope.sign !== 0) {
          if ($scope.type === '<' || $scope.type === '<=') {
            $scope.rangeText = $scope.start + ' - ' + $scope.end;
          } else {
            $scope.rangeText = $scope.type + $scope.sign;
          }
        } else {
          $scope.rangeText = $scope.start + ' - ' + $scope.end;
        }
        $scope.rangeText = utils.convertOperatorsToString($scope.rangeText);

        // Check alert
        $scope.resultText = $scope.value + ($scope.definition ? (' \(' + $scope.definition) + '\)' : '');

        // Hide all
        function hideAll() {
          $('body').find('.health-popup').html('');
        }

        function resize() {
          var offset = $element.offset();
          var width = $element.width();
          var height = $element.height();
          var top = offset.top + $element.height() - 8;
          var left = offset.left;
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

          // Check style
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
          if ($('.health-popup').length > 0) {
            resize();
            setPosition();
          }
        });

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
