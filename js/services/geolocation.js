(function () {
    'use strict';


    //自动地通过ip地址获取位置信息  百度api
    function GeolocationService($http) {
        var service = {};

        service.getLocation = function () {
            return $http.get('http://api.map.baidu.com/location/ip?ak=' + config.baidu.ak)
                .then(function (response) {
                    return response.data;
                });
        };

        return service;
    }

    angular.module('SmartMirror')
        .factory('GeolocationService', GeolocationService);

}());
