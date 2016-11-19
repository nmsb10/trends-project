var key = "82df9267e06ec89e40b14eec91deacb4";
var queryURL = "https://gateway.marvel.com:443/v1/public/characters?name=";
var privateKey = "accae6d1b3da682be3974ffddf1adf741480562d";
var characterName = '';

"https://gateway.marvel.com:443/v1/public/characters?name=Spiderman&apikey=82df9267e06ec89e40b14eec91deacb4"


$(document).ready(function(){

$("button").on("click", function(){


	characterName = $("#name").val().trim();

queryURL += characterName + "&apikey=" + key + "&hash=" + privateKey;

console.log(queryURL);

$.ajax({url: queryURL,method: 'GET'}).done(function(response) {

            
		console.log(response);


           });

return false;
});


})
