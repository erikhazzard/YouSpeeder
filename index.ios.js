/**
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet
} from 'react-native';

import ViewYoutube from './app/components/youtube.js';
import ControlPanel from './app/components/control-panel.js';

/**
 * Main app component
 *
 */
export default class YouSpeeder extends Component {
    render() {
        return (
            <ViewYoutube />
        );
    }
}

AppRegistry.registerComponent('YouSpeeder', () => YouSpeeder);
