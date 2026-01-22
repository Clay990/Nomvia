import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
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

const MEETUPS = [
  {
    id: 1,
    title: "Sunset Bonfire",
    host: "Sarah J.",
    time: "Today, 6:00 PM",
    dist: "2 km away",
    attendees: 12,
    image: "https://media.istockphoto.com/id/525545831/photo/beautiful-campfire-by-the-lake.jpg?s=612x612&w=0&k=20&c=NW1Upfmie4UeT2gHg4DBCgh7dv_Y1G9aZsMDgpNZXu0="
  },
  {
    id: 2,
    title: "Morning Yoga",
    host: "YogaVan",
    time: "Tomorrow, 7:00 AM",
    dist: "500m away",
    attendees: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrT90EAAdiD_02g3q8BKIQLPAOpCgzcMFteQ&s"
  }
];

const MY_CIRCLES = [
  {
    id: 1,
    name: "Solo Female Travelers",
    members: 1240,
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=400&auto=format&fit=crop",
    notification: 3
  },
  {
    id: 2,
    name: "Quin's Inner Circle",
    members: 56,
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=400&auto=format&fit=crop",
    notification: 0
  }
];

const DISCUSSIONS = [
  {
    id: 1,
    topic: "Best heater for high altitude?",
    group: "Van Builders",
    replies: 42,
    author: "Mike_Van",
    hot: true
  },
  {
    id: 2,
    topic: "Police knocking in Goa?",
    group: "India Nomads",
    replies: 156,
    author: "Rohan_Travels",
    hot: true
  },
  {
    id: 3,
    topic: "Starlink resell value",
    group: "Digital Nomads",
    replies: 8,
    author: "TechGypsy",
    hot: false
  }
];

export default function CommunityScreen() {
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>The Campfire</Text>
            <Text style={styles.headerSub}>Connect, discuss, and meet up.</Text>
        </View>
        <TouchableOpacity style={styles.createButton}>
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Text style={styles.sectionTitle}>Happening Nearby</Text>
            </View>
            <TouchableOpacity><Text style={styles.seeAllText}>View Map</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {MEETUPS.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.9}>
                    <Image source={{ uri: event.image }} style={styles.eventImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventOverlay}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>{event.time.split(',')[0]}</Text>
                        </View>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.eventMetaRow}>
                            <MaterialCommunityIcons name="map-marker" size={12} color="#FFF" />
                            <Text style={styles.eventMeta}>{event.dist}</Text>
                            <Text style={styles.eventMeta}>• {event.attendees} going</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Your Circles</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            <TouchableOpacity style={styles.addCircleCard}>
                <View style={styles.addIconCircle}>
                    <MaterialCommunityIcons name="lock-plus" size={24} color="#111" />
                </View>
                <Text style={styles.addCardText}>Join Private Circle</Text>
            </TouchableOpacity>
            {MY_CIRCLES.map((circle) => (
                <View key={circle.id} style={styles.circleContainer}>
                    <Image source={{ uri: circle.image }} style={styles.circleAvatar} />
                    {circle.notification > 0 && (
                        <View style={styles.notifBadge}>
                            <Text style={styles.notifText}>{circle.notification}</Text>
                        </View>
                    )}
                    <Text style={styles.circleLabel} numberOfLines={1}>{circle.name}</Text>
                </View>
            ))}
        </ScrollView>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hot Topics</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>Browse Forums</Text></TouchableOpacity>
        </View>
        <View style={styles.discussionList}>
            {DISCUSSIONS.map((item) => (
                <TouchableOpacity key={item.id} style={styles.topicCard}>
                    <View style={styles.topicLeft}>
                        <View style={styles.topicIcon}>
                            <MaterialCommunityIcons name="comment-text-outline" size={20} color="#6B7280" />
                        </View>
                        <View>
                            <Text style={styles.topicTitle}>{item.topic}</Text>
                            <Text style={styles.topicSub}>in {item.group} • by {item.author}</Text>
                        </View>
                    </View>
                    <View style={styles.topicRight}>
                        <View style={styles.replyBadge}>
                            <Text style={styles.replyText}>{item.replies}</Text>
                        </View>
                        {item.hot && <MaterialCommunityIcons name="fire" size={14} color="#EF4444" style={{marginTop: 4}} />}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
        <View style={styles.exploreBox}>
            <Text style={styles.exploreTitle}>Explore all Categories</Text>
            <Text style={styles.exploreSub}>Builders, Climbers, Tech, Pets...</Text>
            <TouchableOpacity style={styles.exploreBtn}>
                <Text style={styles.exploreBtnText}>Browse Directory</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  createButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  searchContainer: {
    margin: 24,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111' },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, marginTop: 24, marginBottom: 16 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  horizontalScroll: { paddingHorizontal: 24, gap: 12 },
  divider: { height: 8, backgroundColor: '#F9FAFB', marginTop: 24 },
  eventCard: { width: 200, height: 140, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  eventImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  eventOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', justifyContent: 'flex-end', padding: 12 },
  dateBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dateText: { fontSize: 10, fontWeight: '800', color: '#111' },
  eventTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '500' },
  addCircleCard: { 
    width: 80, alignItems: 'center', gap: 8, justifyContent: 'flex-start'
  },
  addIconCircle: { 
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center' 
  },
  addCardText: { fontSize: 10, color: '#6B7280', textAlign: 'center', fontWeight: '600' },
  circleContainer: { width: 70, alignItems: 'center', gap: 8 },
  circleAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#F3F4F6' },
  circleLabel: { fontSize: 11, fontWeight: '600', color: '#111', textAlign: 'center', width: '100%' },
  notifBadge: { 
    position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', 
    minWidth: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#FFF',
    justifyContent: 'center', alignItems: 'center' 
  },
  notifText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  discussionList: { paddingHorizontal: 24, gap: 12 },
  topicCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', 
    borderWidth: 1, borderColor: '#F3F4F6' 
  },
  topicLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  topicIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  topicTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
  topicSub: { fontSize: 11, color: '#6B7280' },
  topicRight: { alignItems: 'center' },
  replyBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  replyText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  exploreBox: { 
    margin: 24, padding: 20, backgroundColor: '#111', borderRadius: 20, 
    alignItems: 'center', gap: 8 
  },
  exploreTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  exploreSub: { color: '#9CA3AF', fontSize: 13, marginBottom: 8 },
  exploreBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  exploreBtnText: { color: '#111', fontWeight: '700', fontSize: 13 }
});