import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  ActivityIndicator
} from "react-native";
import { WebView } from "react-native-webview";
import { useRevenueCat } from "../../context/RevenueCatContext";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "../../context/LocationContext";
import { BuildersService, BuilderItem } from "../services/builders";

import CategoryList from "../../components/builders/CategoryList";
import HelperList from "../../components/builders/HelperList";
import ProBuilderList from "../../components/builders/ProBuilderList";
import SparePartsList from "../../components/builders/SparePartsList";

const { width, height } = Dimensions.get('window');

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
        .marker-icon { display: flex; align-items: center; justify-content: center; }
        .icon-circle {
            width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;
        }
        .leaflet-popup-content-wrapper { border-radius: 8px; padding: 0; }
        .leaflet-popup-content { margin: 10px 12px; text-align: center; font-family: sans-serif; }
        .popup-title { font-weight: 700; font-size: 14px; color: #111; margin-bottom: 2px; }
        .popup-desc { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
        var markersLayer = L.layerGroup().addTo(map);

        window.updateMap = function(items) {
            markersLayer.clearLayers();
            items.forEach(function(item) {
                var color = '#3B82F6'; // Helper (Blue)
                var icon = '🔧'; 
                
                if(item.type === 'pro') { color = '#F59E0B'; icon = '⭐'; } // Pro (Gold)
                else if(item.type === 'part') { color = '#10B981'; icon = '📦'; } // Part (Green)
                else if(item.type === 'service') { color = '#6B7280'; icon = '📍'; } // Generic (Gray)

                var iconHtml = '<div class="icon-circle" style="background-color: ' + color + '">' + icon + '</div>';
                
                var customIcon = L.divIcon({
                    className: 'marker-icon',
                    html: iconHtml,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                });

                var marker = L.marker([item.coordinate.latitude, item.coordinate.longitude], { icon: customIcon });
                marker.bindPopup('<div class="popup-title">' + item.name + '</div><div class="popup-desc">' + item.desc + '</div>');
                markersLayer.addLayer(marker);
            });
        };

        window.centerMap = function(lat, lon) {
            map.setView([lat, lon], 12);
            L.circleMarker([lat, lon], {
                radius: 8, fillColor: "#3B82F6", color: "#FFF", weight: 2, opacity: 1, fillOpacity: 0.8
            }).addTo(map).bindPopup("You");
        };
    </script>
</body>
</html>
`;

// Keep categories static for navigation/filtering context
const HELP_CATEGORIES = [
  { id: 1, label: "Mechanics", icon: "wrench", count: 12, dist: "5 km" },
  { id: 2, label: "Electricians", icon: "lightning-bolt", count: 8, dist: "3 km" },
  { id: 3, label: "Carpenters", icon: "saw-blade", count: 5, dist: "10 km" },
  { id: 4, label: "Solar Techs", icon: "solar-power", count: 4, dist: "12 km" },
  { id: 5, label: "Towing", icon: "tow-truck", count: 2, dist: "15 km" },
];

const FILTER_CHIPS = ["All", "Mechanics", "Electricians", "Carpenters", "Solar", "Towing", "Parts"];

export default function BuildersScreen() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState("All");
  const [items, setItems] = useState<BuilderItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isPro, presentPaywall } = useRevenueCat();
  const { colors, isDark } = useTheme();
  const { location } = useLocation();
  const styles = getStyles(colors);
  
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
      fetchData();
  }, [activeFilter, location]);

  const fetchData = async () => {
      setLoading(true);
      try {
          const data = await BuildersService.getBuildersAndHelpers(
              location?.coords.latitude, 
              location?.coords.longitude, 
              activeFilter
          );
          setItems(data);
      } catch (e) {
          console.log("Error loading builders", e);
      } finally {
          setLoading(false);
      }
  };

  const handleProAction = async (action?: () => void) => {
    if (isPro) {
      if (action) action();
    } else {
      await presentPaywall();
    }
  };

  const doesMatchSearch = (item: BuilderItem) => {
      const term = search.toLowerCase();
      return item.name.toLowerCase().includes(term) || 
             item.desc.toLowerCase().includes(term);
  };

  const filteredItems = items.filter(doesMatchSearch);
  
  useEffect(() => {
      if (viewMode === 'map' && webViewRef.current && mapReady) {
          const mapItems = filteredItems.map(i => ({
              type: i.type,
              coordinate: i.coordinate,
              name: i.name,
              desc: i.desc
          }));
          webViewRef.current.injectJavaScript(`window.updateMap(${JSON.stringify(mapItems)}); true;`);
          
          if (location) {
             webViewRef.current.injectJavaScript(`window.centerMap(${location.coords.latitude}, ${location.coords.longitude}); true;`);
          }
      }
  }, [filteredItems, viewMode, mapReady, location]);

  const filteredHelpers = filteredItems.filter(i => i.type === 'helper' || i.type === 'service').map(h => ({
      id: h.id as any, 
      name: h.name,
      skill: h.desc,
      dist: h.dist || 'Nearby',
      image: h.image || "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=400",
      verified: h.verified || false,
      coordinate: h.coordinate
  }));

  const filteredProBuilders = filteredItems.filter(i => i.type === 'pro').map(b => ({
      id: b.id as any,
      name: b.name,
      built: "10+ vans", 
      specialty: b.desc,
      image: b.image || "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800",
      coordinate: b.coordinate
  }));

  const filteredParts = filteredItems.filter(i => i.type === 'part').map(p => ({
      id: p.id as any,
      item: p.name,
      price: p.price || "Contact for price",
      dist: p.dist || 'Nearby',
      image: p.image || "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=200"
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Service Hub</Text>
            <Text style={styles.headerSubtitle}>Find help, parts & builders</Text>
        </View>
        <TouchableOpacity style={styles.sosButton} onPress={() => handleProAction(() => console.log('SOS triggered'))}>
           <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FFF" />
           <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsSection}>
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.subtext} style={{marginRight: 8}} />
                    <TextInput 
                        placeholder="Search services..." 
                        placeholderTextColor={colors.subtext}
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity 
                    style={styles.viewToggleBtn} 
                    onPress={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                >
                    <MaterialCommunityIcons name={viewMode === 'list' ? "map-outline" : "format-list-bulleted"} size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {FILTER_CHIPS.map((chip) => (
                    <TouchableOpacity 
                        key={chip} 
                        style={[
                            styles.filterChip, 
                            activeFilter === chip && styles.activeFilterChip
                        ]}
                        onPress={() => setActiveFilter(chip)}
                    >
                        <Text style={[
                            styles.filterChipText, 
                            activeFilter === chip && styles.activeFilterChipText
                        ]}>{chip}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
      </View>
      
      {loading ? (
           <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={colors.primary} />
               <Text style={styles.loadingText}>Locating nearby services...</Text>
           </View>
      ) : viewMode === 'list' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeFilter !== "Parts" && <CategoryList categories={HELP_CATEGORIES} colors={colors} />}
            {activeFilter !== "Parts" && <HelperList helpers={filteredHelpers} colors={colors} />}
            {(activeFilter === "All" || activeFilter === "Parts") && <SparePartsList parts={filteredParts} colors={colors} />}
            {activeFilter !== "Parts" && (
                <ProBuilderList 
                    builders={filteredProBuilders} 
                    colors={colors} 
                    isPro={isPro} 
                    onAction={() => handleProAction(() => console.log('Open Portfolio'))} 
                />
            )}
            
            {filteredItems.length === 0 && (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="magnify-remove-outline" size={48} color={colors.subtext} />
                    <Text style={styles.emptyStateText}>No results found in this area.</Text>
                </View>
            )}

            <View style={{height: 100}} />
          </ScrollView>
      ) : (
          <View style={styles.mapContainer}>
              <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: htmlContent }}
                  style={styles.map}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  onLoadEnd={() => setMapReady(true)}
              />
              
              <View style={styles.mapFloatingCard}>
                  <Text style={styles.mapFloatingText}>Showing {filteredItems.length} results in this area</Text>
              </View>
          </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => console.log('Request Help')}>
            <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
            <Text style={styles.fabText}>Post Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text, fontFamily: 'YoungSerif_400Regular' },
  headerSubtitle: { fontSize: 14, color: colors.subtext, marginTop: 2 },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 6,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  sosText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  
  controlsSection: {
      backgroundColor: colors.card,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 10,
  },
  searchRow: { 
      paddingHorizontal: 24, 
      marginBottom: 12,
      flexDirection: 'row',
      gap: 12
  },
  searchContainer: {
    flex: 1,
    backgroundColor: colors.secondary,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.text },
  viewToggleBtn: {
      width: 50, height: 50,
      borderRadius: 14,
      backgroundColor: colors.secondary,
      justifyContent: 'center', 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border
  },
  
  filterScroll: { paddingHorizontal: 24, gap: 10, paddingBottom: 4 },
  filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
  },
  activeFilterChip: {
      backgroundColor: colors.text,
      borderColor: colors.text,
  },
  filterChipText: { color: colors.subtext, fontWeight: '600', fontSize: 13 },
  activeFilterChipText: { color: colors.background },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.subtext, fontSize: 14 },

  emptyState: { padding: 60, alignItems: 'center' },
  emptyStateText: { marginTop: 12, color: colors.subtext, textAlign: 'center' },

  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%', backgroundColor: '#FAFAFA' },
  mapFloatingCard: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  mapFloatingText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  markerContainer: {
      padding: 6,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#FFF',
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
  },

  fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 30,
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
  },
  fabText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});