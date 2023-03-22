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
            myPlayer.on('loadstart', function handlePlaybackEvent(ev) {
                var state = ev.type;
                var player = this;

                var message = {
                    state: state,
                    currentTime: player.currentTime(),
                    duration: player.duration(),
                    muted: player.muted(),
                    playbackRate: player.playbackRate(),
                    videoBufferedPercent: player.bufferedPercent(),
                    videoId: player.mediainfo.id,
                    videoName: player.mediainfo.name,
                    videoTitle: player.mediainfo.name,
                    videoUrl: player.currentSrc(),
                    volume: parseInt(player.volume() * 100),
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
