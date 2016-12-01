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

//global variables:
var playerName = '';
var playerExists = false;

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

function generateMapMarker(coordinates, content) {
    //the google maps marker requires at least position and map.
    var marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        //added the drop animation when each marker is created
        animation: google.maps.Animation.DROP
    });
    //would if(content){ work as well?
    if (content != null) {
        marker.title = content;
        //populate the marker's info window if content is provided in the function call
        var infowindow = new google.maps.InfoWindow({
            content: "<div class='container informationWindow'>" +
                "<div class='row'><div class='col-lg-5 infoWinTitle'><img src=" + content.photo + " alt=" + content.heroName + "height='20%' width='20%'>" + content.heroName + "</div>" +
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
            var heroObject = {
                heroName: response.data.results[i].name,
                location: characterCoords,
                heroDescription: response.data.results[i].description,
                photo: response.data.results[i].thumbnail.path + "." + response.data.results[i].thumbnail.extension,
                health: 0,
                attackPower: attackPower,
                attackPercentage: attackPercentage
            };
            generatedCharactersArray.push(heroObject);
            generateMapMarker(characterCoords, heroObject);
        }
        console.log(reponse);
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