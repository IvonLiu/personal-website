var app = angular.module('nonogram', []);

app.factory('utils', [function() {
  var utils = {};

  utils.calculateCellSize = function(numCols) {
    var graphWidth = angular.element(document.getElementById('graph'))[0].clientWidth;
    return graphWidth / numCols;
  }

  return utils;
}]);

app.factory('nonogram', [function() {
  var nonogram = {};

  nonogram.empty = function(numRows, numCols) {
    var bitmap = [];
    for (var i = 0; i < numRows; i++) {
      var row = [];
      for (var j = 0; j < numCols; j++) {
        row.push(-1);
      }
      bitmap.push(row);
    }
    return bitmap;
  }

  nonogram.copy = function(bitmap) {
    var copy = [];
    for (var i = 0; i < bitmap.length; i++) {
      var row = [];
      for (var j = 0; j < bitmap[i].length; j++) {
        row.push(bitmap[i][j]);
      }
      copy.push(row);
    }
    return copy;
  }

  nonogram.nextState = function(bitmap, value) {
    var copy = nonogram.copy(bitmap);
    for (var row = 0; row < copy.length; row++) {
      for (var col = 0; col < copy[row].length; col++) {
        if (copy[row][col] == -1) {
          copy[row][col] = value;
          return copy;
        }
      }
    }
    return undefined;
  }

  nonogram.remainingSpaceNeeded = function(config, blockCount) {
    var sum = 0;
    for (var i = blockCount; i < config.length; i++) {
      sum += (1 + config[i]);
    }
    return sum;
  }

  nonogram.isValidIntermediate = function(bitmap, rowConfig, colConfig) {

    for (var i = 0; i < rowConfig.length; i++) {
      var config = rowConfig[i].split(' ').map(function(n) {
        return Number(n);
      });
      var consecutive = 0;
      var blockCount = 0;
      for (var j = 0; j < colConfig.length; j++) {

        if (bitmap[i][j] == 1) {

          if (blockCount >= config.length) {
            // There shouldn't be any more 1's in this row
            console.log('fail here');
            return false;
          } else {
            // check remaining space
            /*if (colConfig.length - j - 1 < nonogram.remainingSpaceNeeded(config, blockCount)) {
              console.log('fail here');
              return false;
            }*/
          }

          consecutive++;
          if (consecutive > config[blockCount]) {
            console.log('fail here');
            return false;
          }

        } else {

          // Not in a block to begin with
          if (consecutive == 0) {
            continue;
          }

          // End of a block
          consecutive = 0;
          if (config[blockCount] != consecutive) {
            // Block size is incorrect
            console.log('fail here');
            return false;
          }

          // Check if there is space for leftover blocks
          blockCount++;
          if (blockCount < config.length) {
            if (colConfig.length - j - 1 < nonogram.remainingSpaceNeeded(config, blockCount)) {
              console.log('fail here');
              return false;
            }
          }

        }

      }
    }

    for (var j = 0; j < colConfig.length; j++) {
      var config = rowConfig[j].split(' ').map(function(n) {
        return Number(n);
      });
      var consecutive = 0;
      var blockCount = 0;
      for (var i = 0; i < rowConfig.length; i++) {

        if (bitmap[i][j] == 1) {

          if (blockCount >= config.length) {
            // There shouldn't be any more 1's in this row
            console.log('fail here');
            return false;
          } else {
            // check remaining space
            /*if (rowConfig.length - i - 1 < nonogram.remainingSpaceNeeded(config, blockCount)) {
              console.log('fail here');
              return false;
            }*/
          }

          consecutive++;
          if (consecutive > config[blockCount]) {
            console.log('fail here');
            return false;
          }

        } else {

          // Not in a block to begin with
          if (consecutive == 0) {
            continue;
          }

          // End of a block
          consecutive = 0;
          if (config[blockCount] != consecutive) {
            // Block size is incorrect
            console.log('fail here');
            return false;
          }

          // Check if there is space for leftover blocks
          blockCount++;
          if (blockCount < config.length) {
            if (rowConfig.length - i - 1 < nonogram.remainingSpaceNeeded(config, blockCount)) {
              console.log('fail here');
              return false;
            }
          }

        }

      }
    }

    return true;

  }

  nonogram.isValidSolution = function(bitmap, rowConfig, colConfig) {

    for (var i = 0; i < rowConfig.length; i++) {
      var config = rowConfig[i].split(' ').map(function(n) {
        return Number(n);
      });
      var consecutive = 0;
      var blockCount = 0;
      for (var j = 0; j < colConfig.length; j++) {

        if (bitmap[i][j] == 1) {

          if (blockCount >= config.length) {
            // There shouldn't be any more 1's in this row
            return false;
          }

          consecutive++;
          if (consecutive > config[blockCount]) {
            return false;
          }

        } else {

          // Not in a block to begin with
          if (consecutive == 0) {
            continue;
          }

          // End of a block
          consecutive = 0;
          if (config[blockCount] != consecutive) {
            // Block size is incorrect
            return false;
          }

        }

      }
    }

    for (var j = 0; j < colConfig.length; j++) {
      var config = rowConfig[j].split(' ').map(function(n) {
        return Number(n);
      });
      var consecutive = 0;
      var blockCount = 0;
      for (var i = 0; i < rowConfig.length; i++) {

        if (bitmap[i][j] == 1) {

          if (blockCount >= config.length) {
            // There shouldn't be any more 1's in this row
            return false;
          }

          consecutive++;
          if (consecutive > config[blockCount]) {
            return false;
          }

        } else {

          // Not in a block to begin with
          if (consecutive == 0) {
            continue;
          }

          // End of a block
          consecutive = 0;
          if (config[blockCount] != consecutive) {
            // Block size is incorrect
            return false;
          }

        }

      }
    }

  }

  nonogram.solve = function(rowConfig, colConfig) {
    var bitmap = nonogram.empty(rowConfig.length, colConfig.length);
    var solution = {};
    nonogram.solveRecurse(bitmap, rowConfig, colConfig, solution);
    console.log('finished');
    console.log(JSON.stringify(solution));
    return solution.bitmap;
  }

  nonogram.solveRecurse = function(bitmap, rowConfig, colConfig, solution) {
    console.log('solveRecurse');
    for (var i = 0; i <= 1; i++) {
      var next = nonogram.nextState(bitmap, i);
      if (next) {
        console.log(JSON.stringify(next));
        if (nonogram.isValidIntermediate(next, rowConfig, colConfig)) {
          console.log('recursing');
          nonogram.solveRecurse(next, rowConfig, colConfig, solution);
        } else {
          console.log('next state is invalid');
        }
      } else {
        console.log('no next state');
        if (nonogram.isValidSolution(bitmap, rowConfig, colConfig)) {
          console.log('found solution');
          console.log(JSON.stringify(bitmap));
          solution.bitmap = bitmap;
        }
      }
    }
  }

  return nonogram;
}])

app.controller('MainCtrl', [
  '$scope',
  'utils',
  'nonogram',
  function($scope, utils, nonogram) {

    $scope.rowConfig = ['2 2', '2 1', '3', '1 1', '1'];
    $scope.colConfig = ['2 1', '3', '3', '1 1', '2'];

    $scope.showConfig = function() {
      $scope.rowConfig = new Array($scope.numRows);
      $scope.colConfig = new Array($scope.numCols);
      $scope.cellSize = utils.calculateCellSize($scope.numCols);
    }

    $scope.solve = function() {
      $scope.bitmap = nonogram.solve($scope.rowConfig, $scope.colConfig);
    };

  }
]);
