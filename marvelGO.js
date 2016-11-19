var key = "82df9267e06ec89e40b14eec91deacb4";
var baseURL = "https://gateway.marvel.com:443/v1/public/";
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var characterName = '';
var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];


$(document).ready(function() {


    $("#search-button").on("click", function() {

        characterName = $("#name").val().trim().replace(" ", "%20");

        queryURL = baseURL + "characters?name=" + characterName + currentTime + key + hash;

        console.log(queryURL);

        $.ajax({ url: queryURL, method: 'GET' }).done(function(response){


        	console.log(response.data.results[0].description);

        });

        queryURL = "https://gateway.marvel.com:443/v1/public/";

        return false;
    })

for (var i = 0; i < alphabet.length; i++) {
		
	var currentTime = Date.now();

	var hash = "&hash=" + md5(currentTime + privateKey + key);

	queryURL = baseURL + "characters?nameStartsWith=" + alphabet[i] + "&ts=" + currentTime + "&apikey=" + key + hash;

	$.ajax({ url: queryURL, method: 'GET' }).done(function(response){

        	console.log(response.data.results[1].name);
        

        });
}


});


