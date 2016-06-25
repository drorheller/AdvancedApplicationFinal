// loading the mongo interface
var mongoConn = require('./MongoConnector.js');
var io;
var displayCtx = require('./DisplayContext');
exports = module.exports = startServer;

// staring the server
function startServer(server) {
    io = require('socket.io')(server);

    // setting the socket io listeners after the mongo db is connected
    mongoConn.connect(function() {
        setSocketIoConnectionListener();
    });
}

// call back for the init of the server
function setSocketIoConnectionListener() {
    io.on('connection', function (client) {
        setSocketIoListeners(client);
    });
}

// Registering all of the socket io events
function setSocketIoListeners(client) {

    client.on('GetAds',function(data){
        // making sure that the client sent the 'getAll' parameter
        if (typeof data.getAll === 'undefined') return;

        logEvent('GetActiveAds', data);
        onGetAds(client, data.getAll);
    });

    client.on('GetAdsByStation',function(data){
        // making sure that the client sent the 'stationId' parameter
        if (typeof data.stationId === 'undefined') return;

        logEvent('GetActiveAdsByStation', data);
        onGetAdsByStation(client, data.stationId);
    });

    client.on('ValidateAd', function(data) {
        // making sure that the client sent the 'ad' parameter
        if (typeof data.ad === 'undefined') return;
        
        logEvent('ValidateAd', data);
        onValidateAd(client, data.ad);
    });

    client.on('CreateAd', function(data) {
        // making sure that the client sent the 'adData' parameter
        if (typeof data.adData === 'undefined') return;
        
        logEvent('CreateAd', data);
        onCreateAd(data.adData);
    });

    client.on('DeleteAd', function(data) {
        // making sure that the client sent the 'adId' parameter
        if (typeof data.adId === 'undefined') return;
        
        logEvent('DeleteAd', data);
        onDeleteAd(client , data.adId);
    });

    client.on('EditAd', function(data) {
        // making sure that the client sent the 'adId' and 'adData' parameters
        if (typeof data.adId === 'undefined') return;
        if (typeof data.adData === 'undefined') return;
        
        logEvent('EditAd', data);
        onEditAd(data.adId, data.adData);
    });

    client.on('LoadAllDisplays', function(data) {
        
        logEvent('LoadAllDisplays', data);
        onLoadAllDisplays(client);
    });
}


// Local functions
function onGetAds(client, getAll){
    if (getAll){
        mongoConn.getAllAds(function(data) {
            console.log('Emiting AllAdsDataFromServer to the client');
            
            // The call back is emiting the AllAdsDataFromServer to the client
            client.emit('AllAdsDataFromServer', {allAds : data});
        });
    } else {
        displayCtx.getDisplayData(function(data) {
            console.log('Emiting ActiveAdsDataFromServer to the client');

            // The call back is emiting the ActiveAdsDataFromServer to the client
            client.emit('ActiveAdsDataFromServer', {activeAds : data});
        });
    }
}

function onGetAdsByStation(client, stationId){
    displayCtx.getDisplayDataByStation(stationId, function(data) {
        console.log('Emiting ActiveAdsByStationDataFromServer to the client');

        // The call back is emiting the ActiveAdsByStationDataFromServer to the client
        client.emit('ActiveAdsByStationDataFromServer', {activeAds : data});
    });
}

function onValidateAd (client, ad){
    var _alerts = [];
    if (validateAd(ad, _alerts)){
        console.log("The add is valid");
        
        // sending the validation result to the user
        client.emit('AdValidationResponseFromServer',{valid:  true});

    }else {
        console.log("The add is not valid");

        // sending the validation result to the user
        client.emit('AdValidationResponseFromServer',{valid:  false , alerts : _alerts});
    }
}

// This method is responsible for making sure that the add is valid
// it returns a boolean value and poplulates the alerts collection
function validateAd(ad,alerts){
    var valid = true;
    
    if (ad.name ==""){
        valid = false;
        alerts.push("Name can't be empty");
    }
    if (ad.stationId == ""){
        valid = false;
        alerts.push("Station Id can't be empty");
    }
    if (ad.owner ==""){
        valid = false;
        alerts.push("Owner name cannot be empty");
    }
    if (ad.fields ==""){
        valid = false;
        alerts.push("Ad field cannot be empty");
    }
    if (ad.moneyInvested ==""){
        valid = false;
        alerts.push("Invested money cannot be empty");
    }
    if ((ad.moneyInvested < 100) || (ad.moneyInvested > 5000)){
        valid = false;
        alerts.push("Invested money needs to be between 100 and 5000");
    }
    if (ad.timeFrame.startDate ==""){
        valid = false;
        alerts.push("Start date cannot be empty");
    }
    if (ad.timeFrame.endDate ==""){
        valid = false;
        alerts.push("End date cannot be empty");
    }
    if (new Date(ad.timeFrame.startDate) > new Date(ad.timeFrame.endDate)){
        valid = false;
        alerts.push("End date can't after start date");
    }

    // The validation of the add
    return valid;
}

function onCreateAd(adData) {
    mongoConn.createAd(adData, function(success) {
        if (success) {
            console.log("Emiting AdCreatedOnServer to the client");
            
            // sending the result of the add creation to the client
            io.sockets.emit('AdCreatedOnServer');
        }
        else {
            console.log("The creation of the add failed");
        }
    });
}

function onDeleteAd(client, adId) {
    mongoConn.deleteAd(adId, function(success) {
        if (success) {
            console.log("The deletion of the add succedded");
            
            // sending the result of the deletion to the client
            io.sockets.emit('AdDeletedOnServer',{id : adId});
        }
        else {
            console.log("Could not delete the ad");
        }
    });
}

function onEditAd(adId, adData) {
    mongoConn.updateAd(adId, adData, function(success) {
        if (success) {
            console.log("The update of the add succedded");

            // sending the result of the update to the client
            io.sockets.emit('AdUpdatedOnServer',{id : adId});
        }
        else {
            console.log("Could not update the ad");
        }
    });
}

function onLoadAllDisplays(client) {
    mongoConn.loadAllDisplays(function(data) {

        // sending data to the client
        client.emit("DisplaysDataFromServer", data);
    });
}

// responsible for logging an event
function logEvent(eventName, eventData){
    console.log("Event triggered. Event name : " + eventName + " , Data : " + JSON.stringify(eventData));
}
