import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const JOURNEY_STATS = {
    totalKm: 12500,
    completedKm: 8750,
    countries: 3,
    daysOnRoad: 142
};

const MONTHLY_ACTIVITY = [
    { label: 'Aug', km: 1200, posts: 5 },
    { label: 'Sep', km: 1800, posts: 8 },
    { label: 'Oct', km: 900, posts: 3 },
    { label: 'Nov', km: 2100, posts: 12 },
    { label: 'Dec', km: 1500, posts: 6 },
    { label: 'Jan', km: 1250, posts: 8 },
];

export default function StatsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnims = useRef(MONTHLY_ACTIVITY.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    
    const animations = barAnims.map((anim, i) => 
        Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            delay: i * 100,
            useNativeDriver: false 
        })
    );
    Animated.stagger(100, animations).start();
  }, []);

  const completionPercent = Math.round((JOURNEY_STATS.completedKm / JOURNEY_STATS.totalKm) * 100);

  const bgStyle = { backgroundColor: colors.background };
  const cardStyle = { backgroundColor: colors.card, borderColor: colors.border };
  const textStyle = { color: colors.text };
  const subtextStyle = { color: colors.subtext };

  return (
    <View style={[styles.container, bgStyle]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyle]}>Journey Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         
         <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
            <LinearGradient 
                colors={isDark ? ['#1E293B', '#0F172A'] : ['#222', '#000']} 
                style={styles.heroGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={styles.heroLabel}>CURRENT EXPEDITION</Text>
                        <Text style={styles.heroValue}>{completionPercent}%</Text>
                        <Text style={styles.heroSub}>Pan-American Highway</Text>
                    </View>
                    <MaterialCommunityIcons name="map-marker-distance" size={48} color="#FBBF24" style={{ opacity: 0.8 }} />
                </View>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${completionPercent}%` }]} />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressText}>{JOURNEY_STATS.completedKm.toLocaleString()} km done</Text>
                        <Text style={styles.progressText}>{JOURNEY_STATS.totalKm.toLocaleString()} km total</Text>
                    </View>
                </View>

                <View style={styles.heroStatsRow}>
                    <View style={styles.heroStatItem}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color="#94A3B8" />
                        <Text style={styles.heroStatValue}>{JOURNEY_STATS.daysOnRoad} Days</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.heroStatItem}>
                        <MaterialCommunityIcons name="flag-variant" size={20} color="#94A3B8" />
                        <Text style={styles.heroStatValue}>{JOURNEY_STATS.countries} Countries</Text>
                    </View>
                </View>
            </LinearGradient>
         </Animated.View>

         <View style={styles.grid}>
             <StatBox title="Posts" value="42" icon="camera-burst" color="#3B82F6" colors={colors} />
             <StatBox title="Votes" value="156" icon="thumb-up" color="#10B981" colors={colors} />
             <StatBox title="Friends" value="89" icon="account-group" color="#F59E0B" colors={colors} />
             <StatBox title="Replies" value="15" icon="comment-question" color="#6366F1" colors={colors} />
         </View>

         <View style={[styles.chartCard, cardStyle]}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                 <View>
                    <Text style={[styles.sectionTitle, textStyle]}>Activity Trends</Text>
                    <Text style={[styles.chartSub, subtextStyle]}>Distance traveled (km) • Last 6 months</Text>
                 </View>
                 <TouchableOpacity>
                     <MaterialCommunityIcons name="dots-horizontal" size={20} color={colors.subtext} />
                 </TouchableOpacity>
             </View>
             
             <View style={styles.mockChart}>
                 {MONTHLY_ACTIVITY.map((data, i) => {
                     const maxKm = Math.max(...MONTHLY_ACTIVITY.map(d => d.km));
                     const heightPercent = (data.km / maxKm) * 100;
                     
                     return (
                         <View key={i} style={styles.barContainer}>
                             <Text style={[styles.barValue, subtextStyle]}>{data.km}</Text>
                             <Animated.View 
                                style={[
                                    styles.bar, 
                                    { 
                                        height: barAnims[i].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', `${heightPercent}%`]
                                        }),
                                        backgroundColor: i === MONTHLY_ACTIVITY.length - 1 ? colors.primary : colors.border
                                    }
                                ]} 
                             />
                             <Text style={[styles.barLabel, subtextStyle]}>{data.label}</Text>
                         </View>
                     );
                 })}
             </View>
         </View>

         <View style={[styles.chartCard, cardStyle, { marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, textStyle]}>Popular Routes</Text>
            <Text style={[styles.chartSub, subtextStyle]}>Most traveled by your connections</Text>
            
            <View style={styles.routeItem}>
                <View style={[styles.rankBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.rankText}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.routeName, textStyle]}>Manali - Leh Highway</Text>
                    <View style={styles.routeMeta}>
                        <MaterialCommunityIcons name="account-group" size={14} color={colors.subtext} />
                        <Text style={[styles.routeMetaText, subtextStyle]}>12 friends recently</Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.subtext} />
            </View>

            <View style={[styles.routeItem, { borderBottomWidth: 0 }]}>
                <View style={[styles.rankBadge, { backgroundColor: '#64748B' }]}>
                    <Text style={styles.rankText}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.routeName, textStyle]}>Konkan Coast (Mumbai - Goa)</Text>
                    <View style={styles.routeMeta}>
                        <MaterialCommunityIcons name="account-group" size={14} color={colors.subtext} />
                        <Text style={[styles.routeMetaText, subtextStyle]}>8 friends recently</Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.subtext} />
            </View>
         </View>
         
         <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatBox({ title, value, icon, color, colors }: any) {
    return (
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon as any} size={24} color={color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: colors.subtext }]}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
      paddingHorizontal: 20, 
      paddingTop: 60, 
      paddingBottom: 20, 
      flexDirection: 'row', 
      alignItems: 'center', 
      borderBottomWidth: 1 
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', fontFamily: 'YoungSerif_400Regular' },
  scrollContent: { padding: 20 },
  
  heroCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 24, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  heroGradient: { padding: 24 },
  heroLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  heroValue: { color: '#FFF', fontSize: 42, fontWeight: '800', lineHeight: 48, marginBottom: 2 },
  heroSub: { color: '#CBD5E1', fontSize: 16, marginBottom: 24, fontWeight: '500' },
  
  progressContainer: { marginBottom: 24 },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#FBBF24', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },

  heroStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12 },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  heroStatValue: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { 
      width: (width - 52) / 2, 
      padding: 16, 
      borderRadius: 20, 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)'
  },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  chartCard: { padding: 20, borderRadius: 24, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  chartSub: { fontSize: 13 },
  mockChart: { flexDirection: 'row', justifyContent: 'space-between', height: 180, alignItems: 'flex-end', paddingTop: 20 },
  barContainer: { alignItems: 'center', gap: 8, flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: 16, borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 11, fontWeight: '600' },
  barValue: { fontSize: 10, marginBottom: 4 },

  routeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', gap: 12 },
  rankBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rankText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  routeName: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
  routeMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeMetaText: { fontSize: 12 }
});