videojs.registerPlugin('listenForParent', function () {
    var myPlayer = this;
    // This method called when postMessage sends data into the iframe
    function controlVideo(event) {
        if (event.data === "playerDetail") {
            console.log('Brightcove: message received from sage.com:  ' + event.data, event);

            var message = "holla back youngin!";
            console.log('Brightcove:  sending message to sage.com:  ' + message + " Data: " + JSON.stringify(myPlayer));
            event.source.postMessage(message, event.origin);
        } else if ("playerCurrentTime") {
            var currentTime = myPlayer.currentTime();
            var message = "test update";
            console.log("Brightcove:  sending message to sage.com:  " + message + " Data: " + currentTime);
            event.source.postMessage(message, event.origin);
        } else if (event.data === "playVideo") {
            myPlayer.play();
        } else if (event.data === 'pauseVideo') {
            myPlayer.pause();
        }
    };
    
    function handlePlaybackEvent_(event) {
      var state = event.type;
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

      var targetOrigin = '*';
      var targetWindow = window.frameElement ? window.frameElement : window.parent;
      targetWindow.postMessage(JSON.stringify(message), targetOrigin);
    };

    // Listen for the message, then call controlVideo() method when received
    window.addEventListener("message", controlVideo);
});
