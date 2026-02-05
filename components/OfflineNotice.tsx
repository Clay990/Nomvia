import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Network from 'expo-network';

export default function OfflineNotice() {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
    
    const [displayMode, setDisplayMode] = useState<'offline' | 'online' | 'hidden'>('hidden');

    useEffect(() => {
        const check = async () => {
            const state = await Network.getNetworkStateAsync();
            const reachable = state.isInternetReachable;
            
            if (reachable !== isInternetReachable) {
                if (reachable === false) {
                    setDisplayMode('offline');
                    showBanner();
                    
                    setTimeout(() => {
                        hideBanner();
                    }, 3000);
                } else if (reachable === true && isInternetReachable === false) {
                    setDisplayMode('online');
                    showBanner();
                    
                    setTimeout(() => {
                        hideBanner();
                    }, 2000);
                }
                
                setIsInternetReachable(reachable ?? true);
            }
        };

        check();
        const interval = setInterval(check, 2000); 
        return () => clearInterval(interval);
    }, [isInternetReachable]);

    const showBanner = () => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 20,
            friction: 7
        }).start();
    };

    const hideBanner = () => {
        Animated.timing(slideAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true
        }).start(() => setDisplayMode('hidden'));
    };

    if (displayMode === 'hidden') return null;

    const isOffline = displayMode === 'offline';

    return (
        <Animated.View style={[styles.container, { top: insets.top + 10, transform: [{ translateY: slideAnim }] }]}>
            <View style={[styles.content, isOffline ? styles.offlineBg : styles.onlineBg]}>
                <View style={[styles.iconCircle, isOffline ? styles.offlineIcon : styles.onlineIcon]}>
                    <MaterialCommunityIcons 
                        name={isOffline ? "cloud-off-outline" : "wifi-check"} 
                        size={20} 
                        color={isOffline ? "#FFF" : "#111"} 
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, !isOffline && { color: '#111' }]}>
                        {isOffline ? "You're Offline" : "Back Online"}
                    </Text>
                    <Text style={[styles.subtitle, !isOffline && { color: '#333' }]}>
                        {isOffline ? "Wandering wild? We saved your spot." : "Synced and ready to roll."}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 30,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    offlineBg: {
        backgroundColor: '#1A1A1A',
    },
    onlineBg: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    offlineIcon: {
        backgroundColor: '#FF4444',
    },
    onlineIcon: {
        backgroundColor: '#10B981', 
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
    }
});