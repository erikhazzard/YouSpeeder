/**
 * Main youtube video
 *
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableHighlight,
    TouchableNativeFeedback,
    Text,
    View,
    WebView
} from 'react-native';


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

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.25, 2.5, 2.75, 3, 4];

export default class ViewYotube extends Component {
    state = {
        playbackSpeed: PLAYBACK_SPEEDS[2],
        playbackSpeedIndex: 2,
        url: '',
        status: '',
        backButtonEnabled: false,
        forwardButtonEnabled: false,
        loading: true,
        scalesPageToFit: true
    }

    goBack = () => { this.webview.goBack(); };
    goForward = () => { this.webview.goForward(); };

    onMessage = (e) => {
        console.log(e.nativeEvent.data);
    }
    postMessage = (message) => {
        if (this.webview) { this.webview.postMessage(message, '*'); }
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

        // update state
        this.setState({
            playbackSpeed: PLAYBACK_SPEEDS[nextPlaybackSpeed],
            playbackSpeedIndex: nextPlaybackSpeed
        });
    }

    historyBack = () => { this.postMessage(JSON.stringify({historyBack: true})); }
    historyForward = () => { this.postMessage(JSON.stringify({historyForward: true})); }
    
    /** Skip forward / backwards through the video */
    skip = (skipTime) => { this.postMessage(JSON.stringify({skip: skipTime})); }

    /**
     * Return the current playback speed label
     */
    getCurrentPlaybackSpeedText = () => {
        return `${this.state.playbackSpeed}x`;
    }

    render () {
        return (
            <View style={styles.container}>
                <WebView
                    ref={ (webview) => { return this.webview = webview; } }
                    automaticallyAdjustContentInsets={true}
                    style={styles.youtube}
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
                    }}
                />
                <View style={styles.footer}>
                    <View style={this.state.backButtonEnabled ? styles.footerBackWrapper : styles.footerBackWrapper}>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={this.historyBack}>
                            <Text style={styles.footerBack}>
                                ＜
                            </Text>
                        </Ripple>
                    </View>
                    <View style={styles.footerActionsWrapper}>
                        <Ripple 
                            rippleCentered={true}
                            onPress={ () => { this.skip(-30); }}>
                            <Text style={styles.footerAction}>
                                ↩︎ 30
                            </Text>
                        </Ripple>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={this.cycleThroughPlaybackSpeed} >
                            <Text style={styles.footerActionPlayback}>
                                {this.getCurrentPlaybackSpeedText()}
                            </Text>
                        </Ripple>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={() => { this.skip(30); }}>
                            <Text style={styles.footerAction}>
                                30↪︎ 
                            </Text>
                        </Ripple>
                    </View>
                    <View style={this.state.forwardButtonEnabled ? styles.footerForwardWrapper : styles.footerForwardWrapper}>
                        <Ripple 
                            rippleCentered={true}
                            style={styles.footerRipple} onPress={this.historyForward}>
                            <Text style={styles.footerForward}>
                                ＞
                            </Text>
                        </Ripple>
                    </View>
                </View>
          </View>
        );
    }
}