import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SkeletonPost = () => {
    const { colors, isDark } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const bgStyle = { 
        backgroundColor: isDark ? '#333' : '#E5E7EB',
        opacity: opacity 
    };

    return (
        <View style={[styles.card, { borderColor: isDark ? '#333' : '#F3F4F6', backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <Animated.View style={[styles.avatar, bgStyle]} />
                <View style={styles.headerText}>
                    <Animated.View style={[styles.line, { width: 120, height: 14 }, bgStyle]} />
                    <Animated.View style={[styles.line, { width: 80, marginTop: 6 }, bgStyle]} />
                </View>
            </View>

            <Animated.View style={[styles.media, bgStyle]} />

            <View style={styles.content}>
                <Animated.View style={[styles.line, { width: '90%' }, bgStyle]} />
                <Animated.View style={[styles.line, { width: '80%' }, bgStyle]} />
                <Animated.View style={[styles.line, { width: '40%' }, bgStyle]} />
            </View>

            <View style={styles.actions}>
                <Animated.View style={[styles.circle, bgStyle]} />
                <Animated.View style={[styles.circle, bgStyle]} />
                <Animated.View style={[styles.circle, bgStyle]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        padding: 20,
        overflow: 'hidden'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerText: {
        marginLeft: 12,
    },
    media: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
    },
    content: {
        gap: 8,
        marginBottom: 16,
    },
    line: {
        height: 10,
        borderRadius: 5,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
    }
});

export default SkeletonPost;