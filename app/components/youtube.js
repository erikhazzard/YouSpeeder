/**
 * Main youtube video
 *
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableHighlight,
    TouchableNativeFeedback,
    Dimensions,
    Image,
    Text,
    View,
    WebView
} from 'react-native';

import Modal from 'react-native-modalbox';

// JS client side code to run on embedded youtube page
import youtubeClientCode from '../youtube-client-code.js';

/**
 * Material UI Buttons
 */
import Ripple from 'react-native-material-ripple';

/**
 * Styles
 */
import styles from '../styles.js';

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export default class ViewYotube extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        playbackSpeed: PLAYBACK_SPEEDS[1],
        playbackSpeedIndex: 1,
        skipAmount: 30,
        url: '',
        status: '',
        backButtonEnabled: false,
        forwardButtonEnabled: false,
        isVideoVisible: false,
        isWebviewLoaded: false,
        orientation: Dimensions.get('window').width > Dimensions.get('window').height ? 'landscape' : 'portrait',
        loading: true
    }

    /**
     * When layout is changed, check if it in landscape or portrait mode and
     * apply state accordingly
     */
    onLayout = (event) => {
        let {width, height} = event.nativeEvent.layout;
        let orientation = width > height ? 'landscape' : 'portrait';
        this.setState({ orientation });
        console.log('Layout change : ' + orientation);
    }

    /**
     * This does not work as per notes in client code
     */
    onMessage = (e) => {
        console.log('GOT MESSAGE', e.nativeEvent.data);
    }

    /**
     * Send message from native app to web view
     */
    postMessage = (message) => {
        if (this.webview && this.state.isWebviewLoaded) { this.webview.postMessage(message, '*'); }
    }

    /**
     * Cycles through all playback speeds and triggers message to update 
     * webview video speed
     */
    cycleThroughPlaybackSpeed = () => {
        let nextPlaybackSpeed = this.state.playbackSpeedIndex + 1;
        if (nextPlaybackSpeed >= PLAYBACK_SPEEDS.length) { nextPlaybackSpeed = 0; }

        // post message to webview immediately
        this.postMessage(JSON.stringify({playbackSpeed: PLAYBACK_SPEEDS[nextPlaybackSpeed]}));

        var skipAmount = this.state.skipAmount;
        if (PLAYBACK_SPEEDS[nextPlaybackSpeed] < 1) { skipAmount = 15; }
        else if (PLAYBACK_SPEEDS[nextPlaybackSpeed] >= 1) { skipAmount = 30; }

        // update state
        this.setState({
            playbackSpeed: PLAYBACK_SPEEDS[nextPlaybackSpeed],
            playbackSpeedIndex: nextPlaybackSpeed,
            skipAmount: skipAmount
        });
    }

    historyBack = () => { this.webview.goBack(); }
    historyForward = () => { this.webview.goForward(); }
    
    /** Skip forward / backwards through the video */
    skip = (skipTime) => { 
        this.postMessage(JSON.stringify({skip: skipTime})); 
    }

    /**
     * Return the current playback speed label
     */
    getCurrentPlaybackSpeedText = () => {
        return `${this.state.playbackSpeed}x`;
    }

    render () {
        return (
            <View style={styles.container} onLayout={this.onLayout}>
                <WebView
                    ref={ (webview) => { return this.webview = webview; } }
                    style={this.state.orientation === 'portrait' ? styles.youtube : styles.youtube.youtubeLandscape}
                    automaticallyAdjustContentInsets={true}
                    source={{
                        uri: 'https://www.youtube.com',
                        headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
                        }
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    decelerationRate="normal"
                    startInLoadingState={true}
                    backButtonEnabled={true}
                    forwardButtonEnabled={true}
                    scalesPageToFit={true}
                    onNavigationStateChange = {(navState) => {
                        console.log('Nav changed', navState);
                        // NOTE: This doesn't actually work because youtube is a single page app and does not trigger nav state changes.
                        this.setState({
                            backButtonEnabled: navState.canGoBack,
                            forwardButtonEnabled: navState.canGoForward,
                            url: navState.url,
                            status: navState.title,
                            loading: navState.loading,
                            scalesPageToFit: true
                        });
                    }}
                    onError={(err) => { console.log("ERROR", err); }}
                    onLoad={() => { console.log("Load..."); }}
                    
                    onLoadEnd={() => {
                        console.log("Load End", this.webview);
                        this.webview.injectJavaScript(
                            '(' + youtubeClientCode.toString() + ')()'
                        );
                        this.setState({isWebviewLoaded: true});
                    }}
                />

                <View style={styles.footer}>
                    <View style={styles.footerBackWrapper}>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={this.historyBack}>
                            <Text style={styles.footerBack}>
                                {/* ← */}
                                ⬅︎
                            </Text>
                        </Ripple>
                    </View>
                    <View style={styles.footerActionsWrapper}>
                        <Ripple 
                            rippleCentered={true}
                            onPress={ () => { this.skip(-this.state.skipAmount); }}>
                            <Text style={styles.footerAction}>
                                ↩︎ {this.state.skipAmount}s
                            </Text>
                        </Ripple>
                        <Ripple 
                            rippleCentered={true}
                            onPress={this.cycleThroughPlaybackSpeed} 
                            style={styles.footerRipple} 
                        >
                            <Text style={styles.footerActionPlayback}>
                                {this.getCurrentPlaybackSpeedText()}
                            </Text>
                        </Ripple>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={() => { this.skip(this.state.skipAmount); }}>
                            <Text style={styles.footerAction}>
                                {this.state.skipAmount}s↪︎ 
                            </Text>
                        </Ripple>
                    </View>
                    <View style={styles.footerForwardWrapper}>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={this.historyForward}>
                            <Text style={styles.footerForward}>
                                {/* → */}
                                ➡︎
                            </Text>
                        </Ripple>
                    </View>
                </View>
          </View>
        );
    }
}
