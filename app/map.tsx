import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, StatusBar } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Callout } from "react-native-maps";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// --- THE "UBER DARK" STYLE ---
const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2C2C2C" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3E3E3E" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

// --- MOCK DATA: MEXICO & USA (Active Hub) ---
const MAP_ITEMS = [
  // 1. NOMADS (People moving)
  {
    id: "n1", type: "nomad", title: "Quin (Host)", desc: "Hosting Bonfire tonight!",
    lat: 31.8667, long: -116.5964, // Ensenada, Mexico
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    heading: 180
  },
  {
    id: "n2", type: "nomad", title: "Mike & Van", desc: "Driving south to Cabo",
    lat: 32.3660, long: -117.0543, // Rosarito, Mexico
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    heading: 160
  },
  {
    id: "n3", type: "nomad", title: "Sarah J.", desc: "Crossing the border",
    lat: 32.5149, long: -117.0382, // Tijuana Border
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    heading: 180
  },
  {
    id: "n4", type: "nomad", title: "Alex T.", desc: "Surfing in San Diego",
    lat: 32.7157, long: -117.1611, // San Diego, USA
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    heading: 0
  },

  // 2. CAMPFIRE EVENTS (Social)
  {
    id: "e1", type: "event", title: "Baja Beach Bonfire", desc: "Sunset meet @ 6PM",
    lat: 31.8500, long: -116.6200, // Near Ensenada beach
    icon: "fire"
  },
  {
    id: "e2", type: "event", title: "Taco Tuesday", desc: "Street food crawl",
    lat: 32.5250, long: -117.0300, // Tijuana
    icon: "taco"
  },
  {
    id: "e3", type: "event", title: "Sunrise Yoga", desc: "Valle de Guadalupe",
    lat: 32.0725, long: -116.6094, // Wine Country
    icon: "yoga"
  },

  // 3. SERVICES / BUILDERS (Utility)
  {
    id: "s1", type: "service", title: "Pedro's Mechanics", desc: "Diesel Expert",
    lat: 32.3700, long: -117.0600, // Rosarito
    icon: "wrench"
  },
  {
    id: "s2", type: "service", title: "Solar Supply Co.", desc: "Batteries & Panels",
    lat: 32.7500, long: -117.1500, // San Diego
    icon: "solar-power"
  },

  // 4. SOS (Help Needed)
  {
    id: "sos1", type: "sos", title: "Flat Tire Help", desc: "Need a jack for Sprinter",
    lat: 32.1000, long: -116.9000, // Highway 1
    icon: "alert-circle"
  }
];

// --- CONVOY ROUTE (The Blue Line) ---
const ROUTE_COORDS = [
  { latitude: 32.7157, longitude: -117.1611 }, // San Diego
  { latitude: 32.5149, longitude: -117.0382 }, // Tijuana
  { latitude: 32.3660, longitude: -117.0543 }, // Rosarito
  { latitude: 31.8667, longitude: -116.5964 }, // Ensenada
];

export default function MapScreen() {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: 32.25, // Centered between San Diego and Ensenada
          longitude: -116.95,
          latitudeDelta: 1.8, // Zoomed out enough to see the whole route
          longitudeDelta: 1.8,
        }}
      >
        {/* 1. THE CONVOY LINE */}
        <Polyline 
            coordinates={ROUTE_COORDS}
            strokeColor="#3B82F6" // Blue Route
            strokeWidth={4}
            lineDashPattern={[10, 10]} // Dashed line for "Journey" feel
        />

        {/* 2. MARKERS */}
        {MAP_ITEMS.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.lat, longitude: item.long }}
            title={item.title}
            description={item.desc}
            zIndex={item.type === 'nomad' ? 10 : 5} // People on top
          >
            {/* CUSTOM MARKER UI SWITCH */}
            {item.type === 'nomad' ? (
                // NOMAD AVATAR
                <View style={styles.markerContainer}>
                    <View style={styles.avatarBorder}>
                        <Image source={{ uri: item.avatar }} style={styles.markerImage} />
                    </View>
                    <View style={[styles.arrow, { transform: [{ rotate: `${item.heading}deg` }] }]} />
                </View>
            ) : item.type === 'event' ? (
                // CAMPFIRE EVENT (Orange)
                <View style={[styles.iconMarker, { backgroundColor: '#F59E0B' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={16} color="#FFF" />
                </View>
            ) : item.type === 'service' ? (
                // SERVICE (White)
                <View style={[styles.iconMarker, { backgroundColor: '#FFF' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={16} color="#111" />
                </View>
            ) : (
                // SOS (Red Pulse)
                <View style={[styles.iconMarker, { backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFF' }]}>
                    <MaterialCommunityIcons name="alert" size={16} color="#FFF" />
                </View>
            )}

            {/* CUSTOM CALLOUT (The popup when clicked) */}
            <Callout tooltip>
                <View style={styles.calloutBubble}>
                    <Text style={styles.calloutTitle}>{item.title}</Text>
                    <Text style={styles.calloutDesc}>{item.desc}</Text>
                    <View style={styles.calloutArrow} />
                </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* --- FLOATING HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.toggleCard}>
            <View>
                <Text style={styles.toggleTitle}>Share Live Location</Text>
                <Text style={styles.toggleSub}>Visible to convy members</Text>
            </View>
            <Switch
                value={isSharing}
                onValueChange={setIsSharing}
                trackColor={{ false: "#E5E7EB", true: "#000" }}
                thumbColor={"#FFF"}
            />
        </View>
      </View>

      {/* --- LIST BUTTON --- */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.pillButton} onPress={() => router.back()}>
           <Text style={styles.pillText}>List View</Text>
           <MaterialCommunityIcons name="format-list-bulleted" size={18} color="#000" style={{marginLeft: 6}} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' },
  
  // MARKER STYLES
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  avatarBorder: {
    padding: 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 5, elevation: 5
  },
  markerImage: { width: 36, height: 36, borderRadius: 18 },
  arrow: {
    width: 0, height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 8,
    borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "white",
    marginTop: -4,
  },
  iconMarker: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 4, elevation: 5
  },

  // CALLOUT STYLES
  calloutBubble: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    width: 150,
    alignItems: 'center',
    marginBottom: 5,
  },
  calloutTitle: { fontWeight: '700', fontSize: 12, color: '#111' },
  calloutDesc: { fontSize: 10, color: '#6B7280' },
  calloutArrow: {
    width: 0, height: 0, 
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFF',
    marginTop: -2, alignSelf: 'center'
  },

  // UI OVERLAYS
  header: {
    position: 'absolute', top: 60, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backButton: {
    width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.3, elevation: 4,
  },
  toggleCard: {
    flex: 1, flexDirection: 'row', backgroundColor: '#FFF',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24,
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: "#000", shadowOpacity: 0.2, elevation: 4,
  },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  toggleSub: { fontSize: 10, color: '#6B7280' },
  
  floatingButtonContainer: {
    position: 'absolute', bottom: 50, alignSelf: 'center',
  },
  pillButton: {
    backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30,
    shadowColor: "#000", shadowOpacity: 0.4, elevation: 6,
  },
  pillText: { color: '#000', fontWeight: '700', fontSize: 14 },
});