/**
 * This is the client code ran on youtube to speed up videos
 * 
 */
export default function youtubeClientSpeederCode () {
    /** Speeder config */
    window.__SPEEDER = {rate: 2};

    /**
     * Modify postMessage to avoid bug in react native (see https://github.com/facebook/react-native/issues/10865 )
     */
    var originalPostMessage = window.postMessage;
    var patchedPostMessage = function(message, targetOrigin, transfer) { originalPostMessage(message, targetOrigin, transfer); };
    patchedPostMessage.toString = function() { return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage'); };
    window.postMessage = patchedPostMessage;

    /** Log window 
     * Viewing console.log is more tricky in the embedded webview with react
     * native, so create an element which log messages will be pushed to for
     * testing * */
    var $log = document.createElement('div');
    $log.style.zIndex = 9999;
    $log.style.position = 'fixed'; $log.style.top = 'auto';
    $log.style.fontSize = '10px';
    $log.style.fontFamily = 'monospace';
    $log.style.left = 0; $log.style.right = 0;
    $log.style.bottom = '100px'; $log.style.background = '#f0f0f0';
    $log.style.height = '100px';
    $log.style.border = '1px solid #cdcdcd';
    $log.style.overflow = 'auto';
    $log.style.opacity = 0.7; 
    // $log.style.display = 'none'; // comment this out to show log
    document.body.appendChild($log);
    log('Log initialized!');

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

                $videos[curIndex].removeEventListener("play");
                $videos[curIndex].addEventListener("play", function() { 
                    log("--> canplay event | added playback speed: ", curIndex);
                    $videos[curIndex].playbackRate = window.__SPEEDER.rate;
                }, true);
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
     * Send message to react native when 
     * 1. a video page is active
     * 2. navigation is possible
     */
    function navigationChanged () {
    }
    
    /**
     * Add util to trigger events on pushstate change
     */
    var urlHistory = [window.location.url];
    var historyIndex = 0;
    (function(history){
        var pushState = history.pushState;
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") { history.onpushstate({state: state}); }

            //// put this behind a delay so we can fetch the page info after it
            //// has been loaded
            
            setTimeout(function () { requestAnimationFrame(function () {
                window.postMessage = patchedPostMessage;
                var currentUrl = window.location.href;
                // ignore push states with no URL
                if (!currentUrl) { return false; }

                var clientState = {
                    fromPushState: true,
                    videoIsVisible: false,
                    backEnabled: false,
                    forwardEnabled: false
                };

                // on history change, send message to native app
                if (document.getElementById('player').style.visibility === 'visible') {
                    clientState.videoIsVisible = true;
                }

                
                historyIndex++;
                clientState.historyIndex = historyIndex;
                urlHistory.push(currentUrl);

                // if the current url is the previous URL, it means the user is
                // going backwards
                if (urlHistory[historyIndex - 1] !== undefined) { clientState.backEnabled = true; }
                if (historyIndex > 0) { clientState.backEnabled = true; }

                clientState.forwardEnabled = false;

                // trim history, we don't need the full array
                if (urlHistory.length > 5) { urlHistory.shift(); historyIndex--; }


                log('pushState called ' + JSON.stringify(clientState, null, 4));

                // send message to native app
                window.postMessage(JSON.stringify(clientState), '*');
            }); }, 100);

            return pushState.apply(history, arguments);
        };
    })(window.history);


    /** Handle back button change */
    function handleHistoryChangeFromNav (direction) {
       window.postMessage = patchedPostMessage;

        var currentUrl = window.location.href;
        if (currentUrl === urlHistory[historyIndex]) {
            log('Same URL found, no effect');
        }

        var clientState = {
            videoIsVisible: false,
            backEnabled: false,
            forwardEnabled: true,
            historyIndex: historyIndex
        };

        if (urlHistory[historyIndex - 1] !== undefined) { clientState.backEnabled = true; }
        if (direction === -1) { 
            historyIndex--;
            urlHistory.pop();
            clientState.forwardEnabled = true;

        } else if (direction === 1) {
            historyIndex++;
            clientState.backEnabled= true;
        }

        // TODO set up history tracking. When going forward or back, need to
        // trigger button enabled states AND check if video is visible
        if (document.getElementById('player').style.visibility === 'visible') { clientState.videoIsVisible = true; }
        window.postMessage(JSON.stringify(clientState), '*');
    }

    /**
     * Listen for messages from our app
     */
    document.addEventListener('message', function (e) {
        var data = JSON.parse(e.data);
        log('Got message: ' + JSON.stringify(data));

        if (data.playbackSpeed) { changePlaybackSpeed(data.playbackSpeed); }
        if (data.historyForward) { 
            window.history.go(1); 
            setTimeout(function () { requestAnimationFrame(function () {
                handleHistoryChangeFromNav(1); 
            }); }, 200);
        }
        if (data.historyBack) { 
            window.history.go(-1); 
            setTimeout(function () { requestAnimationFrame(function () {
                handleHistoryChangeFromNav(-1); 
            }); }, 200);
        }

        // Skip forward / back 30 seconds (whatever amount data.skip is)
        if (data.skip) { skip(data.skip); }
    });
}
