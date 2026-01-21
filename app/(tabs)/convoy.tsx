import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const PLANS = [
  {
    id: 1,
    user: "Sarah J.",
    time: "2h ago",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", 
    type: "image", 
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop", 
    tag: "VAN LIFE",
    from: "Manali",
    to: "Leh",
    desc: "Leaving this Thursday early morning. Looking for a convoy for the high passes. I have a 4x4 camper."
  },
  {
    id: 2,
    user: "Mike & Van",
    time: "Heading out this weekend",
    verified: false,
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    type: "map",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop", 
    tag: "COASTAL ROUTE",
    from: "Goa",
    to: "Gokarna",
    desc: "Slow travel down the coast. Looking for chill people to share bonfires with."
  },
  {
    id: 3,
    user: "Alex T.",
    time: "Digital Nomad • Biker",
    verified: false,
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
    type: "none", 
    tag: "REMOTE WORK",
    from: "Co-working in Varkala",
    to: null, 
    desc: "Setting up base for a month. Anyone around for sunset cliffs?"
  }
];

export default function ConvoyScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nomads nearby</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons name="tune-variant" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>No more nomads nearby</Text>
          <TouchableOpacity>
            <Text style={styles.expandText}>Expand your radius?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.floatingContainer}>
        <TouchableOpacity
          style={styles.mapPill}
          activeOpacity={0.9}
          onPress={() => router.push('/map')} 
        >
          <Text style={styles.mapPillText}>Map</Text>
          <MaterialCommunityIcons name="map-marker-multiple" size={16} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PlanCard({ plan }: { plan: any }) {
  return (
    <View style={styles.card}>
      {plan.type !== 'none' && (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: plan.image }} style={styles.cardImage} />

          <View style={styles.tagBadge}>
            {plan.type === 'map' && <MaterialCommunityIcons name="map-marker-path" size={14} color="#FFF" style={{ marginRight: 4 }} />}
            <Text style={styles.tagText}>{plan.tag}</Text>
          </View>
        </View>
      )}

      <View style={styles.cardContent}>

        <View style={styles.userRow}>
          <Image source={{ uri: plan.avatar }} style={styles.avatar} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.userName}>{plan.user}</Text>
              {plan.verified && (
                <MaterialCommunityIcons name="check-decagram" size={14} color="#3B82F6" />
              )}
            </View>
            <Text style={styles.timestamp}>{plan.time}</Text>
          </View>
          {plan.type === 'none' && (
            <View style={[styles.tagBadge, {
              backgroundColor: '#F3F4F6',
              position: 'absolute',
              right: 0,
              top: 0,
              left: undefined, 
              borderRadius: 8
            }]}>
              <Text style={[styles.tagText, { color: '#374151' }]}>{plan.tag}</Text>
            </View>
          )}
        </View>

        <View style={styles.routeRow}>
          <Text style={styles.locationText}>{plan.from}</Text>
          {plan.to && (
            <>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#9CA3AF" />
              <Text style={styles.locationText}>{plan.to}</Text>
            </>
          )}
        </View>

        <Text style={styles.description}>
          {plan.desc}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFF" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.interestButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="star-outline" size={20} color="#111" />
            <Text style={styles.interestButtonText}>Interested</Text>
          </TouchableOpacity>
        </View>

      </View>
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
  filterButton: {
    padding: 4,
  },
  feed: {
    padding: 16,
    gap: 16,
    paddingBottom: 50, 
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mediaContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tagBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  interestButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  interestButtonText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
    marginBottom: 20, 
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  expandText: {
    color: '#111',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  mapPill: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mapPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  }
});