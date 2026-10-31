var app = angular.module('rowEchelon', []);

app.factory('utils', [function() {
  var utils = {

    noSolution: [
      [2, 4, 3, -1],
      [5, 10, -7, -2],
      [3, 6, 5, 9]
    ],

    oneSolution: [
      [1, 3, 6, 25],
      [2, 7, 14, 58],
      [0, 2, 5, 19]
    ],

    infiniteSolutions: [
      [3, -1, -5, 9],
      [0, 1, -10, 0],
      [-2, 1, 0, -6]
    ],

    pad: function(spaces, str) {
      var pad = '';
      for (var i=0; i<spaces; i++) {
        pad += ' ';
      }
      if (typeof str === 'undefined') {
        return pad;
      }
      return (pad + str).slice(-pad.length);      
    },

    swap: function(matrix, a, b) {
      var temp = matrix[a];
      matrix[a] = matrix[b];
      matrix[b] = temp;      
    },

    divide: function(matrix, row, k) {
      for (var col=0; col<matrix[row].length; col++) {
        matrix[row][col] /= k;
      }      
    },

    add: function(matrix, k1, a, k2, b) {
      for (var col=0; col<matrix[a].length; col++) {
        matrix[b][col] *= k2;
        matrix[b][col] += (matrix[a][col]*k1);
      }     
    }

  };
  return utils;
}]);

app.controller('MainCtrl', [
  '$scope',
  'utils',
  function($scope, utils) {

    //$scope.matrix = utils.oneSolution;

    $scope.showInput = function() {
      $scope.matrix = [];
      $scope.solution = undefined;
      for (var i=0; i<$scope.numRows; i++) {
        var row = [];
        for (var j=0; j<$scope.numVars+1; j++) {
          row.push(0);
        }
        $scope.matrix.push(row);
      }
    }

    $scope.solve = function() {
      
      var matrix = [];
      for (var i=0; i<$scope.matrix.length; i++) {
        var row = [];
        for (var j=0; j<$scope.matrix[i].length; j++) {
          row.push(Number($scope.matrix[i][j]));
        }
        matrix.push(row);
      }

      var rank = 0;
      for (var col=0; col<matrix[0].length-1; col++) {

        var isPivotCol = false;
        for (var row=rank; row<matrix.length; row++) {
          if (matrix[row][col] != 0) {
            isPivotCol = true;
            if (row != rank) {
              utils.swap(matrix, rank, row);
            }
            rank++;
            break;
          }
        }

        if (isPivotCol) {
          for (var row=rank; row<matrix.length; row++) {
            utils.add(matrix, matrix[row][col]*-1, rank-1, matrix[rank-1][col], row);
          }
        }

      }

      for (var row=0; row<rank; row++) {
        for (var col=0; col<matrix[row].length-1; col++) {
          if (matrix[row][col] != 0) {

            utils.divide(matrix, row, matrix[row][col]);

            // Go back up and zero everything
            for (var i=row-1; i>=0; i--) {
              utils.add(matrix, matrix[i][col]*-1, row, matrix[row][col], i);
            }

            break;

          }
        }
      }

      // Reduced row-echelon form
      //console.log(matrix);

      if (rank == matrix[0].length-1) {
        var solution = [];
        for (var row=0; row<matrix.length; row++) {
          var end = matrix[row].length - 1;
          solution.push(matrix[row][end]);
        }
        $scope.solution = JSON.stringify(solution);
      } else {
        var noSolution = false;
        for (var row=rank; row<matrix.length; row++) {
          var end = matrix[row].length - 1;
          if (matrix[row][end] != 0) {
            noSolution = true;
            break;
          }
        }
        if (noSolution) {
          $scope.solution = 'There is no solution';
        } else {
          $scope.solution = 'There are infinite solutions';
        }
      }
    }

  }
]);