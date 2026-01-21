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

const MY_CIRCLES = [
  {
    id: 1,
    name: "Solo Female Travelers",
    members: 1240,
    image: "https://images.unsplash.com/photo-1520256862855-398221c1ce12?q=80&w=400&auto=format&fit=crop",
    notification: 3,
    type: "private"
  },
  {
    id: 2,
    name: "Quin's Patreon",
    members: 56,
    image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=400&auto=format&fit=crop",
    notification: 0,
    type: "private"
  }
];

const PUBLIC_TRIBES = [
  {
    id: 101,
    name: "Rock Climbers",
    desc: "Dirtbags searching for the next crag. Beta sharing allowed.",
    members: "3.2k",
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=400&auto=format&fit=crop",
    icon: "image-filter-hdr"
  },
  {
    id: 102,
    name: "Van Builders",
    desc: "Electrical diagrams, insulation tips, and breakdown help.",
    members: "8.5k",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=400&auto=format&fit=crop",
    icon: "hammer-wrench"
  },
  {
    id: 103,
    name: "Snow Chasers",
    desc: "Following the powder across the Rockies and Alps.",
    members: "1.2k",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=400&auto=format&fit=crop",
    icon: "snowflake"
  },
  {
    id: 104,
    name: "Digital Nomads",
    desc: "Coworking spots, wifi hacks, and coffee shops.",
    members: "12k",
    image: "https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=400&auto=format&fit=crop",
    icon: "laptop"
  }
];

export default function CommunityScreen() {
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="email-plus-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" style={{marginRight: 8}} />
            <TextInput 
                placeholder="Find your tribe..." 
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
            />
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Circles</Text>
            <MaterialCommunityIcons name="lock-outline" size={14} color="#6B7280" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <TouchableOpacity style={styles.addCircleCard}>
                <View style={styles.addIconCircle}>
                    <MaterialCommunityIcons name="plus" size={24} color="#111" />
                </View>
                <Text style={styles.addCardText}>Join Private Group</Text>
            </TouchableOpacity>

            {MY_CIRCLES.map((circle) => (
                <TouchableOpacity key={circle.id} style={styles.circleCard} activeOpacity={0.8}>
                    <Image source={{ uri: circle.image }} style={styles.circleImage} />
                    <View style={styles.circleOverlay} />
                    <View style={styles.circleContent}>
                        <Text style={styles.circleName}>{circle.name}</Text>
                        <Text style={styles.circleMembers}>{circle.members} members</Text>
                    </View>
                    {circle.notification > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{circle.notification}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </ScrollView>

        <View style={[styles.sectionHeader, {marginTop: 30}]}>
            <Text style={styles.sectionTitle}>Explore Tribes</Text>
        </View>

        <View style={styles.tribeList}>
            {PUBLIC_TRIBES.map((tribe) => (
                <View key={tribe.id} style={styles.tribeCard}>
                    <Image source={{ uri: tribe.image }} style={styles.tribeImage} />
                    <View style={styles.tribeContent}>
                        <View style={styles.tribeHeader}>
                            <Text style={styles.tribeName}>{tribe.name}</Text>
                            <View style={styles.memberTag}>
                                <MaterialCommunityIcons name="account-group" size={12} color="#6B7280" />
                                <Text style={styles.memberText}>{tribe.members}</Text>
                            </View>
                        </View>
                        <Text style={styles.tribeDesc} numberOfLines={2}>{tribe.desc}</Text>
                    </View>
                    <TouchableOpacity style={styles.joinButton}>
                        <Text style={styles.joinText}>Join</Text>
                    </TouchableOpacity>
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
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingTop: 20,
  },
  searchContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  horizontalScroll: {
    paddingLeft: 24,
  },
  addCircleCard: {
    width: 140,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  circleCard: {
    width: 140,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  circleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  circleContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  circleName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  circleMembers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tribeList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  tribeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tribeImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  tribeContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  tribeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tribeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tribeDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  joinButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
});