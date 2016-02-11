var app = angular.module('voltorb', []);

app.factory('utils', [function() {
  var utils = {
    calculateCellSize: function(cols) {
      var width = angular.element(document.getElementById('board'))[0].clientWidth;
      return Math.floor(width / (cols + 1));
    }
  };
  return utils;
}]);

app.factory('voltorb', [function() {

  var voltorb = {};

  voltorb.newBoard = function(numRows, numCols) {
    var board = [];
    for (var i = 0; i < numRows; i++) {
      var row = [];
      for (var j = 0; j < numCols; j++) {
        row.push({
          zero: 0,
          one: 0,
          two: 0,
          three: 0,
          actual: -1
        });
      }
      board.push(row);
    }
    return board;
  }

  voltorb.copy = function(board) {
    var copy = [];
    for (var i = 0; i < board.length; i++) {
      var row = [];
      for (var j = 0; j < board[i].length; j++) {
        row.push({
          zero: board[i][j].zero,
          one: board[i][j].one,
          two: board[i][j].two,
          three: board[i][j].three,
          actual: board[i][j].actual
        });
      }
      copy.push(row);
    }
    return copy;
  }

  voltorb.nextBoard = function(board, value) {
    var copy = voltorb.copy(board);
    for (var row = 0; row < copy.length; row++) {
      for (var col = 0; col < copy[row].length; col++) {
        if (copy[row][col].actual == -1) {
          copy[row][col].actual = value;
          return copy;
        }
      }
    }
    return undefined;
  };

  voltorb.generateRowColCounts = function(board) {

    var rowCounts = [];
    for (var i = 0; i < board.length; i++) {
      rowCounts.push({
        points: 0,
        voltorbs: 0,
        unknowns: board[0].length
      });
    }

    var colCounts = [];
    for (var i = 0; i < board[0].length; i++) {
      colCounts.push({
        points: 0,
        voltorbs: 0,
        unknowns: board.length
      });
    }

    for (var row = 0; row < board.length; row++) {
      for (var col = 0; col < board[row].length; col++) {
        switch (board[row][col].actual) {
          case 0:
            rowCounts[row].voltorbs++;
            colCounts[col].voltorbs++;
            rowCounts[row].unknowns--;
            colCounts[col].unknowns--;
            break;
          case 1:
          case 2:
          case 3:
            rowCounts[row].points += board[row][col].actual;
            colCounts[col].points += board[row][col].actual;
            rowCounts[row].unknowns--;
            colCounts[col].unknowns--;
            break;
        }
      }
    }

    return {
      row: rowCounts,
      col: colCounts
    };
  }

  voltorb.isValidIntermediate = function(board, rowConfig, colConfig) {

    var counts = voltorb.generateRowColCounts(board);
    var rowCounts = counts.row;
    var colCounts = counts.col;

    for (var i = 0; i < rowConfig.length; i++) {
      if (rowCounts[i].voltorbs > rowConfig[i].voltorbs) {
        return false;
      } else {
        rowCounts[i].unknowns -= (rowConfig[i].voltorbs - rowCounts[i].voltorbs);
        if (rowCounts[i].points + rowCounts[i].unknowns > rowConfig[i].points || rowCounts[i].points + 3 * rowCounts[i].unknown < rowConfig[i].points) {
          return false;
        }
      }
    }

    for (var i = 0; i < colConfig.length; i++) {
      if (colCounts[i].voltorbs > colConfig[i].voltorbs) {
        return false;
      } else {
        colCounts[i].unknowns -= (colConfig[i].voltorbs - colCounts[i].voltorbs);
        if (colCounts[i].points + colCounts[i].unknowns > colConfig[i].points || colCounts[i].points + 3 * colCounts[i].unknown < colConfig[i].points) {
          return false;
        }
      }
    }

    return true;

  }

  voltorb.isValidSolution = function(board, rowConfig, colConfig) {

    var counts = voltorb.generateRowColCounts(board);
    var rowCounts = counts.row;
    var colCounts = counts.col;

    for (var i = 0; i < rowConfig.length; i++) {
      if (rowCounts[i].points != rowConfig[i].points || rowCounts[i].voltorbs != rowConfig[i].voltorbs) {
        return false;
      }
    }
    for (var i = 0; i < colConfig.length; i++) {
      if (colCounts[i].points != colConfig[i].points || colCounts[i].voltorbs != colConfig[i].voltorbs) {
        return false;
      }
    }
    return true;

  }

  voltorb.solutions = function(board, rowConfig, colConfig) {
    var solutions = [];
    voltorb.solutionsRecurse(board, rowConfig, colConfig, solutions);
    return solutions;
  };

  voltorb.solutionsRecurse = function(board, rowConfig, colConfig, solutions) {
    for (var i = 0; i <= 3; i++) {
      var next = voltorb.nextBoard(board, i);
      if (next) {
        if (voltorb.isValidIntermediate(next, rowConfig, colConfig)) {
          voltorb.solutionsRecurse(next, rowConfig, colConfig, solutions);
        }
      } else {
        if (voltorb.isValidSolution(board, rowConfig, colConfig)) {
          solutions.push(board);
        }
      }
    }
  }

  voltorb.probabilities = function(board, rowConfig, colConfig) {

    console.log(JSON.stringify(board));
    var solutions = voltorb.solutions(board, rowConfig, colConfig);
    var pBoard = voltorb.newBoard(rowConfig.length, colConfig.length);
    console.log(JSON.stringify(board));
    for (var i = 0; i < rowConfig.length; i++) {
      for (var j = 0; j < colConfig.length; j++) {
        if (board[i][j].actual != -1) {
          pBoard[i][j].actual = board[i][j].actual;
        } else {
          for (var n = 0; n < solutions.length; n++) {
            switch (solutions[n][i][j].actual) {
              case 0:
                pBoard[i][j].zero++;
                break;
              case 1:
                pBoard[i][j].one++;
                break;
              case 2:
                pBoard[i][j].two++;
                break;
              case 3:
                pBoard[i][j].three++;
                break;
            }
          }
          if (pBoard[i][j].zero == solutions.length) {
            pBoard[i][j].actual = 0;
            pBoard[i][j].isAutofill = true;
          } else if (pBoard[i][j].one == solutions.length) {
            pBoard[i][j].actual = 1;
            pBoard[i][j].isAutofill = true;
          } else if (pBoard[i][j].two == solutions.length) {
            pBoard[i][j].actual = 2;
            pBoard[i][j].isAutofill = true;
          } else if (pBoard[i][j].three == solutions.length) {
            pBoard[i][j].actual = 3;
            pBoard[i][j].isAutofill = true;
          } else {
            pBoard[i][j].zero /= solutions.length;
            pBoard[i][j].one /= solutions.length;
            pBoard[i][j].two /= solutions.length;
            pBoard[i][j].three /= solutions.length;
          }
        }
      }
    }
    return pBoard;
  }

  return voltorb;
}])

