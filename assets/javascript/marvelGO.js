var characterName = '';
var marker = null;
var currentPosition = null;
var isPosition = false;
var map = null;
var playerLocation = {};
//required for marvel api call:
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var key = "82df9267e06ec89e40b14eec91deacb4";
var baseURL = "https://gateway.marvel.com:443/v1/public/";
//array to store all generated characters (removed markers array)
var generatedCharactersArray = [];
var hash = "";

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
var database = firebase.database();

//global variables:
var playerName = '';
var playerExists = false;


$(document).ready(function() {

    initMap();

    //button for adding user
    //replace check-user and player-input with actual starterpage IDs once testing complete
    $("#check-user").on("click", function() {
        //if user forgot to add a name, should respond with something besides dinky alert
        if ($("#player-input").val() === "") {
            alert("please type your name.");
            return false;
        } else {
            playerName = $("#name-input").val().trim();
        }
        if (playerExists) {
            //run functions for existing user play
        } else {
            //1 initializeMap using user's current location:
            initializeMap();
            //1.5 initializeMap also creates a map marker for the playerLocation
            //2 generate heros (using playerLocation):
            generateHeros();

            var userInfo = {
                playerName: playerName,



            };
            //  {
            //   //set an object, with playerName: object
            //   playerName: playerName,
            //   details:
            //   {
            //     userHealth: 100,
            //     //heros are objects
            //     activeHeros:
            //     {
            //       //each hero is an object
            //       heroName:
            //       {
            //         health:0,
            //         //attackPower = decrease of userHealth if hero attacks
            //         attackPower:0,
            //         //attackPercentage = likelihood hero will attack if user attacks them
            //         attackPercentage:0,
            //         //coordinates is another object
            //         coordinates:
            //         {
            //           lat:0,
            //           long:0
            //         }
            //       }
            //     },
            //     capturedHeros:
            //     {
            //       //each captured hero is an object
            //       heroName:
            //       {
            //         health:0,
            //         //attackPower = decrease of userHealth if hero attacks
            //         attackPower:0,
            //         //attackPercentage = likelihood hero will attack if user attacks them
            //         attackPercentage:0,
            //         //coordinates is another object
            //         coordinates:
            //         {
            //           lat:0,
            //           long:0
            //         }
            //       }
            //     }
            //   }
            // }//end of setting the database
            //3 populate map
            //4 enable battle
            //5 update heros after user battles
            //6 update scores
            //IF USER ALREADY EXISTS, DON'T SET. JUST UPLOAD THAT USER'S SETTINGS FROM FIREBASE
            database.ref('users').child(playerName).set(userInfo);

            //add characters to character array
            //set all characters in firebase in child users > playerName > activeHeros
            //enable battle function
            //within battle function, if active hero health = 0, hero is removed from
            //activeHeros and all information is set to capturedHeros
            //don't forget, the markers for capturedHeros could be a different color (eg green?)
        }
        return false;


        //database will update each time user does something
        database.ref('users').on('value', function(snapshot) {
            if (snapshot.child(playerName).exists()) {
                playerExists = true;
                //upload the user's everything from firebase
            } else {}

        });

    })

});

function initializeMap() {
    //default map center defined as Wieboldt Hall 339 E chicago: 41.896573, -87.618767
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(41.896573, -87.618767),
        zoom: 13
    });
    //if user accepts to allow app to take their current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            playerLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            generateMarker(playerLocation);
            map.setCenter(playerLocation);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }
}

function generateMapMarker(coordinates, content) {
    //the google maps marker requires at least position and map.
    var marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        //added the drop animation when each marker is created
        animation: google.maps.Animation.DROP
    });
    //would if(content){ work as well?
    if (content !== null) {
        marker.title = content;
        //populate the marker's info window if content is provided in the function call
        var infowindow = new google.maps.InfoWindow({
            content: "<div class='container informationWindow'>" +
                "<div class='row'><div class='col-lg-5 infoWinTitle'><img src=" + content.details[2] + " alt=" + content.name + "height='20%' width='20%'>" + content.name + "</div>" +
                "<div class='col-lg-7'>" +
                "<div class='row health'><div class='progress'>" +
                "<div class='progress-bar progress-bar-danger text-center' role='progressbar' aria-valuenow='60' aria-valuemin='0' aria-valuemax='100' style='width: 60%;'>Health 60%</div>" +
                "</div></div>" +
                "<input onclick='battle();' type=button value='fight'>" +
                "<div class='row shortBio'></div>" +
                "</div></div>",
            maxWidth: 400,
            position: coordinates
        });
        marker.addListener('click', function() {
            infowindow.open(map, marker);
            //setInterval(function() { infowindow.close(); }, 3000);
        });
    }
}

function generateHeros() {
    var currentTime = Date.now();
    var hash = "&hash=" + md5(currentTime + privateKey + key);
    queryURL = baseURL + "characters?modifiedSince=1/1/1900&ts=" + currentTime + "&apikey=" + key + hash;
    $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {
        for (var i = 0; i < response.data.results.length; i++) {
            var characterCoords = generateRandomCoordinates(playerLocation);
            generatedCharactersArray.push({
                name: response.data.results[i].name,
                details: [
                    characterCoords,
                    response.data.results[i].description,
                    response.data.results[i].thumbnail.path + "." + response.data.results[i].thumbnail.extension
                ]
            });
            generateMapMarker(characterCoords, generatedCharactersArray[i]);
        }
        console.log(generatedCharactersArray);
    });
}

function generateRandomCoordinates(position) {
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
        lat: position.lat + Math.random() * 0.2 * posNegOne,
        lng: position.lng + Math.random() * 0.2 * posNegTwo
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
