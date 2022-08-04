setInterval(function(){
    var status = navigator.onLine ? 'Your internet connection is back' : 'No Internet Connection!';/* check whether online */
    document.getElementById('internetStatus').innerHTML = status; /* display 'anchor' somewhere */

    if(status ==  'No Internet Connection!') {
        var internetStatus = document.getElementsByTagName("a");
        for (var i = 0; i < internetStatus.length; i++) {
          internetStatus[i].onclick = function(e) {event.preventDefault();};
        };
    }
}, 400);