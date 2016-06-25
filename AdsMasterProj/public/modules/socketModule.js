var socketModule = angular.module('socketModule', []);

// Configuring the Socket.io initial settings
socketModule.factory('socket', function ($rootScope) {

    //  Connecting to the address of the server
    var serverSocket = io.connect('http://localhost:8080');

    // basic logic of socket io
    return {
        on : function (eventName, callBack){
            serverSocket.on(eventName, function (){
                var args = arguments;
                $rootScope.$apply(function (){
                    callBack.apply(serverSocket,args);
                });
            });
        },
        emit : function(eventName, data, callBack){
            serverSocket.emit(eventName, data, function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    if (callBack) {
                        callBack.apply(serverSocket,args);
                    }
                });
            });
        },
        removeAllListeners: function (eventName, callBack) {
            serverSocket.removeAllListeners(eventName);
        }

    };
});

// This factory is the interface with the server implemented wia Socket.io
socketModule.factory('serverApi', function ($rootScope, socket) {
    return {
        // helper functions
        registerListener : function(eventName, callBack){
            socket.on(eventName,callBack);
        },

        clearEventsListeners : function(eventName, callBack){
            socket.removeAllListeners(eventName, callBack);
        },

        // Data manipulation functions

        // Getting the active ads from the server
        emit_GetActiveAdsFromServer : function(){
            socket.emit('GetAds',{getAll : false});

            console.log("Triggered the GetAds with getAll : false");
        },

        // Getting all the ads from the server
        emit_GetAllAdsFromServer : function(){
            socket.emit('GetAds',{getAll : true});

            console.log("Triggered the GetAds with getAll : true");
        },

        // Get all the active ads by station id
        emit_GetActiveAdsByStationFromServer : function(stationId){
            socket.emit('GetAdsByStation',{'stationId' : stationId});

            console.log("Triggered the GetAdsByStation");
        },

        // Get all of the stations
        emit_GetAllDisplays : function () {
            socket.emit('LoadAllDisplays');

            console.log("Triggered the LoadAllDisplays");
        },

        // Create new add
        // ad - the add to create
        emit_AdCreate : function (ad) {
            socket.emit('CreateAd',{adData : ad});

            console.log("Triggered the CreateAd");
        },
        
        // Edit an add
        // id - the id of the add
        // add- the add to edit
        emit_AdUpdate : function (_id, ad) {
            socket.emit('EditAd', {adId : _id.toString() ,adData : ad});

            console.log("Triggered the EditAd");
        },
        
        // Delete an add
        // id - the add id to delete
        emit_AdDelete : function (id) {
            socket.emit('DeleteAd',{adId : id.toString()});

            console.log("Triggered the DeleteAd");
        },

        // Validate ad
        // ad - the add to validate
        emit_validateAd : function(_ad){
            socket.emit('ValidateAd',{ad : _ad});

            console.log("Triggered the ValidateAd");
        },

        //****************************
        // Defined events from server (To keep track of constants)
        //****************************
        serverCallBack_ActiveAdsServerResponse 	: "ActiveAdsDataFromServer",
        serverCallBack_ActiveAdsByStationServerResponse : "ActiveAdsByStationDataFromServer",
        serverCallBack_AllAdsServerResponse : "AllAdsDataFromServer",
        serverCallBack_AddCreatedOnServer 		: "AdCreatedOnServer",
        serverCallBack_AddUpdatedOnServer 		: "AdUpdatedOnServer",
        serverCallBack_AddDeletedOnServer 		: "AdDeletedOnServer",
        serverCallBack_AllDisplaysServerResponse 	: "DisplaysDataFromServer",
        serverEvent_AdValidation 			: "AdValidationResponseFromServer"
    };
});