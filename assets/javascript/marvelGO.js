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
var characterName = '';
var marker = null;
var currentPosition = null;
var isPosition = false;
var map = null;
var playerLocation = {};
var currentPosition2 = null;
//required for marvel api call:
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var key = "82df9267e06ec89e40b14eec91deacb4";
var baseURL = "https://gateway.marvel.com:443/v1/public/";
//array to store all generated characters (removed markers array)
var generatedCharactersArray = [];

//button for adding user
//$("#check-user").on("click", function(){
$("#search-button").on("click", function(){
  //if user forgot to add a name, should respond with something besides dinky alert
  if($("#name-input").val()===""){
    alert("please type your name.");
    return false;
  }else{
    playerName = $("#name-input").val().trim();
  }
  if(playerExists){
    //run functions for existing user play
  }else{
    //1 initializeMap using user's current location:
    initializeMap();
    //1.5 initializeMap also creates a map marker for the playerLocation
    //2 generate heros (using playerLocation):
    //NOW BEING CALLED WITHIN THE INITIALIZEMAP FUNCTION...
    //generateHeros();
    //3 pushnewheros function pushes the characters in generatedCharactersArray to activeHeros in firebase 
    //pushNewHeros();
    var userInfo =
    {
      playerName: playerName,
      playerHealth: 100,
    };
    //4 enable battle
    //within battle function, if active hero health = 0, hero is removed from
      //activeHeros and all information is set to capturedHeros
      //don't forget, the markers for capturedHeros could be a different color (eg green?)
    //5 update heros after user battles
    //6 update scores
    //IF USER ALREADY EXISTS, DON'T SET. JUST UPLOAD THAT USER'S SETTINGS FROM FIREBASE
    database.ref('users').child(playerName).set(userInfo);
  }
  return false;
});

function initializeMap(){
  //default map center defined as Wieboldt Hall 339 E chicago: 41.896573, -87.618767
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(41.896573, -87.618767),
      zoom: 15
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
      //should generateHeros (which generates new heros) and pushNewHeros ONLY if user is not already in firebase. but we'll focus on that later
      generateHeros();
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}

