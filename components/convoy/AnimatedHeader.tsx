import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '../../context/ThemeContext';
import { account } from '../../lib/appwrite';

const CURRENT_CONTEXT = {
    location: "Old Manali, HP",
    temp: "12°C",
    weatherIcon: "weather-partly-cloudy",
    aqi: "45 (Good)",
    alert: "App is under development. Some features may not work as expected."
};

export default function AnimatedHeader() {
    const { colors } = useTheme();
    const [headerMode, setHeaderMode] = useState<'greeting' | 'location' | 'alert'>('greeting');
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [userName, setUserName] = useState('Nomad');

    useEffect(() => {
        let isMounted = true;
        const getUser = async () => {
            try {
                const user = await account.get();
                if (isMounted) setUserName(user.name.split(' ')[0]);
            } catch {
                console.log('User not logged in or error');
            }
        };
        getUser();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        let timer: NodeJS.Timeout;
  
        const animateTo = (nextMode: 'greeting' | 'location' | 'alert') => {
            return new Promise<void>((resolve) => {
                if (!isMounted) return resolve();
  
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true
                }).start(() => {
                    if (!isMounted) return resolve();
                    
                    setHeaderMode(nextMode);
  
                    setTimeout(() => {
                        if (!isMounted) return resolve();
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true
                        }).start(() => resolve());
                    }, 100);
                });
            });
        };
  
        const runSequence = async () => {
            await new Promise(r => timer = setTimeout(r, 4000));
            if (!isMounted) return;
  
            while (isMounted) {
                await animateTo('location');
                await new Promise(r => timer = setTimeout(r, 15000));
                if (!isMounted) return;
  
                await animateTo('alert');
                await new Promise(r => timer = setTimeout(r, 6000));
                if (!isMounted) return;
            }
        };
  
        runSequence();
  
        return () => { 
            isMounted = false; 
            clearTimeout(timer);
        };
    }, []);

    const renderContent = () => {
        switch (headerMode) {
            case 'greeting':
                return (
                    <View style={{ justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="hand-wave" size={20} color={colors.primary} />
                            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>Good morning, {userName}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.subtext, marginLeft: 28 }}>Ready for today&apos;s journey?</Text>
                    </View>
                );
            case 'alert':
                return (
                    <View style={{ justifyContent: 'center', width: '100%' }}>
                        <View style={[styles.alertBadge, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30', width: '100%' }]}>
                            <MaterialCommunityIcons name="alert-circle" size={16} color={colors.danger} />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, flex: 1 }} numberOfLines={2} ellipsizeMode="tail">{CURRENT_CONTEXT.alert}</Text>
                        </View>
                    </View>
                );
            case 'location':
            default:
                return (
                  <View style={{ justifyContent: 'center', gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{CURRENT_CONTEXT.location}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialCommunityIcons name={CURRENT_CONTEXT.weatherIcon as any} size={14} color={colors.subtext} />
                              <Text style={{ fontSize: 11, color: colors.subtext, fontWeight: '600' }}>{CURRENT_CONTEXT.temp}</Text>
                          </View>
                          <View style={{ width: 1, height: 10, backgroundColor: colors.border }} />
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialCommunityIcons name="wind-power" size={14} color={colors.subtext} />
                              <Text style={{ fontSize: 11, color: colors.subtext, fontWeight: '600' }}>AQI {CURRENT_CONTEXT.aqi}</Text>
                          </View>
                      </View>
                  </View>
                );
        }
    };

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim, paddingRight: 12, minHeight: 60, justifyContent: 'center' }}>
            {renderContent()}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
});
