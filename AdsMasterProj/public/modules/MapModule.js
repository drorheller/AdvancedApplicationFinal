var mapModule = angular.module('mapModule',['ngTable','uiGmapgoogle-maps','serverCommunicationModule']);

mapModule.controller('MapController',function ($scope, serverApi){
    $scope.map = { center: { latitude: 31.973243, longitude: 34.798661 }, zoom: 7 };
    $scope.map.models = [];

    // get data frm server and sent to convertion to map formt
    serverApi.registerListener(serverApi.serverCallBack_AllDisplaysServerResponse, function (data){
        convertDisplaysData(data);
    });

   //convert to map format
    function convertDisplaysData(displays){
        var models = [];

        displays.map(function(item){

            var convertedItem = {
                id : item.id,
                longitude : Number(item.location.long),
                latitude  : Number(item.location.lat),
                options : {
                    title : item.name
                }
            };

            $scope.map.models.push(convertedItem);
        });
    }

   // get all displays in order to render the map
    serverApi.emit_GetAllDisplays();

    // dispose listeners
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverCallBack_AllDisplaysServerResponse);
    });
});