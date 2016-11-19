var key = "82df9267e06ec89e40b14eec91deacb4";
var queryURL = "https://gateway.marvel.com:443/v1/public/characters?";
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var characterName = '';


$(document).ready(function() {


    $("button").on("click", function() {

    	var currentTime = Date.now();

    	var hash = md5(currentTime + privateKey + key);

        characterName = $("#name").val().trim().replace(" ", "%20");

        queryURL += "name=" + characterName + "&ts=" + currentTime + "&apikey=" + key + "&hash=" + hash;

        console.log(queryURL);

        $.ajax({ url: queryURL, method: 'GET' }).done(function(response){


        	console.log(response.data.results[0].description);


        });

        return false;
    })


})
