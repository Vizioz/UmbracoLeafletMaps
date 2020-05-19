(function () {
    "use strict";

    function leafletmapController($scope, $q, LeafletMapFactory) {

        var leafLetAccessToken = $scope.model.config.accessToken;
        var mapStarted = false;
        var myMap = null;
        var mapMarkers = [];

        $scope.model.value = $scope.model.value || { latLng: [] };
        $scope.mapId = "leaflet-map-" + $scope.$id;
        
        function isMapElementVisible() {
            return angular.element("#" + $scope.mapId).is(":visible");
        }

        function dragMarker(e) {
            $scope.model.value.latLng = [e.target._latlng.lat, e.target._latlng.lng];
        }

        function showMapContextMenu(e) {
            $scope.ctxLat = e.latlng.lat;
            $scope.ctxLon = e.latlng.lng;

            var ctxMenu = angular.element("#" + $scope.mapId).parent().find(".map-context-menu")[0];
            ctxMenu.style.display = "block";
            ctxMenu.style.left = (event.pageX) + "px";
            ctxMenu.style.top = (event.pageY) + "px";
        }

        function hideMapContextMenu() {
            $scope.ctxLat = null;
            $scope.ctxLon = null;

            var ctxMenu = angular.element("#" + $scope.mapId).parent().find(".map-context-menu")[0];
            ctxMenu.style.display = "none";
        }

        function onZoomEnd(e) {
            hideMapContextMenu();
            $scope.model.value.zoom = e.target._zoom;
        }

        function attemptDrawMap() {
            if (!mapStarted) {
                drawMap().then(function () {
                        mapStarted = true;
                    },
                    function (e) {
                        console.log(e);
                    });
            } else {
                resetMap();
            }
        }

        function drawMap() {
            return $q(function (resolve, reject) {
                var lat = $scope.model.value.latLng[0];
                var lng = $scope.model.value.latLng[1];
                var zoom = $scope.model.value.zoom;
                var placeMarker = true;

                if (isNaN(lat)) {
                    lat = $scope.model.config.defaultLat || 0;
                    placeMarker = false;
                }
                if (isNaN(lng)) {
                    lng = $scope.model.config.defaultLng || 0;
                    placeMarker = false;
                }
                if (isNaN(zoom)) {
                    zoom = $scope.model.config.defaultZoom || 2;
                }
                
                try {
                    myMap = L.map($scope.mapId).setView([lat, lng], zoom);
                    myMap.on("contextmenu", showMapContextMenu);
                    myMap.on("click", hideMapContextMenu);
                    myMap.on("zoomend", onZoomEnd);
                    L.tileLayer(
                        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
                        {
                            attribution:
                                'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                            maxZoom: 18,
                            id: "mapbox/streets-v11",
                            tileSize: 512,
                            zoomOffset: -1,
                            accessToken: leafLetAccessToken
                        }).addTo(myMap);

                    if (placeMarker) {
                        var marker = L.marker([lat, lng], { draggable: true }).addTo(myMap);
                        marker.on("dragend", dragMarker);
                        mapMarkers = [marker];
                    }
                    
                    return resolve();
                } catch (e) {
                    return reject(e);
                }
            });
        }

        function resetMap() {
            // clear markers
            for (var i = 0; i < mapMarkers.length; i++) {
                myMap.removeLayer(mapMarkers[i]);
            }

            // recenter map and add new marker
            var latLng = $scope.model.value.latLng;

            if (latLng && !isNaN(latLng[0]) && !isNaN(latLng[1])) {
                myMap.setView(latLng, myMap._zoom);
                var marker = L.marker(latLng, { draggable: true }).addTo(myMap);
                marker.on("dragend", dragMarker);
                mapMarkers = [marker];
            } 
        }

        function initMaps() {
            LeafletMapFactory.initializeMaps()
                .then(function () {
                    $scope.$watch(isMapElementVisible, function (newVal) {
                            if (newVal === true) {
                                attemptDrawMap();
                            }
                        });
                    $scope.$watch("model.value.latLng",
                        function (newVal) {
                            if (isMapElementVisible()) {
                                attemptDrawMap();
                            }
                        },
                        true);
                },
                function() {
                    console.log("Failed to load map resources.");
                });
        }

        $scope.setContextMarker = function() {
            $scope.model.value.latLng = [$scope.ctxLat, $scope.ctxLon];
            hideMapContextMenu();
        };

        initMaps();
    }

    angular.module("umbraco").controller("LeafletMap.Controller", leafletmapController);

})();