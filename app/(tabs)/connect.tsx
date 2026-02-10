import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { account } from "../../lib/appwrite";
import { DatingProfile, DatingService } from "../services/dating";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get('window');

export default function ConnectScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const user = await account.get();
      setCurrentUserId(user.$id);
      const matches = await DatingService.getPotentialMatches(user.$id);
      setProfiles(matches);
    } catch (error) {
      console.log("Error loading matches", error);
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentProfile || !currentUserId) return;
    setShowDetail(false);

    try {
        const type = direction === 'right' ? 'like' : 'pass';
        
        if (type === 'pass') {
            nextCard();
            await DatingService.recordSwipe(currentUserId, currentProfile.$id, type);
            return;
        }

        const result = await DatingService.recordSwipe(currentUserId, currentProfile.$id, type);
        
        if (result.match) {
            setShowMatch(true);
        } else {
            nextCard();
        }
    } catch (error) {
        console.log("Swipe Error", error);
        nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(profiles.length); 
    }
  };

  const handleSendMessage = () => {
    setShowMatch(false);
    if (currentProfile) {
        router.push(`/messages/${currentProfile.$id}`);
    }
  };

  if (loading) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowFilter(true)}>
            <MaterialCommunityIcons name="tune-variant" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/matches')}>
           <MaterialCommunityIcons name="message-text-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.cardContainer}>
          {currentProfile ? (
            <TouchableOpacity 
                activeOpacity={1} 
                style={styles.card} 
                onPress={() => setShowDetail(true)}
            >
              <Image source={{ uri: currentProfile.image }} style={styles.mainImage} />
              
              <View style={styles.vanBubble}>
                 <Image source={{ uri: currentProfile.vanImage }} style={styles.vanImage} />
                 <View style={styles.vanIconBadge}>
                    <MaterialCommunityIcons name="van-utility" size={12} color="#FFF" />
                 </View>
              </View>

              {(currentProfile.pace || currentProfile.style) && (
                  <View style={styles.matchBadge}>
                      <MaterialCommunityIcons name="transit-connection-variant" size={14} color="#FFF" />
                      <Text style={styles.matchBadgeText}>
                          {currentProfile.pace === 'Fast' ? 'High' : 'Good'} Synergy
                      </Text>
                  </View>
              )}

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
                     <MaterialCommunityIcons name="information-outline" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
                   </View>
                   
                   <View style={styles.statusRow}>
                      <View style={styles.locationPill}>
                        <MaterialCommunityIcons name="map-marker" size={14} color="#FFF" />
                        <Text style={styles.locationText}>{currentProfile.location}</Text>
                      </View>
                      
                      {currentProfile.status && (
                          <>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.statusText} numberOfLines={1}>{currentProfile.status}</Text>
                          </>
                      )}
                   </View>

                   <View style={styles.tagRow}>
                      {currentProfile.tags && currentProfile.tags.length > 0 ? (
                          currentProfile.tags.slice(0, 3).map((tag, i) => (
                              <View key={i} style={styles.tag}>
                                  <Text style={styles.tagText}>{tag}</Text>
                              </View>
                          ))
                      ) : (
                          <View style={styles.tag}>
                              <Text style={styles.tagText}>Nomad</Text>
                          </View>
                      )}
                   </View>
                 </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
             <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="map-search-outline" size={64} color={colors.subtext} />
                <Text style={styles.emptyText}>No more nomads nearby.</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={loadMatches}>
                    <Text style={styles.refreshText}>Refresh Radar</Text>
                </TouchableOpacity>
             </View>
          )}
        </View>
        
        {currentProfile && (
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
        )}
      </View>

      <Modal visible={showMatch} transparent animationType="fade">
        <View style={styles.matchOverlay}>
            <View style={styles.matchBox}>
                <View style={styles.matchIconCircle}>
                    <MaterialCommunityIcons name="heart-multiple" size={40} color="#FFF" />
                </View>
                <Text style={styles.matchTitle}>It&apos;s a Match!</Text>
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

      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
          {currentProfile && (
              <View style={styles.detailContainer}>
                  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                      <Image source={{ uri: currentProfile.image }} style={styles.detailImage} />
                      <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setShowDetail(false)}>
                          <MaterialCommunityIcons name="chevron-down" size={30} color="#FFF" />
                      </TouchableOpacity>
                      
                      <View style={styles.detailContent}>
                          <View style={styles.detailHeader}>
                              <Text style={styles.detailName}>{currentProfile.name}, {currentProfile.age}</Text>
                              {currentProfile.verified && <MaterialCommunityIcons name="check-decagram" size={24} color="#3B82F6" />}
                          </View>
                          <Text style={styles.detailRole}>{currentProfile.status || 'Explorer'}</Text>
                          
                          <View style={styles.divider} />
                          
                          <Text style={styles.sectionTitle}>ABOUT ME</Text>
                          <Text style={styles.bioText}>{currentProfile.bio}</Text>
                          
                          <Text style={styles.sectionTitle}>INTERESTS</Text>
                          <View style={styles.tagRow}>
                              {currentProfile.tags && currentProfile.tags.map((tag, i) => (
                                  <View key={i} style={[styles.tag, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                                      <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                                  </View>
                              ))}
                          </View>

                          <Text style={styles.sectionTitle}>MY RIG</Text>
                          <View style={styles.rigCard}>
                              <Image source={{ uri: currentProfile.vanImage }} style={styles.rigImage} />
                              <View style={styles.rigInfo}>
                                  <Text style={styles.rigTitle}>The Vessel</Text>
                                  <Text style={styles.rigSub}>Self-Converted Van</Text>
                              </View>
                          </View>
                      </View>
                  </ScrollView>
                  <View style={styles.detailActions}>
                      <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => handleSwipe('left')}>
                          <MaterialCommunityIcons name="close" size={30} color="#EF4444" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.btn, styles.likeBtn]} onPress={() => handleSwipe('right')}>
                          <MaterialCommunityIcons name="heart" size={30} color="#10B981" />
                      </TouchableOpacity>
                  </View>
              </View>
          )}
      </Modal>

      <Modal visible={showFilter} transparent animationType="slide">
          <View style={styles.filterOverlay}>
              <View style={styles.filterBox}>
                  <View style={styles.filterHeader}>
                      <Text style={styles.filterTitle}>Filter Nomads</Text>
                      <TouchableOpacity onPress={() => setShowFilter(false)}>
                          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.filterLabel}>Distance: 50 km</Text>
                  <View style={styles.sliderMock}><View style={{ width: '40%', height: '100%', backgroundColor: colors.primary }} /></View>

                  <Text style={styles.filterLabel}>Gender</Text>
                  <View style={styles.genderRow}>
                      <TouchableOpacity style={[styles.genderBtn, styles.activeGender]}><Text style={styles.activeGenderText}>All</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.genderBtn}><Text style={styles.genderText}>Male</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.genderBtn}><Text style={styles.genderText}>Female</Text></TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
                      <Text style={styles.applyBtnText}>Apply Filters</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
      justifyContent: 'center',
      alignItems: 'center'
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'YoungSerif_400Regular'
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: '#333'
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
  matchBadge: {
      position: 'absolute',
      top: 20,
      left: 20,
      backgroundColor: 'rgba(16, 185, 129, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
  },
  matchBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
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
    flexWrap: 'wrap'
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
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', flex: 1 },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.secondary,
    borderRadius: 30,
    padding: 20
  },
  emptyText: { color: colors.subtext, fontSize: 16, marginTop: 16, textAlign: 'center' },
  refreshBtn: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20
  },
  refreshText: { color: colors.background, fontWeight: '600' },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBox: {
    width: '85%',
    backgroundColor: colors.card,
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
  matchTitle: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 },
  matchSub: { textAlign: 'center', color: colors.subtext, marginBottom: 24, lineHeight: 20 },
  chatButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  chatButtonText: { color: colors.background, fontWeight: '700', fontSize: 16 },
  keepSwiping: { color: colors.subtext, fontSize: 14, fontWeight: '600' },
  
  // Detail Modal Styles
  detailContainer: { flex: 1, backgroundColor: colors.background },
  detailImage: { width: '100%', height: 400, resizeMode: 'cover' },
  closeDetailBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 },
  detailContent: { padding: 24, marginTop: -30, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  detailName: { fontSize: 28, fontWeight: '800', color: colors.text },
  detailRole: { fontSize: 16, color: colors.subtext, marginBottom: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.subtext, marginBottom: 10, letterSpacing: 1 },
  bioText: { fontSize: 16, color: colors.text, lineHeight: 24, marginBottom: 24 },
  rigCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 16, gap: 12 },
  rigImage: { width: 60, height: 60, borderRadius: 12 },
  rigInfo: { flex: 1 },
  rigTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  rigSub: { fontSize: 13, color: colors.subtext },
  detailActions: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 40 },
  
  // Filter Modal
  filterOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterBox: { backgroundColor: colors.card, padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  filterTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  filterLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  sliderMock: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 24 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  activeGender: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { color: colors.subtext, fontWeight: '600' },
  activeGenderText: { color: '#FFF', fontWeight: '700' },
  applyBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});
