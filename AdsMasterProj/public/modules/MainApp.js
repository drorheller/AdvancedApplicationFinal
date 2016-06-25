var mainApp = angular.module('mainApp',['ngRoute','ngResource','socketModule','homeModule','displayModule','manageModule', 'aboutAdvModule']);

// Routing configuration
mainApp.config(function($routeProvider){
    $routeProvider
        .when('/',
            {
                templateUrl: 'views/home/HomeIndex.html'
            })
        .when('/locations',
            {
                controller: 'displaysMapCntrl',
                templateUrl: 'views/home/Stations.html'
            })
        .when('/aboutAdvertiser',
            {
                controller: 'aboutAdvCntrl',
                templateUrl: 'views/home/AboutAdvertiser.html'
            })
        .when('/displayAds',
            {
                controller : 'displayAdsCntrl',
                templateUrl: 'views/display/DisplayAds.html'
            })
        .when('/displayAds/:stationId',
            {
                controller : 'displayAdsByStationCntrl',
                templateUrl: 'views/display/DispAdsByStation.html'
            })
        .when('/manage',
            {
                controller : 'manageIndexCntrl',
                templateUrl: 'views/manage/ManageIndex.html'
            })
        .when('/manage/createAd',
            {
                controller : 'createAd',
                templateUrl: 'views/manage/CreateAd.html'
            })
        .when('/manage/editAd/:adId',
            {
                controller : 'EditAd',
                templateUrl: 'views/manage/EditAd.html'
            })
        .otherwise({ redirectTo: '/'});
});

mainApp.controller('navbarController',function ($scope, adsService, serverApi){

    // Getting all of the stations from the server
    serverApi.emit_GetAllDisplays();

    // The assigning of the stations from the server call back to the ads service
    $scope.stations = adsService.allStations;

    // A boolean functions that returns whether the stations have been loaded or not
    function stationsLoaded() {
        var stationsHaveBeenLoaded = $scope.stations != '';
        return stationsHaveBeenLoaded;
    };

    $scope.stationsLoaded = stationsLoaded;
});