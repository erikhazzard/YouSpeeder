/**
 * This is the client code ran on youtube to speed up videos
 * 
 */
export default function youtubeClientSpeederCode () {
    /** Global speeder config */
    window.__SPEEDER = {rate: 1};

    /**
     * Modify postMessage to avoid bug in react native. See 
     *  * https://github.com/facebook/react-native/issues/10865
     *  * https://github.com/facebook/react-native/pull/10941
     *  * https://github.com/facebook/react-native/issues/1086:
     *
     *  NOTE: Have tried setting onMessage in native view after page is
     *  loaded but that still does not fix it
    var originalPostMessage = window.postMessage;
    var patchedPostMessage = function(message, targetOrigin, transfer) { originalPostMessage(message, targetOrigin, transfer); };
    patchedPostMessage.toString = function() { return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage'); };
    window.postMessage = patchedPostMessage;
     */


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
    $log.style.display = 'none'; // comment this out to show log
    document.body.appendChild($log);
    log('Log initialized!');

    /** Utility log function */
    function log () {
        var $logItem = document.createElement('div');
        var textContent = [];
        for (var i = 0; i < arguments.length; i++) { textContent.push(JSON.stringify(arguments[i], null, 4)); }
        $logItem.textContent = textContent.join(' | ');
        $log.appendChild($logItem);
        $log.scrollTop = 99999999999;
    };

    /**
     * Process each video and set its playback speed
     */
    var $video = document.querySelector('#player video');

    /**
     * Prepares the video element to set current playback rate
     */
    function playListener () { this.playbackRate = window.__SPEEDER.rate; }
    function loadVideo () {
        log('Loading video');
        $video = document.querySelector('#player video');
        $video.playbackRate = window.__SPEEDER.rate;
        $video.removeEventListener("play", playListener);
        $video.addEventListener("play", playListener, true);
    } 
    /** Load video */
    setTimeout(function () { requestAnimationFrame(function () { loadVideo(); }); }, 1400);

    /**
     * Changes all video playback speeds
     * @param {number} speed - playback rate, e.g., `1` or `1.5`
     */
    function changePlaybackSpeed(speed) {
        window.__SPEEDER.rate = +speed; // ensure it's always a number
        // anytime we change playback speed, ensure we have the video element.
        // This could be optimized, and is overkill right now - it's not necessary
        // to select the video every time; but performance cost in this case
        // is tiny and it solves the problem
        loadVideo();
    }

    /**
     * Skip forwards / backwards on current video
     * @param {number} amount - amount, in seconds, to skip (can be negative to go backwards)
     */
    function skip (amount) {
        log('Skipping time: ' + amount);
        $video.currentTime += amount;
    }

    
    /**
     * Add util to trigger events on pushstate change
     * Hook into nav changes to let native view know if a video is visible
     */
    (function(history){
        var pushState = history.pushState;
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") { history.onpushstate({state: state}); }

            /** Uncomment to send message back to react native
             * This is currently bugged out, will throw an error 30% of the
             * time when calling postMessage 
            setTimeout(function () { requestAnimationFrame(function () {
                var clientState = {
                    isVideoVisible: false
                };

                // on history change, send message to native app
                if (document.getElementById('player').style.visibility === 'visible') { clientState.isVideoVisible = true; }
                log('pushState called ' + JSON.stringify(clientState, null, 4));
                // send message to native app
                window.postMessage(JSON.stringify(clientState), '*');
            }); }, 100);
            */

            //// NOTE: Must call postMessage to have nav triggered
            //// However, this breaks 50% of the time
            // window.postMessage('', '*');
            return pushState.apply(history, arguments);
        };
    })(window.history);


    /** Handle back button change */
    function handleHistoryChangeFromNav (direction) {
        var clientState = { isVideoVisible: false };
        if (document.getElementById('player').style.visibility === 'visible') { clientState.isVideoVisible = true; }
        //// NOTE: Must call postMessage to have nav triggered
        //// However, this breaks 50% of the tiem
        // window.postMessage(JSON.stringify(clientState), '*');
    }

    /**
     * Listen for messages from our app
     */
    document.addEventListener('message', function (e) {
        var data = JSON.parse(e.data);
        log('Got message: ' + JSON.stringify(data));

        if (data.playbackSpeed) { changePlaybackSpeed(data.playbackSpeed); }

        /** Uncomment to respond to nav change 
        if (data.historyForward) { handleHistoryChangeFromNav(1); }
        if (data.historyBack) { handleHistoryChangeFromNav(-1); }
        */

        // Skip forward / back 30 seconds (whatever amount data.skip is)
        if (data.skip) { skip(data.skip); }
    });
}
