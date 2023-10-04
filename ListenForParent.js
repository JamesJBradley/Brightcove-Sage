videojs.registerPlugin('listenForParent', function () {
    var myPlayer = this;
    // This method called when postMessage sends data into the iframe
    function controlVideo(event) {
        if (event.data === "playerDetail") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);

            var message = "holla back youngin!";
            console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
            event.source.postMessage(message, event.origin);
        } else if (event.data === "playerStartTracking") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);
            var playerEvents = [
                "ended",
                "firstplay",
                "pause",
                'play',
                "seeked",
            ];
            setTrackingOnPlayer(playerEvents, myPlayer, event.origin);
        } else if (event.data === "playerTimeTracking") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);
            var playerEvents = [
                "timeupdate",
            ];
            setTrackingOnPlayer(playerEvents, myPlayer, event.origin);
        } else if (event.data === "trackingPause") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);
            myPlayer.on('pause', function () {
                var message = "pause tracked !!!";
                alert(message);
                console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
                event.source.postMessage(message, event.origin);
            });
        } else if (event.data === "playVideo") {
            myPlayer.play();
        } else if (event.data === 'pauseVideo') {
            myPlayer.pause();
        }
    };

    //util
    function handleEvent(event, eventOrigin) {
        var state = event.type;
        var message = {
            state: state,
            currentTime: this.currentTime(),
            duration: this.duration(),
            muted: this.muted(),
            videoId: this.mediainfo.id,
            videoName: this.mediainfo.name,
            videoTitle: this.mediainfo.name,
            videoUrl: this.currentSrc(),
            volume: parseInt(this.volume() * 100)
        };
        console.log('Brightcove:  sending message to sage.com:  ' + " Data: " + JSON.stringify(message));
        console.log('event.origin =  ' + eventOrigin);
        console.log('event =  ' + JSON.stringify(event));
        event.source.postMessage(JSON.stringify(message), eventOrigin);
    }
    function setTrackingOnPlayer(playerEvents, myPlayer, eventOrigin) {
        if (playerEvents.length > 0) {
            playerEvents.forEach(function (playerEvent) {
                myPlayer.on(handleEvent(playerEvent, eventOrigin));
            });
        }
    }

    // Listen for the message, then call controlVideo() method when received
    window.addEventListener("message", controlVideo);
});
