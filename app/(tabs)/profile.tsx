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

const { width } = Dimensions.get('window');

const USER = {
  name: "Suraj Mondal",
  username: "@suraj_codes",
  verified: true,
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
  bio: "Building apps from the back of my van. Currently exploring the Himalayas. 🏔️",
  stats: {
    miles: "12.5k",
    countries: 3,
    campgrounds: 42
  },
  rig: {
    name: "The Code Cruiser",
    model: "Sprinter 144",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop"
  }
};

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.coverContainer}>
          <Image source={{ uri: USER.coverImage }} style={styles.coverImage} />
          <TouchableOpacity style={styles.settingsBtn}>
            <MaterialCommunityIcons name="cog-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: USER.avatar }} style={styles.avatar} />
            {USER.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={16} color="#FFF" />
              </View>
            )}
          </View>

          <View style={styles.nameSection}>
             <Text style={styles.name}>{USER.name}</Text>
             <Text style={styles.username}>{USER.username}</Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.bio}>{USER.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.miles}</Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.countries}</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.campgrounds}</Text>
              <Text style={styles.statLabel}>Camps</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Rig</Text>
            <TouchableOpacity>
                <Text style={styles.editText}>Edit Rig</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.rigCard}>
            <Image source={{ uri: USER.rig.image }} style={styles.rigImage} />
            <View style={styles.rigContent}>
                <View>
                    <Text style={styles.rigName}>{USER.rig.name}</Text>
                    <Text style={styles.rigModel}>{USER.rig.model}</Text>
                </View>
                <View style={styles.rigIcon}>
                    <MaterialCommunityIcons name="van-utility" size={24} color="#111" />
                </View>
            </View>
        </View>

        <View style={styles.menuContainer}>
            <MenuOption icon="map-marker-path" label="My Trips" />
            <MenuOption icon="heart-outline" label="Saved Locations" />
            <MenuOption icon="shield-check-outline" label="Privacy & Safety" />
            <MenuOption icon="logout" label="Log Out" color="#EF4444" />
        </View>
        
        <View style={{ height: 100 }} />

      </ScrollView>
    </View>
  );
}

function MenuOption({ icon, label, color = "#111" }: { icon: any, label: string, color?: string }) {
    return (
        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.menuText, { color }]}>{label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#E5E7EB" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  coverContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  settingsBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  profileHeader: {
    paddingHorizontal: 24,
    marginTop: -40, 
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FAFAFA',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#3B82F6', 
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAFAFA',
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  contentSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  bio: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  editText: {
    fontSize: 14,
    color: '#6B7280',
  },
  rigCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rigImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  rigContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rigName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  rigModel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rigIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuIconBox: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
