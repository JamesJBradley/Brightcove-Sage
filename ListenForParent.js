videojs.registerPlugin('listenForParent', function (options) {
    var myPlayer = this;

    function controlVideo(event) {
        var data = event.data;
        if (!data) {
            // Ignore empty messages.
            return;
        }

        var eventOrigin = event.origin;
        console.log('Brightcove: Event Origin:', event.origin);
        console.log('Brightcove: Event Source:', event.source);
        console.log('Brightcove: Message received from sage.com:', data, event);

        switch (data) {
            case "playerDetail":
                sendToParent("Connection has been made, getting player details", myPlayer, eventOrigin);
                break;
            case "playerStartTracking":
                setTrackingOnPlayer(["ended", "firstplay", "pause", "play", "seeked"], myPlayer, eventOrigin);
                break;
            case "playerTimeTracking":
                setTrackingOnPlayer(["timeupdate"], myPlayer, eventOrigin);
                break;
            case "trackingPause":
                myPlayer.on('pause', function () {
                    sendToParent("Pause tracked!!!", myPlayer, eventOrigin);
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

    function sendToParent(message, player, sendTo) {
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
        console.log("sendTo: " + sendTo);
        if(sendTo != "https://players.brightcove.net") {
            
            setTimeout(window.top.postMessage(JSON.stringify({ message, playerInfo }), sendTo), 5000);
            console.log("sent message to sage.com");
        }
    }

    function setTrackingOnPlayer(playerEvents, player, sendTo) {
        console.log('Brightcove: playerEvents:', playerEvents);
        console.log('Brightcove: player:', player);
    
        playerEvents.forEach(event => {
            console.log('Brightcove: event tracked is: ', event);

            player.on(event, () => {
                console.log('Brightcove: event triggered:', player);
                sendToParent(`${event} event tracked`, player, sendTo);
            });
        });
    }

    window.addEventListener("message", controlVideo);
});
