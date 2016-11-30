var key = "82df9267e06ec89e40b14eec91deacb4";
var baseURL = "https://gateway.marvel.com:443/v1/public/";
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var characterName = '';
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
var database = firebase.database();

var playerName = '';
var playerExists = false;
//button for adding user
//replace check-user and player-input with actual starterpage IDs once testing complete
$("#check-user").on("click", function(){
  //if user forgot to add a name, should respond with something besides dinky alert
  if($("#player-input").val()===""){
    alert("please type your name.");
    return false;
  }else{
    playerName = $("#name-input").val().trim();
  }
  if(playerExists){
    //run functions for existing user play
  }else{
    //1 set new user to firebase
    //2 create/generage heros
    //3 populate map
    //4 enable battle
    //5 update heros after user battles
    //6 update scores
    //IF USER ALREADY EXISTS, DON'T SET. JUST UPLOAD THAT USER'S SETTINGS FROM FIREBASE
    database.ref('users').child(playerName).set({
      //set an object, with playerName: object
      playerName: playerName,
      details:
      {
        userHealth: 100,
        //heros are objects
        activeHeros:
        {
          //each hero is an object
          heroName:
          {
            health:0,
            //attackPower = decrease of userHealth if hero attacks
            attackPower:0,
            //attackPercentage = likelihood hero will attack if user attacks them
            attackPercentage:0,
            //coordinates is another object
            coordinates:
            {
              lat:0,
              long:0
            }
          }
        },
        capturedHeros:
        {
          //each captured hero is an object
          heroName:
          {
            health:0,
            //attackPower = decrease of userHealth if hero attacks
            attackPower:0,
            //attackPercentage = likelihood hero will attack if user attacks them
            attackPercentage:0,
            //coordinates is another object
            coordinates:
            {
              lat:0,
              long:0
            }
          }
        }
      }
    });//end of setting the database
    //run function to generate markers
    //add characters to character array
    //set all characters in firebase in child users > playerName > activeHeros
    //enable battle function
      //within battle function, if active hero health = 0, hero is removed from
      //activeHeros and all information is set to capturedHeros
      //don't forget, the markers for capturedHeros could be a different color (eg green?)
  }
  return false;
});

//database will update each time user does something
database.ref('users').on('value', function(snapshot){
  if(snapshot.child(playerName).exists()){
    playerExists = true;
    //upload the user's everything from firebase
  }else{
  }

});

$(document).ready(function() {

    initMap();

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
        zoom: 10
    });

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
//https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//   infoWindow.setPosition(pos);
//   infoWindow.setContent(browserHasGeolocation ?
//     'Error: The Geolocation service failed.' :
//     'Error: Your browser doesn\'t support geolocation.');
// }

function generateMarker(coordinates, content) {
    //define the icon image
    //var markerImage = $("<i class='material-icons' style='font-size:35px; color:red;'>");
    //choose which google material icon you want to use
    //markerImage.text("local_pizza");
    //console.log(markerImage);
    var marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        //added the drop animation when each marker is created
        animation: google.maps.Animation.DROP
            //icon needs to be a .png, .jpg, etc file
            //icon: markerImage
    });
    //initiate battle function when marker is clicked
    /*    marker.addListener('click', battle);*/
    //push the new marker to the markers array
    /*  markers.push(marker);*/

    if (content != null) {

        marker.title = content;

        var infowindow = new google.maps.InfoWindow({
            content: "<p class=title>" + content + "</p>",
            position: coordinates
        });

        marker.addListener('click', function() {
            infowindow.open(map, marker);

            setInterval(function() { infowindow.close(); }, 3000);
        });
    }
}

function generateCharacters() {

    var currentTime = Date.now();

    var hash = "&hash=" + md5(currentTime + privateKey + key);

    queryURL = baseURL + "characters?modifiedSince=1/1/1900&ts=" + currentTime + "&apikey=" + key + hash;

    $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {

        for (var i = 0; i < response.data.results.length; i++) {

            generateMarker(randomCoordinates(currentPosition), response.data.results[i].name);

        }

    })

}

function battle() {
    console.log("battle selected");
    console.log(markers);
    var battleDiv = $('<div class="battle-div">');
    battleDiv.attr('data-name', "superhero");
    $('#map-row').append(battleDiv);
}

//function to show all markers in markers array
/*function showMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
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
        lat: curPosition.lat + Math.random() * .2 * posNegOne,
        lng: curPosition.lng + Math.random() * .2 * posNegTwo
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
