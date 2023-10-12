videojs.registerPlugin('listenForParent', function (options) {
    var myPlayer = this;

    function controlVideo(event) {
        var data = event.data;
        if (!data) {
            // Ignore empty messages.
            return;
        }
        
        console.log('Brightcove: Event Origin:', event.origin);
        console.log('Brightcove: Event Source:', event.source);
        console.log('Brightcove: Message received from sage.com:', data, event);

        switch (data) {
            case "playerDetail":
                sendToParent("Connection has been made, getting player details", myPlayer);
                break;
            case "playerStartTracking":
                setTrackingOnPlayer(["ended", "firstplay", "pause", "play", "seeked"], myPlayer);
                break;
            case "playerTimeTracking":
                setTrackingOnPlayer(["timeupdate"], myPlayer);
                break;
            case "trackingPause":
                myPlayer.on('pause', function () {
                    sendToParent("Pause tracked!!!", myPlayer);
                });
                break;
            case "playVideo":
                myPlayer.play();
                break;
            case "pauseVideo":
                myPlayer.pause();
                break;
        }
    }

    function sendToParent(message, player) {
        var playerInfo = {
            state: player.paused() ? 'paused' : 'playing',
            currentTime: player.currentTime(),
            duration: player.duration(),
            muted: player.muted(),
            videoId: player.mediainfo.id,
            videoName: player.mediainfo.name,
            videoTitle: player.mediainfo.name,
            videoUrl: player.currentSrc(),
            volume: Math.round(player.volume() * 100)
        };
        console.log('Brightcove: Sending message to sage.com:', { message, playerInfo });
        event.source.postMessage(JSON.stringify({ message, playerInfo }), event.origin);
    }

    function setTrackingOnPlayer(playerEvents, player) {
        console.log('Brightcove: playerEvents:', playerEvents);
        console.log('Brightcove: player:', player);
    
        playerEvents.forEach(event => {
            console.log('Brightcove: event tracked is: ', event);

            player.on(event, () => {
                console.log('Brightcove: event triggered:', player);
                sendToParent(`${event} event tracked`, player);
            });
        });
    }

    window.addEventListener("message", controlVideo);
});