app.controller('MainCtrl', [
  '$scope',
  'utils',
  'voltorb',
  function($scope, utils, voltorb) {

    var numRows = 5;
    var numCols = 5;

    $scope.cellSize = utils.calculateCellSize(numCols);

    $scope.board = [];
    for (var i = 0; i < numRows; i++) {
      var row = [];
      for (var j = 0; j < numCols; j++) {
        row.push({
          zero: -1,
          one: -1,
          two: -1,
          three: -1,
          actual: -1
        });
      }
      $scope.board.push(row);
    }

    $scope.rowConfig = [];
    for (var i = 0; i < numRows; i++) {
      $scope.rowConfig.push({
        points: 0,
        voltorbs: 0
      });
    }

    $scope.colConfig = [];
    for (var i = 0; i < numCols; i++) {
      $scope.colConfig.push({
        points: 0,
        voltorbs: 0
      });
    }

    /*$scope.board = [[{zero:-1,one:-1,two:-1,three:-1,actual:0},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1}],[{zero:-1,one:-1,two:-1,three:-1,actual:0},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1}],[{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:0},{zero:-1,one:-1,two:-1,three:-1,actual:0}],[{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:0},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:3},{zero:-1,one:-1,two:-1,three:-1,actual:2}],[{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:2},{zero:-1,one:-1,two:-1,three:-1,actual:1},{zero:-1,one:-1,two:-1,three:-1,actual:2},{zero:-1,one:-1,two:-1,three:-1,actual:0}]];*/

    /*$scope.rowConfig = [{
      points: 4,
      voltorbs: 1
    }, {
      points: 4,
      voltorbs: 1
    }, {
      points: 3,
      voltorbs: 2
    }, {
      points: 7,
      voltorbs: 1
    }, {
      points: 6,
      voltorbs: 1
    }];
    $scope.colConfig = [{
      points: 3,
      voltorbs: 2
    }, {
      points: 5,
      voltorbs: 1
    }, {
      points: 5,
      voltorbs: 0
    }, {
      points: 7,
      voltorbs: 1
    }, {
      points: 4,
      voltorbs: 2
    }];*/

    $scope.solve = function() {
      $scope.board = voltorb.probabilities($scope.board, $scope.rowConfig, $scope.colConfig);

      /*var minP = 1;
      for (var i=0; i<$scope.rowConfig.length; i++) {
        for (var j=0; j<$scope.colConfig.length; j++) {
          if ($scope.board[i][j].actual == -1 && $scope.board[i][j].zero < minP) {
            minP = $scope.board[i][j].zero;
          }
        }
      }

      for (var i=0; i<$scope.rowConfig.length; i++) {
        for (var j=0; j<$scope.colConfig.length; j++) {
          if ($scope.board[i][j].actual == -1 && $scope.board[i][j].zero == minP) {
            console.log('board['+i+']['+j+'] is optimal');
            $scope.board[i][j].isOptimal = true;
          }
        }
      }*/
    }

    $scope.beautify = function(n) {
      return Math.round(n * 10000) / 10000;
    }

  }
]);
