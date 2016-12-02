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
var playerExists = null;
var hash = "";

$(document).ready(function() {

    //default map center defined as Wieboldt Hall 339 E chicago: 41.896573, -87.618767
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(41.896573, -87.618767),
        zoom: 13
    });

    //button for adding user
    //$("#check-user").on("click", function(){
    $("#search-button").on("click", function() {
        //if user forgot to add a name, should respond with something besides dinky alert
        if ($("#name-input").val() === "") {
            alert("please type your name.");
            //update the player's username in the DOM
            return false;
        } else {
            playerName = $("#name-input").val().trim();
        }
        if (playerExists) {
            //run functions for existing user play
        } else {
            var replaceText = '<li class="active" id="userNameHere"><a href="#">' + playerName + '</a></li>';
            $('#userNameHere').replaceWith(replaceText);
            var replaceHealth = '<li class="active" id="healthHere"><a href="#">Your Health: ' + playerHealth + '</a></li>';
            $('#healthHere').replaceWith(replaceHealth);
            $("#name-input").val('');
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


    $("#capturedHeros").on("click", function() {

        $("#displayCapturedHeros").html("");

    })
})


function initializeMap() {

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

    setInterval(generateHealth, 6000);
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
    if (material != null) {
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
                "<button onclick='fightOnClick()' class='fight-button' id='"+ material.heroName + "'>fight</button>" +
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

function generateHeros(letter) {
    var currentTime = Date.now();
    var hash = "&hash=" + md5(currentTime + privateKey + key);
    queryURL = baseURL + "characters?nameStartsWith=" + letter + "&ts=" + currentTime + "&apikey=" + key + hash;
    $.ajax({ url: queryURL, method: 'GET' }).done(function(response) {
        for (var i = 0; i < response.data.results.length; i++) {
            var characterCoords = generateRandomCoordinates(playerLocation);
            var attackPower = generateAttackValue();
            var attackPercentage = generateAttackPercentage();
            //var health = generateAttackPercentage();
            var heroObject = {
                heroName: response.data.results[i].name,
                location: characterCoords,
                heroDescription: response.data.results[i].description,
                photo: response.data.results[i].thumbnail.path + "." + response.data.results[i].thumbnail.extension,
                health: 100,
                attackPower: attackPower,
                attackPercentage: attackPercentage
            };
            generatedCharactersArray.push(heroObject);
            generateMapMarker(characterCoords, heroObject);
        }
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

function generateAttackValue() {
    var attackValue = Math.ceil(Math.random() * 20);
    return attackValue;
}

function generateAttackPercentage() {
    var attackPercentage = Math.ceil(Math.random() * 100);
    return attackPercentage;
}

function generateHealth() {

    var image = {
        url: 'https://image.spreadshirtmedia.com/image-server/v1/designs/12241293,width=178,height=178/medical-cross-symbol.png',
        scaledSize: new google.maps.Size(25, 25)
    }

    var marker = new google.maps.Marker({
        position: generateRandomCoordinates(playerLocation),
        map: map,
        icon: image,
        //added the drop animation when each marker is created
        animation: google.maps.Animation.DROP
    });

    setInterval(function() { marker.setMap(null); }, 3000);
}

//database will update each time user does something
// database.ref('users').on('value', function(snapshot){
//   if(snapshot.child(playerName).exists()){
//     playerExists = true;
//     //upload the user's everything from firebase
//   }else{
//   }

// });

//need to declare global variable for player health since we're not using firebase
var playerHealth = 100;
//may want to display playHealth somewhere conspicuously on DOM. As well as the playerName
//need to declare global variable for captured characters!
var capturedArray = [];
//if user clicks on a fight button, a randomCharacter is selected to fight
function fightOnClick(){
  console.log("clicked");
  console.log(this);
  var character = $(this).attr("id");
  console.log(character);
  var randomCharacter = generateRandomCharacter();
  console.log(randomCharacter);
  console.log(generatedCharactersArray[randomCharacter].heroName);
  fight(generatedCharactersArray[randomCharacter].heroName);
}
//return a random location from generatedCharactersArray
function generateRandomCharacter(){
  var ohyeah = Math.floor(Math.random()*generatedCharactersArray.length);
  return ohyeah;
}
//fight function has input of the character's name to fight
function fight(character){
  var attackLikelihood = 0;
  var attackStrength = 0;
  var attack = false;
  //need specificCharacter variable so can easily remove a captured character
  var specificCharacterLocation = 0;
  for(var i = 0; i<generatedCharactersArray.length; i++){
    var name = generatedCharactersArray[i].heroName;
    if(character===name){
      attackLikelihood = parseInt(generatedCharactersArray[i].attackPercentage);
      attackStrength = parseInt(generatedCharactersArray[i].attackPower);
      specificCharacterLocation = i;
      //set i to length so the for loop stops
      i = generatedCharactersArray.length;
    }
  }
  var playerNumber = Math.ceil(Math.random() * 100);
  if(playerNumber>attackLikelihood){
    console.log("player not attacked!");
    //the player survived!
    //character captured!
    capturedArray.push(generatedCharactersArray[specificCharacterLocation]);
    //remove this captured character from generatedcharactersarray
    generatedCharactersArray.splice(specificCharacterLocation,1);
  }else{
    console.log("player attacked.");
    playerHealth -= attackStrength;
    if(playerHealth<0){
      //game over!!!
    }
  }
  //REMOVE ALL MARKERS HERE
  //REMOVE ALL MARKERS HERE
  //REMOVE ALL MARKERS HERE (except for the player's own marker. commented thrice so we remember. only needs to happen once, through)
  //update the DOM with only non-captured characters
  //for(var j =0; j<generatedCharactersArray.length; j++){
    //generateMapMarker(generatedCharactersArray[i].location,generatedCharactersArray[i]);
  //}
  console.log(playerHealth);
  console.log(capturedArray);
}//need to declare global variable for player health since we're not using firebase
var playerHealth = 100;
//may want to display playHealth somewhere conspicuously on DOM. As well as the playerName
//need to declare global variable for captured characters!
var capturedArray = [];
//if user clicks on a fight button, a randomCharacter is selected to fight
function fightOnClick(){
  console.log("clicked");
  console.log(this);
  var character = $(this).attr("id");
  console.log(character);
  var randomCharacter = generateRandomCharacter();
  console.log(randomCharacter);
  console.log(generatedCharactersArray[randomCharacter].heroName);
  fight(generatedCharactersArray[randomCharacter].heroName);
}
//return a random location from generatedCharactersArray
function generateRandomCharacter(){
  var ohyeah = Math.floor(Math.random()*generatedCharactersArray.length);
  return ohyeah;
}
//fight function has input of the character's name to fight
function fight(character){
  var attackLikelihood = 0;
  var attackStrength = 0;
  var attack = false;
  //need specificCharacter variable so can easily remove a captured character
  var specificCharacterLocation = 0;
  for(var i = 0; i<generatedCharactersArray.length; i++){
    var name = generatedCharactersArray[i].heroName;
    if(character===name){
      attackLikelihood = parseInt(generatedCharactersArray[i].attackPercentage);
      attackStrength = parseInt(generatedCharactersArray[i].attackPower);
      specificCharacterLocation = i;
      //set i to length so the for loop stops
      i = generatedCharactersArray.length;
    }
  }
  var playerNumber = Math.ceil(Math.random() * 100);
  if(playerNumber>attackLikelihood){
    console.log("player not attacked!");
    //the player survived!
    //character captured!
    capturedArray.push(generatedCharactersArray[specificCharacterLocation]);
    //remove this captured character from generatedcharactersarray
    generatedCharactersArray.splice(specificCharacterLocation,1);
  }else{
    console.log("player attacked.");
    playerHealth -= attackStrength;
    if(playerHealth<0){
      //game over!!!
    }
  }
  //REMOVE ALL MARKERS HERE
  //REMOVE ALL MARKERS HERE
  //REMOVE ALL MARKERS HERE (except for the player's own marker. commented thrice so we remember. only needs to happen once, through)
  //update the DOM with only non-captured characters
  //for(var j =0; j<generatedCharactersArray.length; j++){
    //generateMapMarker(generatedCharactersArray[i].location,generatedCharactersArray[i]);
  //}
  //update userhealth in DOM
  var replaceText = '<li class="active" id="healthHere"><a href="#">Your Health: ' + playerHealth + '</a></li>';
    $('#healthHere').replaceWith(replaceText);
  console.log(playerHealth);
  console.log(capturedArray);
}
