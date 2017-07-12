angular.module('directive', [
  'directive.progress',
  'directive.file-upload',
  'directive.breadcrumb-tabs',
  'directive.password',
  'directive.select-files',
  'directive.uiToggleClass',
  'directive.form-input',
  'directive.loading',
  'directive.participant-view',
  'directive.health-result'
])

  .directive('multiSelectBox', function () {
    return {
      restrict: 'A',
      scope: {
        options: '=multiSelectBox'
      },
      link: function (scope, element, attr) {
        scope.$watch('options', function (newVal) {
          if (newVal.length > 0) {
            element.parent().find('.ms-container').remove();
            setTimeout(function () {
              element.multiSelect();
            }, 200);
          }
        });
      }
    };
  })

  .directive('wrapOwlCarousel', function () {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
        var options = scope.$eval($(element).attr('data-options'));
        setTimeout(function () {
          $(element).owlCarousel(options);
        }, 1000);
      }
    };
  })

  .directive('timePicker', function ($timeout) {
    return {
      restrict: 'EA',
      scope: true,
      link: function ($scope, $element) {
        $timeout(function () {
          $element.timepicker({
            minuteStep: 30
          });
        });
      }
    };
  })

  .directive('datePicker', function () {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
        setTimeout(function () {
          $(element).datepicker({
            todayBtn: "linked",
            clearBtn: true
          });
        }, 500);
      }
    };
  })


  // Hide all menu rollover
  .directive('scrolly', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var win = $(window);

        win.scroll(function () {

          //group-menu-common
          var menuCommon = $(".not-login .root header .menu .group-menu-common");
          if (menuCommon && menuCommon[0]) {

            if (win.scrollTop() > 10) {
              menuCommon[0].style.display = "none";
            } else {
              menuCommon[0].style.display = "";
            }

          }


          // group-question
          var questionCommon = $(".loggin-new-ui .container .group-right .question-mark .group-question");
          if (questionCommon && questionCommon[0]) {

            if (win.scrollTop() > 10) {
              questionCommon[0].style.display = "none";
            } else {
              questionCommon[0].style.display = "";
            }

          }


          // group-profile
          var profileCommon = $(".loggin-new-ui .container .group-right .avatar-mark .group-profile");
          if (profileCommon && profileCommon[0]) {

            if (win.scrollTop() > 10) {
              profileCommon[0].style.display = "none";
            } else {
              profileCommon[0].style.display = "";
            }

          }

          // group-product
          var menuRight = $("#menu-mobile-right");
          if (menuRight && menuRight[0]) {

            if (win.scrollTop() > 10) {
              menuRight[0].style.display = "none";
            } else {
              menuRight[0].style.display = "";
            }

          }
          // group-profile
          var menuRightProfile = $("#menu-mobile-right-profile");
          if (menuRightProfile && menuRightProfile[0]) {

            if (win.scrollTop() > 10) {
              menuRightProfile[0].style.display = "none";
            } else {
              menuRightProfile[0].style.display = "";
            }

          }

        });
      }
    };
  })

  .directive('bDatePicker', function () {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function ($scope, element, attrs, controller) {
        var updateModel;
        updateModel = function (ev) {
          element.datepicker('hide');
          element.blur();
          return $scope.$apply(function () {
            return controller.$setViewValue(ev.date);
          });
        };
        if (controller != null) {
          controller.$render = function () {
            element.datepicker().data().datepicker.date = controller.$viewValue;
            element.datepicker('setValue');
            element.datepicker('update');
            return controller.$viewValue;
          };
        }
        return attrs.$observe('bDatePicker', function (value) {
          var options;
          options = {};
          if (angular.isObject(value)) {
            options = value;
          }
          if (typeof (value) === "string" && value.length > 0) {
            options = angular.fromJson(value);
          }
          return element.datepicker(options).on('changeDate', updateModel);
        });
      }
    };
  })

  .directive('fileInput', function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        files: '=fileInput'
      },
      link: function (scope, element) {
        setTimeout(function () {
          var fileinput = $(element).fileinput();
          fileinput.on('change.bs.fileinput', function (e, files) {
            if (!!e.target.files && e.target.files.length > 0) {
              scope.files = e.target.files;
            } else {
              scope.files = null;
            }
          });
          // Check null
          scope.$watch('files', function (newVal) {
            if (!newVal && newVal !== null) {
              $(element).find('a.fileinput-exists').trigger("click");
            }
          });
        }, 500);
      }
    };
  })

  .directive('emailNotUsed', function ($http, $q, users) {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        ngModel.$asyncValidators.emailNotUsed = function (modelValue, viewValue) {
          return users.checkEmailExist({ 'email': viewValue })
            .then(function (response) {
              return response === true ? $q.reject('Email is already used.') : true;
            });
        };
      }
    };
  })

  /***
   * filtered-input="number"
   * filtered-input="alphabet"
   * filtered-input="alphaNumeric"
   */
  .filter('filterPattern', function () {
    return function (input, pattern) {
      if (input === undefined) {
        return '0.00';
      }
      if (pattern.indexOf('number') !== -1) {
        input = input.replace(/[^\-\d.]/g, '');
      } else if (pattern.indexOf('alphabet') !== -1) {
        input = input.replace(/[^a-zA-Z]/g, '');
      } else if (pattern.indexOf('alphaNumeric') !== -1) {
        input = input.replace(/[^a-zA-Z\d]/g, '');
      }

      return input;
    };
  })

  .directive('filteredInput', function ($filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: true,
      link: function (scope, element, attrs, controller) {

        controller.$parsers.unshift(function (val) {
          var newVal = $filter('filterPattern')(val, attrs.filteredInput);
          element[0].value = newVal;

          return newVal;
        });
      }
    };
  })

  .directive('responsiveEqualHeightGrid', function ($timeout) {
    return {
      restrict: 'EA',
      scope: {
        resizeContent: '=responsiveEqualHeightGrid'
      },
      link: function (scope, element) {
        $timeout(function () {
          $(element).find('.responsive-equal-height-grid').responsiveEqualHeightGrid();
          scope.$watch('resizeContent', function (resize) {
            if (resize) {
              $(element).find('.responsive-equal-height-grid').responsiveEqualHeightGrid();
            }
          });
        }, 100);
      }
    };
  })


  .directive('customPopover', function () {
    return {
      restrict: 'A',
      template: '<span class="{{class}}">{{label}}</span>',
      link: function (scope, el, attrs) {
        scope.label = attrs.popoverLabel;
        scope.class = attrs.popoverClass;
        $(el).popover({
          trigger: 'hover',
          html: true,
          content: attrs.popoverHtml,
          placement: attrs.popoverPlacement
        });
      }
    };
  })

  /**
   * Equal Heights
   *
   * https://gist.github.com/codonnell822/c9e21570a0bc3bee26f6
   *
   * Attach this directive to the parent/wrapping element of
   * a bunch of elements that are columns. This directive will
   * calculate the height of every direct child (one level down)
   * then set all of them to be the height of the tallest one.
   *
   * @example
   <ul data-equal-heights>
   <li>column1</li>
   <li>column2</li>
   <li>column3</li>
   </ul>
   *
   * @ngInject
   */
  .directive('equalHeights', function EqualHeightsDirective($timeout) {
    function link($scope, $element, attrs) {
      $timeout(function () {
        var $children = $element.children(),
          currentMaxHeight = 0,
          numImagesLoaded = 0,
          $images = $element.find('img'),
          imageCount = $images.length;

        if (imageCount > 0) {
          angular.forEach($images, function (image) {
            if (image.complete) {
              numImagesLoaded++;
            }
          });
        }

        if (numImagesLoaded === imageCount) {
          angular.forEach($children, function (child) {
            var childHeight = $(child).outerHeight();

            if (childHeight > currentMaxHeight) {
              currentMaxHeight = childHeight;
            }
          });

          // set heights
          $children.css({ height: currentMaxHeight });
        }
      });
    }

    return {
      restrict: 'A',
      scope: {},
      link: link
    };
  })

  .filter('noFractionCurrency', function ($filter, $locale) {
    var currencyFilter = $filter('currency');
    var formats = $locale.NUMBER_FORMATS;

    return function (amount, currencySymbol) {
      var value = currencyFilter(amount, currencySymbol);
      var sep = value.indexOf(formats.DECIMAL_SEP);

      if (amount >= 0) {
        return value.substring(0, sep);
      }
      return value.substring(0, sep);
    };
  })

  .directive('easyPieChart', function () {
    return {
      restrict: 'AC',
      scope: {
        percent: '=',
        options: '='
      },
      link: function (scope, element, attrs) {
        $(element).easyPieChart(scope.options).data('easyPieChart').update(scope.percent);
      }
    };
  })

  .directive('inputMask', function () {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {
        switch (attrs.inputMask) {
          case 'month':
            $(element).inputmask('99', { "clearIncomplete": true });
            break;
          case 'date':
            $(element).inputmask('99', { "clearIncomplete": true });
            break;
          case 'year':
            $(element).inputmask('9999', { "clearIncomplete": true });
            break;
          case 'ssn':
            $(element).inputmask('999-99-9999', {
              "clearIncomplete": true
            });
            break;
          case 'ssn2':
            $(element).inputmask('9999', { 'clearIncomplete': true });
            break;
          case 'phone':
          case 'telephone':
            $(element).inputmask('(999) 999-9999', { "clearIncomplete": true });
            break;
          case 'birthday':
            $(element).inputmask('99/99/9999', { 'clearIncomplete': true });
            break;
          default:
            $(element).inputmask(attrs.inputMask, { 'clearIncomplete': true });
            break;
        }
      }
    };
  })

  .directive('moveNext', function () {
    return {
      restrict: 'EA',
      link: function (scope, element, attrs) {

        scope.$watch(attrs.ngModel, function (v) {
          if (attrs.moveNext === 'month') {
            if (element.val().split("_").length < 2 && element.val().length >= 2) {
              document.getElementById('date').focus();
            }
          }

          if (attrs.moveNext === 'date') {
            if (element.val().split("_").length < 2 && element.val().length >= 2) {
              document.getElementById('year').focus();
            }
          }

          if (attrs.moveNext === 'year') {
            if (element.val().split("_").length < 2 && element.val().length === 4) {
              document.getElementById('year').blur();
            }
          }

        });
      }
    };
  })

  .directive('scrollAnimation', function ($window, $interval) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        angular.element($window).bind('scroll', function () {
          var t = $(window).scrollTop();
          var h = $(window).height();
          var t2 = element.offset().top;
          var h2 = element.height();
          var stopTime;
          if (t + h > t2 && t < t2 + h2) {
            if (!element.hasClass('translateY')) {
              element.addClass('translateY');
            }
          } else {
            element.removeClass('translateY');
          }
        });

        element.bind('DOMMouseScroll mousewheel onmousewheel', function (event) {
          // cross-browser wheel delta
          event = window.event || event; // old IE support
          var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

          if (delta > 0) {
            //scope.$apply(function() {
            //    scope.$eval(attrs.ngMouseWheelUp);
            //});
            //
            //// for IE
            //event.returnValue = false;
            //// for Chrome and Firefox
            //if(event.preventDefault) {
            //    event.preventDefault();
            //}
            //console.log('Mouse Wheel Scroll Up');
          }

          if (delta < 0) {
            //scope.$apply(function() {
            //    scope.$eval(attrs.ngMouseWheelDown);
            //});
            //
            //// for IE
            //event.returnValue = false;
            //// for Chrome and Firefox
            //if(event.preventDefault) {
            //    event.preventDefault();
            //}
            //console.log('Mouse Wheel Scroll Down');
          }
        });
      }
    };
  })

  .directive('mySlideController', ['$swipe', function ($swipe) {
    return {
      restrict: 'EA',
      link: function (scope, ele, attrs, ctrl) {
        var startX, pointX;
        $swipe.bind(ele, {
          'start': function (coords) {
            startX = coords.x;
            pointX = coords.y;
          },
          'move': function (coords) {
            var delta = coords.x - pointX;
          },
          'end': function (coords) {
          },
          'cancel': function (coords) {
          }
        });
      }
    };
  }])

  .directive('fixHover', function () {
    return {
      restrict: 'EA',
      scope: {
        index: '=fixHover'
      },
      link: function (scope, element) {
        element.addClass('row__' + scope.index);
        var parent = element.parent().parent().parent().parent().parent();

        element.hover(function () {
          parent.find('.row__' + scope.index).addClass('hover');
        }, function () {
          parent.find('.row__' + scope.index).removeClass('hover');
        });
      }
    };
  })

  // Set image placeholder if image not found
  .directive('img', function () {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        // show an image-missing image
        element.error(function () {
          if (attrs.errSrc) {
            element.prop('src', attrs.errSrc);
          } else {
            element.prop('src', 'assets/images/default-profile.png');
          }
        });
      }
    };
  })

  .directive('contactHtml', function ($compile, REGISTRATION_CLOSE_MESSAGE) {
    return {
      restrict: 'A',
      scope: {
        contactHtml: '='
      },
      link: function ($scope, $element) {
        $scope.$watch('contactHtml', function () {
          var textHtml = $scope.contactHtml;
          if (!textHtml) {
            textHtml = REGISTRATION_CLOSE_MESSAGE;
          }

          // Replace phone number
          if (textHtml.search(/\(?([0-9]{1})[-]([0-9]{3})\)?[-]([0-9]{3})[-]([0-9]{4})/gi) > -1) {
            textHtml = textHtml.replace(/\(?([0-9]{1})[-]([0-9]{3})\)?[-]([0-9]{3})[-]([0-9]{4})/gi, '<span class="text-green text-phone">$1-$2-$3-$4</span>');
          }
          if (textHtml.search(/\(?([0-9]{3})\)?[-]([0-9]{3})[-]([0-9]{4})/gi) > -1) {
            textHtml = textHtml.replace(/\(?([0-9]{3})\)?[-]([0-9]{3})[-]([0-9]{4})/gi, '<span class="text-green text-phone">$1-$2-$3</span>');
          }
          // Replace contact text
          textHtml = textHtml.replace(/contact form/ig, '<a class="text-green" data-ng-click="goContact()">contact form</a>');
          textHtml = '<span>' + textHtml + '</span>';

          $compile(textHtml)($scope.$parent, function (cloned) {
            $element.html(cloned);
          });
        });
      }
    };
  });


