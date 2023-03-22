videojs.registerPlugin('listenForParent', function () {
    var myPlayer = this;
    // This method called when postMessage sends data into the iframe
    function controlVideo(event) {
        if (event.data === "playerDetail") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);

            var message = "holla back youngin!";
            console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
            event.source.postMessage(message, event.origin);
        } else if ("playerStartTracking") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);
            myPlayer.on('loadstart', function (ev) {
                var state = ev.type;
                var message = {
                    state: state,
                    currentTime: this.currentTime(),
                    duration: this.duration(),
                    muted: this.muted(),
                    playbackRate: this.playbackRate(),
                    videoBufferedPercent: this.bufferedPercent(),
                    videoId: this.mediainfo.id,
                    videoName: this.mediainfo.name,
                    videoTitle: this.mediainfo.name,
                    videoUrl: this.currentSrc(),
                    volume: parseInt(this.volume() * 100),
                };
                console.log('Brightcove:  sending message to sage.com:  ' + " Data: " + message);
                ev.source.postMessage(JSON.stringify(message), ev.origin);
            });
            var playerEvents = [
                'ended',
                'loadeddata',
                'loadedmetadata',
                'pause',
                'play',
                'ready',
                'stalled',
                'timeupdate',
                'volumechange',
            ];
            playerEvents.forEach(function (playerEvent) {
                myPlayer.on(playerEvent, handlePlaybackEvent);
            });
        } else if (event.data === "playVideo") {
            myPlayer.play();
        } else if (event.data === 'pauseVideo') {
            myPlayer.pause();
        }
    };

    // Listen for the message, then call controlVideo() method when received
    window.addEventListener("message", controlVideo);
});
