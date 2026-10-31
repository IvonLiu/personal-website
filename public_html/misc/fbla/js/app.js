var app = angular.module('fbla', ['ui.router', 'firebase', 'smoothScroll', 'ngAnimate']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('index', {
        abstract: true,
        views: {
          '@': {
            templateUrl: 'layout.html',
            controller: 'IndexCtrl'
          },
          'navbar@index': {
            templateUrl: 'partials/navbar.html',
            controller: 'NavbarCtrl'
          }
        }
      })
      .state('sidebar', {
        parent: 'index',
        abstract: true,
        views: {
          'main@index': {
            templateUrl: 'partials/sidebar.html'
          }
        }
      })

    .state('home', {
      parent: 'index',
      url: '/home?thony',
      views: {
        'main@index': {
          templateUrl: 'partials/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('menu', {
      parent: 'sidebar',
      url: '/menu',
      views: {
        'content@sidebar': {
          templateUrl: 'partials/menu.html',
          controller: 'MenuCtrl'
        },
        'side@sidebar': {
          templateUrl: 'partials/menu.side.html'
        }
      }
    })
    .state('menu.food', {
      url: '/food',
      views: {
        'content@sidebar': {
          templateUrl: 'partials/menu.html',
          controller: 'FoodMenuCtrl'
        }
      }
    })
    .state('menu.drinks', {
      url: '/drinks',
      views: {
        'content@sidebar': {
          templateUrl: 'partials/menu.html',
          controller: 'DrinksMenuCtrl'
        }
      }
    })
    .state('menu.bakery', {
      url: '/bakery',
      views: {
        'content@sidebar': {
          templateUrl: 'partials/menu.html',
          controller: 'BakeryMenuCtrl'
        }
      }
    })

    .state('reservations', {
      parent: 'index',
      url: '/reservations',
      views: {
        'main@index': {
          templateUrl: 'partials/reservations.html',
          controller: 'ReservationsCtrl'
        }
      }
    })

    .state('reviews', {
      parent: 'index',
      url: '/reviews',
      views: {
        'main@index': {
          templateUrl: 'partials/reviews.html',
          controller: 'ReviewsCtrl'
        }
      }
    });

    $urlRouterProvider.otherwise('home');
  }
]);

app.run(['$rootScope', '$location', function($rootScope, $location) {
  $rootScope.setHash = function(id) {
    $location.hash(id);
    $rootScope.$apply();
  };
}]);

app.factory('utils', [function() {
  var utils = {};


  return utils;
}]);

app.factory('reservations', [
  '$firebaseArray',
  function($firebaseArray) {
    var ref = new Firebase('https://fbla-website.firebaseio.com/reservations');
    return $firebaseArray(ref);
  }
]);

app.factory('reviews', [
  '$firebaseArray',
  function($firebaseArray) {
    var ref = new Firebase('https://fbla-website.firebaseio.com/reviews');
    return $firebaseArray(ref);
  }
]);

app.controller('IndexCtrl', [
  '$scope',
  '$rootScope',
  'utils',
  '$http',
  '$state',
  '$window',
  function($scope, $rootScope, utils, $http, $state) {
    $scope.$state = $state;
  }
]);

app.directive("scroll", function($window) {
  return function(scope, element, attrs) {
    angular.element($window).bind("scroll", function() {
      if (this.pageYOffset >= 50) {
        scope.transparentNavbar = true;
        console.log('Scrolled below header.');
      } else {
        scope.transparentNavbar = false;
        console.log('Header is in view.');
      }
      scope.$apply();
    });
  };
});
