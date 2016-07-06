var advertaismentModule = angular.module('advertaismentModule',['serverCommunicationModule']);

// The ads service is responsible for all the communication with the server
// in regard of the ads. create, read, update, delete
advertaismentModule.service('adsService',function(serverApi){

    // Init the service properties
    this.activeAds = [];
    this.allAds = [];
    this.num = 0;
    this.allStations = [];


    // The call back from the server for getting the ads to display
    serverApi.registerListener(serverApi.serverCallBack_ActiveAdsServerResponse, function (data) {
        this.activeAds = data.activeAds;
        console.log("The server returned the adds to display");
    }.bind(this));


    // The call back from the server for the active ads for a specific station
    serverApi.registerListener(serverApi.serverCallBack_ActiveAdsByStationServerResponse, function (data) {
        this.activeAds = data.activeAds;
        console.log("The server returned the adds to display for a specific station");
    }.bind(this));



    // The call back from the server for the number of active ads for a specific station
    serverApi.registerListener(serverApi.serverCallBack_AdCountByStation, function (data) {
        this.adCount = data[0].ads;
        console.log("The server returned the adds to display for a specific station");
    }.bind(this));


    // The call back for getting all the ads from the server
    serverApi.registerListener(serverApi.serverCallBack_AllAdsServerResponse, function (data) {
        this.allAds = data.allAds;
        this.num = data.allAds.length;

        console.log("The server returned the all of the adds, There are:" + this.num + " ads");
    }.bind(this));

    // The call back for creating a new add
    serverApi.registerListener(serverApi.serverCallBack_AddCreatedOnServer, function (data) {
        console.log("The server succeeded to create a new add");
        refreshAllAds();
    });


    // The call back for editing an add
    serverApi.registerListener(serverApi.serverCallBack_AddUpdatedOnServer, function (data) {
        console.log("The server succeeded to edit an add");
        refreshAllAds();
    });

    // The call back for deleting an add
    serverApi.registerListener(serverApi.serverCallBack_AddDeletedOnServer, function (data) {
        console.log("The server succeeded to delete an add");
        refreshAllAds();
    });

    // The call back for retrieving all of the stations
    serverApi.registerListener(serverApi.serverCallBack_AllDisplaysServerResponse, function (data) {
        this.allStations = data;
        console.log("The server succeeded to retrieve all of the stations");
    }.bind(this));

    // The event for getting the active ads
    function refreshActive(){
        serverApi.emit_GetActiveAdsFromServer();
        console.log("The server succeeded to retrieve all of the active ads");
    }

    // The event for getting the active ads by station id
    function refreshActiveByStation(stationId){
        serverApi.emit_GetActiveAdsByStationFromServer(stationId);
    }

    // The event for getting all the ads from the server
    function refreshFullAds(){
        serverApi.emit_GetAllAdsFromServer();
    }

    // The function for refreshing both the active ads and the total ads
    function refreshAllAds(){
        // refreshing the active ads
        refreshActive();

        // refreshing all of the add cache
        refreshFullAds();
    }

    // function for getting an ad by it's id
    function getAdById(id){
        var ad = undefined;

        var index;
        for (index = 0; index < this.allAds.length; ++index) {
            // when the add is found
            if(this.allAds[index]._id === id){
                return this.allAds[index];
            }
        }

        return ad;
    }

    // binding the local method to the service instance for invoking from outside
    // of the service class
    this.getAdById = getAdById;
    this.refreshActive = refreshActive;
    this.refreshActiveByStation = refreshActiveByStation;

}); // end of the service