import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, StatusBar } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"; 
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DARK_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }] 
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }] 
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2C2C2C" }] 
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3E3E3E" }] 
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }] 
  }
];

const NOMADS = [
  {
    id: 1,
    name: "Sarah J.",
    lat: 32.2432, 
    long: 77.1892,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    activity: "Driving to Leh",
  },
  {
    id: 2,
    name: "Mike & Van",
    lat: 15.2993, 
    long: 74.1240,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    activity: "Beach Camp",
  },
];

export default function MapScreen() {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE} 
        customMapStyle={DARK_MAP_STYLE} 
        initialRegion={{
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 25,
          longitudeDelta: 25,
        }}
      >
        {NOMADS.map((nomad) => (
          <Marker
            key={nomad.id}
            coordinate={{ latitude: nomad.lat, longitude: nomad.long }}
            title={nomad.name}
            description={nomad.activity}
          >
            <View style={styles.markerContainer}>
              <View style={styles.avatarBorder}>
                <Image source={{ uri: nomad.avatar }} style={styles.markerImage} />
              </View>
              <View style={styles.arrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.toggleCard}>
            <View>
                <Text style={styles.toggleTitle}>Share Live Location</Text>
                <Text style={styles.toggleSub}>Visible to public nomads</Text>
            </View>
            <Switch
                value={isSharing}
                onValueChange={setIsSharing}
                trackColor={{ false: "#E5E7EB", true: "#000" }}
                thumbColor={"#FFF"}
            />
        </View>
      </View>

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
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.3,
    elevation: 4,
  },
  toggleCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF', 
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 4,
  },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  toggleSub: { fontSize: 10, color: '#6B7280' },
  
  markerContainer: { alignItems: 'center' },
  avatarBorder: {
    padding: 2,
    backgroundColor: '#FFF', 
    borderRadius: 20,
  },
  markerImage: { width: 36, height: 36, borderRadius: 18 },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    transform: [{ rotate: "180deg" }],
    marginTop: -2,
  },

  floatingButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  pillButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    elevation: 6,
  },
  pillText: { color: '#000', fontWeight: '700', fontSize: 14 },
});