function generateMapMarker(coordinates, material) {
  //the google maps marker requires at least position and map.
  var marker = new google.maps.Marker({
    position: coordinates,
    map: map,
    //added the drop animation when each marker is created
    animation: google.maps.Animation.DROP
  });
  //would if(material){ work as well?
  if(material !== null) {
    marker.title = material.heroName;
    var attackPower = material.attackPower;
    //populate the marker's info window if content is provided in the function call
    var infowindow = new google.maps.InfoWindow({
      content: "<div class='container informationWindow'>" +
        "<div class='row'><div class='col-lg-5 infoWinTitle'><img src=" + material.photo + " alt=" + material.heroName + "height='20%' width='20%'>" + material.heroName + "</div>" + 
        "<div class='col-lg-7'>" +
        "<div class='row health'><div class='progress'>" + 
        "<div class='progress-bar progress-bar-danger text-center' role='progressbar' aria-valuenow='" + material.health + "' aria-valuemin='0' aria-valuemax='100' style='width: " + material.health + "%;'>Health " + material.health + "%</div>" +
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
    infowindow.addListener('mouseout', function() {
      infowindow.close();
    });
  }
}

function generateHeros() {
    //console.log(playerLocation);
  var currentTime = Date.now();
  var hash = "&hash=" + md5(currentTime + privateKey + key);
  queryURL = baseURL + "characters?modifiedSince=1/1/1900&ts=" + currentTime + "&apikey=" + key + hash;
  $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {
    for (var i = 0; i < response.data.results.length; i++) {
      var characterCoords = generateRandomCoordinates(playerLocation);
      //console.log(characterCoords);
      var attackPower = generateAttackValue();
      var attackPercentage = generateAttackPercentage();
      //use the same function just because it's out of 100
      var health = generateAttackPercentage();
      var heroObject = {
        heroName: response.data.results[i].name,
        location: characterCoords, 
        heroDescription: response.data.results[i].description,
        photo: response.data.results[i].thumbnail.path + "." + response.data.results[i].thumbnail.extension,
        health:health,
        attackPower:attackPower,
        attackPercentage: attackPercentage
      };
      generateMapMarker(characterCoords, heroObject);
      generatedCharactersArray.push(heroObject);      
      //push each character's info to the user's activeHeros object in firebase
      //database.ref('users').child(playerName).child('activeHeros').push(heroObject);
    }
    console.log(generatedCharactersArray);
    pushNewHeros();
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

function generateAttackValue(){
    var attackValue = Math.ceil(Math.random()*20);
    return attackValue;
}

function generateAttackPercentage(){
    var attackPercentage = Math.ceil(Math.random() * 100);
    return attackPercentage;
}

function pushNewHeros(){
    for(var i = 0; i<generatedCharactersArray.length; i++){
        var firebaseActiveHero = {
            heroName: generatedCharactersArray[i].heroName,
            location: generatedCharactersArray[i].location,
            heroDescription: generatedCharactersArray[i].heroDescription,
            photo: generatedCharactersArray[i].photo,
            health: generatedCharactersArray[i].health,
            attackPower: generatedCharactersArray[i].attackPower,
            attackPercentage: generatedCharactersArray[i].attackPercentage
        };
        //push each character's info to the user's activeHeros object in firebase
        database.ref('users').child(playerName).child('activeHeros').child(generatedCharactersArray[i].heroName).push(firebaseActiveHero);
    }
}

//database will update each time user does something
// database.ref('users').on('value', function(snapshot){
//   if(snapshot.child(playerName).exists()){
//     playerExists = true;
//     //upload the user's everything from firebase
//   }else{
//   }

// });







//ORIGINAL FUNCTIONS BELOW-----------------------------------
var marker = null;
var currentPosition = null;

=======
var playerExists = null;
var hash = "";
>>>>>>> 39f7a65fb7871f5226713597ad96163751146f8c

$(document).ready(function() {
    //button for adding user
    //$("#check-user").on("click", function(){
    $("#search-button").on("click", function() {
        //if user forgot to add a name, should respond with something besides dinky alert
        if ($("#name-input").val() === "") {
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
            //3 setactiveheros function pushes the characters in generatedCharactersArray to activeHeros in firebase 
            //setActiveHeros();
            var userInfo = {
                playerName: playerName,
                playerHealth: 100,
                activeHeros: {
                    heroName: '',
                    location: {
                        lat: '',
                        lng: ''
                    },
                    heroDescription: '',
                    photo: '',
                    health: 0,
                    //attackPower = decrease of userHealth if hero attacks
                    attackPower: 0,
                    //attackPercentage = likelihood hero will attack if user attacks them
                    attackPercentage: 0
                },
                capturedHeros: {}
            };
            //4 enable battle
            //within battle function, if active hero health = 0, hero is removed from
            //activeHeros and all information is set to capturedHeros
            //don't forget, the markers for capturedHeros could be a different color (eg green?)
            //5 update heros after user battles
            //6 update scores
            //IF USER ALREADY EXISTS, DON'T SET. JUST UPLOAD THAT USER'S SETTINGS FROM FIREBASE
        }
        return false;
    });
})


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
            generateMapMarker(playerLocation);
            map.setCenter(playerLocation);
            generateHeros("a");
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    }
}

function generateMapMarker(coordinates, material) {
    //the google maps marker requires at least position and map.
    var marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        //added the drop animation when each marker is created
        animation: google.maps.Animation.DROP
    });
<<<<<<< HEAD
    //initiate battle function when marker is clicked
    /*    marker.addListener('click', battle);*/
    //push the new marker to the markers array
    /*  markers.push(marker);*/

    if (content !==null) {

        marker.title = content.name;

=======
    //would if(material){ work as well?
    if (material != null) {
        marker.title = material.heroName;
        var attackPower = material.attackPower;
        //populate the marker's info window if content is provided in the function call
>>>>>>> 39f7a65fb7871f5226713597ad96163751146f8c
        var infowindow = new google.maps.InfoWindow({
            content: "<div class='container informationWindow'>" +
                "<div class='row'><div class='col-lg-5 infoWinTitle'><img src=" + material.photo + " alt=" + material.heroName + "height='20%' width='20%'>" + material.heroName + "</div>" +
                "<div class='col-lg-7'>" +
                "<div class='row health'><div class='progress'>" +
                "<div class='progress-bar progress-bar-danger text-center' role='progressbar' aria-valuenow='" + material.health + "' aria-valuemin='0' aria-valuemax='100' style='width: " + material.health + "%;'>Health " + material.health + "%</div>" +
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
        infowindow.addListener('mouseout', function() {
            infowindow.close();
        });
    }
}

function generateHeros(){
    //console.log(playerLocation);
    var currentTime = Date.now();
    var hash = "&hash=" + md5(currentTime + privateKey + key);
    queryURL = baseURL + "characters?nameStartsWith=" + letter + "&ts=" + currentTime + "&apikey=" + key + hash;
    $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {
        for (var i = 0; i < response.data.results.length; i++) {
        var characterCoords = generateRandomCoordinates(playerLocation);
        //console.log(characterCoords);
        var attackPower = generateAttackValue();
        var attackPercentage = generateAttackPercentage();
        //use the same function just because it's out of 100
        var health = generateAttackPercentage();
        var heroObject = {
            heroName: response.data.results[i].name,
            location: characterCoords, 
            heroDescription: response.data.results[i].description,
            photo: response.data.results[i].thumbnail.path + "." + response.data.results[i].thumbnail.extension,
            health:health,
            attackPower:attackPower,
            attackPercentage: attackPercentage
        };
        generateMapMarker(characterCoords, heroObject);
        generatedCharactersArray.push(heroObject);
    }
    console.log(generatedCharactersArray);
    pushNewHeros();
    });
}

function battle() {
    console.log("battle selected");
    console.log(markers);
    var battleDiv = $('<div class="battle-div">');
    battleDiv.attr('data-name', "superhero");
    $('#map-row').append(battleDiv);
=======
        console.log(reponse);
    });
>>>>>>> 39f7a65fb7871f5226713597ad96163751146f8c
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
<<<<<<< HEAD
        lat: curPosition.lat + Math.random() * 0.2 * posNegOne,
        lng: curPosition.lng + Math.random() * 0.2 * posNegTwo
=======
        lat: position.lat + Math.random() * 0.2 * posNegOne,
        lng: position.lng + Math.random() * 0.2 * posNegTwo
>>>>>>> 39f7a65fb7871f5226713597ad96163751146f8c
    };
    return newPosition;
}

function generateAttackValue() {
    var attackValue = Math.ceil(Math.random() * 20);
    return attackValue;
}

function generateAttackPercentage() {
    var attackPercentage = Math.ceil(Math.random() * 100);
    return attackPercentage;
}

//database will update each time user does something
// database.ref('users').on('value', function(snapshot){
//   if(snapshot.child(playerName).exists()){
//     playerExists = true;
//     //upload the user's everything from firebase
//   }else{
//   }

// });
