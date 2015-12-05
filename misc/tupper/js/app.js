var app = angular.module('tupper', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	  $stateProvider
	    .state('display', {
	      url: '/display?demo',
	      templateUrl: '/display.html',
	      controller: 'DisplayCtrl'
	    })
	    .state('generate', {
			  url: '/generate?demo',
			  templateUrl: '/generate.html',
			  controller: 'GenerateCtrl'
			});

	  $urlRouterProvider.otherwise('display');
	}
]);

app.factory('utils', [function() {
	var utils = {
		
		max: bigInt("285793394306920833441610418092098634655629245793956098678773267955742373149291514664653927800704880150373913388423749690746007967577679155184353688551864105050094392601490879904551645289937784458453139617535910572704774231271588108092253680499408135958507227058036551719659148821493652464309016970613693109544906508636480672894494640559860467878289647366663850331954867463170600301178621010101029372654264171297982037231491311892858947537525986757827169736600317880446647247045504644272222656049350793825164158207773197137018282319809299349503"),

		samples: [
			"960939379918958884971672962127852754715004339660129306651505519271702802395266424689642842174350718121267153782770623355993237280874144307891325963941337723487857735749823926629715517173716995165232890538221612403238855866184013235585136048828693337902491454229288667081096184496091705183454067827731551705405381627380967602565625016981482083418783163849115590225610003652351370343874461848378737238198224849863465033159410054974700593138339226497249461751545728366702369745461014655997933798537483143786841806593422227898388722980000748404719",
			"471521078405136705082127015007629788050564708735246423199461474888209964454932515919437402745832686080455225314732511987058445684258510272348687567507490935043806330412190221800250505797569879981530771656871198632712262828187784746683679568570020482349453569787962901254810262127861683440785874489659164391318997175410639488578457653779045732431920313163254628652429606912",
			"40073197216055612354374209946939444049261600660342897458441699947130563771328046184881132806366526127831976575422845741987761912298116569002094018648280548040507256614674288642616336445139967321752477237924895082264224848819592995663658367779689687642432736099189206568301020784616989352054273651465711737280851227125753394170041018993349292549867048163137835914673686315008",
			"1423102797625612328419801266161548871548154121440126998110348912867672840787219485876369481883825313414460391319437800841319470151261843015740848648360654510350426721046961217287071876650656021861628782417677013830314236030577141256465538583744611669766382257839351561833589169870172681586449062035456",
			"4858487703217654168507377107565676789145697178497253677539145555247620343537955749299116772611982962556356527603203744742682135448820545638134012705381689785851604674225344958377377969928942335793703373498110479735981161931616997837568312568489938311294622859986621379234205529965392091893253288500432782862263410646820171439206408889517627953930924005233285455643232746873900205120036557171717499335122490912065694632935352302178602108137941774883061885522205403967593003199773578952627785152838963495027790689532144351329310799436758088941568"
		],
		
		generateBitmap: function(strValue) {
			var k = bigInt(strValue);
			var k2str = this.padWithZeroes(k.divide(17).toString(2), 1802);
			var bitmap = [];
			for (var i=0; i<17; i++) {
				bitmap.push([]);
			}
			for (var i=0; i<k2str.length; i++) {
				var b = parseInt(k2str[i]);
				var row = 16 - (i%17);
				bitmap[row].push(b);
			}
			return bitmap;
		},

		generateK: function(bitmap) {
			var k2str = "";
			for (var col=0; col<bitmap[0].length; col++) {
				for (var row=bitmap.length-1; row>=0; row--) {
					k2str += bitmap[row][col];
				}
			}
			k = bigInt(k2str, 2).multiply(17);
			return k.toString();
		},

		padWithZeroes: function(number, length) {
	    var my_string = '' + number;
	    while (my_string.length < length) {
        my_string = '0' + my_string;
	    }
	    return my_string;
		},

		calculateCellSize: function() {
			var graphWidth = angular.element(document.getElementById('graph'))[0].clientWidth;
			return graphWidth/106;
		}

	};
	return utils;
}]);

app.controller('DisplayCtrl', [
	'$scope',
	'$state',
	'$timeout',
	'utils',
	function($scope, $state, $timeout, utils) {
		$scope.cellSize = utils.calculateCellSize();
		angular.element(document.getElementById('nav-display'))[0].className = "active";
		angular.element(document.getElementById('nav-generate'))[0].className = "";
		if ($state.params.demo) {
			angular.element(document.getElementById('nav-link-display'))[0].href = "#/display?demo=1";
			angular.element(document.getElementById('nav-link-generate'))[0].href = "#/generate?demo=1";
		} else {
			angular.element(document.getElementById('nav-link-display'))[0].href = "#/display";
			angular.element(document.getElementById('nav-link-generate'))[0].href = "#/generate";
		}
		
		$scope.default = function() {
			$scope.kRange = -1;
			$scope.k = utils.samples[0];
			$scope.display();
		}
		$scope.display = function() {
			console.log($scope.k);
			if ($state.params.demo && $scope.k == utils.samples[4]) {
				$scope.autoplay();	
			} else {
				$scope.bitmap = utils.generateBitmap($scope.k);
			}
		}
   	$scope.$watch('kRange', function() {
     	if ($scope.kRange >= 0) {
     		$scope.k = utils.max.multiply($scope.kRange).divmod(100).quotient.multiply(17).toString();
     		$scope.display();	
     	}
   	});
   	
   	$scope.autoplay = function() {
   		console.log("Initiating autoplay");
   		$scope.k = "0";
   		$scope.bitmap = utils.generateBitmap($scope.k);
   		$timeout(function() {
	   		$scope.k = utils.samples[1];
	   		$scope.bitmap = utils.generateBitmap($scope.k);
	   		$timeout(function() {
	   			$scope.k = utils.samples[2];
	   			$scope.bitmap = utils.generateBitmap($scope.k);
	   			$timeout(function() {
	   				$scope.k = utils.samples[3];
	   				$scope.bitmap = utils.generateBitmap($scope.k);
	   				$timeout(function() {
	   					$scope.k = "0";
	   					$scope.bitmap = utils.generateBitmap($scope.k);
	   					$scope.k = utils.samples[4];
	   				}, 1000);
	   			}, 3000);
	   		}, 3000);
   		}, 1000);
   	}

   	$scope.default();
	}
]);

app.controller('GenerateCtrl', [
	'$scope',
	'$state',
	'utils',
	function($scope, $state, utils) {
		$scope.cellSize = utils.calculateCellSize();
		angular.element(document.getElementById('nav-display'))[0].className = "";
		angular.element(document.getElementById('nav-generate'))[0].className = "active";
		if ($state.params.demo) {
			angular.element(document.getElementById('nav-link-display'))[0].href = "#/display?demo=1";
			angular.element(document.getElementById('nav-link-generate'))[0].href = "#/generate?demo=1";
		} else {
			angular.element(document.getElementById('nav-link-display'))[0].href = "#/display";
			angular.element(document.getElementById('nav-link-generate'))[0].href = "#/generate";
		}

		$scope.clear = function() {
			$scope.k = "0";
			$scope.bitmap = utils.generateBitmap($scope.k);
		}

		$scope.generate = function() {
			if ($state.params.demo) {
				$scope.k = utils.samples[4];
			} else {
				$scope.k = utils.generateK($scope.bitmap);
			}
		}

		$scope.toggleCell = function(row, col) {
			if ($scope.bitmap[row][col] == 0) {
				$scope.bitmap[row][col] = 1;
			} else {
				$scope.bitmap[row][col] = 0;
			}
		}

		$scope.clear();
	}
]);