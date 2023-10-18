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
            milestone: calculateMilestone(player),
            volume: Math.round(player.volume() * 100)
        };
        console.log('Brightcove: Sending message to sage.com:', { message, playerInfo });
        console.log("sendTo: " + sendTo);
        if (sendTo != "https://players.brightcove.net") {

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
                console.log("event type: " + event);
                if (event === "play") {
                    // then start interval tracking for milestone event
                    console.log("starting milestone tracking");
                    player.milestoneTracking.Interval = setInterval(fireMilestoneEvent.bind(player), 500);
                }
                else if (event === "pause" || event === "ended") {
                    // then remove interval for tracking milestone as video is not playing
                    clearInterval(player.milestoneTracking.Interval);
                }
                sendToParent(`${event} event tracked`, player, sendTo);
            });
        });
    }

    function fireMilestoneEvent() {
        var previouslyReachedMilestone = _.milestoneTracking.milestone ? _.milestoneTracking.milestone : -1;
        var milestone = calculateMilestone(this);

        if (milestone > previouslyReachedMilestone) {
            // new milestone reached so send milestone event to sage.com
            console.log('Brightcove: event triggered:', player);
            _.milestoneTracking.milestone = milestone;
            sendToParent(`milestone event tracked`, this, sendTo);
        }
    }

    function calculateMilestone(player) {
        console.log("in calculate milestone")
        var milestones = [0, .1, .25, .5, .75, .9];
        const isMilestone = (m) => (player.currentTime() / player.duration()) >= m;
        var milestoneIndex = milestones.findLastIndex(isMilestone);
        console.log("milestone calculated is: " + milestones[milestoneIndex]);
        return milestones[milestoneIndex];
    }

    window.addEventListener("message", controlVideo);
});
