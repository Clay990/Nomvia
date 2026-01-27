import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

const MAP_ITEMS = [
  {
    id: "n1", type: "nomad", title: "Quin (Host)", desc: "Hosting Bonfire tonight!",
    lat: 31.8667, long: -116.5964, 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    heading: 180
  },
  {
    id: "n2", type: "nomad", title: "Mike & Van", desc: "Driving south to Cabo",
    lat: 32.3660, long: -117.0543, 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    heading: 160
  },
  {
    id: "n3", type: "nomad", title: "Sarah J.", desc: "Crossing the border",
    lat: 32.5149, long: -117.0382, 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    heading: 180
  },
  {
    id: "n4", type: "nomad", title: "Alex T.", desc: "Surfing in San Diego",
    lat: 32.7157, long: -117.1611, 
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    heading: 0
  },

  {
    id: "e1", type: "event", title: "Baja Beach Bonfire", desc: "Sunset meet @ 6PM",
    lat: 31.8500, long: -116.6200, 
    icon: "🔥"
  },
  {
    id: "e2", type: "event", title: "Taco Tuesday", desc: "Street food crawl",
    lat: 32.5250, long: -117.0300, 
    icon: "🌮"
  },
  {
    id: "e3", type: "event", title: "Sunrise Yoga", desc: "Valle de Guadalupe",
    lat: 32.0725, long: -116.6094, 
    icon: "🧘"
  },

  {
    id: "s1", type: "service", title: "Pedro's Mechanics", desc: "Diesel Expert",
    lat: 32.3700, long: -117.0600, 
    icon: "🔧"
  },
  {
    id: "s2", type: "service", title: "Solar Supply Co.", desc: "Batteries & Panels",
    lat: 32.7500, long: -117.1500, 
    icon: "⚡"
  },

  {
    id: "sos1", type: "sos", title: "Flat Tire Help", desc: "Need a jack for Sprinter",
    lat: 32.1000, long: -116.9000, 
    icon: "🆘"
  }
];

const ROUTE_COORDS = [
  [32.7157, -117.1611], 
  [32.5149, -117.0382], 
  [32.3660, -117.0543], 
  [31.8667, -116.5964], 
];

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #000; }
        #map { height: 100vh; width: 100vw; background-color: #212121; }
        
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
        .nomad-arrow {
            position: absolute;
            bottom: -5px;
            width: 0; 
            height: 0; 
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 8px solid white;
            z-index: 1;
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
        
        .leaflet-popup-content-wrapper {
            border-radius: 8px;
            padding: 0;
        }
        .leaflet-popup-content {
            margin: 10px 12px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .popup-title { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 2px; }
        .popup-desc { font-size: 11px; color: #666; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([32.25, -116.95], 9);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(map);

        var routeCoords = ${JSON.stringify(ROUTE_COORDS)};
        L.polyline(routeCoords, {
            color: '#3B82F6',
            weight: 4,
            dashArray: '10, 10',
            opacity: 0.8
        }).addTo(map);

        var items = ${JSON.stringify(MAP_ITEMS)};

        items.forEach(function(item) {
            var iconHtml = '';
            
            if (item.type === 'nomad') {
                iconHtml = 
                    '<div class="nomad-container">' +
                        '<div class="nomad-border">' +
                            '<img src="' + item.avatar + '" class="nomad-img" />' +
                        '</div>' +
                        '<div class="nomad-arrow" style="transform: rotate(' + item.heading + 'deg)"></div>' +
                    '</div>';
            } else {
                var bgColor = '#FFF';
                if (item.type === 'event') bgColor = '#F59E0B';
                if (item.type === 'sos') bgColor = '#EF4444';
                var border = item.type === 'sos' ? '2px solid #FFF' : 'none';
                
                iconHtml = 
                    '<div class="icon-marker" style="background-color: ' + bgColor + '; border: ' + border + '">' +
                        (item.icon || '') +
                    '</div>';
            }

            var customIcon = L.divIcon({
                className: 'marker-icon',
                html: iconHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            });

            var marker = L.marker([item.lat, item.long], { icon: customIcon }).addTo(map);
            
            var popupContent = 
                '<div class="popup-title">' + item.title + '</div>' +
                '<div class="popup-desc">' + item.desc + '</div>';
            
            marker.bindPopup(popupContent);
        });

    </script>
</body>
</html>
`;

export default function MapScreen() {
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        scrollEnabled={false}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.toggleCard}>
            <View>
                <Text style={styles.toggleTitle}>Share Live Location</Text>
                <Text style={styles.toggleSub}>Visible to convoy members</Text>
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
  map: { flex: 1, backgroundColor: '#212121' },
  
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
