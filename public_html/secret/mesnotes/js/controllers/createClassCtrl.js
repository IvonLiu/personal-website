app.controller('CreateClassCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  'utils',
  '$http',
  'classes',
  function($scope, $rootScope, $state, utils, $http, Classes) {

    $scope.createClass = function() {
      var cls = {
        name: $scope.name,
      };

      $http.post('https://mesnotes.parseapp.com/classes', cls).then(function(response) {
        $scope.name = '';
        $state.go('dash');
      }, utils.handleError);
    };

  }
]);
