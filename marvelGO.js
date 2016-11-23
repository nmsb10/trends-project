var key = "82df9267e06ec89e40b14eec91deacb4";
var baseURL = "https://gateway.marvel.com:443/v1/public/";
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var characterName = '';
var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var marker = null;
var map = null;
var currentPosition = null;
var isPosition = false;

$(document).ready(function() {

    initMap();

    getCurrentLocation();

    if(isPosition){

        generateCharacters();
    }


    $("#search-button").on("click", function() {

        characterName = $("#name").val().trim().replace(" ", "%20");

        queryURL = baseURL + "characters?name=" + characterName + currentTime + key + hash;

        $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {

            console.log(response.data.results[0].description);

        });

        return false;
    })

/*     $("#map").on('click', marker, function() {
        marker.info.open(map, marker);
    });*/



})

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
    });
}

function getCurrentLocation(){

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {

            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            currentPosition = pos;

            marker = new google.maps.Marker({
                position: pos,
                map: map,
            });

            map.setCenter(pos);

            isPosition = true;

        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}


function generateCharacters() {

    for (var i = 0; i < alphabet.length; i++) {

        var currentTime = Date.now();

        var hash = "&hash=" + md5(currentTime + privateKey + key);

        queryURL = baseURL + "characters?nameStartsWith=" + alphabet[i] + "&ts=" + currentTime + "&apikey=" + key + hash;

        $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {

            for (var i = 0; i < response.data.results.length; i++) {
                
                var charPosition = randomCoordinates(currentPosition);

                marker = new google.maps.Marker({
                    position: charPosition,
                    map: map,
                    title: response.data.results[i].name
                 });

                marker.info = new google.maps.InfoWindow({
                    content: "<p class=title>" + response.data.results[i].name + "</p>"
                });

            }
             google.maps.event.addListener(marker, 'click', function() {
                marker.info.open(map, marker);
                });

        });


    }
}

function generateMarker(coordinates, name) {



}

function randomCoordinates(curPosition) {

    var posNegOne = null;
    var posNegTwo = null;

    if (Math.random() >= 0.5) {

        posNegOne = 1;
    } else { posNegOne = -1; }

    if (Math.random() >= 0.5) {

        posNegTwo = 1;
    } else { posNegTwo = -1; }

    return newPosition = {

        lat: curPosition.lat + Math.random() * 20 * posNegOne,
        lng: curPosition.lng + Math.random() * 40 * posNegTwo

    }
}
