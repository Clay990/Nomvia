import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SafeImage from '../SafeImage';
import { useTheme } from '../../context/ThemeContext';

interface MapWidgetProps {
  location: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({ location }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
                resizeMode="cover"
            />
            
            <View style={styles.glassMarker}>
                 <MaterialCommunityIcons name="map-marker" size={24} color="#EF4444" />
                 <Text style={styles.markerText}>{location || "Unknown"}</Text>
            </View>
        </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  mapWidget: {
     backgroundColor: colors.card,
     borderRadius: 24,
     padding: 8,
     marginBottom: 24,
     borderWidth: 1,
     borderColor: colors.border,
  },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 12, paddingTop: 4 },
  widgetTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  seeAllText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  
  mapVisual: { height: 160, borderRadius: 20, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  mapImg: { width: '100%', height: '100%' },

  glassMarker: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', 
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  markerText: { fontSize: 13, fontWeight: '700', color: '#FFF' } 
});

export default MapWidget;