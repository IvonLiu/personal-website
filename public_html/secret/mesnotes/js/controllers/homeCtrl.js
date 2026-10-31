app.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
  'utils',
  '$state',
  function($scope, $rootScope, utils, $state) {
    if ($rootScope.currentUser) {
      $state.go('dash');
    }
  }
]);
