import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CATEGORIES = ["All", "Solar & Electric", "Mechanical", "Carpentry", "Plumbing"];

const BUILDERS = [
  {
    id: 1,
    name: "Nomad Solar Works",
    specialty: "Solar & Electric",
    rating: 4.9,
    reviews: 124,
    location: "Mobile • Currently in Goa",
    verified: true,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=400&auto=format&fit=crop",
    desc: "Lithium conversions, panel mounting, and full Victron system troubleshooting."
  },
  {
    id: 2,
    name: "Driftwood Interiors",
    specialty: "Carpentry",
    rating: 4.8,
    reviews: 56,
    location: "Manali, HP",
    verified: true,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop",
    desc: "Custom cabinetry, slat ceilings, and weight-saving plywood builds."
  },
  {
    id: 3,
    name: "QuickFix Van Garage",
    specialty: "Mechanical",
    rating: 4.5,
    reviews: 210,
    location: "Pune, MH",
    verified: false,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop",
    desc: "Specializing in vintage vans, engine rebuilds, and suspension upgrades."
  }
];

export default function BuildersScreen() {
  const [selectedCat, setSelectedCat] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Builder Directory</Text>
        <TouchableOpacity>
           <Text style={styles.listYourText}>List your business</Text>
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" style={{marginRight: 8}} />
                <TextInput 
                    placeholder="Find verified experts..." 
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>

        <View style={styles.categoryScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity 
                        key={cat} 
                        style={[styles.chip, selectedCat === cat && styles.chipActive]}
                        onPress={() => setSelectedCat(cat)}
                    >
                        <Text style={[styles.chipText, selectedCat === cat && styles.chipTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <View style={styles.listContainer}>
            {BUILDERS.map((builder) => (
                <View key={builder.id} style={styles.card}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: builder.image }} style={styles.cardImage} />
                        {builder.verified && (
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="shield-check" size={12} color="#FFF" />
                                <Text style={styles.verifiedText}>VERIFIED</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.specialty}>{builder.specialty}</Text>
                            <View style={styles.ratingRow}>
                                <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                                <Text style={styles.ratingText}>{builder.rating} ({builder.reviews})</Text>
                            </View>
                        </View>
                        
                        <Text style={styles.name}>{builder.name}</Text>
                        <Text style={styles.desc} numberOfLines={2}>{builder.desc}</Text>

                        <View style={styles.footerRow}>
                            <View style={styles.locationRow}>
                                <MaterialCommunityIcons name="map-marker-radius" size={16} color="#6B7280" />
                                <Text style={styles.locationText}>{builder.location}</Text>
                            </View>
                            
                            <TouchableOpacity style={styles.contactBtn}>
                                <Text style={styles.contactText}>Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))}
        </View>
        
        <View style={{height: 100}} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  listYourText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    textDecorationLine: 'underline',
  },
  
  searchSection: {
    backgroundColor: '#FAFAFA',
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  
  categoryScrollContainer: {
    backgroundColor: '#FAFAFA',
    paddingBottom: 20,
  },
  categoryScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFF',
  },
  
  listContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10B981', 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardContent: {
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  contactBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  }
});