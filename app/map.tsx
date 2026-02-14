import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from 'expo-location';
import { MapService, MapItem } from "./services/map";
import WeatherWidget from "../components/WeatherWidget";
import { CURRENT_USER_LOCATION } from "./utils/location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #FFF; }
        #map { height: 100vh; width: 100vw; background-color: #FAFAFA; }
        
        .marker-icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .nomad-container {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .nomad-border {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #FFF;
            padding: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            z-index: 2;
        }
        .nomad-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .icon-marker {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            font-size: 16px;
            color: #FFF;
        }
        
        .leaflet-popup-content-wrapper { border-radius: 8px; padding: 0; }
        .leaflet-popup-content { margin: 10px 12px; text-align: center; font-family: sans-serif; }
        .popup-title { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 2px; }
        .popup-desc { font-size: 11px; color: #666; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Start centered on a neutral world view (or 0,0) to avoid default bias before centering
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20, 0], 2);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19, subdomains: 'abcd'
        }).addTo(map);

        var markersLayer = L.layerGroup().addTo(map);
        var userMarker = null;

        window.updateMap = function(items) {
            markersLayer.clearLayers();
            
            items.forEach(function(item) {
                var iconHtml = '';
                if (item.type === 'nomad') {
                    iconHtml = '<div class="nomad-container"><div class="nomad-border"><img src="' + item.avatar + '" class="nomad-img" /></div></div>';
                } else {
                    var bgColor = '#3B82F6'; // Default blue
                    if (item.type === 'event') bgColor = '#F59E0B'; // Orange
                    if (item.type === 'service') bgColor = '#10B981'; // Green
                    if (item.type === 'sos') bgColor = '#EF4444'; // Red
                    
                    iconHtml = '<div class="icon-marker" style="background-color: ' + bgColor + '">' + (item.icon || '') + '</div>';
                }

                var customIcon = L.divIcon({
                    className: 'marker-icon',
                    html: iconHtml,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    popupAnchor: [0, -20]
                });

                var marker = L.marker([item.lat, item.long], { icon: customIcon });
                marker.bindPopup('<div class="popup-title">' + item.title + '</div><div class="popup-desc">' + item.desc + '</div>');
                markersLayer.addLayer(marker);
            });
        };

        window.centerMap = function(lat, lon) {
            map.setView([lat, lon], 13);
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            userMarker = L.circleMarker([lat, lon], {
                radius: 8,
                fillColor: "#3B82F6",
                color: "#FFF",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
            userMarker.bindPopup("You are here");
        };
    </script>
</body>
</html>
`;

const FILTERS = [
    { id: 'nomad', label: 'Nomads', icon: 'account-group' },
    { id: 'event', label: 'Events', icon: 'fire' },
    { id: 'service', label: 'Services', icon: 'wrench' },
];

export default function MapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [items, setItems] = useState<MapItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['nomad', 'event', 'service']);
  const [myLocation, setMyLocation] = useState<{lat: number, long: number} | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    initMap();
    loadSharingPreference();
  }, []);

  const loadSharingPreference = async () => {
      try {
          const saved = await AsyncStorage.getItem('is_sharing_location');
          if (saved === 'true') {
              setIsSharing(true);
          }
      } catch (e) {
          console.log('Error loading sharing preference', e);
      }
  };

  const initMap = async () => {
      try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              console.log('Location permission denied, using default.');
              setMyLocation({ lat: CURRENT_USER_LOCATION.latitude, long: CURRENT_USER_LOCATION.longitude });
              loadMapData(CURRENT_USER_LOCATION.latitude, CURRENT_USER_LOCATION.longitude); 
              return;
          }

          const lastKnown = await Location.getLastKnownPositionAsync({});
          if (lastKnown) {
              const { latitude, longitude } = lastKnown.coords;
              setMyLocation({ lat: latitude, long: longitude });
              loadMapData(latitude, longitude);
          }

          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude, longitude } = location.coords;
          
          setMyLocation({ lat: latitude, long: longitude });
          
          // Only reload data if we didn't have a last known location, 
          // or if the distance is significant (optional optimization, here we just reload to be safe)
          if (!lastKnown) {
             loadMapData(latitude, longitude);
          } else {
             // If we moved significantly, we might want to reload. 
             // For now, let's just update the center (setMyLocation does this via useEffect)
             // and silently refresh data
             loadMapData(latitude, longitude);
          }

      } catch (error) {
          console.log('Error getting location', error);
          if (!myLocation) { 
            setMyLocation({ lat: CURRENT_USER_LOCATION.latitude, long: CURRENT_USER_LOCATION.longitude });
            loadMapData(CURRENT_USER_LOCATION.latitude, CURRENT_USER_LOCATION.longitude);
          }
      }
  };

  const loadMapData = async (lat?: number, long?: number) => {
      const data = await MapService.getMapItems(lat, long);
      setItems(data);
  };

  useEffect(() => {
      if (webViewRef.current && mapReady) {
          const filtered = items.filter(i => activeFilters.includes(i.type));
          webViewRef.current.injectJavaScript(`window.updateMap(${JSON.stringify(filtered)}); true;`);
      }
  }, [items, activeFilters, mapReady]);

  useEffect(() => {
      if (webViewRef.current && mapReady && myLocation) {
          webViewRef.current.injectJavaScript(`window.centerMap(${myLocation.lat}, ${myLocation.long}); true;`);
      }
  }, [myLocation, mapReady]);

  useEffect(() => {
      let subscription: Location.LocationSubscription | null = null;

      const startTracking = async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              Toast.show({ type: 'error', text1: 'Permission denied', text2: 'Allow location access to share your live position.' });
              setIsSharing(false);
              return;
          }

          subscription = await Location.watchPositionAsync(
              { accuracy: Location.Accuracy.Balanced, timeInterval: 60000, distanceInterval: 100 },
              (location) => {
                  MapService.updateUserLocation(location.coords.latitude, location.coords.longitude);
              }
          );
      };

      if (isSharing) {
          startTracking();
      }

      return () => {
          if (subscription) subscription.remove();
      };
  }, [isSharing]);

  const toggleFilter = (id: string) => {
      setActiveFilters(prev => {
          if (prev.includes(id)) return prev.filter(f => f !== id);
          return [...prev, id];
      });
  };

  const handleToggleSharing = (value: boolean) => {
      setIsSharing(value);
      AsyncStorage.setItem('is_sharing_location', String(value)).catch(e => 
        console.log('Error saving sharing preference', e)
      );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => {
            setMapReady(true);
        }}
      />

      <View style={styles.topContainer}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            
            <View style={styles.toggleCard}>
                <View>
                    <Text style={styles.toggleTitle}>Share Location</Text>
                    <Text style={styles.toggleSub}>Visible to convoy</Text>
                </View>
                <Switch
                    value={isSharing}
                    onValueChange={handleToggleSharing}
                    trackColor={{ false: "#E5E7EB", true: "#000" }}
                    thumbColor={"#FFF"}
                />
            </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map(f => {
                const isActive = activeFilters.includes(f.id);
                return (
                    <TouchableOpacity 
                        key={f.id} 
                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                        onPress={() => toggleFilter(f.id)}
                    >
                        <MaterialCommunityIcons name={f.icon as any} size={16} color={isActive ? "#FFF" : "#000"} />
                        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.weatherWrapper}>
            <WeatherWidget />
        </View>
        
        <TouchableOpacity style={styles.listButton} onPress={() => router.back()}>
           <Text style={styles.listButtonText}>List View</Text>
           <MaterialCommunityIcons name="format-list-bulleted" size={18} color="#000" style={{marginLeft: 6}} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { flex: 1, backgroundColor: '#FFF' },
  
  topContainer: {
      position: 'absolute', top: 50, left: 0, right: 0,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 12
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.15, elevation: 4,
  },
  toggleCard: {
    flex: 1, flexDirection: 'row', backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24,
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: "#000", shadowOpacity: 0.15, elevation: 4,
  },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  toggleSub: { fontSize: 10, color: '#6B7280' },

  filterScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },
  filterChip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
      shadowColor: "#000", shadowOpacity: 0.1, elevation: 2,
  },
  filterChipActive: { backgroundColor: '#000', borderColor: '#000' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#000' },
  filterTextActive: { color: '#FFF' },

  bottomContainer: {
      position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', gap: 16
  },
  weatherWrapper: { width: '90%', maxWidth: 400 },
  listButton: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30,
    shadowColor: "#000", shadowOpacity: 0.2, elevation: 6,
  },
  listButtonText: { color: '#000', fontWeight: '700', fontSize: 14 },
});