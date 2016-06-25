var mongoConn = require('./MongoConnector.js');
var io;
var ContextTypes = {
    DISPLAY 	: "display",
    MANAGEMENT 	: "management",
    STATISTICS 	: "statistics"
};
var displayCtx = require('./DisplayContext');
var restHandler = require('./RestHandler');

exports = module.exports = startServer;

// Main function called by Express on startup
function startServer(server) {
    io = require('socket.io')(server);

    mongoConn.connect(function() {
        // Connection to Mongo succeed - prepare listeners

        setSocketIoConnectionListener();
    });
}

function setSocketIoConnectionListener() {
    // Prepare client listeners for new connection
    io.on('connection', function (client) {
        //***client.displayId = 0;
        setSocketIoListeners(client);
    });
}

function setSocketIoListeners(client) {
    /*
     Data.getAll : True - returns all ads , False - return only the active ones.
     */
    client.on('GetAds',function(data){
        if (typeof data.getAll === 'undefined') return;
        logEvent('GetActiveAds', data);
        onGetAds(client, data.getAll);
    });

    client.on('GetAdsByStation',function(data){
        if (typeof data.stationId === 'undefined') return;
        logEvent('GetActiveAdsByStation', data);
        onGetAdsByStation(client, data.stationId);
    });

    client.on('ValidateAd', function(data) {
        console.log("Validating ad");
        if (typeof data.ad === 'undefined') return;
        logEvent('ValidateAd', data);
        onValidateAd(client, data.ad);
    });

    client.on('CreateAd', function(data) {
        if (typeof data.adData === 'undefined') return;
        logEvent('CreateAd', data);
        onCreateAd(data.adData);
    });

    client.on('DeleteAd', function(data) {
        if (typeof data.adId === 'undefined') return;
        logEvent('DeleteAd', data);
        console.log("Ad to delete id is " + data.adId);
        onDeleteAd(client , data.adId);
    });

    client.on('EditAd', function(data) {
        if (typeof data.adId === 'undefined') return;
        if (typeof data.adData === 'undefined') return;
        logEvent('EditAd', data);
        onEditAd(data.adId, data.adData);
    });

    client.on('LoadAllDisplays', function(data) {
        logEvent('LoadAllDisplays', data);
        onLoadAllDisplays(client);
    });

    //  Itunes API
    client.on('GetItunesData',function(data){
        if (typeof data.term === 'undefined') return;
        logEvent('GetItunesData', data);
        onGetItunesData(client,data.term);
    });

    client.on('GetOwnersData', function(data) {
        onGetOwnersData(client);
    });
}

//**************************
// Event handling functions
//**************************
function onGetAds(client, getAll){
    if (getAll){
        mongoConn.getAllAds(function(data) {
            console.log('Emiting AllAds response, Data : ');
            console.log(JSON.stringify(data));
            client.emit('AllAdsResponse', {allAds : data});
        });
    } else {
        displayCtx.getDisplayData(function(data) {
            console.log('Emiting ActiveAds response ');
            client.emit('ActiveAdsResponse', {activeAds : data});
        });
    }
}

function onGetAdsByStation(client, stationId){
    displayCtx.getDisplayDataByStation(stationId, function(data) {
        console.log('Emiting ActiveAds by station response ');
        client.emit('ActiveAdsByStationResponse', {activeAds : data});
    });
}

/*
 Validates that the add is logically good.
 */
function onValidateAd (client, ad){
    var _alerts = [];
    if (validateAd(ad, _alerts)){
        console.log("Ad is valid");
        client.emit('AdValidationResponse',{valid:  true});

    }else {
        console.log("Ad is not valid");
        client.emit('AdValidationResponse',{valid:  false , alerts : _alerts});
    }
}

function validateAd(ad,alerts){
    var valid = true;
    console.log('Ad is : ' + JSON.stringify(ad));
    // Ensure basic data is not empty
    if (ad.name ==""){
        valid = false;
        alerts.push("Ad name cannot be empty");
    }
    if (ad.stationId == ""){
        valid = false;
        alerts.push("Ad must be linked to station");
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

    // Check dates
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
        alerts.push("End date cannot be after start date");
    }

    return valid;
}


function onCreateAd(adData) {
    mongoConn.createAd(adData, function(success) {
        if (success) {
            console.log("Emiting AdUpdate");
            io.sockets.emit('AdCreated');
        }
        else {
            console.log("Could not create the ad");
        }
    });
}

function onDeleteAd(client, adId) {
    mongoConn.deleteAd(adId, function(success) {
        if (success) {
            console.log("Delete went well");
            io.sockets.emit('AdDeleted',{id : adId});
        }
        else {
            console.log("Could not delete the ad");
        }
    });
}

function onEditAd(adId, adData) {
    mongoConn.editAd(adId, adData, function(success) {
        if (success) {
            console.log("Emiting AdUpdate");
            io.sockets.emit('AdUpdated',{id : adId});
        }
        else {
            console.log("Could not update the ad");
        }
    });
}

function onLoadAllDisplays(client) {
    mongoConn.loadAllDisplays(function(data) {
        console.log('Emiting DisplaysData response, Data : ');
        console.log(JSON.stringify(data));
        client.emit("DisplaysData", data);
    });
}

function refreshAllClientsData(contextType) {
    switch (contextType) {
        case ContextTypes.DISPLAY:
            sendDisplayData(null);
            break;
        case ContextTypes.MANAGEMENT:
            sendManagementData(null);
            break;
        case ContextTypes.STATISTICS:
            sendStatisticsData(null);
            break;
        default:
            break;
    }
}

function refreshClientData(client, contextType) {
    switch(contextType) {
        case ContextTypes.DISPLAY:
            sendDisplayData(client);
            break;
        case ContextTypes.MANAGEMENT:
            sendManagementData(client);
            break;
        case ContextTypes.STATISTICS:
            sendStatisticsData(client);
            break;
        default:
            break;
    }
}

// Sends all clients or specific client display context data
function sendDisplayData(specificClient) {
    if (specificClient === null) {
        io.in(ContextTypes.DISPLAY).sockets.forEach(function (socket) {
            displayCtx.getDisplayData(socket.displayId, function(data) {
                socket.emit('AdsData', data);
            });
        });
    }
    else {
        displayCtx.getDisplayData(specificClient.displayId, function(data) {
            specificClient.emit('AdsData', data);
        });
    }
}

// Sends all clients or specific client management context data
function sendManagementData(specificClient) {
    mongoConn.getAllAds(function(data) {
        if (specificClient === null) {
            io.to(ContextTypes.MANAGEMENT).emit('ManagementData', data);
        }
        else {
            specificClient.emit('ManagementData', data);
        }
    });
}

//*****************************
//         Logging
//*****************************
function logEvent(eventName, eventData){
    console.log("Event received. Event name : " + eventName + " , Data : " + JSON.stringify(eventData));
}
