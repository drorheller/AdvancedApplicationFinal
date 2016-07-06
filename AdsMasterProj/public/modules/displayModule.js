var displayModule = angular.module('displayModule',['advertaismentModule']);

displayModule.controller('displayAdsCntrl',function($scope,$timeout,adsService){
    // initialize default add to show at begining
    var curId = 0;
    var timer;
    var emptyAd = {
        name : "See this example",
        owner : "the greate Ad Slider",
        texts : [ { text: 'put your text here!!' } ],
        images : [{url: '/images/canvs1.jpg'}],
        moneyInvested : 200
    };

    // The dsiplayed ad that will be fiiled
    $scope.ad = {
        name : "",
        texts : [],
        images : []
    };

    function getCurrentAdToDisplay(){
        // If there is no adds show only the default add
        if (adsService.activeAds.length == 0){
            $scope.ad = emptyAd;
            // Request to refresh active ad
            adsService.refreshActive();
        } else {
            // If we get to the final add return to first(cycle)
            if (curId > adsService.activeAds.length - 1) {
                curId = 0;
            }

            // Assigning appropriated add to current add
            $scope.ad = adsService.activeAds[curId];
            // Set the new cur id
            curId = (curId + 1) % adsService.activeAds.length;
        }
        //set timer on add(how much time it will be displayed)
        timer = $timeout(getCurrentAdToDisplay , calculateAddDisplayTimeByMoney($scope.ad.moneyInvested));
    }




    // Ensure the timer will be removed 
    $scope.$on('$destroy', function(){
        $timeout.cancel(timer);
    });

    // Request to refresh active ads before display
    adsService.refreshActive();

    // Initiates the display add
    getCurrentAdToDisplay();

});

displayModule.controller('displayAdsByStationCntrl',function($scope,$timeout,$routeParams,adsService, serverApi){
    // initialize default add to show at begining
    var curId = 0;
    var timer;
    var emptyAd = {
        name : "See this example",
        owner : "the greate Ad Slider",
        texts : [ { text: 'put your text here!!' } ],
        images : [{url: '/images/canvs1.jpg'}],
        moneyInvested : 200
    };

    // The dsiplayed ad
    $scope.ad = {
        name : '',
        texts : [],
        images : []
    };

    //$scope.showAd = false;
    $scope.stations = adsService.allStations;
    $scope.stationId = $routeParams.stationId;

    // if station is not selected yet put appropriated text
    if ($scope.stationId === '0') {
      $scope.selectedText = "Select station";
        //show selected station
    } else{
        $scope.selectedText = "Station " + $scope.stationId;
    }

    serverApi.registerListener(serverApi.serverCallBack_AdCountByStation, function (data){
        $scope.numberOfAds = data.activeAds[0].ads;
    });

    $scope.hideAdFunc = function() {
        adsService.activeAds = [];
    };

    function getCurrentAdToDisplay(){
        serverApi.emit_GetAdsNumberByStation($scope.stationId);

        if (adsService.activeAds.length == 0){
            $scope.ad = emptyAd;
           // $scope.showAd = true;
            adsService.refreshActiveByStation($scope.stationId);
        } else {
            // If we get to the final add return to first(cycle)
            if (curId > adsService.activeAds.length - 1) {
                curId = 0;
            }
            // Assigning appropriated add to current add
            $scope.ad = adsService.activeAds[curId];
            // Set the new cur id
            curId = (curId + 1) % adsService.activeAds.length;
        }
        //set timer on add(how much time it will be displayed)
        timer = $timeout(getCurrentAdToDisplay , calculateAddDisplayTimeByMoney($scope.ad.moneyInvested));
    }




    //Ensure the timer will be removed
    $scope.$on('$destroy', function(){
        $timeout.cancel(timer);
    });

    if ($scope.stationId != '0') {
        adsService.refreshActiveByStation($scope.stationId);
        // Initiates the display add
        getCurrentAdToDisplay();
    }
});


// Calculates the display  time for an add while considering the amount of  money invested
function calculateAddDisplayTimeByMoney(money){
    if (money <= 0) {
        return 1000;
    }
    return ((money / 100) * 1000);
}

// Calculates how much time an ad will be displayed by the amount of invested money
//function timeFromMoney(money){
   // if (money <= 0) {
   //     return 1000;
  //  }
  //  return ((money / 100) * 1000);
//}

