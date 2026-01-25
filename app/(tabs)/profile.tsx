import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { account } from "../_appwrite";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const USER = {
  name: "Suraj Mondal",
  age: 26,
  role: "Builder",
  verified: true,
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
  coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
  location: "Ladakh, India",
  bio: "Traveling full-time since 2019. Love mountains, slow mornings, and building apps from my van.",
  snapshot: [
    { label: "5 yrs traveling", icon: "clock-outline" },
    { label: "Slow traveler", icon: "tortoise" },
    { label: "Nature lover", icon: "pine-tree" },
    { label: "Pet friendly", icon: "paw" }
  ],
  travelStyle: {
    pace: "Slow & Steady",
    mode: "Solo",
    style: "Long Stays"
  },
  interests: ["Nature", "Coding", "Hiking", "Sci-Fi", "Coffee"],
  rig: {
    summary: "Sprinter 144 • Solar • Starlink",
    name: "The Code Cruiser",
    tech: ["400W Solar", "300Ah Lithium", "Starlink v2"],
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop"
  },
  skills: ["Solar Setup", "React Native", "Route Planning"],
  isHelper: true,
  builder: {
    summary: "Experienced Builder • 8 vans built",
    specialty: "Full Conversions & Electrical",
    portfolio: "View Portfolio"
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const [rigExpanded, setRigExpanded] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [builderExpanded, setBuilderExpanded] = useState(false);
  const [socialsExpanded, setSocialsExpanded] = useState(false);
  const [isHappyToHelp, setIsHappyToHelp] = useState(USER.isHelper);

  const toggleSection = (setter: any, value: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(!value);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      await SecureStore.deleteItemAsync('session_active');
      router.replace('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      await SecureStore.deleteItemAsync('session_active');
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image source={{ uri: USER.coverImage }} style={styles.coverImage} />
          <View style={styles.profileMeta}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: USER.avatar }} style={styles.avatar} />
              {USER.verified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#ffffff" />
                </View>
              )}
            </View>
            <Text style={styles.name}>{USER.name}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>{USER.age}</Text>
              <Text style={styles.detailDot}>•</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>{USER.role.toUpperCase()}</Text>
              </View>
              <Text style={styles.detailDot}>•</Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#6B7280" />
                <Text style={styles.detailText}>{USER.location}</Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogout}>
                <Text style={styles.secondaryBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.snapshotScroll}>
            {USER.snapshot.map((item, index) => (
              <View key={index} style={styles.snapChip}>
                <MaterialCommunityIcons name={item.icon as any} size={14} color="#111" />
                <Text style={styles.snapText}>{item.label}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.passportRow}>
            <View style={styles.passportItem}>
              <Text style={styles.passportLabel}>PACE</Text>
              <Text style={styles.passportValue}>{USER.travelStyle.pace}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.passportItem}>
              <Text style={styles.passportLabel}>MODE</Text>
              <Text style={styles.passportValue}>{USER.travelStyle.mode}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.passportItem}>
              <Text style={styles.passportLabel}>STYLE</Text>
              <Text style={styles.passportValue}>{USER.travelStyle.style}</Text>
            </View>
          </View>
        </View>
        <View style={styles.hr} />
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About</Text>
          <Text style={styles.bioText}>{USER.bio}</Text>
          <View style={styles.interestGrid}>
            {USER.interests.map((interest) => (
              <View key={interest} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.hr} />
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeader}>My Path</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View Full Journey</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapPreviewCard}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" }}
              style={styles.mapImage}
            />
            <View style={styles.mapOverlay}>
              <View style={styles.mapBadge}>
                <View style={styles.pulsingDot} />
                <Text style={styles.mapBadgeText}>Current: {USER.location}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.hr} />
        <AccordionItem
          title="My Setup"
          preview={USER.rig.summary}
          icon="van-utility"
          expanded={rigExpanded}
          onPress={() => toggleSection(setRigExpanded, rigExpanded)}
        >
          <View style={styles.accordionContent}>
            <Image source={{ uri: USER.rig.image }} style={styles.rigImage} />
            <Text style={styles.rigName}>{USER.rig.name}</Text>
            <View style={styles.techList}>
              {USER.rig.tech.map(t => (
                <Text key={t} style={styles.techItem}>• {t}</Text>
              ))}
            </View>
          </View>
        </AccordionItem>
        <View style={styles.hr} />
        <AccordionItem
          title="Knowledge & Help"
          preview="Can help with: Solar, Code..."
          icon="lightbulb-outline"
          expanded={helpExpanded}
          onPress={() => toggleSection(setHelpExpanded, helpExpanded)}
        >
          <View style={styles.accordionContent}>
            <View style={styles.skillRow}>
              {USER.skills.map(skill => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>I'm happy to help others</Text>
              <Switch
                value={isHappyToHelp}
                onValueChange={setIsHappyToHelp}
                trackColor={{ false: "#E5E7EB", true: "#111" }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </AccordionItem>
        {USER.role === "Builder" && (
          <>
            <View style={styles.hr} />
            <AccordionItem
              title="Builder Profile"
              preview={USER.builder.summary}
              icon="hammer-wrench"
              expanded={builderExpanded}
              onPress={() => toggleSection(setBuilderExpanded, builderExpanded)}
            >
              <View style={styles.accordionContent}>
                <Text style={styles.builderSpecLabel}>SPECIALTY</Text>
                <Text style={styles.builderSpecValue}>{USER.builder.specialty}</Text>
                <TouchableOpacity style={styles.portfolioBtn}>
                  <Text style={styles.portfolioText}>{USER.builder.portfolio}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </AccordionItem>
          </>
        )}
        <View style={styles.hr} />
        <AccordionItem
          title="Social Links"
          preview="Instagram · YouTube"
          icon="at"
          expanded={socialsExpanded}
          onPress={() => toggleSection(setSocialsExpanded, socialsExpanded)}
        >
          <View style={[styles.accordionContent, { flexDirection: 'row', gap: 16 }]}>
            <SocialIcon name="instagram" color="#E1306C" />
            <SocialIcon name="youtube" color="#FF0000" />
            <SocialIcon name="web" color="#111" />
          </View>
        </AccordionItem>
        <View style={styles.footer}>
            <TouchableOpacity style={styles.sosButton}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#FFF" />
                <Text style={styles.sosText}>Emergency SOS</Text>
            </TouchableOpacity>
            <Text style={styles.joinedText}>Joined Nomvia in 2024 • Verified</Text>
        </View>
        <View style={{height: 10}} />
      </ScrollView>
    </View>
  );
}

function AccordionItem({ title, preview, icon, expanded, onPress, children }: any) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.accordionLeft}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name={icon} size={20} color="#111" />
          </View>
          <View>
            <Text style={styles.accordionTitle}>{title}</Text>
            {!expanded && <Text style={styles.accordionPreview}>{preview}</Text>}
          </View>
        </View>
        <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={24} color="#9CA3AF" />
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}

