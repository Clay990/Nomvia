import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Modal 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

const PROFILES = [
  {
    id: 1,
    name: "Jessica, 24",
    location: "Currently in Manali",
    destination: "Heading to Ladakh",
    bio: "Solo traveler in a Sprinter. Looking for a hiking buddy or a dinner date. I drive slow and stop for every dog.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    vanImage: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
    tags: ["Hiker", "Slow Travel", "Coffee Addict"]
  },
  {
    id: 2,
    name: "David, 28",
    location: "Goa Beach",
    destination: "Staying here for a month",
    bio: "Digital nomad working remotely. Let's co-work during the day and catch sunset beers at night.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
    vanImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    tags: ["Surfer", "Tech", "Van Life"]
  }
];

export default function ConnectScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);

  const currentProfile = PROFILES[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentIndex === 0) {
      setShowMatch(true);
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < PROFILES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("No more nomads nearby!");
      setCurrentIndex(0); 
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect</Text>
        <TouchableOpacity style={styles.filterBtn}>
           <MaterialCommunityIcons name="tune" size={24} color="#111" />
        </TouchableOpacity>
      </View>

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

            <View style={styles.cardOverlay}>
               <View>
                 <Text style={styles.name}>{currentProfile.name}</Text>
                 
                 <View style={styles.routeRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color="#FFF" />
                    <Text style={styles.routeText}>{currentProfile.location}</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" style={{marginHorizontal:4}} />
                    <Text style={styles.routeText}>{currentProfile.destination}</Text>
                 </View>

                 <View style={styles.tagRow}>
                    {currentProfile.tags.map(tag => (
                        <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                 </View>
               </View>
            </View>
          </View>
        ) : (
           <View style={[styles.card, {justifyContent: 'center', alignItems: 'center'}]}>
              <Text>No more profiles.</Text>
           </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
            style={[styles.btn, styles.passBtn]} 
            onPress={() => handleSwipe('left')}
        >
            <MaterialCommunityIcons name="close" size={32} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.btn, styles.likeBtn]} 
            onPress={() => handleSwipe('right')}
        >
            <MaterialCommunityIcons name="heart" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <Modal visible={showMatch} transparent animationType="slide">
        <View style={styles.matchOverlay}>
            <View style={styles.matchBox}>
                <MaterialCommunityIcons name="party-popper" size={60} color="#10B981" />
                <Text style={styles.matchTitle}>It's a Match!</Text>
                <Text style={styles.matchSub}>You and Jessica both want to connect.</Text>
                
                <TouchableOpacity style={styles.chatButton} onPress={() => setShowMatch(false)}>
                    <Text style={styles.chatButtonText}>Send a Message</Text>
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
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  filterBtn: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  card: {
    height: '85%',
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  vanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vanIconBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingVertical: 2,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    padding: 24,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)', 
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 30,
    marginTop: 10,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  passBtn: {
    borderWidth: 1,
    borderColor: '#EF4444', 
  },
  likeBtn: {
    borderWidth: 1,
    borderColor: '#10B981', 
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBox: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
  },
  matchSub: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  chatButton: {
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  chatButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  keepSwiping: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
});