import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SafeImage from '../SafeImage';

interface ProfileHeaderProps {
  user: any;
  defaultUser: any;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, defaultUser }) => {
  const router = useRouter();
  const DATA = user || defaultUser;

  return (
    <View style={styles.headerWrapper}>
      <SafeImage 
        source={{ uri: DATA.coverImage || defaultUser.coverImage }} 
        style={styles.headerImage} 
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', '#F8F9FA']}
        style={styles.headerGradient}
      />
      
      <View style={styles.topBar}>
         <View style={styles.locationTag}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#FFF" />
            <Text style={styles.locationText}>{DATA.location || "Unknown"}</Text>
         </View>
         <View style={styles.headerIcons}>
            <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.push('/messages')}
                accessibilityLabel="Messages"
                accessibilityRole="button"
            >
               <MaterialCommunityIcons name="chat-processing-outline" size={20} color="#FFF" />
               <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.push('/settings')}
                accessibilityLabel="Settings"
                accessibilityRole="button"
            >
               <MaterialCommunityIcons name="cog-outline" size={20} color="#FFF" />
            </TouchableOpacity>
         </View>
      </View>

      <View style={styles.identityOverlay}>
         <View style={styles.avatarRow}>
            <SafeImage 
                source={{ uri: DATA.avatar || defaultUser.avatar }} 
                style={styles.avatar} 
                resizeMode="cover"
            />
            <View style={styles.identityText}>
               <Text style={styles.heroName}>{DATA.name}</Text>
               <View style={styles.badgeRow}>
                  <View style={styles.roleBadge}>
                     <Text style={styles.roleText}>{DATA.role}</Text>
                  </View>
                  {DATA.verified && (
                    <MaterialCommunityIcons name="check-decagram" size={20} color="#3B82F6" />
                  )}
               </View>
            </View>
         </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: { height: 280, position: 'relative' },
  headerImage: { width: '100%', height: '100%' }, // resizeMode handled by SafeImage/Image default or style prop? SafeImage uses absoluteFill so it covers.
  headerGradient: { position: 'absolute', width: '100%', height: '100%', top: 0 },
  
  topBar: {
     position: 'absolute',
     top: 50,
     left: 20,
     right: 20,
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     zIndex: 10
  },
  locationTag: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: 'rgba(0,0,0,0.5)',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 20,
     gap: 4
  },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF'
  },

  identityOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  avatar: { 
     width: 100, 
     height: 100, 
     borderRadius: 20, 
     borderWidth: 4, 
     borderColor: '#FFF',
     backgroundColor: '#DDD'
  },
  identityText: { flex: 1, paddingBottom: 8 },
  heroName: { fontSize: 32, fontWeight: '900', color: '#111', letterSpacing: -1, textShadowColor: 'rgba(255,255,255,0.5)', textShadowRadius: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: { backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  roleText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});

export default ProfileHeader;
