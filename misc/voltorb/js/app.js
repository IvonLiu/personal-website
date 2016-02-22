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
        row.push(-1);
      }
      board.push(row);
    }
    return board;
  }

  voltorb.newPBoard = function(numRows, numCols) {
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
        row.push(board[i][j]);
      }
      copy.push(row);
    }
    return copy;
  }

  voltorb.nextBoard = function(board, value) {
    var copy = voltorb.copy(board);
    for (var row = 0; row < copy.length; row++) {
      for (var col = 0; col < copy[row].length; col++) {
        if (copy[row][col] == -1) {
          copy[row][col] = value;
          return copy;
        }
      }
    }
    return undefined;
  };

  voltorb.rowCount = function(board, row) {
    var count = {
      points: 0,
      voltorbs: 0,
      unknowns: board[0].length
    };
    for (var i = 0; i < board[0].length; i++) {
      switch (board[row][i]) {
        case 0:
          count.voltorbs++;
          count.unknowns--;
          break;
        case 1:
        case 2:
        case 3:
          count.points += board[row][i];
          count.unknowns--;
          break;
      }
    }
    return count;
  }

  voltorb.colCount = function(board, col) {
    var count = {
      points: 0,
      voltorbs: 0,
      unknowns: board.length
    };
    for (var i = 0; i < board.length; i++) {
      switch (board[i][col]) {
        case 0:
          count.voltorbs++;
          count.unknowns--;
          break;
        case 1:
        case 2:
        case 3:
          count.points += board[i][col];
          count.unknowns--;
          break;
      }
    }
    return count;
  }

  voltorb.isValidIntermediate = function(board, rowConfig, colConfig) {

    for (var i = 0; i < rowConfig.length; i++) {
      var count = voltorb.rowCount(board, i);
      if (count.voltorbs > rowConfig[i].voltorbs) {
        return false;
      } else {
        count.unknowns -= (rowConfig[i].voltorbs - count.voltorbs);
        if (count.points + count.unknowns > rowConfig[i].points || count.points + 3 * count.unknown < rowConfig[i].points) {
          return false;
        }
      }
    }

    for (var i = 0; i < colConfig.length; i++) {
      var count = voltorb.colCount(board, i);
      if (count.voltorbs > colConfig[i].voltorbs) {
        return false;
      } else {
        count.unknowns -= (colConfig[i].voltorbs - count.voltorbs);
        if (count.points + count.unknowns > colConfig[i].points || count.points + 3 * count.unknown < colConfig[i].points) {
          return false;
        }
      }
    }

    return true;

  }

  voltorb.isValidSolution = function(board, rowConfig, colConfig) {

    for (var i = 0; i < rowConfig.length; i++) {
      var count = voltorb.rowCount(board, i);
      if (count.points != rowConfig[i].points || count.voltorbs != rowConfig[i].voltorbs) {
        return false;
      }
    }
    for (var i = 0; i < colConfig.length; i++) {
      var count = voltorb.colCount(board, i);
      if (count.points != colConfig[i].points || count.voltorbs != colConfig[i].voltorbs) {
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

  voltorb.generateBoard = function(pBoard) {
    var board = [];
    for (var i=0; i<pBoard.length; i++) {
      var row = [];
      for (var j=0; j<pBoard[i].length; j++) {
        row.push(pBoard[i][j].actual);
      }
      board.push(row);
    }
    return board;
  }

  voltorb.probabilities = function(board, rowConfig, colConfig, callback) {

    var solutions = voltorb.solutions(board, rowConfig, colConfig);
    var pBoard = voltorb.newPBoard(rowConfig.length, colConfig.length);
    for (var i = 0; i < rowConfig.length; i++) {
      for (var j = 0; j < colConfig.length; j++) {
        if (board[i][j] != -1) {
          pBoard[i][j].actual = board[i][j];
        } else {
          for (var n = 0; n < solutions.length; n++) {
            switch (solutions[n][i][j]) {
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
            pBoard[i][j].isVoltorb = true;
          } else if (pBoard[i][j].one == solutions.length) {
            pBoard[i][j].actual = 1;
            pBoard[i][j].isAutofill = false;  // 1's are useless
          } else if (pBoard[i][j].two == solutions.length) {
            pBoard[i][j].actual = 2;
            pBoard[i][j].isAutofill = true;
          } else if (pBoard[i][j].three == solutions.length) {
            pBoard[i][j].actual = 3;
            pBoard[i][j].isAutofill = true;
          } else {
            if (pBoard[i][j].zero == 0) {
              pBoard[i][j].isSafe = true;
            }
            pBoard[i][j].zero /= solutions.length;
            pBoard[i][j].one /= solutions.length;
            pBoard[i][j].two /= solutions.length;
            pBoard[i][j].three /= solutions.length;
          }
        }
      }
    }
    callback(pBoard);
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

    $scope.pBoard = voltorb.newPBoard(numRows, numCols);

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
      $scope.solving = true;
      voltorb.probabilities(voltorb.generateBoard($scope.pBoard), $scope.rowConfig, $scope.colConfig, function(pBoard) {
        $scope.pBoard = pBoard;
        $scope.solving = false;
      });

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
      return Math.round(n * 100) / 100;
    }

  }
]);
