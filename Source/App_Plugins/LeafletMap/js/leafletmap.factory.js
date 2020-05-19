angular.module('umbraco.resources').factory('LeafletMapFactory',

    function ($q, $timeout) {

        var scriptUrl = "https://unpkg.com/leaflet@1.6.0/dist/leaflet.js";
        var styleUrl = "https://unpkg.com/leaflet@1.6.0/dist/leaflet.css";

        function scriptExists(url) {
            return document.querySelectorAll('script[src="' + url + '"]').length > 0;
        }
        function styleExists(url) {
            return document.querySelectorAll('link[rel=stylesheet][src="' + url + '"]').length > 0;
        }

        function initScripts() {
            return $q(function (resolve, reject) {
                if (!scriptExists(scriptUrl)) {
                    var script = document.createElement('script');
                    script.src = scriptUrl;
                    document.head.appendChild(script);
                    script.onload = function() {
                        $timeout(function() {
                            return resolve();
                        });

                    };
                } else {
                    resolve();
                }
            });
        }

        function initStyles() {
            return $q(function (resolve, reject) {
                if (!styleExists(styleUrl)) {
                    var style = document.createElement('link');
                    style.setAttribute("rel", "stylesheet");
                    style.setAttribute("href", styleUrl);
                    document.head.appendChild(style);
                    style.onload = function() {
                        $timeout(function() {
                            return resolve();
                        });
                    };
                } else {
                    resolve();
                }
            });
        }

        function initializeMaps() {
            return Promise.all([initScripts(), initStyles()]);
        }

        return {
            initializeMaps: initializeMaps
        };
    }
);