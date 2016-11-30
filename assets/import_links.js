$(document).ready(function() {

loadLink("https://fonts.googleapis.com/css?family=Bungee+Inline");
loadLink("https://fonts.googleapis.com/icon?family=Material+Icons");
loadLink("assets/css/index.css")

loadScript("https://cdn.jsdelivr.net/momentjs/2.12.0/moment.min.js");
loadScript("assets/javascript/marvelGO.js", "text/javascript");
loadScript("assets/javascript/md5.js", "text/javascript");

})



function loadScript(url, type)
{    
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    if(type != null){
    	script.type = type;
    }
    script.src = url;
    head.appendChild(script);
}

function loadLink(url)
{    
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    head.appendChild(link);
}