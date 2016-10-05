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
                    return service.weather = response.data;
                });
        };

        service.minutelyForecast = function () {
            if (service.weather === null) {
                return null;
            }
            return service.weather.data.minutely;
        }

        //Returns the current weather along with high and low tempratures for the current day
        service.currentForecast = function () {
            if (service.weather === null) {
                return null;
            }
            service.weather.data.currently.day = moment.unix(service.weather.data.currently.time).format('ddd');
            service.weather.data.currently.temperature = parseFloat(service.weather.data.currently.temperature).toFixed(0);
            service.weather.data.currently.wi = "wi-weather-io-" + service.weather.data.currently.icon;
            service.weather.data.currently.iconAnimation = service.weather.data.currently.icon;
            return service.weather.data.currently;
        }

        service.weeklyForecast = function () {
            if (service.weather === null) {
                return null;
            }
            // Add human readable info to info
            for (var i = 0; i < service.weather.data.daily.data.length; i++) {
                service.weather.data.daily.data[i].day = moment.unix(service.weather.data.daily.data[i].time).format('ddd');
                service.weather.data.daily.data[i].temperatureMin = parseFloat(service.weather.data.daily.data[i].temperatureMin).toFixed(0);
                service.weather.data.daily.data[i].temperatureMax = parseFloat(service.weather.data.daily.data[i].temperatureMax).toFixed(0);
                service.weather.data.daily.data[i].wi = "wi-weather-io-" + service.weather.data.daily.data[i].icon;
                service.weather.data.daily.data[i].counter = String.fromCharCode(97 + i);
                service.weather.data.daily.data[i].iconAnimation = service.weather.data.daily.data[i].icon;
            }
            ;
            return service.weather.data.daily;
        }

        service.hourlyForecast = function () {
            if (service.weather === null) {
                return null;
            }
            service.weather.data.hourly.day = moment.unix(service.weather.data.hourly.time).format('ddd')
            return service.weather.data.hourly;
        }

        service.refreshWeather = function () {
            return service.init(geoloc);
        }

        return service;
    }

    angular.module('SmartMirror')
        .factory('WeatherService', WeatherService);

}());
