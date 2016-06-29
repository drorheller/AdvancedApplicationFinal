var manageModule = angular.module('manageModule',['ngRoute','ngTable','ui.bootstrap','serverCommunicationModule','advertaismentModule']);

manageModule.controller('manageIndexCntrl',function ($scope,$filter,ngTableParams, serverApi, adsService){
    $scope.tempa = adsService;
    $scope.ads = $scope.tempa.allAds;

    $scope.$watchCollection('tempa.allAds',function(newValue , oldValue){
        $scope.ads = newValue;
        $scope.tableParams.reload();
    });

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,           // count of adds per page
        sorting: {
            name: 'asc'     // initial sorting is ascending
        },
        filter: {
            name: ''      // initial filter(is empty)
        }

    }, {
        total: $scope.ads.length, // length of data
        getData: function($defer, params) {

            //Get ordered adds by filter if there is one
            var filteredData = params.filter() ?
                $filter('filter')($scope.ads, params.filter()) :
                $scope.ads;

            // sort the filtered data
            filteredData = params.sorting() ?
                $filter('orderBy')(filteredData, params.orderBy()) :
                filteredData;

            $defer.resolve(filteredData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        },
        filterDelay : 0
    });

    serverApi.emit_GetAllAdsFromServer();

    //delete adds
    $scope.callDelete = function(id){
        serverApi.emit_AdDelete(id);
    }
});

manageModule.controller('EditAd',function($scope,$routeParams,$location,serverApi,adsService){
    $scope.optionalStations = adsService.allStations;
    $scope.oneAtATime = true;
    $scope.dateFormat = 'dd-MMMM-yyyy';
    $scope.adId = $routeParams.adId;
    $scope.ad = adsService.getAdById($scope.adId);
    $scope.alerts = [];

    serverApi.registerListener(serverApi.serverEvent_AdValidation, function (data){
        console.log("update event was raised");
        if (data.valid){
            serverApi.emit_AdUpdate($scope.ad._id,$scope.ad);
            $location.path('/crud');
        }
    });

    // $scope.closeAlert = function(index) {
    //     $scope.alerts.splice(index, 1);
    // };

    //validate before edit
    function doEdit(){

        console.log("do edit");
        if (validateAd($scope)){
            serverApi.emit_validateAd($scope.ad);
        }
    }

    $scope.doEdit = doEdit;

    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverEvent_AdValidation);
    });
});

//create add
manageModule.controller('createAd',function($scope,$location,serverApi, adsService){
    $scope.optionalStations = adsService.allStations;
    $scope.ad = new emptyAd();
    $scope.oneAtATime = true;
    $scope.dateFormat = 'dd-MMMM-yyyy';
    $scope.alerts = [];

    serverApi.registerListener(serverApi.serverEvent_AdValidation, function (data){
        console.log("Create event was raised");
        if (data.valid){
            serverApi.emit_AdCreate($scope.ad);
            $location.path('/crud');
        }

    });
    
   //validate before create
    function doCreate(){

        if(validateAd($scope)){
            serverApi.emit_validateAd($scope.ad);
        }
    }

    $scope.doCreate = doCreate;


    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverEvent_AdValidation);
    });
});


// validate add
function validateAd($scope){

    var valid = true;

    // Ensure basic data is not empty
    if ($scope.ad.name == ""){
        valid = false;
        console.log("Ad name cannot be empty", $scope);
    }
    if ($scope.ad.stationId == ""){
        valid = false;
        console.log("Ad must have station", $scope);
    }
    if ($scope.ad.owner ==""){
        valid = false;
        console.log("Owner name cannot be empty", $scope);
    }
    if ($scope.ad.fields ==""){
        valid = false;
        console.log("Ad field cannot be empty", $scope);
    }
    if ($scope.ad.moneyInvested ==""){
        valid = false;
        console.log("Budget money cannot be empty", $scope);
    }
    if (($scope.ad.moneyInvested < 100) || ($scope.ad.moneyInvested > 5000)){
        valid = false;
        console.log("Budget money needs to be between 100 and 5000", $scope);
    }
    
    if ($scope.ad.timeFrame.startDate ==""){
        valid = false;
        console.log("Start date cannot be empty", $scope);
    }
    if ($scope.ad.timeFrame.endDate ==""){
        valid = false;
        console.log("End date cannot be empty", $scope);
    }
    if (new Date($scope.ad.timeFrame.startDate) > new Date($scope.ad.timeFrame.endDate)){
        valid = false;
        console.log("End date must be after start date", $scope);
    }

    return valid;
}

// Creates an empty Ad;
function emptyAd() {
    return {
        stationId: '',
        name : '',
        owner : '',
        fields : '',
        moneyInvested : 100,
        texts : [{text: ''}, {text: ''},{text: ''},{text: ''},{text: ''}],
        images : [{url :''}, {url : ''}],
        timeFrame :{
            startDate:new Date(),
            endDate:new Date()
        }
    }
}
// /*Get an ad object and returns a clean object - only the data that needs to be sent to the server*/
// function getCleanAd(dirty){
//     var ad = {};
//     ad.name = dirty.name;
//     ad.stationId = dirty.stationId;
//     ad.owner = dirty.owner;
//     ad.fields = dirty.fields;
//     ad.moneyInvested = dirty.moneyInvested;
//     ad.texts = dirty.texts;
//     ad.images = dirty.images;
//     ad.timeFrame = dirty.timeFrame;
//
//     return ad;
// }