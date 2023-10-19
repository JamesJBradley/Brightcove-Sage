videojs.registerPlugin('listenForParent', function (options) {
    var myPlayer = this;

    function controlVideo(event) {
        var data = event.data;
        console.log("event: " + JSON.stringify(event.data));
        if (!data) {
            // Ignore empty messages.
            return;
        }

        var eventOrigin = event.origin;
        console.log('Brightcove: Message received from sage.com:', data, event);

        switch (data) {
            case "playerDetail":
                sendToParent("Connection has been made, getting player details", myPlayer, "player details", eventOrigin);
                break;
            case "playerStartTracking":
                setTrackingOnPlayer(["ended", "firstplay", "pause", "play", "seeked"], myPlayer, eventOrigin);
                break;
            case "playerTimeTracking":
                setTrackingOnPlayer(["timeupdate"], myPlayer, eventOrigin);
                break;
            case "trackingPause":
                myPlayer.on('pause', function () {
                    sendToParent("Pause tracked!!!", myPlayer, "pause", eventOrigin);
                });
                break;
            case "playVideo":
                myPlayer.play();
                sendToParent("play event tracked", myPlayer, "play", eventOrigin);
                break;
            case "pauseVideo":
                myPlayer.pause();
                sendToParent("pause event tracked", myPlayer, "pause", eventOrigin);
                break;
        }
    }

    function sendToParent(message, player, eventType, sendTo) {
        var playerInfo = {
            state: player.paused() ? 'paused' : 'playing',
            eventType: eventType,
            currentTime: player.currentTime(),
            duration: player.duration(),
            muted: player.muted(),
            videoId: player.mediainfo.id,
            videoName: player.mediainfo.name,
            videoTitle: player.mediainfo.name,
            videoUrl: player.currentSrc(),
            milestone: eventType === "ended" ? "100" : calculateMilestone(player),
            isBrightcove: true,
            volume: Math.round(player.volume() * 100)
        };
        if (sendTo != "https://players.brightcove.net") {
            console.log('Brightcove: Sending message to sage.com:', { message, playerInfo });
            setTimeout(window.top.postMessage(JSON.stringify({ message, playerInfo }), sendTo), 5000);
        }
    }

    function setTrackingOnPlayer(playerEvents, player, sendTo) {
        console.log('Brightcove: playerEvents:', playerEvents);
        console.log('Brightcove: player:', player);

        playerEvents.forEach(event => {
            console.log('Brightcove: event tracked is: ', event);
            player.on(event, () => {
                if (event === "timeupdate") {
                    // then check to see if it has reached milestone
                    fireMilestoneEvent(player, sendTo);
                }
                else {
                    //otherwise send event
                    console.log('Brightcove: event triggered:', player);
                    sendToParent(`${event} event tracked`, player, event, sendTo);
                }
            });
        });
    }

    function fireMilestoneEvent(player, sendTo) {
        var previouslyReachedMilestone = player.milestoneTrackingMilestone != undefined ? player.milestoneTrackingMilestone : -1;
        var milestone = calculateMilestone(player);

        if (milestone > previouslyReachedMilestone) {
            // new milestone reached so send milestone event to sage.com
            console.log('Brightcove: event triggered:', player);
            player.milestoneTrackingMilestone = milestone;
            sendToParent(`milestone event tracked`, player, "milestone", sendTo);
        }
        else {
            player.milestoneTrackingMilestone = previouslyReachedMilestone;
        }
    }

    function calculateMilestone(player) {
        var milestones = [0, .1, .25, .5, .75, .9];
        const isMilestone = (m) => (player.currentTime() / player.duration()) >= m;
        var milestoneIndex = milestones.findLastIndex(isMilestone);
        return (milestones[milestoneIndex])*100;
    }

    window.addEventListener("message", controlVideo);
});