function SocialIcon({ name, color }: any) {
  return (
    <TouchableOpacity style={styles.socialBtn}>
      <MaterialCommunityIcons name={name as any} size={24} color={color} />
    </TouchableOpacity>
  )

  
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  hr: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  headerContainer: { marginBottom: 20 },
  coverImage: { width: '100%', height: 140, resizeMode: 'cover' },
  profileMeta: { paddingHorizontal: 24, marginTop: -40, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#111' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000000', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 4 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  detailText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  detailDot: { fontSize: 10, color: '#9CA3AF' },
  roleTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: '800', color: '#111' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  primaryBtn: { flex: 1, backgroundColor: '#111', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  secondaryBtn: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  secondaryBtnText: { color: '#111', fontWeight: '700', fontSize: 14 },
  section: { paddingHorizontal: 24, paddingVertical: 8 },
  snapshotScroll: { flexDirection: 'row', marginBottom: 20 },
  snapChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  snapText: { fontSize: 12, fontWeight: '600', color: '#111' },
  passportRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  passportItem: { flex: 1, alignItems: 'center' },
  passportLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginBottom: 4 },
  passportValue: { fontSize: 13, color: '#111', fontWeight: '700', textAlign: 'center' },
  divider: { width: 1, height: '100%', backgroundColor: '#E5E7EB' },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 8 },
  bioText: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 16 },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
  interestText: { fontSize: 12, fontWeight: '600', color: '#111' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  linkText: { fontSize: 12, fontWeight: '600', color: '#111', textDecorationLine: 'underline' },
  mapPreviewCard: { height: 120, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: '#F3F4F6' },
  mapImage: { width: '100%', height: '100%', opacity: 0.8 },
  mapOverlay: { position: 'absolute', bottom: 12, left: 12 },
  mapBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  mapBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  accordionTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  accordionPreview: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  accordionContent: { marginTop: 12, paddingLeft: 48 },
  rigImage: { width: '100%', height: 120, borderRadius: 12, marginBottom: 12 },
  rigName: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 4 },
  techList: { gap: 4 },
  techItem: { fontSize: 13, color: '#4B5563' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  skillTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  skillText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#111' },
  builderSpecLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginBottom: 4 },
  builderSpecValue: { fontSize: 14, color: '#111', fontWeight: '600', marginBottom: 12 },
  portfolioBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  portfolioText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  socialBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  footer: { padding: 24, alignItems: 'center' },
  sosButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, marginBottom: 16 },
  sosText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  joinedText: { color: '#9CA3AF', fontSize: 12 },
});