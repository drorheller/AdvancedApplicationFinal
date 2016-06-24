var homeModule = angular.module('homeModule',['ngTable','uiGmapgoogle-maps','socketModule']);

homeModule.controller('displaysMapCntrl',function ($scope, serverApi){
    $scope.map = { center: { latitude: 32.069894, longitude: 34.778652 }, zoom: 8 };
    $scope.map.models = [];

    /* Handle displays data response */
    serverApi.registerListener(serverApi.serverCallBack_AllDisplaysServerResponse, function (data){
        convertDisplaysData(data);
    });

    /* Converts the displays data from the serve's format to the maps format */
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

    // Send a request for the displays data
    serverApi.emit_GetAllDisplays();

    /* Removes listeners from socket once scope is no longer in use */
    $scope.$on('$destroy', function (event) {
        serverApi.clearEventsListeners(serverApi.serverCallBack_AllDisplaysServerResponse);
    });
});