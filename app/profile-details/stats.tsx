import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

export default function StatsScreen() {
  const router = useRouter();

  const stats = [
    { title: "Posts Shared", value: "42", unit: "posts", icon: "camera-burst", color: "#3B82F6" },
    { title: "Helpful Votes", value: "156", unit: "votes", icon: "thumb-up", color: "#10B981" },
    { title: "Connections", value: "89", unit: "nomads", icon: "account-group", color: "#F59E0B" },
    { title: "Questions Answered", value: "15", unit: "replies", icon: "comment-question", color: "#6366F1" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Impact</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
         <View style={styles.heroCard}>
            <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.heroGradient}>
                <Text style={styles.heroLabel}>REPUTATION SCORE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                    <Text style={styles.heroValue}>Top 5%</Text>
                    <MaterialCommunityIcons name="trophy" size={32} color="#FBBF24" style={{ marginBottom: 16 }} />
                </View>
                <View style={styles.progressBar}>
                   <View style={{ width: '95%', height: '100%', backgroundColor: '#FBBF24', borderRadius: 4 }} />
                </View>
                <Text style={styles.heroSub}>Community Guide Level</Text>
            </LinearGradient>
         </View>

         <View style={styles.grid}>
             {stats.map((stat, i) => (
                 <View key={i} style={styles.statCard}>
                     <View style={[styles.iconBox, { backgroundColor: stat.color + '20' }]}>
                        <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
                     </View>
                     <Text style={styles.statValue}>{stat.value}</Text>
                     <Text style={styles.statUnit}>{stat.unit}</Text>
                     <Text style={styles.statTitle}>{stat.title}</Text>
                 </View>
             ))}
         </View>

         <View style={styles.chartCard}>
             <Text style={styles.sectionTitle}>Engagement Activity</Text>
             <Text style={styles.chartSub}>Interactions over the last 6 months</Text>
             <View style={styles.mockChart}>
                 {[40, 60, 30, 80, 50, 90].map((h, i) => (
                     <View key={i} style={styles.barContainer}>
                         <View style={[styles.bar, { height: `${h}%` }]} />
                         <Text style={styles.barLabel}>{['Jul','Aug','Sep','Oct','Nov','Dec'][i]}</Text>
                     </View>
                 ))}
             </View>
         </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF' },
  backButton: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  scrollContent: { padding: 20 },
  
  heroCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, height: 160 },
  heroGradient: { flex: 1, padding: 24, justifyContent: 'center' },
  heroLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  heroValue: { color: '#FFF', fontSize: 42, fontWeight: '800', marginBottom: 8, lineHeight: 48 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 8 },
  heroSub: { color: '#94A3B8', fontSize: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statCard: { 
      width: '47%', 
      backgroundColor: '#FFF', 
      padding: 16, 
      borderRadius: 16, 
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111' },
  statUnit: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statTitle: { fontSize: 12, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' },

  chartCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  chartSub: { fontSize: 12, color: '#6B7280', marginBottom: 20 },
  mockChart: { flexDirection: 'row', justifyContent: 'space-between', height: 150, alignItems: 'flex-end' },
  barContainer: { alignItems: 'center', gap: 8, flex: 1 },
  bar: { width: 12, backgroundColor: '#3B82F6', borderRadius: 4 },
  barLabel: { fontSize: 10, color: '#6B7280' },
});
