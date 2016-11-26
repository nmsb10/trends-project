var key = "82df9267e06ec89e40b14eec91deacb4";
var baseURL = "https://gateway.marvel.com:443/v1/public/";
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var characterName = '';
var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var marker = null;
var map = null;
var currentPosition = null;
var isPosition = false;
var hash = "";
//markers array keeps track of the characters generated
var markers = [];

//initialize Firebase
var config = {
    apiKey: "AIzaSyAykKIlUMQeEwI9TxQBBleSxIKTFWT9xJo",
    authDomain: "yourhero-1eca9.firebaseapp.com",
    databaseURL: "https://yourhero-1eca9.firebaseio.com",
    storageBucket: "yourhero-1eca9.appspot.com",
    messagingSenderId: "407983143880"
};
firebase.initializeApp(config);

//create a variable to reference the Firebase database
var database = firebase.database()

$(document).ready(function() {

    initMap();

    /*    getCurrentLocation();*/


/*    $("#search-button").on("click", function() {
        //explain here why you need to use the replace function
        //is this only for 20 results?
        characterName = $("#name").val().trim().replace(" ", "%20");
        //see generateCharacters function for source of currentTime and hash variables
        currentTime = Date.now();

        queryURL = baseURL + "characters?name=" + characterName + currentTime + key + hash;

        console.log(queryURL);

        $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {

            console.log(response.data.results[0].description);

        });

        return false;
    })

*/
})


function initMap() {
    //default map center defined as Wieboldt Hall 339 E chicago: 41.896573, -87.618767
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(41.896573, -87.618767),
        zoom: 15
    });

    var event = google.maps.event.addListener(marker, 'click', function() {
        marker.info.open(map, marker);
    });

    var infoWindow = new google.maps.InfoWindow({ map: map });
    //if user accepts to allow app to take their current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            generateMarker(pos);
            map.setCenter(pos);
            //currentPosition variable used in generateCharacters function
            currentPosition = pos;
            generateCharacters();
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }

}

function getCurrentLocation() {

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

//https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//   infoWindow.setPosition(pos);
//   infoWindow.setContent(browserHasGeolocation ?
//     'Error: The Geolocation service failed.' :
//     'Error: Your browser doesn\'t support geolocation.');
// }

function generateMarker(coordinates) {
    //define the icon image
    //var markerImage = $("<i class='material-icons' style='font-size:35px; color:red;'>");
    //choose which google material icon you want to use
    //markerImage.text("local_pizza");
    //console.log(markerImage);
    marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        //added the drop animation when each marker is created
        animation: google.maps.Animation.DROP
            //icon needs to be a .png, .jpg, etc file
            //icon: markerImage
    });
    //initiate battle function when marker is clicked
    marker.addListener('click', battle);
    //push the new marker to the markers array
    markers.push(marker);
}

function generateCharacters() {

    for (var i = 0; i < alphabet.length; i++) {

        var currentTime = Date.now();

        var hash = "&hash=" + md5(currentTime + privateKey + key);

        queryURL = baseURL + "characters?nameStartsWith=" + alphabet[i] + "&ts=" + currentTime + "&apikey=" + key + hash;
        console.log(queryURL);
        $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {

            for (var i = 0; i < response.data.results.length; i++) {

                var charPosition = randomCoordinates(currentPosition);

                marker = new google.maps.Marker({
                    position: charPosition,
                    map: map,
                    title: response.data.results[i].name
                });

                var infowindow = new google.maps.InfoWindow({
                    content: "<p class=title>" + response.data.results[i].name + "</p>"
                });

/*                google.maps.event.addListener(marker, 'click', function(marker) {

                    return function() {

                        infowindow.setContent(locations[i][0]);
                        infowindow.open(map, marker);
                    }


                })*/
            }
        })
    }
}
    function battle() {
        console.log("battle selected");
        console.log(markers);
        var battleDiv = $('<div class="battle-div">');
        battleDiv.attr('data-name', "superhero");
        $('#map-row').append(battleDiv);
    }



    //function to show all markers in markers array
    function showMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }


    /*function generateCharacters() {
        for (var i = 0; i < alphabet.length; i++) {
            currentTime = Date.now();
            hash = "&hash=" + md5(currentTime + privateKey + key);
            queryURL = baseURL + "characters?nameStartsWith=" + alphabet[i] + "&ts=" + currentTime + "&apikey=" + key + hash;

            $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {
                console.log(response.data.results[1].name);
                generateMarker(randomCoordinates(currentPosition));
            });
        }
    }*/

    function randomCoordinates(curPosition) {
        var posNegOne = null;
        var posNegTwo = null;

        if (Math.random() >= 0.5) {
            posNegOne = 1;
        } else {
            posNegOne = -1;
        }

        if (Math.random() >= 0.5) {
            posNegTwo = 1;
        } else {
            posNegTwo = -1;
        }

        var newPosition = {
            lat: curPosition.lat + Math.random() * 20 * posNegOne,
            lng: curPosition.lng + Math.random() * 40 * posNegTwo
        };

        return newPosition;
    }


    //use this function to make sure characters are not given coordinates
    //in eg the Lake, river, major street...
    /*function safeCoordinates(lat, long) {

    }*/

    //create array to hold all character markers
    //if user clicks on a marker, new div appears with buttons
    //can fight this character
    //if user chooses to fight, use weather app to randomly assign weather high/lows as
    //the fight power.
    //after user defeats the character, new marker appears. when user
    //clicks on this new marker, user health points increase and this marker disappears.

    //marker.addListener('click', function(event) {
    //create new div
    //   addMarker(event.latLng);
    // });
