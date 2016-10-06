(function () {
    'use strict';

    function WeatherService($http) {
        var service = {};
        service.weather = null;
        var geoloc = null;

        service.init = function (geoposition) {
            geoloc = geoposition;
            console.log('天气：' + JSON.stringify(geoposition));
            var city = geoposition.content.address;
            if (city.endsWith('市')) {
                city = city.substring(0, city.length - 1);
                console.log(city);
            }
            var req = {
                method: 'get',
                url: 'http://apis.baidu.com/apistore/weatherservice/recentweathers?cityname=' + city,
                headers: {
                    'apikey': config.baidu.apiKey
                },
            };
            return $http(req)
                .then(function (response) {
                    console.log('weather' + JSON.stringify(response));
                    return service.weather = response.data.retData;
                });
        };

        /*        service.minutelyForecast = function () {
         if (service.weather === null) {
         return null;
         }
         return service.weather.today;
         }*/

        //返回今天的天气
        service.currentForecast = function () {
            if (service.weather === null) {
                return null;
            }
            console.log(service.weather);
            //service.weather.data.currently.wi = "wi-weather-io-" + service.weather.data.currently.icon;
            //service.weather.data.currently.iconAnimation = service.weather.data.currently.icon;
            return service.weather.today;
        }

        service.weeklyForecast = function () {
            if (service.weather === null) {
                return null;
            }
            // Add human readable info to info

            for (var i = 0; i < service.weather.forecast.length; i++) {
                service.weather.forecast[i].date = moment(service.weather.forecast[i].date).format('ddd');
                //service.weather.data.daily.data[i].day = moment.unix(service.weather.forecast[i].time).format('ddd');
                //service.weather.data.daily.data[i].temperatureMin = service.weather.forecast[i].lowtemp;
                //service.weather.data.daily.data[i].temperatureMax = service.weather.forecast[i].hightemp;
                //service.weather.data.daily.data[i].wi = "wi-weather-io-" + service.weather.data.daily.data[i].icon;
                //service.weather.data.daily.data[i].counter = String.fromCharCode(97 + i);
                //service.weather.data.daily.data[i].iconAnimation = service.weather.data.daily.data[i].icon;
            }
            return service.weather.forecast;
        };

        /*        service.hourlyForecast = function () {
         if (service.weather === null) {
         return null;
         }
         service.weather.data.hourly.day = moment.unix(service.weather.data.hourly.time).format('ddd')
         return service.weather.data.hourly;
         }*/

        service.refreshWeather = function () {
            return service.init(geoloc);
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('WeatherService', WeatherService);

}());
