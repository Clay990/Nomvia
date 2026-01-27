import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function PortfolioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Builder Portfolio</Text>
      </View>

      <View style={styles.tabs}>
         {['Projects', 'Pricing', 'Reviews'].map(tab => (
             <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab.toLowerCase() && styles.activeTab]}
                onPress={() => setActiveTab(tab.toLowerCase())}
             >
                 <Text style={[styles.tabText, activeTab === tab.toLowerCase() && styles.activeTabText]}>{tab}</Text>
             </TouchableOpacity>
         ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
         {activeTab === 'projects' && (
             <View>
                 <Text style={styles.sectionTitle}>Featured Build: Sprinter 170</Text>
                 <View style={styles.projectCard}>
                     <View style={styles.compareContainer}>
                         <View style={styles.compareItem}>
                             <Text style={styles.compareLabel}>BEFORE</Text>
                             <Image 
                                source={{ uri: "https://images.unsplash.com/photo-1579737153926-724d9c493c04?q=80&w=400&auto=format&fit=crop" }} 
                                style={styles.compareImage} 
                             />
                         </View>
                         <View style={styles.compareItem}>
                             <Text style={styles.compareLabel}>AFTER</Text>
                             <Image 
                                source={{ uri: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=400&auto=format&fit=crop" }} 
                                style={styles.compareImage} 
                             />
                         </View>
                     </View>
                     <View style={styles.projectInfo}>
                         <Text style={styles.projectDesc}>
                             Complete conversion from cargo shell to luxury home. Features hydronic heating, 400Ah Lithium, and custom cabinetry.
                         </Text>
                         <View style={styles.techTags}>
                             <Text style={styles.tag}>Solar 600W</Text>
                             <Text style={styles.tag}>Victron</Text>
                             <Text style={styles.tag}>Hydronic</Text>
                         </View>
                     </View>
                 </View>
             </View>
         )}

         {activeTab === 'pricing' && (
             <View style={styles.pricingContainer}>
                 {[
                     { name: "Electrical Audit", price: "$150", desc: "Complete system diagnostic and wiring check." },
                     { name: "Solar Install", price: "$1,200+", desc: "Panel mounting, cable routing, and controller setup." },
                     { name: "Full Build Consultation", price: "$300", desc: "2-hour planning session + shopping list." },
                 ].map((item, i) => (
                     <View key={i} style={styles.pricingCard}>
                         <View>
                             <Text style={styles.priceName}>{item.name}</Text>
                             <Text style={styles.priceDesc}>{item.desc}</Text>
                         </View>
                         <Text style={styles.priceValue}>{item.price}</Text>
                     </View>
                 ))}
             </View>
         )}

         {activeTab === 'reviews' && (
             <View>
                 {[
                     { user: "Sarah J.", rating: 5, text: "Fixed my electrical system in 30 minutes. Absolute lifesaver!", date: "2 days ago" },
                     { user: "Mike T.", rating: 5, text: "The custom table mount is solid as a rock. Highly recommend.", date: "1 week ago" },
                 ].map((review, i) => (
                     <View key={i} style={styles.reviewCard}>
                         <View style={styles.reviewHeader}>
                             <View style={styles.reviewerAvatar}>
                                 <Text style={styles.avatarLetter}>{review.user[0]}</Text>
                             </View>
                             <View>
                                 <Text style={styles.reviewerName}>{review.user}</Text>
                                 <View style={styles.stars}>
                                    {[1,2,3,4,5].map(s => (
                                        <MaterialCommunityIcons key={s} name="star" size={14} color="#F59E0B" />
                                    ))}
                                 </View>
                             </View>
                             <Text style={styles.reviewDate}>{review.date}</Text>
                         </View>
                         <Text style={styles.reviewText}>{review.text}</Text>
                     </View>
                 ))}
             </View>
         )}
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

  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { marginRight: 24, paddingBottom: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#111' },
  tabText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  activeTabText: { color: '#111' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },
  projectCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24 },
  compareContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  compareItem: { flex: 1 },
  compareLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  compareImage: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#E5E7EB' },
  projectDesc: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 12 },
  techTags: { flexDirection: 'row', gap: 8 },
  tag: { fontSize: 11, color: '#3B82F6', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  projectInfo: {},

  pricingContainer: { gap: 12 },
  pricingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12 },
  priceName: { fontSize: 16, fontWeight: '700', color: '#111' },
  priceDesc: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#10B981' },

  reviewCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reviewerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: '#111' },
  stars: { flexDirection: 'row' },
  reviewDate: { marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' },
  reviewText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
});
