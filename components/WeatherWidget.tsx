import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { CURRENT_USER_LOCATION } from "../app/utils/location";

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
}

export default function WeatherWidget() {
  const { colors } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { latitude, longitude } = CURRENT_USER_LOCATION;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await response.json();
      if (data.current_weather) {
        setWeather(data.current_weather);
      }
    } catch (error) {
      console.log("Weather fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return "weather-sunny";
    if (code <= 3) return "weather-partly-cloudy";
    if (code <= 48) return "weather-fog";
    if (code <= 67) return "weather-pouring";
    if (code <= 77) return "weather-snowy";
    return "weather-cloudy";
  };

  const getWeatherLabel = (code: number) => {
    if (code <= 1) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snow";
    return "Overcast";
  };

  if (loading) return null;
  if (!weather) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.left}>
        <MaterialCommunityIcons 
            name={getWeatherIcon(weather.weathercode) as any} 
            size={32} 
            color={colors.text} 
        />
        <View style={{ marginLeft: 12 }}>
            <Text style={[styles.temp, { color: colors.text }]}>{Math.round(weather.temperature)}°C</Text>
            <Text style={[styles.condition, { color: colors.subtext }]}>{getWeatherLabel(weather.weathercode)}</Text>
        </View>
      </View>
      
      <View style={styles.right}>
          <View style={styles.stat}>
              <Feather name="wind" size={14} color={colors.subtext} />
              <Text style={[styles.statText, { color: colors.subtext }]}>{weather.windspeed} km/h</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>Safe to Drive</Text>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  left: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  temp: {
      fontSize: 20,
      fontWeight: '800',
  },
  condition: {
      fontSize: 12,
      fontWeight: '600'
  },
  right: {
      alignItems: 'flex-end',
      gap: 6
  },
  stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
  },
  statText: {
      fontSize: 12,
      fontWeight: '600'
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8
  },
  badgeText: {
      fontSize: 10,
      fontWeight: '700'
  }
});
