var mainApp = angular.module('mainApp',['ngRoute','ngResource','serverCommunicationModule','mapModule','displayModule','manageModule', 'aboutAdvertiserModule']);

// Routing configuration
mainApp.config(function($routeProvider){
    $routeProvider
        .when('/',
            {
                templateUrl: 'views/home/HomeIndex.html'
            })
        .when('/locations',
            {
                controller: 'MapController',
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
                templateUrl: 'views/display/AdsByStation.html'
            })
        .when('/crud',
            {
                controller : 'manageIndexCntrl',
                templateUrl: 'views/crud/Table.html'
            })
        .when('/crud/createAd',
            {
                controller : 'createAd',
                templateUrl: 'views/crud/CreateAd.html'
            })
        .when('/crud/editAd/:adId',
            {
                controller : 'EditAd',
                templateUrl: 'views/crud/EditAd.html'
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