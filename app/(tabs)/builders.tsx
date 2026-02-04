import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import LockdownOverlay from '../../components/LockdownOverlay';

const HELP_CATEGORIES = [
  { id: 1, label: "Mechanics", icon: "wrench", count: 12, dist: "5 km" },
  { id: 2, label: "Electricians", icon: "lightning-bolt", count: 8, dist: "3 km" },
  { id: 3, label: "Carpenters", icon: "saw-blade", count: 5, dist: "10 km" },
  { id: 4, label: "Solar Techs", icon: "solar-power", count: 4, dist: "12 km" },
  { id: 5, label: "Towing", icon: "tow-truck", count: 2, dist: "15 km" },
];

const HELPERS = [
  {
    id: 1,
    name: "Rajiv M.",
    skill: "Diesel Engine Expert",
    dist: "2.5 km away",
    image: "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=400&auto=format&fit=crop",
    verified: true
  },
  {
    id: 2,
    name: "Sarah K.",
    skill: "Solar Wiring Helper",
    dist: "Currently in Manali",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
    verified: true
  },
  {
    id: 3,
    name: "Local Garage",
    skill: "Welding & Metalwork",
    dist: "500m away",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=400&auto=format&fit=crop",
    verified: false
  }
];

const PRO_BUILDERS = [
  {
    id: 1,
    name: "Nomad Customs",
    built: "40+ vans",
    specialty: "Full Sprinter Conversions",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Driftwood Studios",
    built: "15+ vans",
    specialty: "Luxury Carpentry",
    image: "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?q=80&w=800&auto=format&fit=crop"
  }
];

const SPARE_PARTS = [
  { id: 1, item: "Victron MPPT 100/30", price: "₹8,000", dist: "1km", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=200&auto=format&fit=crop" },
  { id: 2, item: "MaxxAir Fan (Unused)", price: "₹22,000", dist: "5km", image: "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=200&auto=format&fit=crop" }
];

export default function BuildersScreen() {
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
      <LockdownOverlay />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service Hub</Text>
        <TouchableOpacity style={styles.sosButton}>
           <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FFF" />
           <Text style={styles.sosText}>SOS Help</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" style={{marginRight: 8}} />
                <TextInput 
                    placeholder="Search for mechanics, parts, or help..." 
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Help Near You</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>View all</Text></TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>Quick fixes, right now. Based on your location.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {HELP_CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.catCard}>
                    <View style={styles.catIconBox}>
                        <MaterialCommunityIcons name={cat.icon as any} size={24} color="#111" />
                    </View>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <Text style={styles.catMeta}>Within {cat.dist}</Text>
                    <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{cat.count} nearby</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People Who Can Help</Text>
        </View>
        <Text style={styles.sectionSub}>Independent workers & experienced nomads nearby.</Text>
        <View style={styles.verticalList}>
            {HELPERS.map((helper) => (
                <TouchableOpacity key={helper.id} style={styles.helperCard}>
                    <Image source={{ uri: helper.image }} style={styles.helperImage} />
                    <View style={styles.helperContent}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.helperName}>{helper.name}</Text>
                            {helper.verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#3B82F6" />}
                        </View>
                        <Text style={styles.helperSkill}>{helper.skill}</Text>
                        <View style={styles.distRow}>
                            <MaterialCommunityIcons name="map-marker" size={12} color="#6B7280" />
                            <Text style={styles.distText}>{helper.dist}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.msgBtn}>
                        <MaterialCommunityIcons name="chat-outline" size={20} color="#111" />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </View>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pro Builders</Text>
        </View>
        <Text style={styles.sectionSub}>Learn from the best. Verified conversion experts.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {PRO_BUILDERS.map((builder) => (
                <View key={builder.id} style={styles.proCard}>
                    <Image source={{ uri: builder.image }} style={styles.proImage} />
                    <View style={styles.proContent}>
                        <Text style={styles.proName}>{builder.name}</Text>
                        <View style={styles.proBadge}>
                            <Text style={styles.proBadgeText}>{builder.built} built</Text>
                        </View>
                        <Text style={styles.proSpec}>{builder.specialty}</Text>
                    </View>
                    <TouchableOpacity style={styles.proBtn}>
                        <Text style={styles.proBtnText}>View Portfolio</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgent Parts Nearby</Text>
        </View>
        <Text style={styles.sectionSub}>Nomads selling spare parts in your area.</Text>
        <View style={styles.partsList}>
            {SPARE_PARTS.map((part) => (
                <View key={part.id} style={styles.partCard}>
                     <View style={styles.partIconBox}>
                        <MaterialCommunityIcons name="cube-outline" size={24} color="#6B7280" />
                     </View>
                     <View style={{flex: 1}}>
                        <Text style={styles.partName}>{part.item}</Text>
                        <Text style={styles.partPrice}>{part.price} • {part.dist} away</Text>
                     </View>
                     <TouchableOpacity style={styles.buyBtn}>
                        <Text style={styles.buyBtnText}>Contact</Text>
                     </TouchableOpacity>
                </View>
            ))}
        </View>
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  sosText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  searchSection: { padding: 24, paddingBottom: 10 },
  searchContainer: {
    backgroundColor: '#F9FAFB',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111' },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  sectionSub: { paddingHorizontal: 24, fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  horizontalScroll: { paddingHorizontal: 24, gap: 12 },
  catCard: {
    width: 140,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  catIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  catLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  catMeta: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  catBadge: { backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  catBadgeText: { fontSize: 10, fontWeight: '700', color: '#111' },
  verticalList: { paddingHorizontal: 24, gap: 12 },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  helperImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  helperContent: { flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helperName: { fontSize: 16, fontWeight: '700', color: '#111' },
  helperSkill: { fontSize: 13, color: '#4B5563', marginVertical: 2 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: { fontSize: 12, color: '#6B7280' },
  msgBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  proImage: { width: '100%', height: 100, resizeMode: 'cover' },
  proContent: { padding: 12 },
  proName: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 4 },
  proBadge: { backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: '#D97706' },
  proSpec: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  proBtn: { backgroundColor: '#111', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  proBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  partsList: { paddingHorizontal: 24, gap: 12 },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  partIconBox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#FFF', borderRadius: 8 },
  partName: { fontSize: 14, fontWeight: '700', color: '#111' },
  partPrice: { fontSize: 12, color: '#6B7280' },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6 },
  buyBtnText: { fontSize: 12, fontWeight: '700', color: '#111' },
});