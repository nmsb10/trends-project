$("document").ready(function(){  // after entering the username, press the go button and user is directed to index page
	
	$('#start').bind("click",function() { 
    	window.location.href = 'index.html'; ///CHANGE! 
    	return false;
	});


}); 

