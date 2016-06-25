var aboutAdvModule = angular.module('aboutAdvModule',['ngRoute','socketModule']);

aboutAdvModule.controller('aboutAdvCntrl', function ($scope, serverApi) {
    var callback = function(data) {
        $('#wicon')[0].src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
        $('#wstate')[0].innerText += data.weather[0].description;
    };

    var url = "http://api.openweathermap.org/data/2.5/weather?q=Tel%20Aviv&appid=27c15de27bbafd543500496e6ae3d73d";
    $.getJSON(url, callback);
});



