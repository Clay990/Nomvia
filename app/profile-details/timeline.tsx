import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TimelineScreen() {
  const router = useRouter();

  const moments = [
    {
       date: "Jan 12, 2026",
       location: "Yosemite National Park",
       title: "Winter Wonderland",
       description: "First time seeing the valley covered in snow. The heater struggled, but the views were worth it.",
       image: "https://images.unsplash.com/photo-1518623001395-1252423c0d0c?q=80&w=800&auto=format&fit=crop"
    },
    {
       date: "Dec 25, 2025",
       location: "Baja California, Mexico",
       title: "Christmas by the Sea",
       description: "Spent the holidays surfing and eating tacos with a convoy of 5 other vans.",
       image: "https://images.unsplash.com/photo-1531512630560-60a67137f68c?q=80&w=800&auto=format&fit=crop"
    },
    {
       date: "Nov 10, 2025",
       location: "Moab, Utah",
       title: "Red Rock Adventures",
       description: "Got stuck in sand for 2 hours, but rescued by a friendly Jeep. Learned a lesson about PSI.",
       image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop"
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journey Timeline</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
          {moments.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                  <View style={styles.leftColumn}>
                      <Text style={styles.dateText}>{item.date}</Text>
                      <View style={styles.line} />
                  </View>
                  
                  <View style={styles.rightContent}>
                      <View style={styles.dot} />
                      <View style={styles.card}>
                          <Image source={{ uri: item.image }} style={styles.cardImage} />
                          <View style={styles.cardBody}>
                              <View style={styles.locationTag}>
                                  <MaterialCommunityIcons name="map-marker" size={12} color="#6B7280" />
                                  <Text style={styles.locationText}>{item.location}</Text>
                              </View>
                              <Text style={styles.cardTitle}>{item.title}</Text>
                              <Text style={styles.cardDesc}>{item.description}</Text>
                          </View>
                      </View>
                  </View>
              </View>
          ))}
          <View style={styles.timelineEnd}>
               <View style={styles.endDot} />
               <Text style={styles.endText}>Journey Started</Text>
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF' },
  backButton: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  scrollContent: { padding: 20 },

  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  leftColumn: { width: 80, alignItems: 'flex-end', marginRight: 16, position: 'relative' },
  dateText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginTop: 16 },
  line: { position: 'absolute', right: -24, top: 40, bottom: -40, width: 2, backgroundColor: '#E5E7EB' },
  
  rightContent: { flex: 1, position: 'relative' },
  dot: { position: 'absolute', left: -9, top: 20, width: 14, height: 14, borderRadius: 7, backgroundColor: '#3B82F6', borderWidth: 3, borderColor: '#F8F9FA', zIndex: 10 },
  
  card: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardImage: { width: '100%', height: 140 },
  cardBody: { padding: 16 },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  locationText: { fontSize: 12, color: '#6B7280' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  timelineEnd: { marginLeft: 96, flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 40 },
  endDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D1D5DB' },
  endText: { color: '#9CA3AF', fontStyle: 'italic' },
});
