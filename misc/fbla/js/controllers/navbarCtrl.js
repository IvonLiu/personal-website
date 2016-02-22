app.controller('NavbarCtrl', [
  '$scope',
  '$rootScope',
  'utils',
  '$http',
  '$state',
  function($scope, $rootScope, utils, $http, $state) {
    $scope.$state = $state;
  }
]);
