import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ServiceItem {
  id: string;
  name: string;
  desc: string;
  dist: string;
  image: string;
  coordinate: any;
}

interface ServiceListProps {
  services: ServiceItem[];
  colors: any;
  onMapSelect: (coord: any) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, colors, onMapSelect }) => {
  if (services.length === 0) return null;

  const styles = getStyles(colors);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Local Services</Text>
        <Text style={styles.sectionBadge}>{services.length} nearby</Text>
      </View>
      <Text style={styles.sectionSub}>Verified shops, garages & stations.</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {services.map((service) => (
          <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => onMapSelect(service.coordinate)}>
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            <View style={styles.serviceOverlay}>
                <View style={styles.serviceTag}>
                    <Text style={styles.serviceTagText}>{service.desc}</Text>
                </View>
            </View>
            <View style={styles.serviceContent}>
              <Text style={styles.serviceName} numberOfLines={1}>{service.name}</Text>
              <View style={styles.distRow}>
                <MaterialCommunityIcons name="map-marker-radius" size={14} color={colors.primary} />
                <Text style={styles.distText}>{service.dist}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginTop: 24 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sectionBadge: { fontSize: 12, fontWeight: '600', color: colors.primary, backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sectionSub: { paddingHorizontal: 24, fontSize: 13, color: colors.subtext, marginTop: 4, marginBottom: 16 },
  
  horizontalScroll: { paddingHorizontal: 24, gap: 12 },
  serviceCard: {
    width: 160,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  serviceImage: { width: '100%', height: 100, resizeMode: 'cover' },
  serviceOverlay: {
      position: 'absolute',
      top: 8, left: 8
  },
  serviceTag: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  serviceTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  
  serviceContent: { padding: 10 },
  serviceName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: { fontSize: 12, color: colors.subtext, fontWeight: '500' }
});

export default ServiceList;
