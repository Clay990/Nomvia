import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SafeImage from '../SafeImage';

interface MapWidgetProps {
  location: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({ location }) => {
  return (
    <View style={styles.mapWidget}>
        <View style={styles.mapHeader}>
            <Text style={styles.widgetTitle}>Current Location</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="View full map">
                <Text style={styles.seeAllText}>View Map</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.mapVisual}>
            <SafeImage 
                source={{ uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" }} 
                style={styles.mapImg}
            />
            <View style={styles.pulseMarker}>
                 <View style={styles.pulseCore} />
                 <View style={styles.pulseRing} />
            </View>
            <View style={styles.locBadge}>
                 <Text style={styles.locBadgeText}>{location || "Unknown"}</Text>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWidget: {
     backgroundColor: '#FFF',
     borderRadius: 20,
     padding: 6,
     marginBottom: 24,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 8,
     elevation: 2,
  },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10 },
  widgetTitle: { fontSize: 14, fontWeight: '700', color: '#111' },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  mapVisual: { height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  mapImg: { width: '100%', height: '100%' },
  pulseMarker: { position: 'absolute', top: '50%', left: '50%', alignItems: 'center', justifyContent: 'center' },
  pulseCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6', zIndex: 2 },
  pulseRing: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(59, 130, 246, 0.3)' },
  locBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  locBadgeText: { fontSize: 11, fontWeight: '700', color: '#111' },
});

export default MapWidget;
