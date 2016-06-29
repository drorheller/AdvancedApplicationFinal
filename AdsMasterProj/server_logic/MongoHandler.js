var mongoModule = require('mongodb');
var mongoClient = mongoModule.MongoClient;
var mongoDb;
var dbName = 'adsServer';

// connet to mongo
exports.connect = function(successCallback) {
    mongoClient.connect('mongodb://localhost:27017/', function (err, db) {
        if (err) throw err;

        mongoDb = db;
        console.log("Connected to MongoDB");
        successCallback();
    });
};

// disconnet mongo
exports.disconnect = function() {
    mongoDb.close();
};

// get all ads
function getAdsCollection() {
    return mongoDb.db(dbName).collection('ads');
}

//get al displays of adds
function getDisplaysCollection() {
    return mongoDb.db(dbName).collection('displays');
}


exports.getAllAds = function(dataCallback) {
    getAdsCollection().find({}).toArray(function(err, docs) {
        if (err) throw err;
        dataCallback(docs);
    });
};

exports.loadAllDisplays = function(dataCallback) {
    getDisplaysCollection().find({}).toArray(function(err, docs) {
        if (err) throw err;

        dataCallback(docs);
    });
};

//get ads by station
exports.getAdsByStationId = function(stationId, dataCallback) {
    getAdsCollection().find({"stationId" : {$eq:stationId}}).toArray(function(err, docs) {
        if (err) throw err;

        dataCallback(docs);
    });
};


// creat new add
exports.createAd = function(adData, endCallback) {
    getAdsCollection().insert(adData, function(err, result) {
        console.log("result is : " + JSON.stringify(result));
        if (err) throw err;

        endCallback(true);
    });
};

//update specific add
exports.updateAd = function(adId, adData, endCallback) {
    console.log("start updating ad , id: " + adId);
    console.log("start updating ad , data: " + adData);
    delete adData._id;

    getAdsCollection().update({ _id : new mongoModule.ObjectID(adId)}, { $set: adData }, function(err, result) {
        console.log("result is : " + JSON.stringify(result));
        if (err) console.log( err );
        var success = (result == 1);
        endCallback(success);
    });
};

//delete specific add
exports.deleteAd = function(adId, endCallback) {
    console.log("start deleting ad , id: " + adId);
    getAdsCollection().remove({ _id : new mongoModule.ObjectID(adId) }, function(err, result) {
        console.log("result is : " + JSON.stringify(result));
        if (err) throw err;

        var success = (result == 1);
        endCallback(success);
    });
};


// exports.getOwnersData = function(dataCallback) {
//     getAdsCollection().group(
//         { owner: 1 },                               // GroupBy Key
//         {},                                         // Condition
//         { moneyInvested : 0, count: 0 },            // Initial value
//         function( curr, result ) {                  // Reduce function
//             result.moneyInvested += parseInt(curr.moneyInvested);
//             result.count++;
//         },
//         function(err, results) {                    // End callback
//             if (err) throw err;
//             console.log(results);
//             dataCallback(results);
//         }
//     );
// };