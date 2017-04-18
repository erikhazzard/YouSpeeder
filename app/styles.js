/**
 *
 * App-wide styles
 *
 */
import { StyleSheet } from 'react-native';

const FONT_FAMILIES = {
    label: 'AvenirNext-Medium',
    labelBold: 'AvenirNext-Heavy'
};

/**
 * Set some properties that other styles will mixin
 */
const baseActionLabelStyle = {
    color: '#ffffff',
    fontFamily: FONT_FAMILIES.labelBold,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    width: 50
};

/**
 * App wide styles
 *  There are a few styles that are used (such as nav disabled state), but
 *  can be used once states are hooked up properly.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    youtube: {
        marginTop: 24
    },
    youtubeLandscape: {
        marginTop: 0
    },

    footer: {
        height: 50,
        backgroundColor: '#dd2222',
        justifyContent: 'center', 
        flexDirection: 'row',
        alignItems: 'center'
    },
    footerRippleWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    footerBackWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'flex-start', opacity: 0.7, paddingTop: 12},
        footerBackWrapperDisabled: { flex: 1, flexDirection: 'row', justifyContent: 'flex-start', opacity: 0.1 },
    footerForwardWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', opacity: 0.7, paddingTop: 12},
        footerForwardWrapperDisabled: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', opacity: 0.1 },

    footerActionsWrapper: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    footerAction: Object.assign({}, baseActionLabelStyle, {
        paddingTop: 14, 
        paddingBottom: 6, 
        opacity: 0.9,
        fontFamily: FONT_FAMILIES.label
    }),
    footerActionDisabled: Object.assign({}, baseActionLabelStyle, {
        paddingTop: 14, 
        paddingBottom: 6, 
        fontFamily: FONT_FAMILIES.label,
        opacity: 0.1
    }),

    footerActionPlayback: Object.assign({}, baseActionLabelStyle, {paddingTop: 10, fontSize: 20, width: 90 }),

    footerBack: Object.assign({}, baseActionLabelStyle, {fontSize: 26, paddingTop: 5, paddingBottom: 6}),
    footerForward: Object.assign({}, baseActionLabelStyle, {fontSize: 26, paddingTop: 5, paddingBottom: 6}),

    /** Modal */
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 300
    }

});
export default styles;
