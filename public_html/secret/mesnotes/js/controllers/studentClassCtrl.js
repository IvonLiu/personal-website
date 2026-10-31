app.controller('StudentClassCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  'utils',
  '$http',
  'classes',
  'clsResponse',
  function($scope, $rootScope, $state, utils, $http, Classes, clsResponse) {
    
    $scope.clsResponse = clsResponse;
    $scope.cls = clsResponse.cls;
    $scope.assignments = [];

    var grid = utils.generateClassGrid($scope.clsResponse);
    for (var i=0; i<grid.length; i++) {
      if (grid[i].user.id == $rootScope.currentUser.id) {
        $scope.assignments = grid[i].assignments;
        break;
      }
    }
    
    console.log(JSON.stringify($scope.assignments));
  }
]);