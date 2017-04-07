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

const baseActionLabelStyle = {
    color: '#ffffff',
    fontFamily: FONT_FAMILIES.labelBold,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    width: 50
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#F5FCFF'
    },
    youtube: {
        marginTop: 24,
        flex: 1,
        width: '100%',
        alignSelf: 'stretch', 
        justifyContent: 'center', 
        alignItems: 'center'
    },

    footer: {
        height: 50,
        backgroundColor: '#dd2222',
        alignSelf: 'stretch', 
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

    footerBackWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'flex-start', opacity: 0.8},
    footerBackWrapperDisabled: { flex: 1, flexDirection: 'row', justifyContent: 'flex-start', opacity: 0.4 },
    footerForwardWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', opacity: 0.8},
    footerForwardWrapperDisabled: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', opacity: 0.4 },

    footerActionsWrapper: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    footerAction: Object.assign({}, baseActionLabelStyle, {
        paddingTop: 14, 
        paddingBottom: 6, 
        fontFamily: FONT_FAMILIES.label
    }),
    footerActionPlayback: Object.assign({}, baseActionLabelStyle, {paddingTop: 10, fontSize: 20, width: 88}),

    footerBack: Object.assign({}, baseActionLabelStyle),
    footerForward: Object.assign({}, baseActionLabelStyle)
});
export default styles;
