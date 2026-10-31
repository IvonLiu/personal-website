app.controller('TeacherClassCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  'utils',
  '$http',
  'classes',
  'assignments',
  'saPairs',
  'clsResponse',
  function($scope, $rootScope, $state, utils, $http, Classes, Assignments, SAPairs, clsResponse) {

    $scope.clsResponse = clsResponse;
    $scope.cls = clsResponse.cls;
    $scope.assignments = clsResponse.assignments;
    $scope.grid = utils.generateClassGrid($scope.clsResponse);

    //console.log(JSON.stringify($scope.grid));

    $scope.createAssignment = function() {
      var assignment = {
        name: $scope.name,
        max: $scope.max
      };
      $http.post('https://mesnotes.parseapp.com/classes/'+$scope.cls.id+'/assignments', assignment).then(function(response) {
        $scope.clsResponse.assignments.push(Parse.Object.fromJSON(response.data));
        $scope.grid = utils.generateClassGrid($scope.clsResponse);
        $scope.name = '';
        $scope.max = '';
      }, utils.handleError);
    };

    $scope.generateScoreGrid = function() {
      console.log(JSON.stringify($scope.grid));
    }

    $scope.save = function() {

      var data = {
        grid: $scope.grid.map(function(item) {
          return {
            user: _.extend(item.user.toJSON(), {className: '_User'}),
            assignments: item.assignments.map(function(assignment) {
              return {
                assignment: _.extend(assignment.assignment.toJSON(), {className: 'Assignment'}),
                obtained: assignment.obtained
              };
            })
          };
        })
      };

      $http.post('https://mesnotes.parseapp.com/classes/'+$scope.cls.id+'/grid', data).then(function(response) {
        console.log(response.data);
      }, utils.handleError);
      /*$http.get('https://mesnotes.parseapp.com/simpletest').then(function(response) {
        console.log('Simpletest works: ' + JSON.stringify(response.data));
      }, function (error) {
        console.log('Simpletest fails: ' + JSON.stringify(error));
      });*/
      /*$http.post('https://mesnotes.parseapp.com/test2', {id: 'XxHtOyvKla'}).then(function(response) {
        console.log('Test2 works: ' + JSON.stringify(response.data));
      }, function(error) {
        console.log('Test2 fails: ' + JSON.stringify(error));
      });*/
    }
  }
]);
