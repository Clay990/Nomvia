import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SkeletonPost() {
    const { colors, isDark } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const bgStyle = { backgroundColor: isDark ? '#333' : '#E0E0E0', opacity };

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: isDark ? '#333' : '#F3F4F6' }]}>
            <View style={styles.header}>
                <Animated.View style={[styles.avatar, bgStyle]} />
                <View style={{ gap: 6 }}>
                    <Animated.View style={[styles.textLine, { width: 120, height: 14 }, bgStyle]} />
                    <Animated.View style={[styles.textLine, { width: 80, height: 10 }, bgStyle]} />
                </View>
            </View>

            <View style={{ paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
                <Animated.View style={[styles.textLine, { width: '100%' }, bgStyle]} />
                <Animated.View style={[styles.textLine, { width: '90%' }, bgStyle]} />
                <Animated.View style={[styles.textLine, { width: '40%' }, bgStyle]} />
            </View>

            <Animated.View style={[styles.media, bgStyle]} />
            
            <View style={styles.actions}>
                 <Animated.View style={[styles.circle, bgStyle]} />
                 <Animated.View style={[styles.circle, bgStyle]} />
                 <Animated.View style={[styles.circle, bgStyle]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    textLine: {
        height: 12,
        borderRadius: 6,
    },
    media: {
        width: '100%',
        height: 180,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 20,
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
    }
});
