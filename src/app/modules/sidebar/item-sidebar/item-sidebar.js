angular.module('app.sidebar.item', [])

  .controller('SidebarItemController', function ($rootScope, $scope, $state, $timeout, security) {
    $scope.isHaveHealthResult = true;


    if (security.currentUser.healthResult === false) {
      $scope.isHaveHealthResult = false;
    }

    // Open/Close Sub Menu
    $scope.openSubMenu = function (element) {
      $rootScope.isClickSubMenu = true;

      $timeout(function () {
        if ($rootScope.isClickSubMenu) {
          $rootScope.isClickSubMenu = false;
        }
      }, 500);

      $(".icon-bss-plus-minus").each(function () {
        $(this).html($(this).html().replace("-", "+"));
      });

      var content = element.innerHTML;
      var parentElement = angular.element(element.parentElement);
      element = angular.element(element);

      element.removeAttr('href');

      if (parentElement.hasClass('open')) {

        //element[0].innerHTML = content.replace(">-<", ">+<");//replace text
        parentElement.removeClass('open');
        parentElement.addClass('closeSubMenu');
        parentElement.find('ul').slideUp();
      } else {


        parentElement.siblings('li').removeClass('open');
        parentElement.siblings('li').addClass('closeSubMenu');
        parentElement.siblings('li').find('ul').slideUp();


        element[0].innerHTML = content.replace(">+<", ">-<");//replace text
        parentElement.addClass('open');
        parentElement.removeClass('closeSubMenu');
        parentElement.find('ul').slideDown();
      }
    };


  });
