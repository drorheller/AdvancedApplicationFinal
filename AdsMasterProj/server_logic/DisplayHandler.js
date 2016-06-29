var mongoHandler = require('./MongoHandler.js');

exports.getDisplayData = function(dataCallback) {
    var relevantDisplayAds = [];

    // Gets all ads match time frames
    mongoHandler.getAllAds(function(displayAds) {
        displayAds.forEach(function(ad) {
            if (isTimeFramesMatchCurrentTime(ad.timeFrame)) {
                relevantDisplayAds.push(ad);
            }
        });

        dataCallback(relevantDisplayAds);
    });
};

exports.getDisplayDataByStation = function(stationId, dataCallback) {
    var relevantDisplayAds = [];

    // Gets all ads by station id that match time frames
    mongoHandler.getAdsByStationId(stationId, function(displayAds) {
        displayAds.forEach(function(ad) {
            if (isTimeFramesMatchCurrentTime(ad.timeFrame)) {
                relevantDisplayAds.push(ad);
            }
        });

        dataCallback(relevantDisplayAds);
    });
};

// Checks if the add time frame match the current time
function isTimeFramesMatchCurrentTime(displayTimeFrame) {
    var today = new Date();
    var isFrameMatch;

    //get start and end date
    var startDate = new Date(displayTimeFrame.startDate);
    var endDate = new Date(displayTimeFrame.endDate);

    //check if the add time frame match current date
    isFrameMatch = ((startDate < today) && (endDate > today));

    return isFrameMatch;

}
