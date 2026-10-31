app.controller('JoinClassCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  'utils',
  '$http',
  'classes',
  function($scope, $rootScope, $state, utils, $http, Classes) {

    $scope.joinClass = function() {
      $http.post('https://mesnotes.parseapp.com/classes/'+$scope.classId+'/join').then(function(response) {
        $scope.classId = '';
        $state.go('dash');
      }, utils.handleError);
    };

  }
]);
