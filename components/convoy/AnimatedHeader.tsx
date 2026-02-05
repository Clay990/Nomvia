import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '../../context/ThemeContext';
import { account } from '../../lib/appwrite';
import { useLocation } from '../../context/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_CONTEXT = {
    location: "Old Manali, HP",
    temp: "12°C",
    weatherIcon: "weather-partly-cloudy",
    aqi: "45 (Good)",
    alert: "App is under development. Some features may not work as expected."
};

export default function AnimatedHeader() {
    const { colors } = useTheme();
    const { location, address, loading: locationLoading } = useLocation();
    const [headerMode, setHeaderMode] = useState<'greeting' | 'location' | 'alert'>('greeting');
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [userName, setUserName] = useState('Nomad');

    const locationText = address 
        ? `${address.city || address.subregion || 'Unknown'}, ${address.region || address.country || ''}`
        : (locationLoading ? "Locating..." : "Location Unavailable");

    const [weather, setWeather] = useState({ temp: '--', icon: 'weather-cloudy', wind: '--' });

    useEffect(() => {
        AsyncStorage.getItem('last_weather').then(cached => {
            if (cached) {
                setWeather(JSON.parse(cached));
            }
        });

        if (!location) return;

        const fetchWeather = async () => {
            try {
                const { latitude, longitude } = location.coords;
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius`
                );
                const data = await response.json();
                
                if (data.current) {
                    const temp = Math.round(data.current.temperature_2m);
                    const wind = Math.round(data.current.wind_speed_10m);
                    const code = data.current.weather_code;
                    let icon = 'weather-sunny';

                    // Simple WMO code mapping
                    if (code >= 1 && code <= 3) icon = 'weather-partly-cloudy';
                    else if (code >= 45 && code <= 48) icon = 'weather-fog';
                    else if (code >= 51 && code <= 67) icon = 'weather-rainy';
                    else if (code >= 71 && code <= 77) icon = 'weather-snowy';
                    else if (code >= 80 && code <= 82) icon = 'weather-pouring';
                    else if (code >= 95) icon = 'weather-lightning';

                    const newWeather = { temp: `${temp}°C`, icon, wind: `${wind} km/h` };
                    setWeather(newWeather);
                    AsyncStorage.setItem('last_weather', JSON.stringify(newWeather));
                }
            } catch (e) {
                console.log("Weather fetch failed", e);
            }
        };

        fetchWeather();
    }, [location]);

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
                          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{locationText}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialCommunityIcons name={weather.icon as any} size={14} color={colors.subtext} />
                              <Text style={{ fontSize: 11, color: colors.subtext, fontWeight: '600' }}>{weather.temp}</Text>
                          </View>
                          <View style={{ width: 1, height: 10, backgroundColor: colors.border }} />
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialCommunityIcons name="weather-windy" size={14} color={colors.subtext} />
                              <Text style={{ fontSize: 11, color: colors.subtext, fontWeight: '600' }}>Wind {weather.wind}</Text>
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
