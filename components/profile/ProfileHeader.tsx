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
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', '#F9FAFB']}
        locations={[0, 0.6, 1]}
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
  headerWrapper: { height: 320, position: 'relative' }, 
  headerImage: { width: '100%', height: '100%' }, 
  headerGradient: { position: 'absolute', width: '100%', height: '100%', top: 0 },
  
  topBar: {
     position: 'absolute',
     top: 60,
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
     backgroundColor: 'rgba(255, 255, 255, 0.2)', 
     backdropFilter: 'blur(10px)',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 20,
     gap: 4,
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.3)'
  },
  locationText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    bottom: 24,
    left: 24,
    right: 24,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  avatar: { 
     width: 90, 
     height: 90, 
     borderRadius: 28, 
     borderWidth: 4, 
     borderColor: '#FFFFFF',
     backgroundColor: '#F3F4F6'
  },
  identityText: { flex: 1, paddingBottom: 6 },
  heroName: { fontSize: 32, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  roleBadge: { backgroundColor: '#1F2937', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});

export default ProfileHeader;
