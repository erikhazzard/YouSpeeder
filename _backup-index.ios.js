/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';


import { WebView } from 'react-native';

export default class YouSpeeder extends Component {
  render() {
    return (
      <View style={styles.container}>
        <WebView
          automaticallyAdjustContentInsets={true}
          style={{height: 400, width: 400 }}
          source={{
              uri: 'https://www.youtube.com/watch?v=oqLvtlAK81E',
              headers: {
                  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
              }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(err) => {
              console.log("ERRRROR", err);
          }}
          onLoad={() => {
              console.log("Load");
          }}

          onLoadEnd={() => {
            console.log("Load End");
                this.webview.injectJavaScript(`
                  console.log("INJECTED JS");
                    window.__SPEEDER = {rate: 2};

                    function loadVideo () {
                        var $videos = document.getElementsByTagName("video");
                        console.log("Load Video Called | videos:", $videos);
                        if ($videos.length < 1) { 
                            return setTimeout(function () { requestAnimationFrame(function () { loadVideo(); }); }, 1000);
                        }


                        for (var i = 0; i < $videos.length; i++) {
                            (function (curIndex) {
                                console.log("-- adding playback speed: ", curIndex);
                                $videos[i].addEventListener("canplay", function() { 
                                    console.log("--> canplay event | added playback speed: ", curIndex);
                                    $videos[curIndex].playbackRate = window.__SPEEDER.rate;
                                }, true);
                            })(i);
                        }
                    }

                    setTimeout(function () {
                        loadVideo();
                    }, 1000)
                `);
          }}
          ref={webview => { this.webview = webview; }}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('YouSpeeder', () => YouSpeeder);
