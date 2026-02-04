import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import LockdownOverlay from '../../components/LockdownOverlay';

const { width, height } = Dimensions.get('window');

const PROFILES = [
  {
    id: 1,
    name: "David",
    age: 28,
    verified: true,
    location: "Goa Beach",
    status: "Staying here for a month",
    bio: "Digital nomad working remotely. Let's co-work during the day and catch sunset beers at night.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    vanImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    tags: ["Surfer", "Tech", "Van Life"],
    isMoving: false
  },
  {
    id: 2,
    name: "Jessica",
    age: 24,
    verified: true,
    location: "Manali",
    status: "Heading to Ladakh",
    bio: "Solo traveler in a Sprinter. Looking for a hiking buddy or a dinner date.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    vanImage: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
    tags: ["Hiker", "Slow Travel", "Coffee"],
    isMoving: true
  }
];

export default function ConnectScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);

  const currentProfile = PROFILES[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setShowMatch(true);
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < PROFILES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("You've seen everyone nearby!");
      setCurrentIndex(0);
    }
  };

  const handleSendMessage = () => {
    setShowMatch(false);
    router.push(`/messages/${currentProfile.id}`);
  };

  return (
    <View style={styles.container}>
      <LockdownOverlay />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
        <TouchableOpacity style={styles.filterBtn}>
           <MaterialCommunityIcons name="tune-variant" size={24} color="#111" />
        </TouchableOpacity>
      </View>
      <View style={styles.contentArea}>
        <View style={styles.cardContainer}>
          {currentProfile ? (
            <View style={styles.card}>
              <Image source={{ uri: currentProfile.image }} style={styles.mainImage} />
              <View style={styles.vanBubble}>
                 <Image source={{ uri: currentProfile.vanImage }} style={styles.vanImage} />
                 <View style={styles.vanIconBadge}>
                    <MaterialCommunityIcons name="van-utility" size={12} color="#FFF" />
                 </View>
              </View>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                style={styles.cardOverlay}
              >
                 <View>
                   <View style={styles.nameRow}>
                     <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
                     {currentProfile.verified && (
                        <MaterialCommunityIcons name="check-decagram" size={24} color="#3B82F6" />
                     )}
                   </View>
                   <View style={styles.statusRow}>
                      <View style={styles.locationPill}>
                        <MaterialCommunityIcons name="map-marker" size={14} color="#FFF" />
                        <Text style={styles.locationText}>{currentProfile.location}</Text>
                      </View>
                      <MaterialCommunityIcons name="arrow-right" size={16} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.statusText}>{currentProfile.status}</Text>
                   </View>
                   <View style={styles.tagRow}>
                      {currentProfile.tags.map(tag => (
                          <View key={tag} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                          </View>
                      ))}
                   </View>
                 </View>
              </LinearGradient>
            </View>
          ) : (
             <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No more nomads nearby.</Text>
             </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
              style={[styles.btn, styles.passBtn]} 
              activeOpacity={0.7}
              onPress={() => handleSwipe('left')}
          >
              <MaterialCommunityIcons name="close" size={32} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.btn, styles.likeBtn]} 
              activeOpacity={0.7}
              onPress={() => handleSwipe('right')}
          >
              <MaterialCommunityIcons name="heart" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={showMatch} transparent animationType="fade">
        <View style={styles.matchOverlay}>
            <View style={styles.matchBox}>
                <View style={styles.matchIconCircle}>
                    <MaterialCommunityIcons name="heart-multiple" size={40} color="#FFF" />
                </View>
                <Text style={styles.matchTitle}>It's a Match!</Text>
                <Text style={styles.matchSub}>You and {currentProfile?.name} both want to connect.</Text>
                <TouchableOpacity style={styles.chatButton} onPress={handleSendMessage}>
                    <Text style={styles.chatButtonText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowMatch(false); nextCard(); }}>
                    <Text style={styles.keepSwiping}>Keep swiping</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
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
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contentArea: {
    flex: 1,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vanBubble: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFF',
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  vanImage: { width: '100%', height: '100%' },
  vanIconBadge: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 60,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 10,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  passBtn: { borderWidth: 1, borderColor: '#FEE2E2' },
  likeBtn: { borderWidth: 1, borderColor: '#D1FAE5' },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
  },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBox: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  matchIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#10B981",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  matchTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 8 },
  matchSub: { textAlign: 'center', color: '#6B7280', marginBottom: 24, lineHeight: 20 },
  chatButton: {
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  chatButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  keepSwiping: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
});