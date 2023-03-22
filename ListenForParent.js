videojs.registerPlugin('listenForParent', function () {
    var myPlayer = this;
    // This method called when postMessage sends data into the iframe
    function controlVideo(event) {
        if (event.data === "playerDetail") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);

            var message = "holla back youngin!";
            console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
            event.source.postMessage(message, event.origin);
        } else if (event.data === "trackingPause") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);
            var message = myPlayer.duration();
            console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
            //myPlayer.on('pause', function (ev) {
              //  var message = "pause tracked !!!";
                //alert(message);
                //console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
                //event.source.postMessage(message, event.origin);
            //});
        } else if (event.data === "playVideo") {
            myPlayer.play();
        } else if (event.data === 'pauseVideo') {
            myPlayer.pause();
        }
    };
    
    
    
    // Listen for the message, then call controlVideo() method when received
    window.addEventListener("message", controlVideo);
});
