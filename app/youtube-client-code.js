/**
 * This is the client code ran on youtube to speed up videos
 * 
 */
export default function youtubeClientSpeederCode () {
    /** Speeder config */
    window.__SPEEDER = {rate: 2};

    /** Log window 
     * Viewing console.log is more tricky in the embedded webview with react
     * native, so create an element which log messages will be pushed to for
     * testing * */
    var $log = document.createElement('div');
    $log.style.zIndex = 9999;
    $log.style.position = 'fixed'; $log.style.top = 'auto';
    $log.style.fontFamily = 'monospace';
    $log.style.left = 0; $log.style.right = 0;
    $log.style.bottom = '100px'; $log.style.background = '#f0f0f0';
    $log.style.height = '100px';
    $log.style.border = '1px solid #cdcdcd';
    $log.style.overflow = 'auto';
    $log.style.opacity = 0.7; 
    $log.style.display = 'none'; // comment this out to show log
    document.body.appendChild($log);

    /** Utility log function */
    function log () {
        var $logItem = document.createElement('div');
        var textContent = [];
        for (var i = 0; i < arguments.length; i++) {
            textContent.push(JSON.stringify(arguments[i], null, 4));
        }
        $logItem.textContent = textContent.join(' | ');
        $log.appendChild($logItem);
        $log.scrollTop = 99999999999;
    };

    /** Main video loading / playback setting config */
    /** TODO: Remove videos after they haven't been played in a while */
    var videosById = {};
    /**
     * Process each video and set its playback speed
     */
    function loadVideo () {
        var $videos = document.getElementsByTagName("video");
        log("Load Video Called | videos:", $videos.length);

        for (var i = 0; i < $videos.length; i++) {
            /** check if it's already been set */
            if ($videos[i].dataset.videoId) { continue; }

            log.log('Found new video element...');
            $videos[i].dataset.videoId = 'video-' + Date.now() + (Math.random() * 10000000 | 0);

            (function (curIndex) {
                $videos[curIndex].playbackRate = window.__SPEEDER.rate;
                log("-- adding playback speed: ", curIndex, window.__SPEEDER.rate);

                $videos[curIndex].addEventListener("play", function() { 
                    log("--> canplay event | added playback speed: ", curIndex);
                    $videos[curIndex].playbackRate = window.__SPEEDER.rate;
                }, true);

                setInterval(() => {
                    log('Video playbackrate:: ', $videos[curIndex].dataset.videoId, $videos[curIndex].playbackRate);
                }, 1000);
            })(i);
        }
    } 

    /**
     * Changes all video playback speeds
     * @param {number} speed - playback rate, e.g., `1` or `1.5`
     */
    function changePlaybackSpeed(speed) {
        window.__SPEEDER.rate = +speed; // ensure it's always a number

        /** TODO: Could cache all video elements instead of doing it here manually */
        var $videos = document.getElementsByTagName("video");
        for (var i = 0; i < $videos.length; i++) {
            $videos[i].playbackRate = window.__SPEEDER.rate;
        }
    }

    /**
     * Skip forwards / backwards on current video
     * @param {number} amount - amount, in seconds, to skip (can be negative to go backwards)
     */
    function skip (amount) {
        /** TODO: Could cache all video elements instead of doing it here manually */
        log('Skipping time: ' + amount);

        var $videos = document.getElementsByTagName("video");
        for (var i = 0; i < $videos.length; i++) {
            $videos[i].currentTime += amount;
        }
    }

    /** Reload videos every second */
    setInterval(function () { requestAnimationFrame(function () { loadVideo(); }); }, 1000);

    /**
     * Listen for messages from our app
     */
    document.addEventListener('message', function (e) {
        var data = JSON.parse(e.data);
        log('Got message: ' + JSON.stringify(data));

        if (data.playbackSpeed) { changePlaybackSpeed(data.playbackSpeed); }
        if (data.historyFoward) { window.history.go(1); }
        if (data.historyBack) { window.history.go(-1); }

        if (data.skip) { skip(data.skip); }

    });
}
